const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '.env')});

const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const patientRoutes = require('./routes/patients');
const prescriptionRoutes = require('./routes/prescriptions');
const doctorRoutes = require('./routes/doctors');

const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({limit:'4mb'}));
app.use('/api/clinical', require('./routes/clinical'));

// Legacy endpoints are limited to administrators; patient access uses scoped clinical APIs.
const {verifyToken}=require('./middleware/auth');
app.use('/api', verifyToken, async (req,res,next)=>{
    try {
        const db=require('./config/db');
        const [users]=await db.query('SELECT role FROM users WHERE id=?',[req.user.id]);
        if(users[0]?.role!=='admin') return res.status(403).json({error:'Administrator access required.'});
        next();
    }catch{res.status(503).json({error:'Database unavailable.'});}
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/medicines', inventoryRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/doctors', doctorRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'Remix PharmRx Backend is active.' });
});

const frontendDirectory = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(path.join(frontendDirectory, 'index.html'))) {
    app.use(express.static(frontendDirectory));
    app.get('/{*page}', (req, res) => res.sendFile(path.join(frontendDirectory, 'index.html')));
} else {
    app.get('/', (req, res) => res.json({ status: 'Remix PharmRx Backend is active.' }));
}

const PORT = process.env.PORT || 5000;
app.use((err,req,res,next)=>{
    res.status(err.status||500).json({error:err.type==='entity.too.large'?'Uploaded request is too large.':'Invalid request.'});
});
if (require.main === module) app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    const checkpointTimer=setInterval(async()=>{try{const db=require('./config/db');const [[user]]=await db.query("SELECT id,role FROM users WHERE role='admin' ORDER BY id LIMIT 1");if(user)await require('./action-history').locked(db,c=>require('./checkpoints').automatic(c,user));}catch(e){console.error('Checkpoint failed:',e.code||e.message);}},60000);checkpointTimer.unref();
});
module.exports = app;
