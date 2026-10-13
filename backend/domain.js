const fail = (message, status=400, code='VALIDATION_ERROR') => { const e=new Error(message); e.status=status; e.code=code; throw e; };
const integer=(value,label,min=1,max=1000000)=>{const n=Number(value);if(!Number.isSafeInteger(n)||n<min||n>max)fail(`${label} must be a whole number from ${min} to ${max}.`);return n;};
const decimal=(value,label,min=0,max=1000000)=>{const n=Number(value);if(value===''||value==null||!Number.isFinite(n)||n<min||n>max)fail(`${label} must be from ${min} to ${max}.`);return Math.round(n*100)/100;};
const required=(v,label,max=150)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail(`${label} is required (maximum ${max} characters).`);return v.trim();};
const date=(v,label)=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)fail(`${label} must be a valid date.`);return v;};
const choice=(v,choices,label)=>{if(!choices.includes(v))fail(`Invalid ${label}.`);return v;};
const uniqueItems=(items)=>{if(!Array.isArray(items)||!items.length||items.length>50)fail('Add between 1 and 50 medicines.');const seen=new Set();return items.map(i=>{const medicine_id=integer(i.medicine_id,'Medicine');if(seen.has(medicine_id))fail('Combine duplicate medicines into one line.');seen.add(medicine_id);return {...i,medicine_id,quantity:integer(i.quantity,'Quantity',1,10000)};});};
// Prices entered for batches are pre-tax. Round each tax half per line, in paise.
const totals=items=>items.reduce((t,i)=>{const base=Math.round(Number(i.unit_price)*100)*i.quantity;const half=Math.round(base*Number(i.tax_rate)/200);return {subtotal:t.subtotal+base,cgst:t.cgst+half,sgst:t.sgst+half,net_payable:t.net_payable+base+2*half};},{subtotal:0,cgst:0,sgst:0,net_payable:0});
module.exports={fail,integer,decimal,required,date,choice,uniqueItems,totals};
