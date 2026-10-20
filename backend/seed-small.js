// Explicit demo reset: full pre-reset backup, transactional replacement, no real patients.
const fs=require('fs');const path=require('path');const mysql=require('mysql2/promise');
require('dotenv').config({path:path.join(__dirname,'.env')});
async function main(){
 const c=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,port:process.env.DB_PORT||3306,multipleStatements:true,dateStrings:true});
 const h=require('./action-history');const dir=path.join(__dirname,'../evidence');fs.mkdirSync(dir,{recursive:true});
 try{
 await require('./install-safety').schema(c);
 const backup={created_at:new Date().toISOString(),tables:{}};
 for(const table of [...h.tables,'rx_action_history','rx_checkpoints']){const [r]=await c.query(table==='users'?'SELECT id,name,email,role FROM users':`SELECT * FROM \`${table}\``);backup.tables[table]=r;}
 // Password hashes are unnecessary: user accounts are preserved by the reset.
 const backupPath=path.join(dir,'before-small-reset-'+Date.now()+'.json');fs.writeFileSync(backupPath,JSON.stringify(backup,null,2));
 await c.beginTransaction();
 for(const table of [...h.tables].reverse())if(table!=='users')await c.query(`DELETE FROM \`${table}\``);
 await c.query('DELETE FROM rx_action_history');await c.query('DELETE FROM rx_checkpoints');
 const [users]=await c.query('SELECT id,name,email,role FROM users');
 for(const u of users){if(u.role==='patient')await c.query('INSERT INTO rx_patients(user_id,name,date_of_birth) VALUES(?,?,?)',[u.id,u.name,'1995-06-15']);
 if(u.role==='doctor')await c.query('INSERT INTO rx_doctors(user_id,name,reg_number) VALUES(?,?,?)',[u.id,u.name,'DEMO-REG-'+u.id]);
 if(['admin','pharmacist'].includes(u.role))await c.query('INSERT INTO rx_pharmacists(user_id,name,dl_number) VALUES(?,?,?)',[u.id,u.name,'DEMO-LICENCE']);}
 const names=['Kabir Mehta','Aditi Shah','Sana Khan','Arjun Patel','Tara Joshi','Neel Kapoor','Riya Singh','Dev Rao'];
 for(let i=0;i<names.length;i++)await c.query('INSERT INTO rx_patients(name,date_of_birth,phone,address,flag_athlete,flag_elderly_care,flag_high_risk_addiction) VALUES(?,?,?,?,?,?,?)',[names[i],i===3?'1950-01-15':'1994-03-12','90000000'+String(i).padStart(2,'0'),'Fictional college demo record',i===2,i===3,i===4]);
 const [supplier]=await c.query("INSERT INTO rx_suppliers(company_name,phone) VALUES('College Demo Supplies','9000000099')");
 const catalog=[
 ['Paracetamol 500 mg','Paracetamol',500,1000,4000,'Side effects are uncommon at recommended doses; rare serious allergic reactions.','Overdose may cause severe liver damage. Avoid duplicate paracetamol products; lower limits may apply below 50 kg or with liver disease.','https://www.nhs.uk/medicines/paracetamol-for-adults/',500,3,3],
 ['Ibuprofen 200 mg','Ibuprofen',200,400,1200,'Indigestion, stomach pain, nausea; serious risks include gastrointestinal bleeding, kidney injury and allergic reactions.','Avoid with other NSAIDs or anticoagulants without prescriber review; use extra caution with ulcers, kidney disease and pregnancy.','https://www.nhs.uk/medicines/ibuprofen-for-adults/',200,3,3],
 ['Cetirizine 10 mg','Cetirizine',10,10,10,'Sleepiness, tiredness, headache, dry mouth, nausea and dizziness.','Kidney impairment may require a lower dose. Avoid driving if sleepy.','https://www.nhs.uk/medicines/cetirizine/how-and-when-to-take-cetirizine/',10,1,7]
 ];
 const medicines=[];
 for(const [brand,generic,strength,single,daily,effects,cautions,url,dose,frequency,duration] of catalog){
 const [m]=await c.query('INSERT INTO rx_medicines(brand_name,generic_name,schedule_type,tax_rate,reorder_level) VALUES(?,?,?,0,20)',[brand,generic,'OTC']);
 await c.query('INSERT INTO rx_medicine_profiles(medicine_id,strength_mg,max_single_mg,max_daily_mg,side_effects,cautions,source_url,reviewed_on) VALUES(?,?,?,?,?,?,?,CURRENT_DATE)',[m.insertId,strength,single,daily,effects,cautions,url]);
 const [b]=await c.query('INSERT INTO rx_batches(medicine_id,batch_number,expiry_date,mrp,stock_qty,supplier_id) VALUES(?,?,DATE_ADD(CURRENT_DATE,INTERVAL 1 YEAR),?,200,?)',[m.insertId,'SMALL-'+m.insertId,2+medicines.length,supplier.insertId]);
 medicines.push({id:m.insertId,batch:b.insertId,dose,frequency,duration,quantity:frequency*duration});
 }
 // Warfarin is a real catalog entry for the sourced interaction example; its dose is individually prescribed.
 const [warfarin]=await c.query("INSERT INTO rx_medicines(brand_name,generic_name,schedule_type) VALUES('Warfarin 1 mg','Warfarin','Schedule H')");
 await c.query("INSERT INTO rx_medicine_profiles(medicine_id,strength_mg,side_effects,cautions,source_url,reviewed_on) VALUES(?,1,?,?,?,CURRENT_DATE)",[warfarin.insertId,'Bleeding, bruising; serious internal bleeding can occur.','Dose is individually adjusted using INR monitoring; no general dose ceiling is supplied. Ibuprofen increases bleeding risk.','https://www.nhs.uk/medicines/warfarin/']);
 const [rule]=await c.query("INSERT INTO rx_interaction_rules(rule_name,severity_level) VALUES('Ibuprofen + warfarin: increased bleeding risk','High')");
 for(const id of [medicines[1].id,warfarin.insertId])await c.query('INSERT INTO rx_interaction_medicines(rule_id,medicine_id) VALUES(?,?)',[rule.insertId,id]);
 const [patients]=await c.query('SELECT id,flag_elderly_care FROM rx_patients ORDER BY id');const [[doctor]]=await c.query('SELECT id FROM rx_doctors ORDER BY id LIMIT 1');
 const [[actor]]=await c.query("SELECT id,role FROM users WHERE role='admin' ORDER BY id LIMIT 1");
 await require('./checkpoints').create(c,actor,'Small dataset: before prescriptions','Seed');
 const prescriptions=[];
 for(let i=0;i<20;i++){
 const med=medicines[i%3],patient=patients[i%patients.length];
 const [p]=await c.query("INSERT INTO rx_prescriptions(patient_id,doctor_id,prescription_date,notes,status) VALUES(?,?,CURRENT_DATE,?,'Pending Review')",[patient.id,doctor.id,`Fictional adult demonstration ${i+1}/20; illustrative directions, not individual treatment.`]);
 await c.query('INSERT INTO rx_prescription_items(prescription_id,medicine_id,dosage,frequency,duration_days,quantity_prescribed,dose_mg,doses_per_day) VALUES(?,?,?,?,?,?,?,?)',[p.insertId,med.id,med.dose+' mg',med.frequency+' times daily'+(med.id===medicines[1].id?' with food':''),med.duration,med.quantity,med.dose,med.frequency]);
 prescriptions.push({id:p.insertId,patient_id:patient.id,medicine:med});
 if((i+1)%5===0)await require('./checkpoints').create(c,actor,'After '+(i+1)+' demo prescriptions','5 prescriptions');
 }
 await c.query("INSERT INTO rx_allergies(patient_id,medicine_id,allergy_name,severity) VALUES(?,?,'Documented ibuprofen allergy (fictional patient)','Severe')",[patients[2].id,medicines[1].id]);
 await c.query("INSERT INTO rx_instructions(patient_id,medicine_id,instruction_type,notes) VALUES(?,?,'Monitoring Required','Fictional care plan: confirm monitoring and schedule follow-up before issuing.')",[patients[5].id,medicines[1].id]);
 for(const [flag,med] of [['flag_athlete',medicines[2]],['flag_elderly_care',medicines[1]],['flag_high_risk_addiction',medicines[0]]])await c.query("INSERT INTO rx_flag_rules(rule_name,medicine_id,patient_flag,severity,notes) VALUES(?,?,?,'HIGH',?)",['Care plan review: '+flag,med.id,flag,'Workflow example: patient is flagged for additional care. Review their individual care plan; this is not a drug contraindication or a sports ban.']);
 await c.commit();fs.writeFileSync(path.join(dir,'small-dataset.json'),JSON.stringify({backup:backupPath,prescriptions,medicines,created_at:new Date().toISOString()},null,2));
 console.log('Saved full pre-reset data backup. Created 20 pending prescriptions, 10 patients, 4 real medicines. Dispense 2 through the API after trigger verification.');
 }catch(e){await c.rollback();throw e;}finally{await c.end();}
}
if(require.main===module)main().catch(e=>{console.error(e.code,e.message);process.exitCode=1;});
