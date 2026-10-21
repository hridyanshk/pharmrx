// Adds clearly fictional, linked demonstration records through the same APIs as the website.
// Existing records are preserved. Credentials are read from ignored local environment files.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const dotenv=require('dotenv');
const large=process.argv.includes('--large');
const local=process.argv.includes('--local');
const count=large?{medicines:300,patients:500,prescriptions:1500,invoices:250}:{medicines:100,patients:200,prescriptions:500,invoices:80};
const prefix='PHARMRX-DEMO-V1';
const hosted=local?null:dotenv.parse(fs.readFileSync(path.join(__dirname,'../.env.hosted-access')));
const base=(local?'http://localhost:5000':hosted.WEBSITE_URL.replace(/\/$/,'')).replace(/\/$/,'')+'/api/clinical';
const now=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const shifted=days=>{const d=new Date(now+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);};
const number=i=>String(i+1).padStart(4,'0');
let token;
const auditIds=[];
async function request(url,method='GET',body){
 const response=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});
 const data=await response.json();if(!response.ok)throw new Error(`${method} ${url}: ${data.error||response.status}`);if(data.undo)auditIds.push(data.undo.id);return data;
}
async function phase(label,list,fn){let next=0,completed=0;console.log(`${label}: ${list.length} planned`);
 await Promise.all(Array.from({length:3},async()=>{while(next<list.length){const i=next++;await fn(list[i],i);completed++;if(completed%50===0)console.log(`${label}: ${completed}/${list.length}`);}}));
 console.log(`${label}: complete`);
}
const names=['Aarav','Aditi','Kabir','Meera','Nisha','Arjun','Sana','Ishaan','Tara','Rohan','Zoya','Dev','Anaya','Vihaan','Mira','Neel','Sara','Riya','Rehan','Kavya'];
const surnames=['Sharma','Rao','Khan','Mehta','Shah','Kapoor','Ali','Joshi','Singh','Patel'];
const batches=[],medicines=[],patients=[],doctors=[],suppliers=[],prescriptions=[];
async function main(){
 token=(await request('/login','POST',{email:local?'admin@pharmrx.local':hosted.ADMIN_EMAIL,password:local?'PharmRxDemo!2026':hosted.PASSWORD})).token;
 const initial=await request('/bootstrap');
 await phase('Suppliers',Array.from({length:12},(_,i)=>i),async i=>{
  const company_name=`Demo Supply House ${number(i)}`;const old=initial.suppliers.find(s=>s.company_name===company_name);
  suppliers[i]=old||{id:(await request('/records/suppliers','POST',{company_name,gstin:`DEMO-GST-${number(i)}`,phone:`DEMO-CONTACT-${number(i)}`})).id};
 });
 await phase('Doctors',Array.from({length:20},(_,i)=>i),async i=>{
  const reg_number=`${prefix}-DOC-${number(i)}`;const old=initial.doctors.find(d=>d.reg_number===reg_number);
  doctors[i]=old||{id:(await request('/records/doctors','POST',{name:`Dr ${names[i%names.length]} ${surnames[i%surnames.length]} (Demo ${number(i)})`,reg_number,email:`doctor${i+1}@example.invalid`,phone:`DEMO-PHONE-${number(i)}`})).id};
 });
 await phase('Medicines',Array.from({length:count.medicines},(_,i)=>i),async i=>{
  const brand_name=`Demo ${['Aster','Cedar','Juniper','Saffron','Iris','Amber','Willow','Pearl'][i%8]} ${number(i)}`;
  const old=initial.medicines.find(m=>m.brand_name===brand_name);
  medicines[i]=old||{id:(await request('/records/medicines','POST',{brand_name,generic_name:`Fictional project compound ${number(i)}`,hsn_code:'DEMO-HSN',schedule_type:['OTC','Schedule H','Schedule H1','Schedule X'][i%4],tax_rate:[0,5,12,18][i%4],reorder_level:20+(i%4)*10})).id,brand_name};
 });
 await phase('Patients',Array.from({length:count.patients},(_,i)=>i),async i=>{
  const name=`${names[i%names.length]} ${surnames[Math.floor(i/names.length)%surnames.length]} (Demo ${number(i)})`;
  const old=initial.patients.find(p=>p.name===name);
  patients[i]=old||{id:(await request('/records/patients','POST',{name,date_of_birth:`${i%8===0?1952+i%15:1980+i%25}-${String(i%12+1).padStart(2,'0')}-${String(i%27+1).padStart(2,'0')}`,phone:`DEMO-PHONE-${number(i)}`,address:`Fictional address ${i+1}, Demo Town — project data only`,flag_athlete:i%13===0,flag_elderly_care:i%8===0,flag_high_risk_addiction:i%17===0})).id,name,flag_athlete:i%13===0};
 });
 await phase('Stock batches',Array.from({length:count.medicines*2},(_,i)=>i),async i=>{
  const medicine=medicines[Math.floor(i/2)],batch_number=`${prefix}-BATCH-${number(i)}`;
  const old=initial.batches.find(b=>b.medicine_id===medicine.id&&b.batch_number===batch_number);
  const stock_qty=i%14===0?5:i%19===0?0:300+(i%9)*40;
  batches[i]=old||{id:(await request('/batches','POST',{medicine_id:medicine.id,supplier_id:suppliers[i%suppliers.length].id,batch_number,expiry_date:shifted(i%11===0?14:180+i%540),mrp:15+(i%30)*7.5,stock_qty})).id,medicine_id:medicine.id,stock_qty};
 });
 const rxInputs=Array.from({length:count.prescriptions},(_,i)=>i);
 await phase('Prescriptions',rxInputs,async i=>{
  const marker=`[${prefix}:RX:${number(i)}]`;
  const old=initial.prescriptions.find(p=>p.notes?.includes(marker));
  if(old){prescriptions[i]={...old,existed:true,index:i};return;}
  const patient=patients[i%patients.length];
  const chosen=[medicines[i%medicines.length],medicines[(i+7)%medicines.length],medicines[(i+23)%medicines.length]].slice(0,i%3+1);
  const items=chosen.map((m,j)=>({medicine_id:m.id,quantity:2+j,dosage:'Fictional demo instruction — not for treatment',frequency:'Project demonstration frequency',duration_days:7+(i%4)*7}));
  const id=(await request('/prescriptions','POST',{patient_id:patient.id,doctor_id:doctors[i%doctors.length].id,notes:`${marker} Fictional DBMS sample. Not a clinical prescription.`,items})).id;
  const rx={id,patient_id:patient.id,status:'Pending Review',index:i,items,patient};prescriptions[i]=rx;
  if(i%5!==0){await request(`/prescriptions/${id}/review`,'PATCH',{});rx.status='In Filling';}
 });
 const invoiceCandidates=prescriptions.filter(p=>!p.existed&&p.status==='In Filling'&&!p.patient.flag_athlete&&p.items.every(item=>batches.some(b=>b.medicine_id===item.medicine_id&&Number(b.stock_qty)>=40))).slice(0,count.invoices);
 await phase('Demo invoices',invoiceCandidates,async rx=>{
  const items=rx.items.map(item=>({batch_id:batches.find(b=>b.medicine_id===item.medicine_id&&Number(b.stock_qty)>=40).id,quantity:item.quantity}));
  const request_id=crypto.createHash('sha256').update(`${prefix}-SALE-${rx.id}`).digest('hex');
  const check=await request('/pos/preview','POST',{prescription_id:rx.id,items});
  if(check.alerts.some(a=>a.severity==='CRITICAL')){console.log(`Skipped blocked demo RX-${rx.id}`);return;}
  await request('/pos/checkout','POST',{prescription_id:rx.id,request_id,items,followup_days:7,override_reason:check.alerts.length?'Fictional dataset: configured demonstration warning reviewed.':''});
 });
 let latest=await request('/bootstrap');
 const existingOrders=new Set((latest.orders||[]).filter(o=>suppliers.some(s=>s.id===o.supplier_id)).map(o=>o.supplier_id));
 await phase('Purchase orders',suppliers.filter(s=>!existingOrders.has(s.id)),async(s,i)=>{
  const medicine=medicines[(i*9)%medicines.length];const order=await request('/orders','POST',{supplier_id:s.id,items:[{medicine_id:medicine.id,quantity:60}]});
  if(i%3!==0)await request(`/orders/${order.id}/status`,'PATCH',{status:'Sent'});
  if(i%3===2)await request(`/orders/${order.id}/receive`,'POST',{items:[{medicine_id:medicine.id,quantity:60,batch_number:`${prefix}-PO-${order.id}`,expiry_date:shifted(730),mrp:45}]});
 });
 latest=await request('/bootstrap');
 const refillIds=new Set((latest.refills||[]).map(r=>r.prescription_item_id));
 const ownIds=new Set(prescriptions.map(p=>p.id));
 const refillItems=(latest.prescriptionItems||[]).filter(item=>ownIds.has(item.prescription_id)&&!refillIds.has(item.id)).slice(0,60);
 await phase('Refill reminders',refillItems,async(item,i)=>request('/refills','POST',{prescription_item_id:item.id,next_refill_date:shifted(i%3===0?-3:3+i%45),frequency_days:30}));
 // Rules are added last so baseline sample invoices remain straightforward.
 latest=await request('/bootstrap');
 const rules=Array.from({length:8},(_,i)=>i);
 await phase('Fictional safety examples',rules,async i=>{
  const patient=patients[(i*13)%patients.length],medicine=medicines[(i*11)%medicines.length];
  if(!latest.allergies.some(a=>a.patient_id===patient.id&&a.medicine_id===medicine.id&&a.allergy_name===`${prefix} demo allergy`))await request('/records/allergies','POST',{patient_id:patient.id,medicine_id:medicine.id,allergy_name:`${prefix} demo allergy`,severity:i%2?'Moderate':'Severe'});
  if(!latest.instructions.some(a=>a.patient_id===patient.id&&a.medicine_id===medicine.id&&a.notes?.includes(prefix)))await request('/records/instructions','POST',{patient_id:patient.id,medicine_id:medicine.id,instruction_type:i%2?'Monitoring Required':'Avoid',notes:`${prefix}: Fictional doctor-instruction example for demonstrating the review prompt.`});
 });
 const data=await request('/bootstrap');
 const counts=Object.fromEntries(['medicines','patients','doctors','suppliers','batches','prescriptions','prescriptionItems','invoices','invoiceItems','orders','orderItems','refills','checkups','allergies','instructions'].map(k=>[k,(data[k]||[]).length]));
 const report={target:local?'local':hosted.WEBSITE_URL,seed:prefix,fictional:true,completed_at:new Date().toISOString(),counts,created_action_ids:auditIds};
 const reportPath=path.join(__dirname,`../design-previews/database-${local?'local':'hosted'}-seed-report.json`);fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
 console.log('FINAL '+JSON.stringify({target:report.target,counts,report:reportPath}));
}
main().catch(error=>{console.error('Seed stopped: '+error.message);console.error('Completed records were preserved. Rerun to skip existing named demo records.');process.exitCode=1;});
