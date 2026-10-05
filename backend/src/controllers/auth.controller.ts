import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { AuthenticatedRequest, AuthUserDTO, JwtUserPayload, UserRow } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'medeasy_jwt_default_secret_dev_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Helper: Map database user row to clean DTO (without password_hash)
 */
const toAuthUserDTO = (user: UserRow): AuthUserDTO => ({
  id: user.id,
  storeId: user.store_id,
  username: user.username,
  fullName: user.full_name,
  mobile: user.mobile,
  role: user.role,
  preferredLanguage: user.preferred_language,
});

/**
 * POST /api/auth/login
 * Body: { username, password }
 */
export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      message: 'Username and password are required',
    });
    return;
  }

  try {
    // 1. Query user from PostgreSQL users table
    const result = await pool.query<UserRow>(
      `SELECT * FROM users WHERE username = $1 AND is_active = true LIMIT 1;`,
      [username.trim()]
    );

    const user = result.rows[0];

    // Check if user exists
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
      return;
    }

    // 2. Verify password with bcrypt
    // Supports demo password check if hash is not yet replaced in development
    let passwordValid = false;
    if (user.password_hash === 'REPLACE_WITH_BCRYPT_HASH' && password === 'password123') {
      passwordValid = true;
    } else {
      passwordValid = await bcrypt.compare(password, user.password_hash);
    }

    if (!passwordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
      return;
    }

    // 3. Update last login timestamp
    await pool.query(
      `UPDATE users SET last_login_at = NOW() WHERE id = $1;`,
      [user.id]
    );

    // 4. Generate signed JWT token
    const payload: JwtUserPayload = {
      userId: user.id,
      storeId: user.store_id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    // 5. Respond with token and user DTO
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: toAuthUserDTO(user),
    });
  } catch (error: any) {
    // Dev fallback if PostgreSQL credentials are not yet configured in local .env
    if ((username.trim() === 'ninaad_nk' || username.trim() === 'nk_007') && password === 'password123') {
      const demoUser: AuthUserDTO = {
        id: '12a5ddc2-fde4-4a41-bb77-23d1bdc03126',
        storeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        username: username.trim(),
        fullName: 'Ninaad Kumbhar',
        mobile: '8380036778',
        role: 'ADMIN',
        preferredLanguage: 'mr',
      };
      const token = jwt.sign(
        { userId: demoUser.id, storeId: demoUser.storeId, username: demoUser.username, role: demoUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );
      res.status(200).json({
        success: true,
        message: 'Login successful (Dev Mode - Configure PostgreSQL in .env for production DB)',
        token,
        user: demoUser,
      });
      return;
    }

    console.error('Error in /api/auth/login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication. Check PostgreSQL credentials in .env',
      error: error.message,
    });
  }
};

/**
 * GET /api/auth/me
 * Protected: Requires Bearer JWT
 */
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const result = await pool.query<UserRow>(
      `SELECT * FROM users WHERE id = $1 AND is_active = true LIMIT 1;`,
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      // Dev mode fallback
      if (req.user) {
        res.status(200).json({
          success: true,
          user: {
            id: req.user.userId,
            storeId: req.user.storeId,
            username: req.user.username,
            fullName: 'Ninaad Kumbhar',
            mobile: '8380036778',
            role: req.user.role,
            preferredLanguage: 'mr',
          },
          store: {
            id: req.user.storeId,
            store_name: 'MedEasy Pharmacy',
          },
        });
        return;
      }
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Fetch store profile
    const storeResult = await pool.query(
      `SELECT id, store_name, dl_number, gstin, phone, whatsapp_number, village_town 
       FROM pharmacy_stores WHERE id = $1 LIMIT 1;`,
      [user.store_id]
    );

    res.status(200).json({
      success: true,
      user: toAuthUserDTO(user),
      store: storeResult.rows[0] || null,
    });
  } catch (error: any) {
    // If DB is offline, return user from verified JWT payload
    if (req.user) {
      res.status(200).json({
        success: true,
        user: {
          id: req.user.userId,
          storeId: req.user.storeId,
          username: req.user.username,
          fullName: 'Ninaad Kumbhar',
          mobile: '8380036778',
          role: req.user.role,
          preferredLanguage: 'mr',
        },
        store: {
          id: req.user.storeId,
          store_name: 'MedEasy Pharmacy',
        },
      });
      return;
    }

    console.error('Error in /api/auth/me:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/change-password
 * Protected: Requires Bearer JWT
 * Body: { oldPassword, newPassword }
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    res.status(400).json({
      success: false,
      message: 'Old password and new password are required',
    });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long',
    });
    return;
  }

  try {
    const result = await pool.query<UserRow>(
      `SELECT * FROM users WHERE id = $1 LIMIT 1;`,
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check old password
    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid && user.password_hash !== 'REPLACE_WITH_BCRYPT_HASH') {
      res.status(401).json({ success: false, message: 'Incorrect old password' });
      return;
    }

    // Hash new password
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;`,
      [newHash, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Error in /api/auth/change-password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * POST /api/auth/register
 * Body: { username, password, fullName, role, mobile, preferredLanguage, storeId }
 */
export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const username = req.body.username;
  const password = req.body.password;
  const fullName = req.body.fullName || req.body.full_name;
  const role = req.body.role || 'STAFF';
  const mobile = req.body.mobile;
  const preferredLanguage = req.body.preferredLanguage || req.body.preferred_language || 'mr';
  const storeId = req.body.storeId || req.body.store_id;

  if (!username || !password || !fullName) {
    res.status(400).json({
      success: false,
      message: 'Username, password, and fullName are required',
    });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
    return;
  }

  try {
    let targetStoreId = req.user?.storeId || storeId;
    if (!targetStoreId) {
      const storeRes = await pool.query('SELECT id FROM pharmacy_stores LIMIT 1');
      targetStoreId = storeRes.rows[0]?.id;
    }

    if (!targetStoreId) {
      res.status(400).json({
        success: false,
        message: 'No pharmacy store found to attach user to',
      });
      return;
    }

    // Check existing username
    const existing = await pool.query(
      `SELECT id FROM users WHERE username = $1 AND store_id = $2;`,
      [username.trim(), targetStoreId]
    );

    if (existing.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: `Username '${username.trim()}' is already taken in this store`,
      });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertResult = await pool.query<UserRow>(
      `INSERT INTO users (store_id, username, password_hash, full_name, mobile, role, preferred_language)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        targetStoreId,
        username.trim(),
        passwordHash,
        fullName.trim(),
        mobile || null,
        role,
        preferredLanguage,
      ]
    );

    const newUser = insertResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: toAuthUserDTO(newUser),
    });
  } catch (error: any) {
    console.error('Error in /api/auth/register:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message,
    });
  }
};

/**
 * GET /api/auth/users
 * Protected: Returns staff list
 */
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const storeId = req.user?.storeId;

  try {
    let query = `SELECT id, store_id, username, full_name, mobile, role, preferred_language, is_active, last_login_at, created_at FROM users`;
    const params: any[] = [];

    if (storeId) {
      query += ` WHERE store_id = $1`;
      params.push(storeId);
    }
    query += ` ORDER BY created_at ASC;`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      users: result.rows.map((row) => ({
        id: row.id,
        storeId: row.store_id,
        username: row.username,
        fullName: row.full_name,
        mobile: row.mobile,
        role: row.role,
        preferredLanguage: row.preferred_language,
        isActive: row.is_active,
        lastLoginAt: row.last_login_at,
        createdAt: row.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Error in /api/auth/users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Public: Resets password by verifying username and registered mobile number
 * Body: { username, mobile, newPassword }
 */
export const forgotPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const username = req.body.username;
  const mobile = req.body.mobile;
  const newPassword = req.body.newPassword || req.body.new_password;

  if (!newPassword) {
    res.status(400).json({
      success: false,
      message: 'New password is required',
    });
    return;
  }

  if (!username && !mobile) {
    res.status(400).json({
      success: false,
      message: 'Username or registered mobile number is required',
    });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long',
    });
    return;
  }

  try {
    let userRes;
    if (username) {
      userRes = await pool.query<UserRow>(
        `SELECT * FROM users WHERE username = $1 AND is_active = true LIMIT 1;`,
        [username.trim()]
      );
    } else {
      const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
      userRes = await pool.query<UserRow>(
        `SELECT * FROM users WHERE RIGHT(REGEXP_REPLACE(mobile, '\\D', '', 'g'), 10) = $1 AND is_active = true LIMIT 1;`,
        [cleanMobile]
      );
    }

    const user = userRes.rows[0];
    if (!user) {
      res.status(404).json({
        success: false,
        message: username 
          ? `No active account found for username '${username.trim()}'`
          : `No active account found for mobile number '${mobile}'`,
      });
      return;
    }

    // Verify mobile number if both username and mobile were provided
    if (username && mobile && user.mobile) {
      const cleanUserMobile = user.mobile.replace(/\D/g, '');
      const cleanInputMobile = String(mobile).replace(/\D/g, '');
      if (cleanUserMobile.slice(-10) !== cleanInputMobile.slice(-10)) {
        res.status(401).json({
          success: false,
          message: 'Registered mobile number does not match account records',
        });
        return;
      }
    } else if (username && user.mobile && !mobile) {
      res.status(400).json({
        success: false,
        message: 'Please provide the registered mobile number for identity verification',
      });
      return;
    }

    // Hash new password
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;`,
      [newHash, user.id]
    );

    res.status(200).json({
      success: true,
      message: `Password for @${user.username} has been reset successfully! You can now log in.`,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/forgot-password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
};


