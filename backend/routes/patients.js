const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all patients
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM patients ORDER BY name ASC');
        const formatted = rows.map(r => ({
            PatientID: `PAT-${r.id}`,
            id: r.id,
            Name: r.name,
            Age: r.age,
            Gender: r.gender,
            Contact: r.contact,
            Address: r.address,
            MedicalHistory: r.medical_history || ''
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new patient (without address column)
router.post('/', async (req, res) => {
    const name = req.body.Name || req.body.name;
    const age = req.body.Age || req.body.age || 0;
    const gender = req.body.Gender || req.body.gender || 'Unknown';
    const contact = req.body.Contact || req.body.contact || '';
    const medicalHistory = req.body.MedicalHistory || req.body.medicalHistory || '';

    if (!name) {
        return res.status(400).json({ error: "Column 'name' cannot be null" });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO patients (name, age, gender, contact, medical_history) VALUES (?, ?, ?, ?, ?)',
            [name, age, gender, contact, medicalHistory]
        );
        res.status(201).json({
            PatientID: `PAT-${result.insertId}`,
            id: result.insertId,
            Name: name,
            Age: age,
            Gender: gender,
            Contact: contact,
            MedicalHistory: medicalHistory
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;