"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPurchaseInvoices = exports.createPurchaseInvoice = void 0;
const db_1 = require("../db");
const getStoreId = async (req) => {
    if (req.user?.storeId)
        return req.user.storeId;
    const res = await db_1.pool.query('SELECT id FROM pharmacy_stores LIMIT 1;');
    return res.rows[0]?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
};
const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
/**
 * POST /api/purchases
 * Inward distributor purchase invoice & update stock batches in PostgreSQL
 */
const createPurchaseInvoice = async (req, res) => {
    const client = await db_1.pool.connect();
    try {
        const storeId = await getStoreId(req);
        const userId = (req.user?.userId && isUuid(req.user.userId)) ? req.user.userId : null;
        const { supplierId, supplierName, supplierInvoiceNumber, purchaseDate = new Date().toISOString().slice(0, 10), paymentMode = 'BANK_TRANSFER', items, subtotal, discountAmount = 0, gstAmount = 0, netTotal, notes } = req.body;
        if (!supplierName || !supplierInvoiceNumber) {
            res.status(400).json({
                success: false,
                message: 'Supplier name and distributor invoice number are required',
            });
            return;
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Purchase invoice must include at least one medicine item',
            });
            return;
        }
        await client.query('BEGIN');
        // 1. Resolve Supplier
        let finalSupplierId = (supplierId && isUuid(supplierId)) ? supplierId : null;
        if (!finalSupplierId) {
            const supRes = await client.query(`SELECT id FROM suppliers WHERE store_id = $1 AND name ILIKE $2 LIMIT 1;`, [storeId, supplierName.trim()]);
            if (supRes.rows.length > 0) {
                finalSupplierId = supRes.rows[0].id;
            }
            else {
                const createSup = await client.query(`INSERT INTO suppliers (store_id, name) VALUES ($1, $2) RETURNING id;`, [storeId, supplierName.trim()]);
                finalSupplierId = createSup.rows[0].id;
            }
        }
        // 2. Computed amounts
        const computedSubtotal = subtotal !== undefined
            ? Number(subtotal)
            : items.reduce((s, i) => s + (Number(i.purchasePrice || 0) * Number(i.quantity || 1)), 0);
        const computedGst = gstAmount !== undefined
            ? Number(gstAmount)
            : Number((computedSubtotal * 0.12).toFixed(2));
        const computedNet = netTotal !== undefined
            ? Number(netTotal)
            : Number((computedSubtotal - Number(discountAmount || 0) + computedGst).toFixed(2));
        // 3. Insert purchase invoice
        const insertInvoiceSql = `
      INSERT INTO purchase_invoices (
        store_id, supplier_id, supplier_name_snapshot, supplier_invoice_number,
        purchase_date, subtotal, discount_amount, taxable_amount, gst_amount, net_total,
        payment_mode, status, notes, created_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'RECEIVED', $12, $13)
      ON CONFLICT (store_id, supplier_id, supplier_invoice_number)
      DO UPDATE SET net_total = EXCLUDED.net_total
      RETURNING *;
    `;
        const invoiceRes = await client.query(insertInvoiceSql, [
            storeId,
            finalSupplierId,
            supplierName.trim(),
            supplierInvoiceNumber.trim(),
            purchaseDate,
            computedSubtotal,
            discountAmount || 0,
            computedSubtotal - (discountAmount || 0),
            computedGst,
            computedNet,
            ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'].includes(paymentMode) ? paymentMode : 'BANK_TRANSFER',
            notes || null,
            userId
        ]);
        const purchaseInvoice = invoiceRes.rows[0];
        // 4. Insert Line Items and Inward Batches
        let totalUnits = 0;
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const medName = (it.medicineName || it.name || 'Medicine').trim();
            const batchNo = (it.batchNumber || `B-${Date.now()}-${i}`).trim();
            const expDate = it.expiryDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
            const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
            const freeQty = Math.max(0, parseInt(it.freeQuantity, 10) || 0);
            const itemTotalUnits = qty + freeQty;
            totalUnits += itemTotalUnits;
            const pPrice = Number(it.purchasePrice || (Number(it.mrp || 0) * 0.7));
            const mrp = Number(it.mrp || pPrice * 1.3);
            const sPrice = Number(it.sellingPrice || mrp);
            const gstRate = Number(it.gstRate || 12.0);
            const lineTotal = Number(it.total || (pPrice * qty));
            // 4a. Find or create medicine
            let medicineId = (it.medicineId && isUuid(it.medicineId)) ? it.medicineId : null;
            if (!medicineId) {
                const medSearch = await client.query(`SELECT id FROM medicines WHERE store_id = $1 AND name ILIKE $2 LIMIT 1;`, [storeId, medName]);
                if (medSearch.rows.length > 0) {
                    medicineId = medSearch.rows[0].id;
                }
                else {
                    const createMed = await client.query(`INSERT INTO medicines (store_id, name, generic_name, unit, rack_location, gst_rate)
             VALUES ($1, $2, $3, 'strip', $4, $5) RETURNING id;`, [storeId, medName, it.genericName || medName, it.rackLocation || 'Shelf', gstRate]);
                    medicineId = createMed.rows[0].id;
                }
            }
            // 4b. Find or create batch & increment current_stock
            const batchRes = await client.query(`INSERT INTO medicine_batches (
          medicine_id, batch_number, expiry_date, purchase_price, mrp, selling_price,
          current_stock, initial_stock, is_serving
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, true)
        ON CONFLICT (medicine_id, batch_number)
        DO UPDATE SET 
          current_stock = medicine_batches.current_stock + EXCLUDED.current_stock,
          expiry_date = EXCLUDED.expiry_date,
          mrp = EXCLUDED.mrp,
          selling_price = EXCLUDED.selling_price,
          purchase_price = EXCLUDED.purchase_price,
          updated_at = NOW()
        RETURNING id;`, [medicineId, batchNo, expDate, pPrice, mrp, sPrice, itemTotalUnits]);
            const batchId = batchRes.rows[0].id;
            // 4c. Insert into purchase_invoice_items
            await client.query(`INSERT INTO purchase_invoice_items (
          purchase_invoice_id, line_number, medicine_id, batch_id, medicine_name,
          batch_number, expiry_date, purchase_price, mrp, selling_price, quantity,
          free_quantity, gst_rate, total_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (purchase_invoice_id, line_number) DO NOTHING;`, [
                purchaseInvoice.id,
                i + 1,
                medicineId,
                batchId,
                medName,
                batchNo,
                expDate,
                pPrice,
                mrp,
                sPrice,
                qty,
                freeQty,
                gstRate,
                lineTotal
            ]);
        }
        await client.query('COMMIT');
        res.status(201).json({
            success: true,
            message: 'Purchase invoice received and inventory stock batches updated',
            purchase: {
                id: purchaseInvoice.id,
                supplierName: purchaseInvoice.supplier_name_snapshot,
                supplierInvoiceNumber: purchaseInvoice.supplier_invoice_number,
                purchaseDate: purchaseInvoice.purchase_date,
                netTotal: Number(purchaseInvoice.net_total),
                paymentMode: purchaseInvoice.payment_mode,
                lineCount: items.length,
                totalUnits
            }
        });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating purchase invoice:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to record purchase invoice',
            error: err.message,
        });
    }
    finally {
        client.release();
    }
};
exports.createPurchaseInvoice = createPurchaseInvoice;
/**
 * GET /api/purchases
 * Fetch recent purchase invoices from distributors
 */
const getPurchaseInvoices = async (req, res) => {
    try {
        const storeId = await getStoreId(req);
        const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
        const result = await db_1.pool.query(`SELECT 
        p.id,
        p.supplier_id AS "supplierId",
        p.supplier_name_snapshot AS "supplierName",
        p.supplier_invoice_number AS "invoiceNumber",
        p.purchase_date AS "purchaseDate",
        p.subtotal::float AS "subtotal",
        p.gst_amount::float AS "gstAmount",
        p.net_total::float AS "netTotal",
        p.payment_mode AS "paymentMode",
        p.status,
        COUNT(pi.id)::int AS "lineCount",
        COALESCE(SUM(pi.quantity + pi.free_quantity), 0)::int AS "totalUnits",
        p.created_at AS "createdAt"
      FROM purchase_invoices p
      LEFT JOIN purchase_invoice_items pi ON p.id = pi.purchase_invoice_id
      WHERE p.store_id = $1
      GROUP BY p.id
      ORDER BY p.purchase_date DESC, p.created_at DESC
      LIMIT $2;`, [storeId, limit]);
        res.json({
            success: true,
            count: result.rows.length,
            purchases: result.rows,
        });
    }
    catch (err) {
        console.error('Error fetching purchase invoices:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch purchase invoices',
            error: err.message,
        });
    }
};
exports.getPurchaseInvoices = getPurchaseInvoices;
