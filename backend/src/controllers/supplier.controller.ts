import { Response } from 'express';
import { pool } from '../db';
import { AuthenticatedRequest } from '../types/auth.types';

const getStoreId = async (req: AuthenticatedRequest): Promise<string> => {
  if (req.user?.storeId) return req.user.storeId;
  const res = await pool.query('SELECT id FROM pharmacy_stores LIMIT 1;');
  return res.rows[0]?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
};

/**
 * GET /api/suppliers
 * Fetch all suppliers/distributors for the store
 */
export const getSuppliers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const storeId = await getStoreId(req);
    const search = ((req.query.q as string) || '').trim();

    let sql = `
      SELECT 
        id, 
        name, 
        contact_person AS "contactPerson", 
        mobile, 
        email, 
        gstin, 
        dl_number AS "dlNumber", 
        address, 
        is_active AS "isActive",
        created_at AS "createdAt"
      FROM suppliers
      WHERE store_id = $1 AND is_active = true
    `;
    const params: any[] = [storeId];

    if (search) {
      sql += ` AND (name ILIKE $2 OR contact_person ILIKE $2 OR mobile ILIKE $2)`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY name ASC;`;

    const result = await pool.query(sql, params);

    res.json({
      success: true,
      count: result.rows.length,
      suppliers: result.rows,
    });
  } catch (err: any) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: err.message,
    });
  }
};

/**
 * POST /api/suppliers
 * Create a new distributor/supplier
 */
export const createSupplier = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const storeId = await getStoreId(req);
    const { name, contactPerson, mobile, email, gstin, dlNumber, address } = req.body;

    if (!name || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Supplier/Distributor name is required',
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO suppliers (
        store_id, name, contact_person, mobile, email, gstin, dl_number, address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id, 
        name, 
        contact_person AS "contactPerson", 
        mobile, 
        email, 
        gstin, 
        dl_number AS "dlNumber", 
        address, 
        is_active AS "isActive";`,
      [
        storeId,
        name.trim(),
        contactPerson ? contactPerson.trim() : null,
        mobile ? mobile.trim() : null,
        email ? email.trim() : null,
        gstin ? gstin.trim().toUpperCase() : null,
        dlNumber ? dlNumber.trim() : null,
        address ? address.trim() : null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplier: result.rows[0],
    });
  } catch (err: any) {
    console.error('Error creating supplier:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: err.message,
    });
  }
};
