const test=require('node:test');const assert=require('node:assert/strict');
const app=require('../server');const db=require('../config/db');
test('public view selection needs no credentials and retains staff permissions',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const base=`http://127.0.0.1:${server.address().port}/api/clinical`;
 async function request(url,method='GET',body,token,expected=200){const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert.equal(r.status,expected,JSON.stringify(data));return data;}
 try{
 await request('/bootstrap','GET',null,null,401);
 for(const role of ['doctor','patient','root','',null])await request('/workspace-session','POST',{role},null,400);
 const admin=await request('/workspace-session','POST',{role:'admin'});
 const pharma=await request('/workspace-session','POST',{role:'pharmacist',user_id:admin.user.id});
 assert.equal(admin.user.role,'admin');assert.equal(pharma.user.role,'pharmacist');assert.notEqual(admin.user.id,pharma.user.id);
 const adminView=await request('/bootstrap','GET',null,admin.token);const pharmaView=await request('/bootstrap','GET',null,pharma.token);
 assert.ok(Array.isArray(adminView.accounts));assert.ok(Array.isArray(adminView.checkpoints));
 assert.equal(pharmaView.accounts,undefined);assert.equal(pharmaView.checkpoints,undefined);assert.ok(Array.isArray(pharmaView.batches));
 await request('/checkpoints','POST',{label:'Should not save'},pharma.token,403);
 await request('/accounts','POST',{},pharma.token,403);
 }finally{await new Promise(r=>server.close(r));await db.end();}
});
