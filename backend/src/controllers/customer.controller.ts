import { Response } from 'express';
import { pool } from '../db';
import { AuthenticatedRequest } from '../types/auth.types';

const getStoreId = async (req: AuthenticatedRequest): Promise<string> => {
  if (req.user?.storeId) return req.user.storeId;
  const res = await pool.query('SELECT id FROM pharmacy_stores LIMIT 1;');
  return res.rows[0]?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
};

const isUuid = (val: any): boolean =>
  typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

/**
 * GET /api/customers
 * Fetch all customers for current store
 */
export const getCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const storeId = await getStoreId(req);
    const search = ((req.query.q as string) || '').trim();

    let sql = `
      SELECT 
        id, 
        full_name AS "fullName", 
        mobile, 
        address, 
        total_purchases::float AS "totalPurchases", 
        total_bills AS "totalBills", 
        last_purchase_date AS "lastPurchaseDate", 
        is_active AS "isActive",
        created_at AS "createdAt"
      FROM customers
      WHERE store_id = $1 AND is_active = true
    `;
    const params: any[] = [storeId];

    if (search) {
      sql += ` AND (full_name ILIKE $2 OR mobile ILIKE $2)`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY updated_at DESC, created_at DESC;`;

    const result = await pool.query(sql, params);

    res.json({
      success: true,
      count: result.rows.length,
      customers: result.rows,
    });
  } catch (err: any) {
    console.error('Error in getCustomers:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: err.message,
    });
  }
};

/**
 * GET /api/customers/:id
 * Fetch single customer and their actual invoices
 */
export const getCustomerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const storeId = await getStoreId(req);
    const { id } = req.params;

    if (!isUuid(id)) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const customerRes = await pool.query(
      `SELECT 
        id, 
        full_name AS "fullName", 
        mobile, 
        address, 
        total_purchases::float AS "totalPurchases", 
        total_bills AS "totalBills", 
        last_purchase_date AS "lastPurchaseDate", 
        is_active AS "isActive"
      FROM customers 
      WHERE id = $1 AND store_id = $2;`,
      [id, storeId]
    );

    if (customerRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const invoicesRes = await pool.query(
      `SELECT 
        id, 
        invoice_number AS "invoiceNumber", 
        subtotal::float AS "subtotal", 
        net_total::float AS "netTotal", 
        payment_mode AS "paymentMode", 
        status, 
        doctor_name AS "doctorName", 
        notes, 
        invoice_date AS "invoiceDate"
      FROM sales_invoices
      WHERE customer_id = $1 AND store_id = $2
      ORDER BY invoice_date DESC;`,
      [id, storeId]
    );

    res.json({
      success: true,
      customer: customerRes.rows[0],
      invoices: invoicesRes.rows,
    });
  } catch (err: any) {
    console.error('Error in getCustomerById:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer profile',
      error: err.message,
    });
  }
};

/**
 * POST /api/customers
 * Create or update customer by mobile
 */
export const createCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const storeId = await getStoreId(req);
    const { fullName, mobile, address } = req.body;

    if (!fullName || !mobile) {
      res.status(400).json({
        success: false,
        message: 'Full name and mobile number are required',
      });
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length < 10) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number',
      });
      return;
    }

    const query = `
      INSERT INTO customers (store_id, full_name, mobile, address)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (store_id, mobile)
      DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        address = COALESCE(EXCLUDED.address, customers.address),
        is_active = true,
        updated_at = NOW()
      RETURNING 
        id, 
        full_name AS "fullName", 
        mobile, 
        address, 
        total_purchases::float AS "totalPurchases", 
        total_bills AS "totalBills", 
        last_purchase_date AS "lastPurchaseDate";
    `;

    const result = await pool.query(query, [storeId, fullName.trim(), cleanMobile, address || null]);

    res.status(201).json({
      success: true,
      message: 'Customer saved successfully',
      customer: result.rows[0],
    });
  } catch (err: any) {
    console.error('Error in createCustomer:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: err.message,
    });
  }
};

/**
 * PUT /api/customers/:id
 * Update customer details
 */
export const updateCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const storeId = await getStoreId(req);
    const { id } = req.params;
    const { fullName, mobile, address } = req.body;

    const result = await pool.query(
      `UPDATE customers
       SET full_name = COALESCE($1, full_name),
           mobile = COALESCE($2, mobile),
           address = COALESCE($3, address),
           updated_at = NOW()
       WHERE id = $4 AND store_id = $5
       RETURNING 
        id, 
        full_name AS "fullName", 
        mobile, 
        address, 
        total_purchases::float AS "totalPurchases", 
        total_bills AS "totalBills", 
        last_purchase_date AS "lastPurchaseDate";`,
      [fullName ? fullName.trim() : null, mobile ? mobile.trim() : null, address ?? null, id, storeId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: result.rows[0],
    });
  } catch (err: any) {
    console.error('Error in updateCustomer:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: err.message,
    });
  }
};
