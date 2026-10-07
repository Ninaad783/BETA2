import { Response } from 'express';
import { pool } from '../db';
import { AuthenticatedRequest } from '../types/auth.types';

export const getStoreProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        store_name AS "storeName", 
        dl_number AS "dlNumber", 
        gstin, 
        phone, 
        whatsapp_number AS "whatsappNumber", 
        email, 
        address_line AS "addressLine", 
        village_town AS "villageTown", 
        district, 
        state, 
        pincode, 
        thermal_header AS "thermalHeader", 
        thermal_footer AS "thermalFooter", 
        currency,
        updated_at AS "updatedAt"
      FROM pharmacy_stores 
      ORDER BY created_at ASC 
      LIMIT 1;`
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Pharmacy store profile not found' });
      return;
    }

    res.json({
      success: true,
      store: result.rows[0]
    });
  } catch (err: any) {
    console.error('Error fetching store profile:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacy store profile',
      error: err.message
    });
  }
};

export const updateStoreProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      storeName,
      dlNumber,
      gstin,
      phone,
      whatsappNumber,
      email,
      addressLine,
      thermalHeader,
      thermalFooter
    } = req.body;

    const currentStore = await pool.query('SELECT id FROM pharmacy_stores ORDER BY created_at ASC LIMIT 1;');
    if (currentStore.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Pharmacy store not found' });
      return;
    }
    const storeId = currentStore.rows[0].id;

    const updateRes = await pool.query(
      `UPDATE pharmacy_stores
       SET 
        store_name = COALESCE($1, store_name),
        dl_number = COALESCE($2, dl_number),
        gstin = COALESCE($3, gstin),
        phone = COALESCE($4, phone),
        whatsapp_number = COALESCE($5, whatsapp_number),
        email = COALESCE($6, email),
        address_line = COALESCE($7, address_line),
        thermal_header = COALESCE($8, thermal_header),
        thermal_footer = COALESCE($9, thermal_footer),
        updated_at = NOW()
       WHERE id = $10
       RETURNING 
        id, 
        store_name AS "storeName", 
        dl_number AS "dlNumber", 
        gstin, 
        phone, 
        whatsapp_number AS "whatsappNumber", 
        email, 
        address_line AS "addressLine", 
        thermal_header AS "thermalHeader", 
        thermal_footer AS "thermalFooter", 
        updated_at AS "updatedAt";`,
      [
        storeName,
        dlNumber,
        gstin,
        phone,
        whatsappNumber,
        email,
        addressLine,
        thermalHeader,
        thermalFooter,
        storeId
      ]
    );

    res.json({
      success: true,
      message: 'Pharmacy store profile updated successfully',
      store: updateRes.rows[0]
    });
  } catch (err: any) {
    console.error('Error updating store profile:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update store profile',
      error: err.message
    });
  }
};
