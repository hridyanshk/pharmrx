const fs=require('fs');const path=require('path');
const triggerBody=`
 DECLARE patient INT; DECLARE medicine INT; DECLARE rx INT; DECLARE review_notes TEXT; DECLARE locked_patient INT;
 SELECT patient_id,prescription_id,override_reason INTO patient,rx,review_notes FROM rx_invoices WHERE id=NEW.invoice_id;
 SELECT id INTO locked_patient FROM rx_patients WHERE id=patient FOR UPDATE;
 SELECT medicine_id INTO medicine FROM rx_batches WHERE id=NEW.batch_id;
 IF EXISTS(SELECT 1 FROM rx_patients p WHERE p.id=patient AND p.requires_full_profile=1 AND (p.date_of_birth IS NULL OR p.phone IS NULL OR CHAR_LENGTH(TRIM(p.phone))=0 OR p.address IS NULL OR CHAR_LENGTH(TRIM(p.address))=0)) THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Required patient profile is incomplete'; END IF;
 IF EXISTS(SELECT 1 FROM rx_batches WHERE id=NEW.batch_id AND (expiry_date<CURRENT_DATE OR stock_qty<NEW.qty_sold)) THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Expired batch or insufficient stock'; END IF;
 IF EXISTS(SELECT 1 FROM rx_allergies WHERE patient_id=patient AND medicine_id=medicine AND severity='Severe') OR
 EXISTS(SELECT 1 FROM rx_instructions WHERE patient_id=patient AND medicine_id=medicine AND instruction_type='Avoid') THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Patient allergy or avoid instruction blocks dispensing'; END IF;
 IF EXISTS(SELECT 1 FROM rx_patients p JOIN rx_sports_restrictions s ON s.medicine_id=medicine WHERE p.id=patient AND p.flag_athlete=1) THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Sports restriction blocks athlete dispensing'; END IF;
 IF EXISTS(SELECT 1 FROM rx_patients p JOIN rx_flag_rules r ON r.medicine_id=medicine AND r.enabled=1 WHERE p.id=patient AND r.severity='CRITICAL' AND
 ((r.patient_flag='flag_athlete' AND p.flag_athlete=1) OR (r.patient_flag='flag_elderly_care' AND p.flag_elderly_care=1) OR (r.patient_flag='flag_high_risk_addiction' AND p.flag_high_risk_addiction=1))) THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Configured patient flag blocks dispensing'; END IF;
 IF EXISTS(SELECT 1 FROM rx_medicine_profiles mp WHERE mp.medicine_id=medicine AND
 (mp.max_single_mg IS NULL OR mp.max_daily_mg IS NULL OR rx IS NULL OR NOT EXISTS(SELECT 1 FROM rx_prescription_items it WHERE it.prescription_id=rx AND it.medicine_id=medicine) OR
 EXISTS(SELECT 1 FROM rx_prescription_items it WHERE it.prescription_id=rx AND it.medicine_id=medicine AND (it.dose_mg IS NULL OR it.doses_per_day IS NULL OR it.dose_mg>mp.max_single_mg OR it.dose_mg*it.doses_per_day>mp.max_daily_mg)) OR
 EXISTS(SELECT 1 FROM rx_patients p WHERE p.id=patient AND (p.date_of_birth IS NULL OR TIMESTAMPDIFF(YEAR,p.date_of_birth,CURRENT_DATE)<18)))) THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Missing structured adult dose or high dosage blocks dispensing'; END IF;
 IF EXISTS(SELECT 1 FROM rx_dosage_limits l WHERE l.medicine_id=medicine AND l.risk_level<>'Standard' AND NEW.qty_sold+
 (SELECT COALESCE(SUM(ii.qty_sold),0) FROM rx_invoice_items ii JOIN rx_invoices inv ON inv.id=ii.invoice_id JOIN rx_batches b ON b.id=ii.batch_id WHERE ii.id<>NEW.id AND inv.patient_id=patient AND b.medicine_id=medicine AND inv.invoice_date>=CURRENT_TIMESTAMP-INTERVAL 30 DAY)>l.max_qty_per_30_days) THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Rolling 30 day quantity limit exceeded'; END IF;
 IF EXISTS(SELECT 1 FROM rx_interaction_rules r WHERE r.severity_level='High'
 AND EXISTS(SELECT 1 FROM rx_interaction_medicines im WHERE im.rule_id=r.id AND im.medicine_id=medicine)
 AND (SELECT COUNT(*) FROM rx_interaction_medicines WHERE rule_id=r.id)>=2
 AND NOT EXISTS(SELECT 1 FROM rx_interaction_medicines im WHERE im.rule_id=r.id AND im.medicine_id<>medicine AND NOT EXISTS
 (SELECT 1 FROM rx_prescription_items it JOIN rx_prescriptions p ON p.id=it.prescription_id WHERE p.patient_id=patient AND p.status<>'Cancelled' AND it.medicine_id=im.medicine_id AND DATE_ADD(p.prescription_date,INTERVAL it.duration_days DAY)>=CURRENT_DATE)
 AND NOT EXISTS(SELECT 1 FROM rx_invoice_items ii JOIN rx_invoices inv ON inv.id=ii.invoice_id JOIN rx_batches b ON b.id=ii.batch_id WHERE inv.patient_id=patient AND b.medicine_id=im.medicine_id AND inv.invoice_date>=CURRENT_TIMESTAMP-INTERVAL 30 DAY))) THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='High severity medicine combination blocks dispensing'; END IF;
 IF review_notes IS NULL OR CHAR_LENGTH(TRIM(review_notes))=0 THEN
 IF EXISTS(SELECT 1 FROM rx_dosage_limits l WHERE l.medicine_id=medicine AND NEW.qty_sold+
 (SELECT COALESCE(SUM(ii.qty_sold),0) FROM rx_invoice_items ii JOIN rx_invoices inv ON inv.id=ii.invoice_id JOIN rx_batches b ON b.id=ii.batch_id WHERE ii.id<>NEW.id AND inv.patient_id=patient AND b.medicine_id=medicine AND inv.invoice_date>=CURRENT_TIMESTAMP-INTERVAL 30 DAY)>=l.max_qty_per_30_days*0.8) THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Quantity warning requires recorded review notes'; END IF;
 IF EXISTS(SELECT 1 FROM rx_interaction_rules r WHERE r.severity_level<>'High'
 AND EXISTS(SELECT 1 FROM rx_interaction_medicines im WHERE im.rule_id=r.id AND im.medicine_id=medicine)
 AND (SELECT COUNT(*) FROM rx_interaction_medicines WHERE rule_id=r.id)>=2
 AND NOT EXISTS(SELECT 1 FROM rx_interaction_medicines im WHERE im.rule_id=r.id AND im.medicine_id<>medicine AND NOT EXISTS
 (SELECT 1 FROM rx_prescription_items it JOIN rx_prescriptions p ON p.id=it.prescription_id WHERE p.patient_id=patient AND p.status<>'Cancelled' AND it.medicine_id=im.medicine_id AND DATE_ADD(p.prescription_date,INTERVAL it.duration_days DAY)>=CURRENT_DATE))) THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Medicine combination warning requires review notes'; END IF;
 IF EXISTS(SELECT 1 FROM View_Patient_Safety_Alerts WHERE patient_id=patient AND medicine_id=medicine AND CAST(severity AS BINARY)<>CAST('CRITICAL' AS BINARY)) OR
 EXISTS(SELECT 1 FROM rx_patients p JOIN rx_flag_rules r ON r.medicine_id=medicine AND r.enabled=1 AND r.severity='HIGH' WHERE p.id=patient AND
 ((r.patient_flag='flag_athlete' AND p.flag_athlete=1) OR (r.patient_flag='flag_elderly_care' AND p.flag_elderly_care=1) OR (r.patient_flag='flag_high_risk_addiction' AND p.flag_high_risk_addiction=1))) THEN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Patient warning requires recorded review notes'; END IF; END IF;
`;
async function schema(c){
 await c.query(fs.readFileSync(path.join(__dirname,'safety-schema.sql'),'utf8'));
 const [[profileId]]=await c.query("SELECT COUNT(*) n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='rx_medicine_profiles' AND COLUMN_NAME='id'");
 if(!profileId.n)await c.query('ALTER TABLE rx_medicine_profiles ADD COLUMN id INT NOT NULL AUTO_INCREMENT UNIQUE');
 await c.query('ALTER TABLE rx_medicine_profiles MODIFY max_single_mg DECIMAL(10,2) NULL, MODIFY max_daily_mg DECIMAL(10,2) NULL');
 for(const [name,type] of [['dose_mg','DECIMAL(10,2)'],['doses_per_day','DECIMAL(5,2)']]){
  const [[r]]=await c.query('SELECT COUNT(*) n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?',['rx_prescription_items',name]);
  if(!r.n)await c.query(`ALTER TABLE rx_prescription_items ADD COLUMN ${name} ${type} NULL CHECK (${name}>0)`);
 }
}
async function install(c){
 // Only fixed, reviewed SQL is installed. Website users configure data, never raw SQL.
 for(const event of ['INSERT','UPDATE']){
 const name='rx_safety_invoice_'+event.toLowerCase();
 const [[exists]]=await c.query('SELECT COUNT(*) n FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND TRIGGER_NAME=?',[name]);
 if(!exists.n)await c.query(`CREATE TRIGGER ${name} BEFORE ${event} ON rx_invoice_items FOR EACH ROW BEGIN ${triggerBody} END`);
 }
}
module.exports={schema,install,triggerBody};
if(require.main===module){require('dotenv').config({path:path.join(__dirname,'.env')});(async()=>{const c=await require('mysql2/promise').createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,port:process.env.DB_PORT||3306,multipleStatements:true});try{await schema(c);await install(c);console.log('Safety schema and INSERT/UPDATE triggers installed.');}finally{await c.end();}})().catch(e=>{console.error(e.code,e.message);process.exitCode=1;});}
