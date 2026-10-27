import test from 'node:test';
import assert from 'node:assert/strict';
import {matches, monitorAlerts, dateAfter} from './workspace-data.mjs';

test('search handles spaces, punctuation, phone numbers and a minor spelling error',()=>{
 assert.equal(matches(' rx-014 ',['RX 014','Aarav Sharma']),true);
 assert.equal(matches('aarav sharma',['Sharma, Aarav']),true);
 assert.equal(matches('9000',['9000000000']),true);
 assert.equal(matches('asters',['Aster']),true);
 assert.equal(matches('sarma',['Sharma']),true);
 assert.equal(matches('nisha',['Aarav Sharma']),false);
});
test('monitor ignores ordinary missing addresses and empty expired batches',()=>{
 const today='2026-10-20';
 const alerts=monitorAlerts({patients:[{id:1,name:'Aarav',address:''},{id:2,name:'Nisha',requires_full_profile:1,address:'',phone:'',date_of_birth:null}],medicines:[{id:1,brand_name:'Aster',stock_qty:3,reserved_qty:3,reorder_level:5}],batches:[{id:1,medicine_name:'Aster',stock_qty:0,expiry_date:'2026-01-01'},{id:2,medicine_name:'Cedar',stock_qty:5,expiry_date:'2026-11-20'},{id:3,medicine_name:'Iris',stock_qty:5,expiry_date:'2026-11-19'}]},today);
 assert.equal(alerts[0].id,'stock-1');
 assert.equal(alerts.some(a=>a.id==='profile-1'),false);
 assert.equal(alerts.some(a=>a.id==='profile-2'),true);
 assert.equal(alerts.some(a=>a.id==='expiry-1'),false);
 assert.equal(alerts.some(a=>a.id==='expiry-2'),false);
 assert.equal(alerts.some(a=>a.id==='expiry-3'),true);
 assert.equal(dateAfter('2026-12-20',30),'2027-01-19');
});
test('monitor distinguishes pending work from completed work',()=>{
 const alerts=monitorAlerts({prescriptions:[{id:1,status:'Pending Review'},{id:2,status:'Dispensed'}],checkups:[{id:1,status:'Scheduled',checkup_due_date:'2026-10-19'},{id:2,status:'Completed',checkup_due_date:'2026-10-19'}],refills:[{id:1,next_refill_date:'2026-10-21'},{id:2,next_refill_date:'2026-10-20'}]},'2026-10-20');
 assert.deepEqual(alerts.map(a=>a.id),['review-1','checkup-1','refill-2']);
});
