-- =============================================================================
-- MEDEASY PHARMACY OS - PRODUCTION POSTGRESQL DATABASE SCHEMA (v1.1)
-- POS + FEFO Inventory + Proper Purchase History
-- Udhaar / customer credit has been intentionally removed.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. ENUM TYPES
-- =============================================================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'PHARMACIST', 'STAFF');
CREATE TYPE sale_payment_mode AS ENUM ('CASH', 'UPI', 'CARD');
CREATE TYPE sale_status AS ENUM ('COMPLETED', 'CANCELLED');
CREATE TYPE purchase_payment_mode AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER');
CREATE TYPE purchase_status AS ENUM ('RECEIVED', 'CANCELLED');
CREATE TYPE stock_status_enum AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK');

-- =============================================================================
-- 2. STORE PROFILE & CONFIGURATION
-- =============================================================================
CREATE TABLE IF NOT EXISTS pharmacy_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(255) NOT NULL,
    dl_number VARCHAR(100),
    gstin VARCHAR(50),
    phone VARCHAR(20),
    whatsapp_number VARCHAR(20),
    email VARCHAR(255),
    address_line TEXT,
    village_town VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    thermal_header TEXT,
    thermal_footer TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    backup_frequency VARCHAR(50) NOT NULL DEFAULT 'DAILY',
    last_backup_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. USERS & STAFF ACCESS CONTROL
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20),
    role user_role NOT NULL DEFAULT 'STAFF',
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en'
        CHECK (preferred_language IN ('en', 'mr')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_store_username UNIQUE (store_id, username)
);

CREATE INDEX IF NOT EXISTS idx_users_store ON users(store_id);

-- =============================================================================
-- 4. MEDICINE CATEGORIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS medicine_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_store_category UNIQUE (store_id, name)
);

-- =============================================================================
-- 5. MEDICINES MASTER CATALOG
-- =============================================================================
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES medicine_categories(id) ON DELETE SET NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'strip',
    min_stock_alert INTEGER NOT NULL DEFAULT 15 CHECK (min_stock_alert >= 0),
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 12.00 CHECK (gst_rate >= 0 AND gst_rate <= 100),
    hsn_code VARCHAR(50),
    manufacturer VARCHAR(150),
    rack_location VARCHAR(50),
    requires_prescription BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_store_name ON medicines(store_id, name);
CREATE INDEX IF NOT EXISTS idx_medicines_generic_name ON medicines(generic_name);
CREATE INDEX IF NOT EXISTS idx_medicines_rack ON medicines(store_id, rack_location);

-- =============================================================================
-- 6. MEDICINE BATCHES / FEFO STOCK VAULT
-- =============================================================================
CREATE TABLE IF NOT EXISTS medicine_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    expiry_date DATE NOT NULL,
    purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (purchase_price >= 0),
    mrp NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (mrp >= 0),
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (selling_price >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    initial_stock INTEGER NOT NULL DEFAULT 0 CHECK (initial_stock >= 0),
    is_serving BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_med_batch UNIQUE (medicine_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_batches_fefo ON medicine_batches(medicine_id, expiry_date ASC, current_stock DESC);
CREATE INDEX IF NOT EXISTS idx_batches_barcode ON medicine_batches(barcode);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON medicine_batches(expiry_date);

-- =============================================================================
-- 7. CUSTOMERS - NO CREDIT / UDHAAR FIELDS
-- Customer data is only for bill identity and purchase history.
-- =============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    address TEXT,
    total_purchases NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (total_purchases >= 0),
    total_bills INTEGER NOT NULL DEFAULT 0 CHECK (total_bills >= 0),
    last_purchase_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_store_customer_mobile UNIQUE (store_id, mobile)
);

CREATE INDEX IF NOT EXISTS idx_customers_store_mobile ON customers(store_id, mobile);

-- =============================================================================
-- 8. SUPPLIERS DIRECTORY
-- No supplier Udhaar balance is stored. Purchase invoices are paid at purchase.
-- Historical supplier invoices remain permanently queryable.
-- =============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    mobile VARCHAR(20),
    email VARCHAR(255),
    gstin VARCHAR(50),
    dl_number VARCHAR(100),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_store_name ON suppliers(store_id, name);

-- =============================================================================
-- 9. SALES INVOICES
-- =============================================================================
CREATE TABLE IF NOT EXISTS sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name_snapshot VARCHAR(200),
    customer_mobile_snapshot VARCHAR(20),
    doctor_name VARCHAR(150),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    taxable_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (taxable_amount >= 0),
    gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (gst_amount >= 0),
    net_total NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (net_total >= 0),
    payment_mode sale_payment_mode NOT NULL DEFAULT 'CASH',
    status sale_status NOT NULL DEFAULT 'COMPLETED',
    notes TEXT,
    is_thermal_printed BOOLEAN NOT NULL DEFAULT false,
    is_whatsapp_dispatched BOOLEAN NOT NULL DEFAULT false,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_store_invoice_number UNIQUE (store_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_sales_store_date ON sales_invoices(store_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales_invoices(customer_id);

-- =============================================================================
-- 10. SALES INVOICE LINE ITEMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS sales_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE RESTRICT,
    medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES medicine_batches(id) ON DELETE SET NULL,
    medicine_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    purchase_price NUMERIC(12,2) NOT NULL CHECK (purchase_price >= 0),
    mrp NUMERIC(12,2) NOT NULL CHECK (mrp >= 0),
    selling_price NUMERIC(12,2) NOT NULL CHECK (selling_price >= 0),
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 12.00 CHECK (gst_rate >= 0 AND gst_rate <= 100),
    taxable_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (taxable_amount >= 0),
    gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (gst_amount >= 0),
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 11. PURCHASE INVOICES
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name_snapshot VARCHAR(255) NOT NULL,
    supplier_invoice_number VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    taxable_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (taxable_amount >= 0),
    gst_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (gst_amount >= 0),
    net_total NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (net_total >= 0),
    payment_mode purchase_payment_mode NOT NULL DEFAULT 'BANK_TRANSFER',
    status purchase_status NOT NULL DEFAULT 'RECEIVED',
    notes TEXT,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_supplier_invoice_per_store UNIQUE (store_id, supplier_id, supplier_invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_purchase_store_date ON purchase_invoices(store_id, purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_supplier_date ON purchase_invoices(supplier_id, purchase_date DESC);

-- =============================================================================
-- 12. PURCHASE INVOICE LINE ITEMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_invoice_id UUID NOT NULL REFERENCES purchase_invoices(id) ON DELETE RESTRICT,
    line_number INTEGER NOT NULL CHECK (line_number > 0),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES medicine_batches(id) ON DELETE RESTRICT,
    medicine_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    purchase_price NUMERIC(12,2) NOT NULL CHECK (purchase_price >= 0),
    mrp NUMERIC(12,2) NOT NULL CHECK (mrp >= 0),
    selling_price NUMERIC(12,2) NOT NULL CHECK (selling_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    free_quantity INTEGER NOT NULL DEFAULT 0 CHECK (free_quantity >= 0),
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 12.00 CHECK (gst_rate >= 0 AND gst_rate <= 100),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    taxable_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (taxable_amount >= 0),
    gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (gst_amount >= 0),
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_purchase_line UNIQUE (purchase_invoice_id, line_number)
);

-- =============================================================================
-- 13. SEED DATA
-- =============================================================================
INSERT INTO pharmacy_stores (
    id, store_name, dl_number, gstin, phone, whatsapp_number, email,
    address_line, village_town, district, state, pincode,
    thermal_header, thermal_footer
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'MedEasy Pharmacy',
    '',
    '',
    '8380036778',
    '8380036778',
    '',
    '',
    '',
    '',
    'Maharashtra',
    '',
    'MEDEASY PHARMACY',
    'Thank you for your visit! Wishing you good health.'
) ON CONFLICT (id) DO NOTHING;

-- Primary Admin User: Ninaad Kumbhar (Admin). Default password: password123
INSERT INTO users (
    id, store_id, username, password_hash, full_name, mobile, role, preferred_language
) VALUES
(
    '12a5ddc2-fde4-4a41-bb77-23d1bdc03126',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'ninaad_nk',
    '$2b$10$PD3lBUoaEi1Z8owWsWRqaedep8cAaE4vreGWkXv8LblZ2VkTypYNy',
    'Ninaad Kumbhar',
    '8380036778',
    'ADMIN',
    'mr'
) ON CONFLICT (store_id, username) DO NOTHING;
