"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoreMedicine = exports.createStoreMedicine = exports.getStoreMedicines = exports.inwardFromMaster = exports.searchUnifiedMedicines = exports.searchMasterMedicines = void 0;
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
const getStoreId = async (req) => {
    if (req.user?.storeId)
        return req.user.storeId;
    const res = await db_1.pool.query('SELECT id FROM pharmacy_stores LIMIT 1;');
    return res.rows[0]?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
};
const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
/**
 * Controller: Get All Store Inventory Medicines with Batches
 * GET /api/medicines
 */
const getStoreMedicines = async (req, res) => {
    try {
        const storeId = await getStoreId(req);
        const sql = `
      SELECT 
        m.id,
        m.name,
        m.generic_name AS "genericName",
        COALESCE(c.name, 'Allopathy') AS category,
        m.unit,
        m.min_stock_alert AS "minStockAlert",
        m.gst_rate::float AS "gstRate",
        m.hsn_code AS "hsnCode",
        m.manufacturer,
        m.rack_location AS "rackLocation",
        m.requires_prescription AS "requiresPrescription",
        COALESCE(SUM(b.current_stock), 0)::int AS "totalStock",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', b.id,
              'medicineId', b.medicine_id,
              'batchNumber', b.batch_number,
              'barcode', b.barcode,
              'expiryDate', TO_CHAR(b.expiry_date, 'YYYY-MM-DD'),
              'purchasePrice', b.purchase_price::float,
              'mrp', b.mrp::float,
              'sellingPrice', b.selling_price::float,
              'currentStock', b.current_stock,
              'initialStock', b.initial_stock,
              'isServing', b.is_serving
            ) ORDER BY b.expiry_date ASC
          ) FILTER (WHERE b.id IS NOT NULL),
          '[]'::json
        ) AS batches
      FROM medicines m
      LEFT JOIN medicine_categories c ON m.category_id = c.id
      LEFT JOIN medicine_batches b ON m.id = b.medicine_id
      WHERE m.store_id = $1
      GROUP BY m.id, c.name
      ORDER BY m.name ASC;
    `;
        const result = await db_1.pool.query(sql, [storeId]);
        const formattedMedicines = result.rows.map((row) => {
            const totalStock = row.totalStock;
            const minAlert = row.minStockAlert;
            const status = totalStock === 0 ? 'OUT_OF_STOCK' : (totalStock <= minAlert ? 'LOW_STOCK' : 'IN_STOCK');
            const firstBatch = row.batches && row.batches.length > 0 ? row.batches[0] : null;
            const mrp = firstBatch ? firstBatch.mrp : 50;
            const sellingPrice = firstBatch ? firstBatch.sellingPrice : 45;
            return {
                id: row.id,
                name: row.name,
                genericName: row.genericName,
                category: row.category,
                unit: row.unit,
                minStockAlert: row.minStockAlert,
                totalStock,
                status,
                gstRate: row.gstRate,
                sellingPrice,
                mrp,
                hsnCode: row.hsnCode,
                manufacturer: row.manufacturer,
                rackLocation: row.rackLocation,
                requiresPrescription: row.requiresPrescription,
                batches: row.batches || []
            };
        });
        res.json({
            success: true,
            count: formattedMedicines.length,
            medicines: formattedMedicines
        });
    }
    catch (error) {
        console.error('Error getting store medicines:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve store medicines',
            error: error.message,
        });
    }
};
exports.getStoreMedicines = getStoreMedicines;
/**
 * Controller: Create Store Medicine & Initial Batch
 * POST /api/medicines
 */
const createStoreMedicine = async (req, res) => {
    const client = await db_1.pool.connect();
    try {
        const storeId = await getStoreId(req);
        const { name, genericName, category = 'Allopathy', unit = 'strip', minStockAlert = 15, gstRate = 12, sellingPrice = 40, mrp = 50, hsnCode = '300490', manufacturer = '', rackLocation = 'A-01', requiresPrescription = false, batch } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: 'Medicine name is required' });
            return;
        }
        await client.query('BEGIN');
        const medRes = await client.query(`INSERT INTO medicines (
        store_id, name, generic_name, unit, min_stock_alert, 
        gst_rate, hsn_code, manufacturer, rack_location, requires_prescription
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;`, [
            storeId,
            name.trim(),
            genericName || name.trim(),
            unit,
            parseInt(minStockAlert, 10) || 15,
            Number(gstRate || 12),
            hsnCode,
            manufacturer,
            rackLocation,
            !!requiresPrescription
        ]);
        const createdMed = medRes.rows[0];
        let createdBatch = null;
        if (batch && batch.batchNumber) {
            const bRes = await client.query(`INSERT INTO medicine_batches (
          medicine_id, batch_number, expiry_date, purchase_price, mrp, selling_price, current_stock, initial_stock, is_serving
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, true)
        RETURNING *;`, [
                createdMed.id,
                batch.batchNumber.trim(),
                batch.expiryDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
                Number(batch.purchasePrice || (mrp * 0.7)),
                Number(batch.mrp || mrp),
                Number(batch.sellingPrice || sellingPrice),
                parseInt(batch.currentStock || batch.quantity, 10) || 10
            ]);
            createdBatch = bRes.rows[0];
        }
        await client.query('COMMIT');
        res.status(201).json({
            success: true,
            message: 'Medicine added to inventory successfully',
            medicine: {
                id: createdMed.id,
                name: createdMed.name,
                genericName: createdMed.generic_name,
                category: category || 'Allopathy',
                unit: createdMed.unit,
                minStockAlert: createdMed.min_stock_alert,
                totalStock: createdBatch ? createdBatch.current_stock : 0,
                status: createdBatch && createdBatch.current_stock > 0 ? (createdBatch.current_stock <= createdMed.min_stock_alert ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
                gstRate: Number(createdMed.gst_rate),
                mrp: createdBatch ? Number(createdBatch.mrp) : mrp,
                sellingPrice: createdBatch ? Number(createdBatch.selling_price) : sellingPrice,
                hsnCode: createdMed.hsn_code,
                manufacturer: createdMed.manufacturer,
                rackLocation: createdMed.rack_location,
                requiresPrescription: createdMed.requires_prescription,
                batches: createdBatch ? [{
                        id: createdBatch.id,
                        medicineId: createdMed.id,
                        batchNumber: createdBatch.batch_number,
                        expiryDate: createdBatch.expiry_date,
                        purchasePrice: Number(createdBatch.purchase_price),
                        mrp: Number(createdBatch.mrp),
                        sellingPrice: Number(createdBatch.selling_price),
                        currentStock: createdBatch.current_stock,
                        isServing: true
                    }] : []
            }
        });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding store medicine:', err);
        res.status(500).json({ success: false, message: 'Failed to add medicine', error: err.message });
    }
    finally {
        client.release();
    }
};
exports.createStoreMedicine = createStoreMedicine;
/**
 * Controller: Update Store Medicine Info
 * PUT /api/medicines/:id
 */
const updateStoreMedicine = async (req, res) => {
    try {
        const storeId = await getStoreId(req);
        const { id } = req.params;
        const { name, genericName, unit, minStockAlert, gstRate, hsnCode, manufacturer, rackLocation, requiresPrescription } = req.body;
        if (!isUuid(id)) {
            res.status(404).json({ success: false, message: 'Medicine not found' });
            return;
        }
        const result = await db_1.pool.query(`UPDATE medicines
       SET 
         name = COALESCE($1, name),
         generic_name = COALESCE($2, generic_name),
         unit = COALESCE($3, unit),
         min_stock_alert = COALESCE($4, min_stock_alert),
         gst_rate = COALESCE($5, gst_rate),
         hsn_code = COALESCE($6, hsn_code),
         manufacturer = COALESCE($7, manufacturer),
         rack_location = COALESCE($8, rack_location),
         requires_prescription = COALESCE($9, requires_prescription),
         updated_at = NOW()
       WHERE id = $10 AND store_id = $11
       RETURNING *;`, [
            name, genericName, unit, minStockAlert, gstRate, hsnCode, manufacturer, rackLocation, requiresPrescription, id, storeId
        ]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, message: 'Medicine not found' });
            return;
        }
        res.json({ success: true, message: 'Medicine updated successfully', medicine: result.rows[0] });
    }
    catch (err) {
        console.error('Error updating medicine:', err);
        res.status(500).json({ success: false, message: 'Failed to update medicine', error: err.message });
    }
};
exports.updateStoreMedicine = updateStoreMedicine;
