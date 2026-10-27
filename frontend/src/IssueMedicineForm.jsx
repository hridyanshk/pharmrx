import React from 'react';
import {AlertTriangle, CheckCircle2, ChevronDown, Minus, Plus, ShieldCheck, X} from 'lucide-react';
import {Motif} from './Apothecary.jsx';

const price=v=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(Number(v||0));
export default function IssueMedicineForm({data,form,setForm,items,setItems,preview,checking,busy,onRetry,today}) {
 const prescriptions=(data.prescriptions||[]).filter(p=>p.status!=='Dispensed'&&p.status!=='Cancelled');
 const rx=prescriptions.find(p=>p.id===Number(form.prescription_id));
 const patient=(data.patients||[]).find(p=>p.id===rx?.patient_id);
 const expected=(data.prescriptionItems||[]).filter(i=>i.prescription_id===rx?.id);
 const information=(preview?.alerts||[]).filter(a=>a.severity==='INFO');
 const alerts=(preview?.alerts||[]).filter(a=>a.severity!=='INFO');
 const blocked=alerts.some(a=>a.severity==='CRITICAL');
 const flags=[patient?.flag_athlete?'Athlete':null,patient?.flag_elderly_care?'Elderly-care follow-up':null,patient?.flag_high_risk_addiction?'High-risk follow-up':null].filter(Boolean);
 const relevantInstructions=(data.instructions||[]).filter(i=>i.patient_id===patient?.id&&expected.some(e=>e.medicine_id===i.medicine_id));
 const detected=Boolean(flags.length||alerts.length||relevantInstructions.length);
 const special=detected||Boolean(form.special_case);
 const needFollowup=Boolean(patient?.flag_elderly_care||patient?.flag_high_risk_addiction);
 const setLine=(index,changes)=>setItems(items.map((line,i)=>i===index?{...line,...changes}:line));
 return <fieldset className="issue-form" disabled={busy}>
   <div className="issue-patient-bar"><Motif/><label><span>PATIENT & PRESCRIPTION</span><select required aria-label="Patient and prescription" value={form.prescription_id||''} onChange={e=>setForm({...form,prescription_id:e.target.value,special_case:false,warning_ack:false,override_reason:''})}><option value="">Choose a prescription…</option>{prescriptions.map(p=><option value={p.id} key={p.id}>{p.patient_name} · RX-{p.id}</option>)}</select></label>{rx&&<div className="issue-prescriber"><small>PRESCRIBER</small><b>{rx.doctor_name}</b></div>}</div>
   <div className="issue-med-heading"><h3>Medicines to issue</h3><span>{items.length} batch {items.length===1?'line':'lines'}</span></div>
   <div className="issue-med-list">{items.map((line,index)=>{
     const batch=(data.batches||[]).find(b=>b.id===Number(line.batch_id));
     const medicineId=line.medicine_id||batch?.medicine_id;
     const allowed=(data.batches||[]).filter(b=>b.expiry_date>=today&&expected.some(e=>e.medicine_id===b.medicine_id)&&(!medicineId||b.medicine_id===Number(medicineId)));
     const written=expected.find(i=>i.medicine_id===Number(medicineId));
     return <article className="issue-med-card" key={index}><div className="issue-med-number">{String(index+1).padStart(2,'0')}</div><div className="issue-med-choice"><h3>{batch?.medicine_name||written?.medicine_name||'Select a medicine batch'}</h3>{written&&<p>{written.dosage} · {written.frequency} · {written.duration_days} days · {written.quantity_prescribed} units</p>}<label><span>Batch</span><select required aria-label={`Batch for medicine ${index+1}`} value={line.batch_id||''} onChange={e=>setLine(index,{batch_id:e.target.value})}><option value="">Choose batch…</option>{allowed.map(b=><option key={b.id} value={b.id}>{b.medicine_name} · {b.batch_number}</option>)}</select></label>{batch&&<small className="issue-batch-meta">Expires {String(batch.expiry_date).slice(0,10)} · {Number(batch.stock_qty)-Number(batch.reserved_qty)} unreserved units</small>}</div><div className="issue-quantity"><label htmlFor={`issue-qty-${index}`}>UNITS TO ISSUE</label><div><button type="button" aria-label={`Decrease medicine ${index+1} quantity`} disabled={busy||Number(line.quantity)<=1} onClick={()=>setLine(index,{quantity:Math.max(1,Number(line.quantity)-1)})}><Minus size={19}/></button><input id={`issue-qty-${index}`} aria-label={`Quantity for medicine ${index+1}`} required type="number" min="1" step="1" value={line.quantity} onChange={e=>setLine(index,{quantity:e.target.value})}/><button type="button" disabled={busy} aria-label={`Increase medicine ${index+1} quantity`} onClick={()=>setLine(index,{quantity:Number(line.quantity||0)+1})}><Plus size={19}/></button></div></div><button type="button" className="issue-remove" aria-label={`Remove medicine batch line ${index+1}`} disabled={busy} onClick={()=>setItems(items.filter((_,i)=>i!==index))}><X size={16}/></button></article>;
   })}</div>
   <button type="button" className="issue-add-line" disabled={busy||!rx} onClick={()=>setItems([...items,{batch_id:'',quantity:1}])}><Plus size={17}/> Split across another batch</button>
       <div className={`issue-check-strip ${preview?'ready':''}`} role="status">{checking?<><ShieldCheck size={22}/><span>Checking stock & calculating amount…</span></>:preview?<><CheckCircle2 size={23}/><span>Ready to issue</span></>:<><ShieldCheck size={22}/><span>{rx?'Choose valid batch quantities to check this issue.':'Select a prescription to begin.'}</span>{rx&&items.length>0&&<button type="button" onClick={onRetry} disabled={busy}>Recheck</button>}</>}</div>
    {(flags.length>0||alerts.length>0||relevantInstructions.length>0)&&<details className="ledger-side-effects"><summary>Clinical precautions & alerts ({flags.length+alerts.length+relevantInstructions.length})</summary>{flags.map(f=><p key={f}><b>Patient flag:</b> {f}</p>)}{relevantInstructions.map(i=><p key={i.id}><b>{i.medicine_name}:</b> {i.notes}</p>)}{alerts.map((a,i)=><p key={i}><b>{a.reason}:</b> {a.notes}</p>)}</details>}
   {information.length>0&&<details className="ledger-side-effects"><summary>Medicine side effects & precautions</summary>{information.map((a,i)=><div key={i}><p>{a.notes}</p><a href={a.source_url} target="_blank" rel="noreferrer">Medicine reference ↗</a></div>)}</details>}<div className="issue-total"><div><small>AMOUNT TO COLLECT</small><strong>{preview?price(preview.totals.net_payable/100):'—'}</strong></div>{preview&&<details><summary>Tax breakdown</summary><span>Before tax {price(preview.totals.subtotal/100)}</span><span>CGST {price(preview.totals.cgst/100)} · SGST {price(preview.totals.sgst/100)}</span></details>}<Motif tile/></div>
 </fieldset>;
}
