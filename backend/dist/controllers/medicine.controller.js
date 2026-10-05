"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inwardFromMaster = exports.searchUnifiedMedicines = exports.searchMasterMedicines = void 0;
const db_1 = require("../db");
/**
 * Controller: Search 1,000+ Master Medicines Catalog
 * GET /api/medicines/master/search?q=...&limit=20
 */
const searchMasterMedicines = async (req, res) => {
    try {
        const query = (req.query.q || '').trim();
        const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
        let sql = '';
        let params = [];
        if (!query) {
            sql = `
        SELECT id, name, generic_name, category, form, manufacturer, 
               pack_size, gst_rate, hsn_code, typical_mrp, requires_prescription, barcode
        FROM master_medicines
        ORDER BY name ASC
        LIMIT $1;
      `;
            params = [limit];
        }
        else {
            sql = `
        SELECT id, name, generic_name, category, form, manufacturer, 
               pack_size, gst_rate, hsn_code, typical_mrp, requires_prescription, barcode
        FROM master_medicines
        WHERE name ILIKE $1 OR generic_name ILIKE $1 OR barcode = $2
        ORDER BY 
          CASE 
            WHEN name ILIKE $3 THEN 1
            WHEN name ILIKE $1 THEN 2
            WHEN generic_name ILIKE $3 THEN 3
            ELSE 4
          END,
          name ASC
        LIMIT $4;
      `;
            params = [`%${query}%`, query, `${query}%`, limit];
        }
        const result = await db_1.pool.query(sql, params);
        res.json({
            success: true,
            count: result.rows.length,
            medicines: result.rows,
        });
    }
    catch (error) {
        console.error('Error searching master medicines:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search master medicines catalog',
            error: error.message,
        });
    }
};
exports.searchMasterMedicines = searchMasterMedicines;
/**
 * Controller: Unified Search for Billing & Inventory
 * Returns both in-stock store medicines and global master catalog matches
 * GET /api/medicines/search?q=...&limit=15
 */
const searchUnifiedMedicines = async (req, res) => {
    try {
        const query = (req.query.q || '').trim();
        const limit = Math.min(parseInt(req.query.limit || '15', 10), 30);
        if (!query) {
            res.json({
                success: true,
                storeMatches: [],
                masterMatches: [],
            });
            return;
        }
        // 1. Query Store-specific Inventory Batches
        const storeSql = `
      SELECT 
        m.id, 
        m.name, 
        m.generic_name, 
        m.unit, 
        m.gst_rate, 
        m.hsn_code, 
        m.manufacturer, 
        m.rack_location,
        b.id AS batch_id, 
        b.batch_number, 
        b.barcode, 
        b.expiry_date, 
        b.selling_price, 
        b.mrp, 
        b.current_stock
      FROM medicines m
      INNER JOIN medicine_batches b ON m.id = b.medicine_id
      WHERE (m.name ILIKE $1 OR m.generic_name ILIKE $1 OR b.barcode = $2)
        AND b.current_stock > 0
      ORDER BY b.expiry_date ASC
      LIMIT $3;
    `;
        const storeResult = await db_1.pool.query(storeSql, [`%${query}%`, query, limit]);
        // 2. Query Global 1,000+ Master Catalog
        const masterSql = `
      SELECT id, name, generic_name, category, form, manufacturer, 
             pack_size, gst_rate, hsn_code, typical_mrp, requires_prescription, barcode
      FROM master_medicines
      WHERE name ILIKE $1 OR generic_name ILIKE $1 OR barcode = $2
      ORDER BY 
        CASE 
          WHEN name ILIKE $3 THEN 1
          WHEN name ILIKE $1 THEN 2
          ELSE 3
        END,
        name ASC
      LIMIT $4;
    `;
        const masterResult = await db_1.pool.query(masterSql, [`%${query}%`, query, `${query}%`, limit]);
        res.json({
            success: true,
            query,
            storeMatches: storeResult.rows,
            masterMatches: masterResult.rows,
        });
    }
    catch (error) {
        console.error('Error in unified medicine search:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform medicine search',
            error: error.message,
        });
    }
};
exports.searchUnifiedMedicines = searchUnifiedMedicines;
/**
 * Controller: Inward a Master Medicine into Store Inventory
 * POST /api/medicines/inward-from-master
 */
const inwardFromMaster = async (req, res) => {
    const client = await db_1.pool.connect();
    try {
        const { master_medicine_id, batch_number, barcode, expiry_date, purchase_price, mrp, selling_price, quantity, rack_location } = req.body;
        if (!master_medicine_id || !batch_number || !expiry_date || quantity === undefined) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: master_medicine_id, batch_number, expiry_date, quantity',
            });
            return;
        }
        await client.query('BEGIN');
        // 1. Get default store
        const storeRes = await client.query('SELECT id FROM pharmacy_stores LIMIT 1;');
        if (storeRes.rows.length === 0) {
            throw new Error('No pharmacy store found in database');
        }
        const storeId = storeRes.rows[0].id;
        // 2. Get master medicine details
        const masterRes = await client.query('SELECT * FROM master_medicines WHERE id = $1;', [master_medicine_id]);
        if (masterRes.rows.length === 0) {
            throw new Error('Master medicine not found');
        }
        const masterMed = masterRes.rows[0];
        // 3. Find or Create in store medicines catalog
        let medicineId = '';
        const existingMed = await client.query('SELECT id FROM medicines WHERE store_id = $1 AND name = $2 LIMIT 1;', [storeId, masterMed.name]);
        if (existingMed.rows.length > 0) {
            medicineId = existingMed.rows[0].id;
        }
        else {
            const insertMed = await client.query(`INSERT INTO medicines (
          store_id, name, generic_name, unit, min_stock_alert, 
          gst_rate, hsn_code, manufacturer, rack_location, requires_prescription
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id;`, [
                storeId,
                masterMed.name,
                masterMed.generic_name,
                masterMed.form || 'strip',
                15,
                masterMed.gst_rate || 12.00,
                masterMed.hsn_code || '300490',
                masterMed.manufacturer,
                rack_location || 'Rack General',
                masterMed.requires_prescription || false
            ]);
            medicineId = insertMed.rows[0].id;
        }
        // 4. Create or Update Batch
        const batchRes = await client.query(`INSERT INTO medicine_batches (
        medicine_id, batch_number, barcode, expiry_date, 
        purchase_price, mrp, selling_price, current_stock, initial_stock
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      ON CONFLICT (medicine_id, batch_number) DO UPDATE
      SET current_stock = medicine_batches.current_stock + EXCLUDED.current_stock,
          selling_price = EXCLUDED.selling_price,
          mrp = EXCLUDED.mrp,
          updated_at = NOW()
      RETURNING id, current_stock;`, [
            medicineId,
            batch_number,
            barcode || masterMed.barcode,
            expiry_date,
            purchase_price || Number((masterMed.typical_mrp * 0.7).toFixed(2)),
            mrp || masterMed.typical_mrp,
            selling_price || Number((masterMed.typical_mrp * 0.95).toFixed(2)),
            parseInt(quantity, 10)
        ]);
        await client.query('COMMIT');
        res.status(201).json({
            success: true,
            message: `Successfully stocked '${masterMed.name}' (Batch: ${batch_number})`,
            medicine_id: medicineId,
            batch_id: batchRes.rows[0].id,
            current_stock: batchRes.rows[0].current_stock
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error inwarding from master medicine:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to inward medicine from master catalog',
            error: error.message,
        });
    }
    finally {
        client.release();
    }
};
exports.inwardFromMaster = inwardFromMaster;
