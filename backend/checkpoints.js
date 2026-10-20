const h=()=>require('./action-history');
const {fail}=require('./domain');
const encode=s=>Object.fromEntries(Object.entries(s).map(([t,rows])=>[t,[...rows.values()]]));
async function create(c,user,label,reason='Manual'){
 const [[last]]=await c.query('SELECT COALESCE(MAX(id),0) id FROM rx_action_history');
 const [r]=await c.query('INSERT INTO rx_checkpoints(label,actor_id,reason,state,action_id) VALUES(?,?,?,?,?)',[label,user.id,reason,JSON.stringify(encode(await h().snapshot(c))),last.id]);
 return {id:r.insertId,label,reason};
}
async function automatic(c,user){
 const [[last]]=await c.query('SELECT id,action_id,TIMESTAMPDIFF(SECOND,created_at,CURRENT_TIMESTAMP) age FROM rx_checkpoints ORDER BY id DESC LIMIT 1');
 if(!last)return create(c,user,'Initial checkpoint','Initial');
 // Count created prescription rows, including prescriptions created by upload verification.
 const [[count]]=await c.query(`SELECT COUNT(*) n FROM rx_action_history a
 JOIN JSON_TABLE(a.changes,'$[*]' COLUMNS (
 table_name VARCHAR(80) PATH '$.table', before_row JSON PATH '$.before', after_row JSON PATH '$.after'
 )) ch WHERE a.id>? AND a.undone_at IS NULL AND ch.table_name='rx_prescriptions'
 AND ch.before_row IS NULL AND ch.after_row IS NOT NULL`,[last.action_id]);
 if(count.n>=5||last.age>=1800)return create(c,user,count.n>=5?'After 5 prescriptions':'30 minute checkpoint',count.n>=5?'5 prescriptions':'30 minutes');
}
async function list(c){const [r]=await c.query('SELECT id,label,reason,action_id,created_at,restored_at FROM rx_checkpoints ORDER BY id DESC LIMIT 50');return r;}
async function restore(pool,user,id){return h().locked(pool,async c=>{
 const [[point]]=await c.query('SELECT * FROM rx_checkpoints WHERE id=? FOR UPDATE',[id]);if(!point)fail('Checkpoint not found.',404);
 // First preserve current state so restoring a checkpoint is itself recoverable.
 const recovery=await create(c,user,'Before restoring checkpoint '+id,'Before restore');
 const raw=typeof point.state==='string'?JSON.parse(point.state):point.state;
 const target=Object.fromEntries(h().tables.map(t=>[t,new Map((raw[t]||[]).map(r=>[r.id,r]))]));
 const changes=h().differences(await h().snapshot(c),target);
 // Delete dependents first, then restore parents and children. Existing user passwords remain unchanged.
 for(const table of [...h().tables].reverse())for(const ch of changes.filter(x=>x.table===table&&x.before&&!x.after))await c.query(`DELETE FROM \`${table}\` WHERE id=?`,[ch.id]);
 for(const table of h().tables)for(const ch of changes.filter(x=>x.table===table&&x.after)){
 const row=h().values(ch.after);if(ch.before){delete row.id;await c.query(`UPDATE \`${table}\` SET ? WHERE id=?`,[row,ch.id]);}
 else {if(table==='users')fail('Cannot restore a removed account password. Restore the database backup.',409);await c.query(`INSERT INTO \`${table}\` SET ?`,[row]);}
 }
 await c.query('UPDATE rx_action_history SET undone_at=CURRENT_TIMESTAMP WHERE id>? AND id<=? AND undone_at IS NULL',[point.action_id,(await c.query('SELECT action_id FROM rx_checkpoints WHERE id=?',[recovery.id]))[0][0].action_id]);
 await c.query('UPDATE rx_checkpoints SET restored_at=CURRENT_TIMESTAMP WHERE id=?',[id]);
 return {ok:true,restored:id,recovery_checkpoint:recovery.id,records:changes.length};
 });}
module.exports={create,automatic,list,restore};
