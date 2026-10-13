const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all prescriptions
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM prescriptions ORDER BY created_at DESC, id DESC');
        const formatted = rows.map(r => ({
            PrescriptionID: `RX-${r.id}`,
            id: r.id,
            PatientID: `PAT-${r.patient_id}`,
            DoctorID: `DOC-${r.doctor_id}`,
            Date: r.date || r.created_at,
            Diagnosis: r.diagnosis || '',
            Status: r.status || 'Pending'
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET prescription items
router.get('/items', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM prescription_items');
        const formatted = rows.map(r => ({
            id: r.id,
            PrescriptionID: `RX-${r.prescription_id}`,
            MedicineID: `MED-${r.medicine_id}`,
            Dosage: r.dosage,
            Frequency: r.frequency,
            Duration: r.duration,
            Quantity: r.quantity
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new prescription + automatically deduct stock
router.post('/', async (req, res) => {
    const { PatientID, DoctorID, Diagnosis, Status, Date, items } = req.body;
    
    const patientId = String(PatientID || '').replace('PAT-', '');
    const doctorId = String(DoctorID || '').replace('DOC-', '');

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert prescription
        const [rxResult] = await connection.query(
            'INSERT INTO prescriptions (patient_id, doctor_id, diagnosis, status, date) VALUES (?, ?, ?, ?, ?)',
            [patientId, doctorId, Diagnosis || '', Status || 'Pending', Date || new Date()]
        );
        const newRxId = rxResult.insertId;

        // 2. Insert items and decrement stock in inventory
        if (items && Array.isArray(items)) {
            for (const item of items) {
                const medId = String(item.MedicineID || '').replace('MED-', '');
                const qty = Number(item.Quantity || 1);

                // Insert prescription item
                await connection.query(
                    'INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, quantity) VALUES (?, ?, ?, ?, ?, ?)',
                    [newRxId, medId, item.Dosage || '', item.Frequency || '', item.Duration || '', qty]
                );

                // Automatically deduct stock from inventory table
                await connection.query(
                    'UPDATE inventory SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
                    [qty, medId]
                );
            }
        }

        await connection.commit();
        connection.release();

        res.status(201).json({
            PrescriptionID: `RX-${newRxId}`,
            message: 'Prescription created and inventory stock updated successfully'
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;