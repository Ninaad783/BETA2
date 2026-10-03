import { Request } from 'express';

export type UserRole = 'ADMIN' | 'PHARMACIST' | 'STAFF';

export interface UserRow {
  id: string;
  store_id: string;
  username: string;
  password_hash: string;
  full_name: string;
  mobile: string | null;
  role: UserRole;
  preferred_language: 'en' | 'mr';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUserDTO {
  id: string;
  storeId: string;
  username: string;
  fullName: string;
  mobile: string | null;
  role: UserRole;
  preferredLanguage: 'en' | 'mr';
}

export interface JwtUserPayload {
  userId: string;
  storeId: string;
  username: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}
