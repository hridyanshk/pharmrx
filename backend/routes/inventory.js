const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all inventory / medicines
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM inventory ORDER BY name ASC');
        const formatted = rows.map(r => {
            const priceVal = Number(r.unit_price) || 0;
            return {
                MedicineID: `MED-${r.id}`,
                id: r.id,
                Name: r.name,
                Category: r.category,
                BatchNo: r.batch_number,
                StockQty: r.stock_quantity,
                // Provide every casing/naming convention the frontend might look for:
                UnitPrice: priceVal,
                unit_price: priceVal,
                price: priceVal,
                Price: priceVal,
                ExpiryDate: r.expiry_date,
                safetyThreshold: 30
            };
        });
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new medicine
router.post('/', async (req, res) => {
    const { Name, Category, BatchNo, StockQty, UnitPrice, ExpiryDate } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO inventory (name, category, batch_number, stock_quantity, unit_price, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
            [Name, Category, BatchNo, StockQty || 0, UnitPrice || 0, ExpiryDate || null]
        );
        res.status(201).json({
            MedicineID: `MED-${result.insertId}`,
            id: result.insertId,
            Name,
            Category,
            BatchNo,
            StockQty: StockQty || 0,
            UnitPrice: UnitPrice || 0,
            ExpiryDate
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update medicine / inventory item
router.put('/:id', async (req, res) => {
    // Strip 'MED-' prefix if present so we get a clean integer ID
    const rawId = req.params.id;
    const id = String(rawId || '').replace('MED-', '');
    
    // Extract fields gracefully supporting multiple naming conventions
    const name = req.body.name || req.body.Name;
    const category = req.body.category || req.body.Category || req.body.brand || req.body.Brand;
    const batchNumber = req.body.batch_number || req.body.BatchNumber || req.body.batchNo || req.body.BatchNo;
    const stockQuantity = req.body.stock_quantity || req.body.StockQuantity || req.body.stockQty || req.body.StockQty || 0;
    const unitPrice = req.body.unit_price || req.body.UnitPrice || req.body.price || req.body.Price;
    const expiryDate = req.body.expiry_date || req.body.ExpiryDate || null;

    if (!name || unitPrice === undefined || unitPrice === null) {
        return res.status(400).json({ error: "Name and unit_price cannot be null" });
    }

    try {
        const [result] = await db.query(
            `UPDATE inventory 
             SET name = ?, category = ?, batch_number = ?, stock_quantity = ?, unit_price = ?, expiry_date = ? 
             WHERE id = ?`,
            [name, category, batchNumber, stockQuantity, unitPrice, expiryDate, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medicine not found' });
        }

        res.json({ message: 'Medicine updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update medicine
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const numericId = id.replace('MED-', '');
    const { Name, Category, BatchNo, StockQty, UnitPrice, ExpiryDate } = req.body;
    try {
        await db.query(
            'UPDATE inventory SET name = ?, category = ?, batch_number = ?, stock_quantity = ?, unit_price = ?, expiry_date = ? WHERE id = ?',
            [Name, Category, BatchNo, StockQty, UnitPrice, ExpiryDate, numericId]
        );
        res.json({ MedicineID: id, Name, Category, BatchNo, StockQty, UnitPrice, ExpiryDate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT adjust stock quantity specifically
router.put('/:id/stock', async (req, res) => {
    const { id } = req.params;
    const numericId = id.replace('MED-', '');
    const { stockQty } = req.body;
    try {
        await db.query('UPDATE inventory SET stock_quantity = ? WHERE id = ?', [stockQty, numericId]);
        res.json({ MedicineID: id, StockQty: stockQty });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE medicine
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const numericId = id.replace('MED-', '');
    try {
        await db.query('DELETE FROM inventory WHERE id = ?', [numericId]);
        res.json({ message: 'Medicine deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;