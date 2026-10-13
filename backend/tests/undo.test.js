const test=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const app=require('../server');
const db=require('../config/db');

test('saved actions persist in MySQL and undo atomically with ownership and dependency checks',{timeout:60000},async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}/api/clinical`,tag=`UNDO-${randomUUID()}`;
 const tokens={},actions=[];let patientId,medicineId,batchId,rxId,uploadId;
 const query=async(sql,args=[])=>(await db.query(sql,args))[0];
 async function request(path,method='GET',body,role='admin',expected=200){const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(tokens[role]?{Authorization:`Bearer ${tokens[role]}`}:{})},...(body?{body:JSON.stringify(body)}:{})});const result=await response.json();if(result.undo)actions.push(result.undo.id);assert.equal(response.status,expected,`${path}: ${JSON.stringify(result)}`);return result;}
 const undo=(action,role='admin',expected=200)=>request(`/undo/${action.undo.id}`,'POST',{},role,expected);
 try{
  for(const role of ['admin','pharmacist','patient'])tokens[role]=(await request('/login','POST',{email:`${role}@pharmrx.local`,password:'PharmRxDemo!2026'},role)).token;
  const original=await request('/bootstrap'),doctorId=original.doctors[0].id;
  const patient=await request('/records/patients','POST',{name:tag,flag_elderly_care:true},'admin',201);patientId=patient.id;
  const body={brand_name:tag,generic_name:'Undo test ingredient',schedule_type:'OTC',tax_rate:5,reorder_level:10};
  const medicine=await request('/records/medicines','POST',body,'admin',201);medicineId=medicine.id;
  assert.equal((await query('SELECT brand_name FROM rx_medicines WHERE id=?',[medicineId]))[0].brand_name,tag,'A website save must be persisted in MySQL before the response');
  const edit1=await request(`/records/medicines/${medicineId}`,'PUT',{...body,brand_name:tag+' first'});
  const edit2=await request(`/records/medicines/${medicineId}`,'PUT',{...body,brand_name:tag+' second'});
  await undo(edit1,'admin',409);await undo(edit2,'patient',403);
  await undo(edit2);await undo(edit1);await undo(edit1,'admin',409);
  assert.equal((await query('SELECT brand_name FROM rx_medicines WHERE id=?',[medicineId]))[0].brand_name,tag);
  const batch=await request('/batches','POST',{medicine_id:medicineId,batch_number:tag,expiry_date:'2032-12-31',mrp:25,stock_qty:30},'pharmacist',201);batchId=batch.id;
  await undo(medicine,'admin',409);assert.equal((await query('SELECT COUNT(*) n FROM rx_medicines WHERE id=?',[medicineId]))[0].n,1,'A failed dependent undo rolls back');
  const prescriptionBody={patient_id:patientId,doctor_id:doctorId,items:[{medicine_id:medicineId,quantity:3,dosage:'Test only',frequency:'Test only',duration_days:5}]};
  const rx=await request('/prescriptions','POST',prescriptionBody,'admin',201);rxId=rx.id;
  const reviewed=await request(`/prescriptions/${rxId}/review`,'PATCH',{});
  assert.equal((await query('SELECT status FROM rx_prescriptions WHERE id=?',[rxId]))[0].status,'In Filling');
  await undo(reviewed);assert.equal((await query('SELECT status FROM rx_prescriptions WHERE id=?',[rxId]))[0].status,'Pending Review');
  const reviewedAgain=await request(`/prescriptions/${rxId}/review`,'PATCH',{});
  const reopened=await request(`/prescriptions/${rxId}/unreview`,'PATCH',{});
  assert.equal((await query('SELECT status FROM rx_prescriptions WHERE id=?',[rxId]))[0].status,'Pending Review');
  await undo(reopened);
  assert.equal((await query('SELECT status FROM rx_prescriptions WHERE id=?',[rxId]))[0].status,'In Filling');
  const saleBody={prescription_id:rxId,request_id:randomUUID(),items:[{batch_id:batchId,quantity:3}],followup_days:7,special_case:true,override_reason:'Test special-case review notes'};
  await request('/pos/checkout','POST',{...saleBody,override_reason:''},'pharmacist',400);
  const sale=await request('/pos/checkout','POST',saleBody,'pharmacist',201);
  assert.equal((await query('SELECT override_reason FROM rx_invoices WHERE id=?',[sale.id]))[0].override_reason,'Test special-case review notes','Extra review notes persist even without automatic warnings');
  assert.equal((await query('SELECT stock_qty FROM rx_batches WHERE id=?',[batchId]))[0].stock_qty,27);
  await undo(reviewedAgain,'admin',409);
  await undo(sale,'pharmacist');
  assert.equal((await query('SELECT stock_qty FROM rx_batches WHERE id=?',[batchId]))[0].stock_qty,30);
  assert.equal((await query('SELECT COUNT(*) n FROM rx_invoices WHERE id=?',[sale.id]))[0].n,0);
  assert.equal((await query('SELECT COUNT(*) n FROM rx_checkups WHERE prescription_id=?',[rxId]))[0].n,0);
  assert.equal((await query('SELECT status FROM rx_prescriptions WHERE id=?',[rxId]))[0].status,'In Filling');
  await request('/pos/checkout','POST',saleBody,'pharmacist',409);
  await undo(reviewedAgain);await undo(rx);
  const person=(await request('/bootstrap','GET',undefined,'patient')).patient;
  const upload=await request('/verification/upload','POST',{patient_id:person.id,uploaded_image_url:'data:image/png;base64,iVBORw0KGgo=',fulfillment_type:'Pickup',items:[{medicine_id:medicineId,quantity:2}]},'patient',201);uploadId=upload.id;
  const verified=await request(`/verification/${uploadId}`,'PATCH',{status:'Verified',doctor_id:doctorId,notes:'Test review',items:[{medicine_id:medicineId,quantity:2,dosage:'Test',frequency:'Test',duration_days:2}]},'pharmacist');
  await undo(verified,'pharmacist');
  const [reset]=await query('SELECT verification_status,prescription_id FROM rx_verifications WHERE id=?',[uploadId]);assert.equal(reset.verification_status,'Pending');assert.equal(reset.prescription_id,null);
  assert.equal((await query('SELECT COUNT(*) n FROM rx_reservations WHERE verification_id=?',[uploadId]))[0].n,0);
  await undo(upload,'patient');
  const adjustment=await request(`/batches/${batchId}/adjust`,'POST',{stock_qty:12,reason:'Undo test only'},'pharmacist');await undo(adjustment,'pharmacist');
  assert.equal((await query('SELECT stock_qty FROM rx_batches WHERE id=?',[batchId]))[0].stock_qty,30);
  await undo(batch,'pharmacist');await undo(medicine);await undo(patient);
  const history=await request('/history');assert.ok(history.some(a=>a.id===reviewed.undo.id&&a.undone_at),'Undo history survives a new backend read');assert.ok(history.every(a=>!('changes' in a)),'Private undo snapshots never appear in history responses');
 }finally{
  if(uploadId){await db.query('DELETE FROM rx_reservations WHERE verification_id=?',[uploadId]);await db.query('DELETE FROM rx_verifications WHERE id=?',[uploadId]);}
  if(rxId){await db.query('DELETE ii FROM rx_invoice_items ii JOIN rx_invoices i ON i.id=ii.invoice_id WHERE i.prescription_id=?',[rxId]);await db.query('DELETE FROM rx_invoices WHERE prescription_id=?',[rxId]);await db.query('DELETE FROM rx_checkups WHERE prescription_id=?',[rxId]);await db.query('DELETE FROM rx_prescription_items WHERE prescription_id=?',[rxId]);await db.query('DELETE FROM rx_prescriptions WHERE id=?',[rxId]);}
  if(batchId){await db.query('DELETE FROM rx_stock_adjustments WHERE batch_id=?',[batchId]);await db.query('DELETE FROM rx_batches WHERE id=?',[batchId]);}
  if(medicineId)await db.query('DELETE FROM rx_medicines WHERE id=?',[medicineId]);if(patientId)await db.query('DELETE FROM rx_patients WHERE id=?',[patientId]);
  if(actions.length)await db.query('DELETE FROM rx_action_history WHERE id IN (?)',[actions]);
  await new Promise(resolve=>server.close(resolve));await db.end();
 }
});
