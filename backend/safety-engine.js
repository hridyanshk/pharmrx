const {fail,decimal}=require('./domain');
// Structured doses are milligrams per administration, never inferred from free text.
function doseFields(item){
 const supplied=item.dose_mg!=null&&item.dose_mg!==''||item.doses_per_day!=null&&item.doses_per_day!=='';
 if(!supplied)return {dose_mg:null,doses_per_day:null};
 return {dose_mg:decimal(item.dose_mg,'Dose (mg)',0.01,100000),doses_per_day:decimal(item.doses_per_day,'Doses per day',0.01,24)};
}
async function alerts(c,patientId,items){
 const result=[];
 const [[patient]]=await c.query('SELECT * FROM rx_patients WHERE id=?',[patientId]);
 if(!patient)fail('Patient not found.',404);
 for(const item of items){
  const [[p]]=await c.query('SELECT * FROM rx_medicine_profiles WHERE medicine_id=?',[item.medicine_id]);
  if(p){
   result.push({severity:'INFO',reason:'Medicine information',notes:p.side_effects+' '+p.cautions,source_url:p.source_url});
   const dose=doseFields(item);
   if(p.max_single_mg==null||p.max_daily_mg==null)result.push({severity:'CRITICAL',reason:'Individual dosing review required',notes:'This medicine requires a patient-specific dose assessment. No general dosing profile is configured.'});
   else if(dose.dose_mg==null)result.push({severity:'CRITICAL',reason:'Structured dose required',notes:'Enter dose in mg and doses per day for this medicine.'});
   else if(dose.dose_mg>p.max_single_mg||dose.dose_mg*dose.doses_per_day>p.max_daily_mg)result.push({severity:'CRITICAL',reason:'High dosage',notes:`Maximum configured single dose ${p.max_single_mg} mg; daily dose ${p.max_daily_mg} mg.`,source_url:p.source_url});
   if(!patient.date_of_birth||new Date(patient.date_of_birth)>new Date(new Date().setFullYear(new Date().getFullYear()-18)))result.push({severity:'CRITICAL',reason:'Adult dose profile only',notes:'Known adult date of birth is required; paediatric dosing is not configured.'});
  }
  const [rules]=await c.query('SELECT * FROM rx_flag_rules WHERE medicine_id=? AND enabled=1',[item.medicine_id]);
  for(const rule of rules)if(patient[rule.patient_flag])result.push({severity:rule.severity,reason:rule.rule_name,notes:rule.notes});
 }
 return result;
}
module.exports={doseFields,alerts};
