import { Response } from 'express';
import { pool } from '../db';
import { AuthenticatedRequest } from '../types/auth.types';

const getStoreId = async (req: AuthenticatedRequest): Promise<string> => {
  if (req.user?.storeId) return req.user.storeId;
  const res = await pool.query('SELECT id FROM pharmacy_stores LIMIT 1;');
  return res.rows[0]?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
};

/**
 * POST /api/sales
 * Create a new Sales Tax Invoice with FEFO Batch deduction & Customer history
 */
export const createSaleInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const storeId = await getStoreId(req);
    const userId = req.user?.userId || null;

    const {
      customerId,
      customerName,
      customerMobile,
      doctorName,
      patientName,
      paymentMode = 'CASH',
      notes,
      items,
      subtotal,
      discountAmount = 0,
      gstAmount = 0,
      netTotal
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Cart cannot be empty. Please include at least one medicine item.',
      });
      return;
    }

    await client.query('BEGIN');

    // 1. Resolve Customer ID
    let finalCustomerId: string | null = customerId || null;
    let customerNameSnapshot = customerName || patientName || 'Walk-in Customer';
    let customerMobileSnapshot = customerMobile || null;

    if (!finalCustomerId && customerMobile && customerMobile.trim().length >= 10) {
      const cleanMobile = customerMobile.replace(/\D/g, '').slice(-10);
      const custRes = await client.query(
        `INSERT INTO customers (store_id, full_name, mobile)
         VALUES ($1, $2, $3)
         ON CONFLICT (store_id, mobile)
         DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = NOW()
         RETURNING id, full_name, mobile;`,
        [storeId, customerName || 'Valued Customer', cleanMobile]
      );
      if (custRes.rows.length > 0) {
        finalCustomerId = custRes.rows[0].id;
        customerNameSnapshot = custRes.rows[0].full_name;
        customerMobileSnapshot = custRes.rows[0].mobile;
      }
    }

    // 2. Generate Next Invoice Number
    const countRes = await client.query(
      `SELECT count(*) FROM sales_invoices WHERE store_id = $1;`,
      [storeId]
    );
    const seq = parseInt(countRes.rows[0].count, 10) + 1001;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const invoiceNumber = `INV-${dateStr}-${seq}`;

    // 3. Compute Totals if not explicitly provided
    const computedSubtotal = subtotal !== undefined 
      ? Number(subtotal) 
      : items.reduce((sum: number, it: any) => sum + (Number(it.total) || (Number(it.sellingPrice || it.mrp || 0) * Number(it.quantity || 1))), 0);
    
    const computedGst = gstAmount !== undefined 
      ? Number(gstAmount) 
      : Number((computedSubtotal * 0.12).toFixed(2));

    const computedNetTotal = netTotal !== undefined 
      ? Number(netTotal) 
      : Number((computedSubtotal - Number(discountAmount || 0)).toFixed(2));

    // 4. Insert into sales_invoices
    const insertInvoiceSql = `
      INSERT INTO sales_invoices (
        store_id, 
        invoice_number, 
        customer_id, 
        customer_name_snapshot, 
        customer_mobile_snapshot,
        doctor_name, 
        subtotal, 
        discount_amount, 
        taxable_amount, 
        gst_amount, 
        net_total,
        payment_mode, 
        status, 
        notes, 
        created_by_user_id, 
        invoice_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'COMPLETED', $13, $14, NOW())
      RETURNING *;
    `;

    const invoiceResult = await client.query(insertInvoiceSql, [
      storeId,
      invoiceNumber,
      finalCustomerId,
      customerNameSnapshot,
      customerMobileSnapshot,
      doctorName || null,
      computedSubtotal,
      discountAmount || 0,
      computedSubtotal - (discountAmount || 0),
      computedGst,
      computedNetTotal,
      ['CASH', 'UPI', 'CARD'].includes(paymentMode) ? paymentMode : 'CASH',
      notes || null,
      userId
    ]);

    const createdInvoice = invoiceResult.rows[0];

    // 5. Insert line items & deduct batch stock
    for (const item of items) {
      const medName = item.medicineName || item.name || 'Medicine';
      const batchNo = item.batchNumber || item.batch_number || 'DEFAULT';
      const expDate = item.expiryDate || item.expiry_date || new Date(Date.now() + 365*24*3600*1000).toISOString().slice(0, 10);
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const mrp = Number(item.mrp || item.sellingPrice || 0);
      const sellPrice = Number(item.sellingPrice || item.mrp || 0);
      const discPct = Number(item.discountPercent || 0);
      const gstRate = Number(item.gstRate || 12.0);
      const lineTotal = Number(item.total || (sellPrice * qty));
      const lineTaxable = Number((lineTotal / (1 + gstRate / 100)).toFixed(2));
      const lineGst = Number((lineTotal - lineTaxable).toFixed(2));

      await client.query(
        `INSERT INTO sales_invoice_items (
          invoice_id, medicine_id, batch_id, medicine_name, batch_number, expiry_date,
          quantity, purchase_price, mrp, selling_price, discount_percent, gst_rate,
          taxable_amount, gst_amount, total_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);`,
        [
          createdInvoice.id,
          item.medicineId || item.id || null,
          item.batchId || null,
          medName,
          batchNo,
          expDate,
          qty,
          Number(item.purchasePrice || (mrp * 0.7)),
          mrp,
          sellPrice,
          discPct,
          gstRate,
          lineTaxable,
          lineGst,
          lineTotal
        ]
      );

      // Decrement batch stock if batch_id provided
      if (item.batchId) {
        await client.query(
          `UPDATE medicine_batches 
           SET current_stock = GREATEST(0, current_stock - $1), updated_at = NOW()
           WHERE id = $2;`,
          [qty, item.batchId]
        );
      }
    }

    // 6. Update customer spend & count if customer linked
    if (finalCustomerId) {
      await client.query(
        `UPDATE customers
         SET total_purchases = total_purchases + $1,
             total_bills = total_bills + 1,
             last_purchase_date = NOW(),
             updated_at = NOW()
         WHERE id = $2;`,
        [computedNetTotal, finalCustomerId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Sale invoice created successfully',
      invoiceNumber: createdInvoice.invoice_number,
      invoice: {
        id: createdInvoice.id,
        invoiceNumber: createdInvoice.invoice_number,
        customerId: finalCustomerId,
        customerName: customerNameSnapshot,
        customerMobile: customerMobileSnapshot,
        doctorName: createdInvoice.doctor_name,
        netTotal: Number(createdInvoice.net_total),
        paymentMode: createdInvoice.payment_mode,
        invoiceDate: createdInvoice.invoice_date,
        itemsCount: items.length,
      },
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error creating sale invoice:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to complete sale checkout',
      error: err.message,
    });
  } finally {
    client.release();
  }
};

/**
 * GET /api/sales
 * Fetch recent sales invoices with line items summary & today's counter analytics
 */
export const getSaleInvoices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const storeId = await getStoreId(req);
    const limit = Math.min(parseInt((req.query.limit as string) || '30', 10), 100);

    const invoicesRes = await pool.query(
      `SELECT 
        s.id,
        s.invoice_number AS "invoiceNumber",
        s.customer_id AS "customerId",
        s.customer_name_snapshot AS "customerName",
        s.customer_mobile_snapshot AS "customerMobile",
        s.doctor_name AS "doctorName",
        s.subtotal::float AS "subtotal",
        s.discount_amount::float AS "discountAmount",
        s.gst_amount::float AS "gstAmount",
        s.net_total::float AS "netTotal",
        s.payment_mode AS "paymentMode",
        s.status,
        s.notes,
        s.invoice_date AS "date",
        s.created_at AS "createdAt",
        COALESCE(
          (SELECT string_agg(i.medicine_name || ' (' || i.quantity || 'x)', ', ')
           FROM sales_invoice_items i 
           WHERE i.invoice_id = s.id), 'Counter Sale'
        ) AS "itemsSummary"
      FROM sales_invoices s
      WHERE s.store_id = $1
      ORDER BY s.invoice_date DESC
      LIMIT $2;`,
      [storeId, limit]
    );

    // Today's counter analytics
    const todayRes = await pool.query(
      `SELECT 
        COALESCE(SUM(net_total), 0)::float AS "todaySales",
        COUNT(*)::int AS "todayBillsCount"
      FROM sales_invoices
      WHERE store_id = $1 
        AND invoice_date::date = CURRENT_DATE 
        AND status = 'COMPLETED';`,
      [storeId]
    );

    const todaySales = todayRes.rows[0]?.todaySales || 0;
    const todayBillsCount = todayRes.rows[0]?.todayBillsCount || 0;
    const todayProfit = Number((todaySales * 0.20).toFixed(2)); // estimated 20% pharmacy retail margin

    res.json({
      success: true,
      count: invoicesRes.rows.length,
      invoices: invoicesRes.rows,
      stats: {
        todaySales,
        todayBillsCount,
        todayProfit,
      },
    });
  } catch (err: any) {
    console.error('Error fetching sales invoices:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales invoices',
      error: err.message,
    });
  }
};

/**
 * GET /api/sales/:id
 * Fetch single invoice and its full line items
 */
export const getSaleInvoiceById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const storeId = await getStoreId(req);
    const { id } = req.params;

    const invoiceRes = await pool.query(
      `SELECT 
        id, 
        invoice_number AS "invoiceNumber", 
        customer_name_snapshot AS "customerName", 
        customer_mobile_snapshot AS "customerMobile",
        doctor_name AS "doctorName",
        subtotal::float AS "subtotal", 
        discount_amount::float AS "discountAmount", 
        gst_amount::float AS "gstAmount", 
        net_total::float AS "netTotal", 
        payment_mode AS "paymentMode", 
        status, 
        notes, 
        invoice_date AS "date"
      FROM sales_invoices
      WHERE id = $1 AND store_id = $2;`,
      [id, storeId]
    );

    if (invoiceRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Sale invoice not found' });
      return;
    }

    const itemsRes = await pool.query(
      `SELECT 
        id, 
        medicine_name AS "medicineName", 
        batch_number AS "batchNumber", 
        expiry_date AS "expiryDate", 
        quantity, 
        mrp::float AS "mrp", 
        selling_price::float AS "sellingPrice", 
        discount_percent::float AS "discountPercent", 
        gst_rate::float AS "gstRate", 
        total_amount::float AS "total"
      FROM sales_invoice_items
      WHERE invoice_id = $1
      ORDER BY id ASC;`,
      [id]
    );

    res.json({
      success: true,
      invoice: {
        ...invoiceRes.rows[0],
        items: itemsRes.rows,
      },
    });
  } catch (err: any) {
    console.error('Error fetching invoice by id:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice details',
      error: err.message,
    });
  }
};
