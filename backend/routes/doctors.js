const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all doctors
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM doctors ORDER BY name ASC');
        // Map database columns to match frontend Doctor interface properties
        const formatted = rows.map(r => ({
            DoctorID: `DOC-${r.id}`,
            id: r.id,
            Name: r.name,
            Specialization: r.specialization,
            LicenseNo: r.license_number,
            Contact: r.contact,
            email: r.email || `${r.name.toLowerCase().replace(/[^a-z]/g, '')}@pharmrx-health.com`
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new doctor
router.post('/', async (req, res) => {
    const { Name, Specialization, LicenseNo, Contact, email } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO doctors (name, specialization, license_number, contact, email) VALUES (?, ?, ?, ?, ?)',
            [Name, Specialization, LicenseNo, Contact, email || null]
        );
        res.status(201).json({
            DoctorID: `DOC-${result.insertId}`,
            id: result.insertId,
            Name,
            Specialization,
            LicenseNo,
            Contact,
            email
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;