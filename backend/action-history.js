const {AsyncLocalStorage}=require('node:async_hooks');
const {fail}=require('./domain');
const context=new AsyncLocalStorage();
// Parent-first order also determines the order used to restore deleted records.
const tables=['users','rx_patients','rx_doctors','rx_pharmacists','rx_suppliers','rx_medicines','rx_batches','rx_allergies','rx_stock_adjustments','rx_instructions','rx_sports_restrictions','rx_dosage_limits','rx_interaction_rules','rx_interaction_medicines','rx_prescriptions','rx_prescription_items','rx_verifications','rx_reservations','rx_invoices','rx_invoice_items','rx_purchase_orders','rx_purchase_order_items','rx_refills','rx_checkups'];
const allowed=new Set(tables);
let schemaPromise;
const schema=`CREATE TABLE IF NOT EXISTS rx_action_history (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, actor_id INT NOT NULL, actor_role VARCHAR(20) NOT NULL,
 label VARCHAR(150) NOT NULL, method VARCHAR(10) NOT NULL, path VARCHAR(200) NOT NULL,
 request_key VARCHAR(80), changes JSON NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 undone_at TIMESTAMP NULL, INDEX(actor_id,id), INDEX(request_key)
)`;
function ensureSchema(pool){return schemaPromise??=pool.query(schema).catch(e=>{schemaPromise=undefined;throw e;});}
const connection=()=>context.getStore()?.connection;
function scopedDb(pool){return new Proxy(pool,{get(target,key){if(key==='query'||key==='execute')return (...args)=>(connection()||target)[key](...args);const value=target[key];return typeof value==='function'?value.bind(target):value;}});}
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const canonical=value=>JSON.stringify(stable(value));
// Older actions predate the optional profile flag. Its default must not invalidate their Undo.
const comparable=(table,row)=>table==='rx_patients'&&row&&!Object.hasOwn(row,'requires_full_profile')?{...row,requires_full_profile:0}:row;
async function snapshot(c){const result={};for(const table of tables){const [rows]=await c.query(table==='users'?'SELECT id,name,email,role FROM users':`SELECT * FROM \`${table}\``);result[table]=new Map(rows.map(r=>[r.id,r]));}return result;}
function differences(before,after){const changes=[];for(const table of tables)for(const id of new Set([...before[table].keys(),...after[table].keys()])){const a=before[table].get(id)||null,b=after[table].get(id)||null;if(canonical(a)!==canonical(b))changes.push({table,id,before:a,after:b});}return changes;}
const excluded=new Set(['/login','/pos/preview','/safety/check','/undo']);
const isMutation=(method,path)=>['POST','PUT','PATCH','DELETE'].includes(method)&&!excluded.has(path)&&!path.startsWith('/undo/');
function labelFor(req){const p=req.path;
 if(p==='/maintenance/clean-sample-data')return 'Clean sample record labels';
 if(/\/prescriptions\/\d+\/review$/.test(p))return 'Mark prescription reviewed';
 if(/\/prescriptions\/\d+\/unreview$/.test(p))return 'Undo prescription review';
 if(p==='/pos/checkout')return 'Dispense prescription';
 if(/\/orders\/\d+\/receive$/.test(p))return 'Receive purchase order';
 if(/\/orders\/\d+\/status$/.test(p))return `${req.body.status==='Cancelled'?'Cancel':'Send'} purchase order`;
 if(/\/batches\/\d+\/adjust$/.test(p))return 'Adjust batch stock';
 if(p==='/verification/upload')return 'Upload prescription';
 if(/^\/verification\/\d+$/.test(p))return `${req.body.status==='Rejected'?'Reject':'Verify'} prescription upload`;
 if(/\/refills\/\d+\/advance$/.test(p))return 'Advance refill reminder';
 if(/^\/checkups\//.test(p))return 'Record follow-up outcome';
 if(p==='/my-profile')return 'Update contact details';
 const name=(p.startsWith('/records/')?p.split('/')[2]:p.split('/')[1]).replaceAll('-',' ');
 return `${req.method==='DELETE'?'Remove':req.method==='POST'?'Add':'Edit'} ${name}`;
}
async function locked(pool,fn){const c=await pool.getConnection();let acquired=false;
 try{const [[r]]=await c.query("SELECT GET_LOCK(CONCAT(DATABASE(),':pharmrx-actions'),10) acquired");if(r.acquired!==1)fail('Another save is in progress. Please retry.',409);acquired=true;
 await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');await c.beginTransaction();const result=await fn(c);await c.commit();return result;
 }catch(e){await c.rollback();throw e;}finally{if(acquired)await c.query("SELECT RELEASE_LOCK(CONCAT(DATABASE(),':pharmrx-actions'))").catch(()=>{});c.release();}
}
function wrap(pool,handler){return async(req,res)=>{
 if(!isMutation(req.method,req.path))return handler(req,res);
 await ensureSchema(pool);const send=res.json.bind(res);let body,called=false;
 res.json=value=>{body=value;called=true;return res;};
 try{const action=await locked(pool,c=>context.run({connection:c},async()=>{
 if(req.path==='/pos/checkout'&&req.body.request_id){const [undone]=await c.query('SELECT id FROM rx_action_history WHERE request_key=? AND undone_at IS NOT NULL LIMIT 1',[req.body.request_id]);if(undone.length)fail('This dispensing request was undone. Open a new dispensing form to try again.',409);}
 const before=await snapshot(c);await handler(req,res);if(!called)throw new Error('Mutation did not return a response');
 const changes=differences(before,await snapshot(c));if(!changes.length)return null;
 const label=labelFor(req);const [saved]=await c.query('INSERT INTO rx_action_history(actor_id,actor_role,label,method,path,request_key,changes) VALUES(?,?,?,?,?,?,?)',[req.user.id,req.user.role,label,req.method,req.path,req.path==='/pos/checkout'?req.body.request_id||null:null,JSON.stringify(changes)]);return {id:saved.insertId,label};
 }));res.json=send;return send({...body,...(action?{undo:action}:{})});
 }catch(e){res.json=send;throw e;}
};}
async function history(pool,user,before){await ensureSchema(pool);const [rows]=await pool.query(`SELECT id,label,method,path,created_at,undone_at FROM rx_action_history WHERE actor_id=? AND actor_role=?${before?' AND id<?':''} ORDER BY id DESC LIMIT 40`,[user.id,user.role,...(before?[before]:[])]);return rows;}
const values=row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,v&&typeof v==='object'?JSON.stringify(v):v]));
async function undo(pool,user,id){await ensureSchema(pool);return locked(pool,async c=>{
 const [[action]]=await c.query('SELECT * FROM rx_action_history WHERE id=? FOR UPDATE',[id]);
 if(!action)fail('Saved action not found.',404);
 if(action.actor_id!==user.id||action.actor_role!==user.role)fail('You can only undo actions saved by your own account with its current role.',403);
 if(action.undone_at)fail('This action has already been undone.',409);
 const changes=typeof action.changes==='string'?JSON.parse(action.changes):action.changes;
 for(const change of changes){if(!allowed.has(change.table))throw new Error('Unsupported history table');
 const [[actual]]=await c.query(change.table==='users'?'SELECT id,name,email,role FROM users WHERE id=? FOR UPDATE':`SELECT * FROM \`${change.table}\` WHERE id=? FOR UPDATE`,[change.id]);
 if(canonical(comparable(change.table,actual||null))!==canonical(comparable(change.table,change.after)))fail('These records changed after this action. Undo the later linked action first, or refresh and review the current records.',409);
 }
 try{
 for(const table of tables)for(const ch of changes.filter(ch=>ch.table===table&&ch.before&&!ch.after))await c.query(`INSERT INTO \`${table}\` SET ?`,[values(ch.before)]);
 for(const table of tables)for(const ch of changes.filter(ch=>ch.table===table&&ch.before&&ch.after)){const restored=values(ch.before);delete restored.id;await c.query(`UPDATE \`${table}\` SET ? WHERE id=?`,[restored,ch.id]);}
 for(const table of [...tables].reverse())for(const ch of changes.filter(ch=>ch.table===table&&!ch.before&&ch.after))await c.query(`DELETE FROM \`${table}\` WHERE id=?`,[ch.id]);
 }catch(e){if(['ER_ROW_IS_REFERENCED_2','ER_NO_REFERENCED_ROW_2','ER_DUP_ENTRY'].includes(e.code))fail('A later record depends on this action. Undo that linked action first. Nothing was changed.',409);throw e;}
 const [[invalid]]=await c.query('SELECT b.id FROM rx_batches b LEFT JOIN rx_reservations r ON r.batch_id=b.id GROUP BY b.id,b.stock_qty HAVING b.stock_qty<COALESCE(SUM(r.quantity),0) LIMIT 1');
 if(invalid)fail('Undo would leave more reserved units than available stock. Undo the later allocation first.',409);
 await c.query('UPDATE rx_action_history SET undone_at=CURRENT_TIMESTAMP WHERE id=?',[id]);return {ok:true,id:action.id,label:action.label};
 });}
module.exports={schema,ensureSchema,scopedDb,connection,wrap,history,undo};
