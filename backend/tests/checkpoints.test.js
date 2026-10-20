const test=require('node:test');const assert=require('node:assert/strict');const app=require('../server');const db=require('../config/db');const h=require('../action-history');const cp=require('../checkpoints');
test('five-prescription and 30-minute checkpoints restore persisted app state atomically',{timeout:45000},async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}/api/clinical`;let token,baseline;
 async function api(url,method='GET',body){const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert.ok(r.ok,JSON.stringify(data));return data;}
 try{
 token=(await api('/login','POST',{email:'admin@pharmrx.local',password:'PharmRxDemo!2026'})).token;
 const data=await api('/bootstrap');baseline=await api('/checkpoints','POST',{label:'Checkpoint integration baseline'});
 const medicine=data.medicines.find(m=>m.generic_name==='Paracetamol');
 const directions={medicine_id:medicine.id,quantity:3,dosage:'500 mg',frequency:'Once daily',duration_days:3,dose_mg:500,doses_per_day:1};
 for(let i=0;i<4;i++)await api('/prescriptions','POST',{patient_id:data.patients[0].id,doctor_id:data.doctors[0].id,items:[directions]});
 const upload=await api('/verification/upload','POST',{patient_id:data.patients[0].id,uploaded_image_url:'data:image/png;base64,iVBORw0KGgo=',fulfillment_type:'Pickup',items:[{medicine_id:medicine.id,quantity:3}]});
 await api(`/verification/${upload.id}`,'PATCH',{status:'Verified',doctor_id:data.doctors[0].id,notes:'Fifth prescription created by verification',items:[directions]});
 const [[five]]=await db.query('SELECT * FROM rx_checkpoints ORDER BY id DESC LIMIT 1');assert.equal(five.reason,'5 prescriptions');
 const saved=typeof five.state==='string'?JSON.parse(five.state):five.state;assert.equal(saved.rx_prescriptions.length,data.prescriptions.length+5);
 await db.query('UPDATE rx_checkpoints SET created_at=CURRENT_TIMESTAMP-INTERVAL 31 MINUTE WHERE id=?',[five.id]);
 await h.locked(db,c=>cp.automatic(c,data.user));
 const [[timed]]=await db.query('SELECT * FROM rx_checkpoints ORDER BY id DESC LIMIT 1');assert.equal(timed.reason,'30 minutes');
 const restore=await api(`/checkpoints/${baseline.id}/restore`,'POST',{});assert.ok(restore.recovery_checkpoint);
 const after=await api('/bootstrap');assert.equal(after.prescriptions.length,data.prescriptions.length);assert.deepEqual(after.batches,data.batches);
 require('fs').writeFileSync(require('path').join(__dirname,'../../evidence/checkpoint-proof.json'),JSON.stringify({passed:true,five_prescriptions:{id:five.id,reason:five.reason,saved_prescriptions:saved.rx_prescriptions.length},thirty_minutes:{id:timed.id,reason:timed.reason,method:'Advanced checkpoint timestamp by 31 minutes; invoked the same automatic routine as the server timer.'},restore,final_prescriptions:after.prescriptions.length},null,2));
 }finally{if(baseline){await api(`/checkpoints/${baseline.id}/restore`,'POST',{}).catch(()=>{});}await new Promise(r=>server.close(r));await db.end();}
});
