const fs=require('fs');const path=require('path');const mysql=require('mysql2/promise');const bcrypt=require('bcryptjs');
require('dotenv').config({path:path.join(__dirname,'.env')});
async function setup(){
 const c=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,port:process.env.DB_PORT||3306,multipleStatements:true});
 try{
  // Use the configured database: managed providers choose their own database names.
  const baseSchema=fs.readFileSync(path.join(__dirname,'../db.sql'),'utf8').replace(/^CREATE DATABASE[^;]*;\s*/im,'').replace(/^USE[^;]*;\s*/im,'');
  await c.query(baseSchema);
  await c.query(fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8'));
  const [[installed]]=await c.query("SELECT COUNT(*) n FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND TRIGGER_NAME='Before_Invoice_Item_Insert_Check_Athlete'");
  if(!installed.n) try{
  await c.query('DROP TRIGGER IF EXISTS Before_Invoice_Item_Insert_Check_Athlete');
  await c.query(`CREATE TRIGGER Before_Invoice_Item_Insert_Check_Athlete BEFORE INSERT ON rx_invoice_items FOR EACH ROW
  BEGIN IF EXISTS(SELECT 1 FROM rx_invoices i JOIN rx_patients p ON p.id=i.patient_id JOIN rx_batches b ON b.id=NEW.batch_id JOIN rx_sports_restrictions s ON s.medicine_id=b.medicine_id WHERE i.id=NEW.invoice_id AND p.flag_athlete=TRUE)
  THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Configured sports restriction: dispensing blocked for athlete'; END IF; END`);
  }catch(e){if(e.code!=='ER_BINLOG_CREATE_ROUTINE_NEED_SUPER')throw e;console.log('Administrator step pending: run install-db-routines.sql in Workbench.');}
  const [[procedure]]=await c.query("SELECT COUNT(*) n FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() AND ROUTINE_NAME='Schedule_Followup_Checkup'");
  if(!procedure.n){await c.query('DROP PROCEDURE IF EXISTS Schedule_Followup_Checkup');
  await c.query(`CREATE PROCEDURE Schedule_Followup_Checkup(IN p_patient_id INT,IN p_prescription_id INT,IN p_days_after INT)
  BEGIN IF p_days_after<1 OR p_days_after>365 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Follow-up days must be between 1 and 365'; END IF;
  INSERT INTO rx_checkups(patient_id,prescription_id,checkup_due_date) VALUES(p_patient_id,p_prescription_id,DATE_ADD(CURRENT_DATE,INTERVAL p_days_after DAY)); END`);}
  // Demo accounts are explicit, authenticated local project fixtures. Existing passwords are never reset.
  await c.beginTransaction();
  const demoPassword=process.env.DEMO_PASSWORD || (process.env.NODE_ENV==='production' ? '' : 'PharmRxDemo!2026');
  if(!demoPassword)throw new Error('Set DEMO_PASSWORD before initializing a hosted database.');
  const hash=await bcrypt.hash(demoPassword,12);
  const accounts=[['admin','Demo Administrator'],['pharmacist','Demo Pharmacist'],['doctor','Dr. Meera Shah'],['patient','Aarav Sharma'],['patient2','Nisha Rao']];
  for(const [key,name] of accounts){const role=key==='patient2'?'patient':key;await c.query('INSERT IGNORE INTO users(name,email,password_hash,role) VALUES(?,?,?,?)',[name,`${key}@pharmrx.local`,hash,role]);const [[u]]=await c.query('SELECT id FROM users WHERE email=?',[`${key}@pharmrx.local`]);
   if(role==='patient')await c.query('INSERT IGNORE INTO rx_patients(user_id,name,phone,address,flag_elderly_care) VALUES(?,?,?,?,?)',[u.id,name,'9000000000','Demo address',key==='patient2']);
   if(role==='doctor')await c.query('INSERT IGNORE INTO rx_doctors(user_id,name,reg_number,email) VALUES(?,?,?,?)',[u.id,name,'DEMO-DOC-001',`${key}@pharmrx.local`]);
   if(role==='pharmacist'||role==='admin')await c.query('INSERT IGNORE INTO rx_pharmacists(user_id,name,dl_number) VALUES(?,?,?)',[u.id,name,'DEMO-LICENCE']);
  }
  const [[count]]=await c.query('SELECT COUNT(*) n FROM rx_medicines');
  if(!count.n){
   const [s]=await c.query('INSERT INTO rx_suppliers(company_name,gstin,phone) VALUES(?,?,?)',['Demonstration Supplies','DEMO-GSTIN','9000000001']);
   for(const [name,generic,schedule,qty] of [['Demo medicine A','Sample ingredient A','Schedule H',120],['Demo medicine B','Sample ingredient B','OTC',15],['Demo medicine C','Sample ingredient C','Schedule H1',60]]){
    const [m]=await c.query('INSERT INTO rx_medicines(brand_name,generic_name,schedule_type) VALUES(?,?,?)',[name,generic,schedule]);
    await c.query('INSERT INTO rx_batches(medicine_id,batch_number,expiry_date,mrp,stock_qty,supplier_id) VALUES(?,?,DATE_ADD(CURRENT_DATE,INTERVAL 1 YEAR),?,?,?)',[m.insertId,`DEMO-${m.insertId}`,25,qty,s.insertId]);
   }
  }
  const [[prescriptionCount]]=await c.query('SELECT COUNT(*) n FROM rx_prescriptions');
  if(!prescriptionCount.n){
   const [[doctor]]=await c.query("SELECT d.id FROM rx_doctors d JOIN users u ON u.id=d.user_id WHERE u.email='doctor@pharmrx.local'");
   const [[medicine]]=await c.query("SELECT id FROM rx_medicines WHERE brand_name='Demo medicine A' LIMIT 1");
   if(doctor&&medicine)for(const [email,status] of [['patient@pharmrx.local','Pending Review'],['patient2@pharmrx.local','In Filling']]){
    const [[patient]]=await c.query('SELECT p.id FROM rx_patients p JOIN users u ON u.id=p.user_id WHERE u.email=?',[email]);
    const [p]=await c.query('INSERT INTO rx_prescriptions(patient_id,doctor_id,prescription_date,notes,status) VALUES(?,?,CURRENT_DATE,?,?)',[patient.id,doctor.id,'Fictional DBMS demonstration. No clinical directions are provided.',status]);
    await c.query('INSERT INTO rx_prescription_items(prescription_id,medicine_id,dosage,frequency,duration_days,quantity_prescribed) VALUES(?,?,?,?,?,?)',[p.insertId,medicine.id,'Demo directions only','Demo frequency',7,2]);
   }
  }
  await c.commit();console.log('PharmRx tables, views and demo accounts are ready. Database routines require the separate administrator script if not already installed.');
 }catch(e){await c.rollback();throw e;}finally{await c.end();}
}
if(require.main===module)setup().catch(e=>{console.error(e.code||'',e.message);process.exitCode=1;});
module.exports=setup;
