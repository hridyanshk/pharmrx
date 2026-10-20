const test=require('node:test');const assert=require('node:assert/strict');
const {doseFields}=require('../safety-engine');
test('dose values must be structured, positive, finite and paired',()=>{
 assert.deepEqual(doseFields({dosage:'500 mg'}),{dose_mg:null,doses_per_day:null});
 assert.deepEqual(doseFields({dose_mg:500,doses_per_day:3}),{dose_mg:500,doses_per_day:3});
 for(const item of [{dose_mg:500},{doses_per_day:3},{dose_mg:-1,doses_per_day:3},{dose_mg:500,doses_per_day:Infinity}])assert.throws(()=>doseFields(item));
});
test('UPDATE trigger independently rejects high dosage on an existing invoice item',async()=>{
 require('dotenv').config({path:require('path').join(__dirname,'../.env'),quiet:true});
 const db=require('../config/db');const c=await db.getConnection();
 try{
 await c.beginTransaction();
 const [[item]]=await c.query('SELECT ii.id,inv.prescription_id,b.medicine_id FROM rx_invoice_items ii JOIN rx_invoices inv ON inv.id=ii.invoice_id JOIN rx_batches b ON b.id=ii.batch_id JOIN rx_medicine_profiles mp ON mp.medicine_id=b.medicine_id WHERE mp.max_single_mg IS NOT NULL LIMIT 1');
 assert.ok(item,'Run seed-small.js and verify-small.js to populate the two demo issues.');
 await c.query('UPDATE rx_prescription_items SET dose_mg=99999 WHERE prescription_id=? AND medicine_id=?',[item.prescription_id,item.medicine_id]);
 await assert.rejects(c.query('UPDATE rx_invoice_items SET unit_price=unit_price+1 WHERE id=?',[item.id]),e=>e.sqlState==='45000'&&/dosage/.test(e.sqlMessage));
 }finally{await c.rollback();c.release();await db.end();}
});
