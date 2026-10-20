import React, {useId, useState} from 'react';
import {ArrowUpRight, ChevronRight, Eye, Package, Sparkles} from 'lucide-react';

export function Motif({tile=false, className=''}) {
  // Crop the user's original artwork in the browser; no generated replacement.
  return <svg className={`ap-motif ${className}`} viewBox={tile?'120 125 296 296':'495 195 155 155'} aria-hidden="true"><image href="/apothecary/persian-motifs.png" width="1138" height="2048"/></svg>;
}

/** @param {{compact?: boolean, onClick?: () => void}} props */
export function ShopSign({compact=false,onClick=undefined}) {
  const Sign=onClick?'button':'div';
  return <Sign type={onClick?'button':undefined} aria-label={onClick?'Go to Home':undefined} onClick={onClick} className={`ap-sign ${compact?'compact':''}`}><Motif className="sign-flower left"/><div className="ap-sign-lettering"><span className="ap-wordmark">PHARMRX</span><span className="ap-sign-caption">PHARMACY WORKSPACE</span></div><Motif className="sign-flower right"/></Sign>;
}

function DrawerPull({row,onSelect}) {
  const [pulls,setPulls]=useState(0);
  return <button className="ap-drawer-button" aria-label={`Select prescription RX-${row.id}`} onClick={()=>{setPulls(pulls+1);onSelect();}}><span key={pulls} className={`ap-drawer-front ${pulls?'pulled':''}`} aria-hidden="true"><span className="ap-drawer-mount"><span className="ap-drawer-ring"/></span><span className="ap-drawer-label">View at counter</span></span></button>;
}

export function Ribbon({children, cream=false}) {
  const id=useId().replaceAll(':','');
  return <div className={`ap-ribbon ${cream?'cream':''}`}><svg viewBox="0 0 700 148" role="img" aria-label={String(children)}><defs><path id={`curve-${id}`} d="M 92 94 Q 350 39 608 94"/></defs><path className="ribbon-tail" d="M60 68L15 54 28 95 8 132 105 112 96 82M640 68L685 54 672 95 692 132 595 112 604 82"/><path className="ribbon-cloth" d="M57 52 Q350 -6 643 52 L630 128 Q350 73 70 128Z"/><path className="ribbon-stitch" d="M66 59Q350 5 634 59M77 118Q350 64 623 118"/><text><textPath href={`#curve-${id}`} startOffset="50%" textAnchor="middle">{children}</textPath></text></svg><span className="ribbon-tassel left"/><span className="ribbon-tassel right"/></div>;
}

export function FlipStat({label,value,detail,onOpen,index=0}) {
  const [pinned,setPinned]=useState(false);
  return <article className={`ap-stat ${pinned?'pinned':''}`} style={{'--i':index}}><button className="ap-flip" aria-label={`${label}: ${value}. ${detail}. Flip for details.`} aria-pressed={pinned} onClick={()=>setPinned(!pinned)}><span className="ap-flip-inner"><span className="ap-face ap-front" aria-hidden="true"><Motif/><strong>{value}</strong><span>{label}</span><small><Sparkles size={12}/> Hover or tap to turn</small></span><span className="ap-face ap-back" aria-hidden="true"><Motif tile/><b>{label}</b><span>{detail}</span><small>Tap to turn back</small></span></span></button><button className="ap-stat-link" onClick={onOpen}>Open register <ArrowUpRight size={14}/></button></article>;
}

export function RecordPeek({row,items=[],onOpen}) {
  const [dismissed,setDismissed]=useState(false);
  const id=useId();
  return <span className={`ap-peek ${dismissed?'dismissed':''}`} onMouseEnter={()=>setDismissed(false)} onBlur={()=>setDismissed(false)} onKeyDown={e=>{if(e.key==='Escape'){setDismissed(true);e.stopPropagation();}}}><button className="rx-text-button ap-peek-trigger" onClick={onOpen} aria-label={`Open prescription RX-${row.id}`} aria-describedby={id}><Eye size={15}/> RX-{row.id}</button><span id={id} className="ap-peek-paper" role="tooltip"><small>PRESCRIPTION SLIP</small><b>{row.patient_name}</b><span>{row.doctor_name}</span><span>{row.status}</span><span>{items.length?items.map(i=>`${i.medicine_name} × ${i.quantity_prescribed}`).join(' · '):'Open the record for its details.'}</span><em>Click to open the complete record <ChevronRight size={12}/></em></span></span>;
}

const ready=p=>p.status==='In Filling';
const date=v=>String(v||'').slice(0,10);
export function MedicineCabinet({medicines,batches=[],search='',canEdit,onEdit}) {
  const [turned,setTurned]=useState([]);
  const filtered=medicines.filter(m=>!search||Object.values(m).some(v=>String(v).toLowerCase().includes(search.toLowerCase())));
  return <><p className="ap-cabinet-hint">Hover a tile for its batch label. Tap to keep it open; the table view is always available.</p><div className="ap-medicine-cabinet">{filtered.map((m,index)=>{
    const linked=batches.filter(b=>b.medicine_id===m.id);
    const available=Number(m.stock_qty)-Number(m.reserved_qty);
    const isTurned=turned.includes(m.id);
    return <article className={`ap-stat ap-medicine-tile ${isTurned?'pinned':''}`} key={m.id} style={{'--i':Math.min(index,8)}}><button className="ap-flip" aria-label={`${m.brand_name}, ${available} available. Ingredient: ${m.generic_name||'not recorded'}. ${linked.length} linked batches, ${m.reserved_qty} held. Reorder threshold ${m.reorder_level}. Show batch label.`} aria-pressed={isTurned} onClick={()=>setTurned(isTurned?turned.filter(id=>id!==m.id):[...turned,m.id])}><span className="ap-flip-inner"><span className="ap-face ap-front" aria-hidden="true"><Motif tile/><b>{m.brand_name}</b><span>{m.schedule_type}</span><strong>{available}<small> available units</small></strong><small>{available<=Number(m.reorder_level)?'Stock needs attention':'On the shelf'} · Turn to inspect</small></span><span className="ap-face ap-back" aria-hidden="true"><b>{m.brand_name}</b><span>Ingredient: {m.generic_name||'Not recorded'}</span><span>{linked.length} linked batches · {m.reserved_qty} held</span><span>Earliest expiry: {linked.length?date([...linked].sort((a,b)=>String(a.expiry_date).localeCompare(String(b.expiry_date)))[0].expiry_date):'No batch recorded'}</span><span>Reorder threshold: {m.reorder_level}</span><small>Tap to turn back</small></span></span></button>{canEdit?<button className="ap-stat-link" onClick={()=>onEdit(m)}>Edit medicine label <ArrowUpRight size={14}/></button>:<div className="ap-stat-caption">Medicine catalogue</div>}</article>;
  })}</div>{!filtered.length&&<div className="rx-empty">No medicines match this view.</div>}</>;
}
export function DispensaryDashboard({data,search='',isPatient,isStaff,go,open,badge,today}) {
  const prescriptions=data.prescriptions||[];
  const shown=prescriptions.filter(p=>!search||[p.id,`RX-${p.id}`,p.patient_name,p.doctor_name,p.status].some(v=>String(v).toLowerCase().includes(search.toLowerCase())));
  const low=(data.medicines||[]).filter(m=>Number(m.stock_qty)-Number(m.reserved_qty)<=Number(m.reorder_level));
  const followups=(data.checkups||[]).filter(c=>c.status==='Scheduled');
  const [selectedId,setSelectedId]=useState(null);
  const selected=prescriptions.find(p=>p.id===selectedId)||prescriptions.find(p=>p.status!=='Dispensed')||prescriptions[0];
  const lines=(data.prescriptionItems||[]).filter(i=>i.prescription_id===selected?.id);
  return <>
    <div className="ap-stats">
      <FlipStat index={0} label={isPatient?'My prescriptions':'Awaiting review'} value={isPatient?prescriptions.length:prescriptions.filter(p=>p.status==='Pending Review').length} detail={isPatient?'Your prescribing records, instructions and current status.':'Prescriptions awaiting a recorded pharmacist review.'} onOpen={()=>go('prescriptions')}/>
      <FlipStat index={1} label={isPatient?'My invoices':'Ready to dispense'} value={isPatient?(data.invoices||[]).length:prescriptions.filter(ready).length} detail={isPatient?'Saved invoices for your completed dispensing.':'Reviewed prescriptions. Stock is checked again at the counter.'} onOpen={()=>go(isPatient?'invoices':isStaff?'checkout':'prescriptions')}/>
      <FlipStat index={2} label={isPatient?'Follow-ups due':'Stock alerts'} value={isPatient?followups.filter(c=>date(c.checkup_due_date)<=today).length:low.length} detail={isPatient?'Scheduled check-ins due today or earlier.':'Medicines at or below their configured available-stock threshold.'} onOpen={()=>go(isPatient?'followups':'medicines')}/>
    </div>
    <div className="ap-ledger-layout"><section className="ap-register"><div className="rx-section-heading"><h2>{isPatient?'My prescription book':'Prescription register'}</h2><button className="rx-text-button" onClick={()=>go('prescriptions')}>All records <ArrowUpRight size={15}/></button></div><div className="ap-register-hint"><Eye size={14}/> Hover a reference to unfold its slip. Select a patient to view the counter.</div><div className="rx-table-wrap"><table><thead><tr><th>Record</th><th>Patient</th><th>Prescriber</th><th>Status</th><th>Counter</th></tr></thead><tbody>{shown.slice(0,6).map(p=><tr key={p.id} className={selected?.id===p.id?'ap-selected-row':''}><td><RecordPeek row={p} items={(data.prescriptionItems||[]).filter(i=>i.prescription_id===p.id)} onOpen={()=>open('rx-detail',p)}/></td><td><button className="ap-patient-select" onClick={()=>setSelectedId(p.id)} onFocus={()=>setSelectedId(p.id)}>{p.patient_name}</button></td><td>{p.doctor_name}</td><td>{badge(p.status)}</td><td><DrawerPull row={p} onSelect={()=>setSelectedId(p.id)}/></td></tr>)}</tbody></table>{!shown.length&&<div className="rx-empty">{search?"No matching prescriptions.":"The register is waiting for its first prescription."}</div>}</div>
      <div className="ap-lower-ledgers">{!isPatient&&<section><div className="rx-section-heading"><Motif/><h2>Stock to reorder</h2></div>{low.slice(0,4).map(m=><button className="ap-ledger-line" key={m.id} onClick={()=>go('medicines')}><span>{m.brand_name}</span><b>{Number(m.stock_qty)-Number(m.reserved_qty)} left</b><ArrowUpRight size={14}/></button>)}{!low.length&&<p>All medicines are above their stock thresholds.</p>}</section>}<section><div className="rx-section-heading"><Motif/><h2>Follow-up book</h2></div>{followups.slice(0,4).map(c=><button className="ap-ledger-line" key={c.id} onClick={()=>go('followups')}><span>{c.patient_name}</span><b>{date(c.checkup_due_date)}</b><ArrowUpRight size={14}/></button>)}{!followups.length&&<p>No outstanding scheduled check-ins.</p>}<button className="rx-text-button" onClick={()=>go('followups')}>Open reminder book <ArrowUpRight size={14}/></button></section></div>
    </section><section className="ap-counter-paper"><Ribbon cream>AT THE COUNTER</Ribbon>{selected?<div className="ap-counter-body" key={selected.id}><small>SELECTED PRESCRIPTION</small><h2>RX-{selected.id}</h2>{badge(selected.status)}<dl><dt>Patient</dt><dd>{selected.patient_name}</dd><dt>Prescriber</dt><dd>{selected.doctor_name}</dd><dt>Prescribed items</dt><dd>{lines.map(i=><span className="ap-counter-item" key={i.id}><span>{i.medicine_name}</span><b>{i.quantity_prescribed} units</b></span>)}</dd></dl><button className="rx-button" onClick={()=>open(isStaff&&ready(selected)?'checkout':'rx-detail',selected)}>{isStaff&&ready(selected)?'Review & dispense':'Open prescription'}<ChevronRight size={16}/></button><p className="ap-counter-footnote">{isStaff?'Review first. Dispense once. Every movement stays in the ledger.':'Your records and instructions, kept together.'}</p></div>:<div className="rx-empty">Select a prescription to bring it to the counter.</div>}<Motif tile className="ap-counter-seal"/></section></div>
  </>;
}

export function DispensingCounter({data,search='',open,badge,onReview}) {
 const queue=(data.prescriptions||[]).filter(p=>['Pending Review','In Filling'].includes(p.status)&&(!search||[p.id,`RX-${p.id}`,p.patient_name,p.doctor_name,p.status].some(v=>String(v).toLowerCase().includes(search.toLowerCase()))));
 const [selectedId,setSelectedId]=useState(null);
 const selected=queue.find(p=>p.id===selectedId)||queue.find(ready)||queue[0];
 const lines=(data.prescriptionItems||[]).filter(i=>i.prescription_id===selected?.id);
 const batches=(data.batches||[]).filter(b=>lines.some(i=>i.medicine_id===b.medicine_id));
 return <div className="ap-workshop issue-workshop"><section className="ap-ticket-rack"><h2>At the counter</h2><p>{queue.length} prescriptions waiting</p><button className="issue-upload-entry" onClick={()=>open('upload')}><Package size={19}/> Add paper prescription</button>{queue.map(p=><button className={`ap-ticket ${selected?.id===p.id?'selected':''}`} key={p.id} onClick={()=>setSelectedId(p.id)}><Motif/><strong>RX-{p.id}</strong><span>{p.patient_name}</span>{badge(p.status)}</button>)}{!queue.length&&<p>The queue is clear. Add a prescription to begin.</p>}</section><section className="ap-review-sheet"><Ribbon cream>ISSUE MEDICINES</Ribbon>{selected?<div key={selected.id} className="ap-review-body"><small>RX-{selected.id} · {badge(selected.status)}</small><h2>{selected.patient_name}</h2><p>{selected.doctor_name}</p><div className="issue-counter-meds">{lines.map(i=><article key={i.id}><Motif/><div><b>{i.medicine_name}</b><small>As prescribed</small></div><strong>{i.quantity_prescribed}<span>units</span></strong></article>)}</div><details className="issue-written-notes"><summary>View prescriber instructions</summary>{lines.map(i=><p key={i.id}><b>{i.medicine_name}</b><br/>{i.dosage} · {i.frequency} · {i.duration_days} days</p>)}{selected.notes&&<p>{selected.notes}</p>}</details><button className="rx-button issue-start-button" onClick={()=>ready(selected)?open('checkout',selected):onReview(selected)}>{ready(selected)?'Issue these medicines':'Mark prescription reviewed'}<ArrowUpRight size={24}/></button><small className="issue-counter-helper">{ready(selected)?'Stock, patient rules and totals are checked in the next step.':'Check the original prescription before marking it reviewed.'}</small><details className="issue-batch-drawer"><summary>Stock & batch details</summary>{batches.map(b=><div className="ap-review-line" key={b.id}><div><b>{b.medicine_name} · {b.batch_number}</b><span>Expiry {date(b.expiry_date)}</span></div><strong>{b.stock_qty} in stock</strong></div>)}{!batches.length&&<p>No linked batches.</p>}</details></div>:<div className="rx-empty">Choose a prescription to start issuing.</div>}</section></div>;
}
