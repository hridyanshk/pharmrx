const test=require('node:test');const assert=require('node:assert/strict');const {randomUUID}=require('crypto');
const app=require('../server');const db=require('../config/db');const {totals,uniqueItems,date}=require('../domain');
test('validation and tax rounding reject malformed quantities and dates',()=>{
 assert.throws(()=>uniqueItems([{medicine_id:1,quantity:-1}]));assert.throws(()=>uniqueItems([{medicine_id:1,quantity:1},{medicine_id:1,quantity:1}]));assert.throws(()=>date('2026-02-30','Date'));
 assert.deepEqual(totals([{unit_price:19.99,quantity:3,tax_rate:5}]),{subtotal:5997,cgst:150,sgst:150,net_payable:6297});
});
test('complete relational workflow and permission boundaries',{timeout:45000},async t=>{
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}/api/clinical`;
 const tag='TEST-'+randomUUID();let tokens={};let auditIds=[];let medicineIds=[],patientId,rxIds=[],orderId,uploadId;
 async function request(path,method='GET',body,role='admin',expected=200){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(tokens[role]?{Authorization:`Bearer ${tokens[role]}`}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});const result=await r.json();if(result.undo)auditIds.push(result.undo.id);assert.equal(r.status,expected,`${method} ${path}: ${JSON.stringify(result)}`);return result;}
 async function record(kind,b,role='admin'){return (await request('/records/'+kind,'POST',b,role,201)).id;}
 try{
 await request('/bootstrap','GET',undefined,'none',401);
 for(const role of ['admin','pharmacist','doctor','patient','patient2'])tokens[role]=(await request('/login','POST',{email:`${role}@pharmrx.local`,password:'PharmRxDemo!2026'},'none')).token;
 const original=await request('/bootstrap');const doctor=original.doctors[0];const patient=await request('/bootstrap','GET',undefined,'patient');const otherPatient=await request('/bootstrap','GET',undefined,'patient2');
 assert.equal(patient.patients.length,1);assert.equal(otherPatient.patients.length,1);assert.notEqual(patient.patient.id,otherPatient.patient.id);assert.equal(patient.batches,undefined);
 await request('/safety/overuse-limit/'+otherPatient.patient.id,'GET',undefined,'patient',403);
 await request('/records/medicines','POST',{brand_name:'Unauthorized'},'patient',403);
 patientId=await record('patients',{name:tag,date_of_birth:'2000-01-01',flag_elderly_care:true});
 for(let i=0;i<2;i++)medicineIds.push(await record('medicines',{brand_name:`${tag}-${i}`,schedule_type:'OTC',tax_rate:5,reorder_level:5}));
 const batchId=(await request('/batches','POST',{medicine_id:medicineIds[0],batch_number:tag,expiry_date:'2030-12-31',mrp:19.99,stock_qty:20},'pharmacist',201)).id;
 const [expired]=await db.query("INSERT INTO rx_batches(medicine_id,batch_number,expiry_date,mrp,stock_qty) VALUES(?,?, '2020-01-01',10,20)",[medicineIds[0],tag+'-expired']);
 const [second]=await db.query("INSERT INTO rx_batches(medicine_id,batch_number,expiry_date,mrp,stock_qty) VALUES(?,?, '2030-12-31',10,20)",[medicineIds[1],tag+'-second']);
 const rxBody={patient_id:patientId,doctor_id:doctor.id,items:[{medicine_id:medicineIds[0],quantity:3,dosage:'Test directions',frequency:'Test frequency',duration_days:10}]};
 const rx=(await request('/prescriptions','POST',rxBody,'doctor',201)).id;rxIds.push(rx);
 const [[unchanged]]=await db.query('SELECT stock_qty FROM rx_batches WHERE id=?',[batchId]);assert.equal(unchanged.stock_qty,20,'Prescription must not deduct stock');
 const checkout={prescription_id:rx,request_id:randomUUID(),items:[{batch_id:batchId,quantity:3}],followup_days:7};
 await request('/pos/preview','POST',checkout,'pharmacist',400);await request(`/prescriptions/${rx}/review`,'PATCH',{},'pharmacist');
 await request('/pos/preview','POST',{...checkout,items:[{batch_id:expired.insertId,quantity:3}]},'pharmacist',400);
 const allergy=await record('allergies',{patient_id:patientId,medicine_id:medicineIds[0],allergy_name:'Test only',severity:'Severe'});
 const blocked=await request('/pos/preview','POST',checkout,'pharmacist');assert.ok(blocked.alerts.some(a=>a.severity==='CRITICAL'));
 await request('/pos/checkout','POST',checkout,'pharmacist',400);const [[still]]=await db.query('SELECT stock_qty FROM rx_batches WHERE id=?',[batchId]);assert.equal(still.stock_qty,20);
 await request(`/safety/allergies/${allergy}`,'DELETE');
 const limit=await record('limits',{medicine_id:medicineIds[0],max_qty_per_30_days:2,risk_level:'Controlled'});
 await request('/pos/checkout','POST',checkout,'pharmacist',400);await request(`/safety/limits/${limit}`,'DELETE');
 const interaction=(await request('/interactions','POST',{rule_name:tag,severity_level:'High',medicine_ids:medicineIds},'admin',201)).id;
 const interactionCheck=await request('/safety/check','POST',{patient_id:patientId,items:medicineIds.map(m=>({medicine_id:m,quantity:1}))});assert.ok(interactionCheck.alerts.some(a=>a.severity==='CRITICAL'));await request(`/safety/interactions/${interaction}`,'DELETE');
 const incomplete={name:tag,requires_full_profile:true,flag_elderly_care:true};
 await request(`/records/patients/${patientId}`,'PUT',incomplete);
 const missingProfile=await request('/pos/preview','POST',checkout,'pharmacist',400);assert.match(missingProfile.error,/full-profile requirement/);
 await request('/pos/checkout','POST',checkout,'pharmacist',400);
 await request(`/records/patients/${patientId}`,'PUT',{...incomplete,requires_full_profile:false});
 const good=await request('/pos/preview','POST',checkout,'pharmacist');assert.equal(good.totals.net_payable,6297);
 const concurrent=await Promise.all([1,2].map(()=>fetch(base+'/pos/checkout',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${tokens.pharmacist}`},body:JSON.stringify(checkout)})));assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,201]);const invoices=await Promise.all(concurrent.map(r=>r.json()));assert.equal(invoices[0].id,invoices[1].id);
 const [[deducted]]=await db.query('SELECT stock_qty FROM rx_batches WHERE id=?',[batchId]);assert.equal(deducted.stock_qty,17);
 const [[followup]]=await db.query('SELECT COUNT(*) n FROM rx_checkups WHERE prescription_id=?',[rx]);assert.equal(followup.n,1);
 await request('/pos/checkout','POST',{...checkout,request_id:randomUUID()},'pharmacist',400);
 // Separate simultaneous sales for one patient must not bypass a configured rolling limit.
 const concurrentLimit=await record('limits',{medicine_id:medicineIds[0],max_qty_per_30_days:5,risk_level:'Controlled'});
 const parallelBodies=[];
 for(let i=0;i<2;i++){const id=(await request('/prescriptions','POST',{...rxBody,items:[{...rxBody.items[0],quantity:2}]},'doctor',201)).id;rxIds.push(id);await request(`/prescriptions/${id}/review`,'PATCH',{},'pharmacist');parallelBodies.push({...checkout,prescription_id:id,request_id:randomUUID(),items:[{batch_id:batchId,quantity:2}],override_reason:'Test acknowledgement'});}
 const parallel=await Promise.all(parallelBodies.map(body=>fetch(base+'/pos/checkout',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${tokens.pharmacist}`},body:JSON.stringify(body)})));assert.deepEqual(parallel.map(r=>r.status).sort(),[201,400]);const [[afterParallel]]=await db.query('SELECT stock_qty FROM rx_batches WHERE id=?',[batchId]);assert.equal(afterParallel.stock_qty,15);await request(`/safety/limits/${concurrentLimit}`,'DELETE');
 // Database trigger independently blocks an athlete sale even outside the application.
 await db.query('UPDATE rx_patients SET flag_athlete=TRUE WHERE id=?',[patientId]);const sports=await record('sports',{medicine_id:medicineIds[0],banned_category:'Test only',notes:'Fictional restriction for DBMS test'});
 const c=await db.getConnection();try{await c.beginTransaction();const [[ph]]=await c.query('SELECT id FROM rx_pharmacists LIMIT 1');const [inv]=await c.query('INSERT INTO rx_invoices(patient_id,pharmacist_id,request_id,subtotal,cgst,sgst,net_payable) VALUES(?,?,?,0,0,0,0)',[patientId,ph.id,randomUUID()]);await assert.rejects(c.query('INSERT INTO rx_invoice_items(invoice_id,batch_id,qty_sold,unit_price,tax_rate,medicine_name,batch_number) VALUES(?,?,1,0,0,?,?)',[inv.insertId,batchId,tag,tag]),e=>e.sqlState==='45000');}finally{await c.rollback();c.release();}
 await request(`/safety/sports/${sports}`,'DELETE');await db.query('UPDATE rx_patients SET flag_athlete=FALSE WHERE id=?',[patientId]);
 const supplier=original.suppliers[0];orderId=(await request('/orders','POST',{supplier_id:supplier.id,items:[{medicine_id:medicineIds[0],quantity:4}]},'pharmacist',201)).id;
 await request(`/orders/${orderId}/status`,'PATCH',{status:'Sent'},'pharmacist');const receive={items:[{medicine_id:medicineIds[0],quantity:4,batch_number:tag+'-po',expiry_date:'2031-01-01',mrp:10}]};await request(`/orders/${orderId}/receive`,'POST',receive,'pharmacist');await request(`/orders/${orderId}/receive`,'POST',receive,'pharmacist',400);
 // A patient's uploaded request is reviewed and reserved without deducting physical stock.
 uploadId=(await request('/verification/upload','POST',{patient_id:patient.patient.id,uploaded_image_url:'data:image/png;base64,iVBORw0KGgo=',fulfillment_type:'Pickup',items:[{medicine_id:medicineIds[1],quantity:2}]},'patient',201)).id;
 const verified=await request(`/verification/${uploadId}`,'PATCH',{status:'Verified',doctor_id:doctor.id,notes:'Test review',items:[{medicine_id:medicineIds[1],quantity:2,dosage:'Test',frequency:'Test',duration_days:2}]},'pharmacist');rxIds.push(verified.prescription_id);
 const [[held]]=await db.query('SELECT stock_qty FROM rx_batches WHERE id=?',[second.insertId]);assert.equal(held.stock_qty,20);const [[reservation]]=await db.query('SELECT SUM(quantity) n FROM rx_reservations WHERE verification_id=?',[uploadId]);assert.equal(Number(reservation.n),2);
 await request(`/batches/${second.insertId}/adjust`,'POST',{stock_qty:1,reason:'test'},'pharmacist',400);
 const scoped=await request('/bootstrap','GET',undefined,'patient');assert.ok(scoped.prescriptions.every(p=>p.patient_id===patient.patient.id));assert.ok(scoped.verifications.every(v=>v.patient_id===patient.patient.id));assert.ok(scoped.invoices.every(i=>i.patient_id===patient.patient.id));
 await request(`/verification/${uploadId}`,'PATCH',{status:'Rejected',notes:'Test cleanup'},'pharmacist');const [[released]]=await db.query('SELECT COUNT(*) n FROM rx_reservations WHERE verification_id=?',[uploadId]);assert.equal(released.n,0);
 const [[cancelled]]=await db.query('SELECT status FROM rx_prescriptions WHERE id=?',[verified.prescription_id]);assert.equal(cancelled.status,'Cancelled');await request('/pos/preview','POST',{prescription_id:verified.prescription_id,items:[{batch_id:second.insertId,quantity:2}]},'pharmacist',400);
 const [[item]]=await db.query('SELECT id FROM rx_prescription_items WHERE prescription_id=?',[rx]);await request('/refills','POST',{prescription_item_id:item.id,next_refill_date:'2020-01-01',frequency_days:30},'doctor',201);
 const latest=await request('/bootstrap');const refill=latest.refills.find(r=>r.prescription_item_id===item.id);await request(`/refills/${refill.id}/advance`,'PATCH',{},'doctor');const checkup=latest.checkups.find(c=>c.prescription_id===rx);await request(`/checkups/${checkup.id}`,'PATCH',{status:'Completed',notes:'Test outcome'},'doctor');
 await t.test('all workflow assertions completed',()=>assert.ok(true));
 }finally{
 // Remove only this run's fixtures, preserving seeded accounts and all user-created records.
 if(uploadId){await db.query('DELETE FROM rx_reservations WHERE verification_id=?',[uploadId]);await db.query('DELETE FROM rx_verifications WHERE id=?',[uploadId]);}
 if(rxIds.length){await db.query('DELETE ii FROM rx_invoice_items ii JOIN rx_invoices i ON i.id=ii.invoice_id WHERE i.prescription_id IN (?)',[rxIds]);await db.query('DELETE FROM rx_invoices WHERE prescription_id IN (?)',[rxIds]);await db.query('DELETE r FROM rx_refills r JOIN rx_prescription_items i ON i.id=r.prescription_item_id WHERE i.prescription_id IN (?)',[rxIds]);await db.query('DELETE FROM rx_checkups WHERE prescription_id IN (?)',[rxIds]);await db.query('DELETE FROM rx_prescription_items WHERE prescription_id IN (?)',[rxIds]);await db.query('DELETE FROM rx_prescriptions WHERE id IN (?)',[rxIds]);}
 if(orderId){await db.query('DELETE FROM rx_purchase_order_items WHERE po_id=?',[orderId]);await db.query('DELETE FROM rx_purchase_orders WHERE id=?',[orderId]);}
 if(medicineIds.length){await db.query('DELETE im FROM rx_interaction_medicines im WHERE medicine_id IN (?)',[medicineIds]);await db.query('DELETE FROM rx_interaction_rules WHERE rule_name=?',[tag]);for(const table of ['rx_allergies','rx_instructions','rx_sports_restrictions','rx_dosage_limits'])await db.query(`DELETE FROM ${table} WHERE medicine_id IN (?)`,[medicineIds]);await db.query('DELETE a FROM rx_stock_adjustments a JOIN rx_batches b ON b.id=a.batch_id WHERE b.medicine_id IN (?)',[medicineIds]);await db.query('DELETE FROM rx_batches WHERE medicine_id IN (?)',[medicineIds]);await db.query('DELETE FROM rx_medicines WHERE id IN (?)',[medicineIds]);}
 if(auditIds.length)await db.query('DELETE FROM rx_action_history WHERE id IN (?)',[auditIds]);
 if(patientId)await db.query('DELETE FROM rx_patients WHERE id=?',[patientId]);await new Promise(r=>server.close(r));await db.end();
 }
});
