-- =============================================================================
-- MEDEASY PHARMACY OS - PRODUCTION POSTGRESQL SCHEMA (v1.0)
-- Engineered for High-Speed Counter POS, FEFO Batching & Digital Udhaar
-- Tailored to Indian Retail Pharmacy Regulations (GSTIN, DL, Schedule H/H1)
-- =============================================================================

-- Enable UUID extension for distributed unique keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. STORE PROFILE & CONFIGURATION
-- =============================================================================
CREATE TABLE IF NOT EXISTS pharmacy_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(255) NOT NULL DEFAULT 'MedEasy Khed Shivapur Medical',
    dl_number VARCHAR(100) NOT NULL DEFAULT 'MH-PUN-2024-DL9012',
    gstin VARCHAR(50) NOT NULL DEFAULT '27AABCM9876E1Z4',
    phone VARCHAR(20) NOT NULL DEFAULT '+91 9822334455',
    whatsapp_number VARCHAR(20) DEFAULT '+91 9822334455',
    email VARCHAR(255) DEFAULT 'contact@medeasypharmacy.in',
    address_line TEXT NOT NULL DEFAULT 'Shop No. 4, Gram Panchayat Complex, Pune-Bangalore Highway',
    village_town VARCHAR(100) NOT NULL DEFAULT 'Khed Shivapur',
    district VARCHAR(100) NOT NULL DEFAULT 'Pune',
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    pincode VARCHAR(20) NOT NULL DEFAULT '412205',
    thermal_header TEXT DEFAULT 'MedEasy Khed Shivapur Medical\nPrompt Care & Quality Medicines',
    thermal_footer TEXT DEFAULT 'Thank you for your visit! Get well soon.\nMedicines once sold cannot be returned without bill.',
    currency VARCHAR(10) DEFAULT 'INR',
    backup_frequency VARCHAR(50) DEFAULT 'DAILY',
    last_backup_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. USERS & STAFF ACCESS
-- =============================================================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'PHARMACIST', 'STAFF');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20),
    role user_role NOT NULL DEFAULT 'STAFF',
    preferred_language VARCHAR(10) DEFAULT 'en' CHECK (preferred_language IN ('en', 'mr')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. MEDICINE CATEGORIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS medicine_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_store_category UNIQUE (store_id, name)
);

-- =============================================================================
-- 4. MEDICINE MASTER CATALOG
-- =============================================================================
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,                        -- Brand Name (e.g., 'Dolo 650')
    generic_name VARCHAR(255) NOT NULL,                -- Active Salt (e.g., 'Paracetamol 650mg')
    category_id UUID REFERENCES medicine_categories(id) ON DELETE SET NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'strip',         -- strip, tablet, capsule, bottle, sachet, tube, vial
    min_stock_alert INTEGER NOT NULL DEFAULT 15,       -- Low stock threshold
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 12.00,      -- 5.00, 12.00, 18.00%
    hsn_code VARCHAR(50) DEFAULT '3004',               -- HSN Code for Pharma GST
    manufacturer VARCHAR(150),                         -- e.g. Micro Labs, Cipla, Sun Pharma
    rack_location VARCHAR(50) DEFAULT 'A-01',          -- Counter shelf coordinates (e.g. A-04, B-12)
    requires_prescription BOOLEAN NOT NULL DEFAULT false, -- Schedule H / H1 drug indicator
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines (name);
CREATE INDEX IF NOT EXISTS idx_medicines_generic_name ON medicines (generic_name);
CREATE INDEX IF NOT EXISTS idx_medicines_rack ON medicines (rack_location);

-- =============================================================================
-- 5. MEDICINE BATCHES (FEFO ENGINE & STOCK VAULT)
-- =============================================================================
CREATE TABLE IF NOT EXISTS medicine_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),                              -- EAN-13 / GS1 barcode for instant scanning
    expiry_date DATE NOT NULL,                         -- Expiry Date for FEFO (Earliest Expiry First Out)
    purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    mrp NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    initial_stock INTEGER NOT NULL DEFAULT 0,
    is_serving BOOLEAN NOT NULL DEFAULT false,         -- Marked as the active FEFO batch at counter
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_med_batch UNIQUE (medicine_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_batches_expiry ON medicine_batches (expiry_date ASC);
CREATE INDEX IF NOT EXISTS idx_batches_barcode ON medicine_batches (barcode);
CREATE INDEX IF NOT EXISTS idx_batches_current_stock ON medicine_batches (current_stock);

-- =============================================================================
-- 6. CUSTOMERS & UDHAAR CREDIT LEDGER
-- =============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    address TEXT,
    credit_limit NUMERIC(10,2) DEFAULT 5000.00,
    current_due NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (current_due >= 0),
    total_purchases NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_bills INTEGER NOT NULL DEFAULT 0,
    last_purchase_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_store_customer_mobile UNIQUE (store_id, mobile)
);

CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers (mobile);
CREATE INDEX IF NOT EXISTS idx_customers_due ON customers (current_due);

-- =============================================================================
-- 7. SUPPLIERS DIRECTORY
-- =============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    gstin VARCHAR(50),
    dl_number VARCHAR(100),
    address TEXT,
    current_due NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (current_due >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers (name);

-- =============================================================================
-- 8. SALES INVOICES (COUNTER BILLING & POS)
-- =============================================================================
CREATE TYPE payment_mode_enum AS ENUM ('CASH', 'UPI', 'CARD', 'CREDIT_UDHAAR');
CREATE TYPE payment_status_enum AS ENUM ('PAID', 'PENDING_UDHAAR', 'PARTIALLY_PAID');

CREATE TABLE IF NOT EXISTS sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,        -- Format: INV-2026-0843
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name_snapshot VARCHAR(200),               -- Saved at bill creation time
    customer_mobile_snapshot VARCHAR(20),
    doctor_name VARCHAR(150),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    net_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_mode payment_mode_enum NOT NULL DEFAULT 'CASH',
    payment_status payment_status_enum NOT NULL DEFAULT 'PAID',
    amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    amount_due NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    is_thermal_printed BOOLEAN NOT NULL DEFAULT false,
    is_whatsapp_dispatched BOOLEAN NOT NULL DEFAULT false,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_invoices_num ON sales_invoices (invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_date ON sales_invoices (invoice_date);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_cust ON sales_invoices (customer_id);

-- =============================================================================
-- 9. SALES INVOICE LINE ITEMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS sales_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES medicine_batches(id) ON DELETE SET NULL,
    medicine_name VARCHAR(255) NOT NULL,               -- Historical immutable snapshot
    batch_number VARCHAR(100) NOT NULL,
    expiry_date VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    purchase_price NUMERIC(10,2) NOT NULL,             -- Crucial for real-time COGS net profit
    mrp NUMERIC(10,2) NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    total_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_items_inv ON sales_invoice_items (invoice_id);
CREATE INDEX IF NOT EXISTS idx_sales_items_med ON sales_invoice_items (medicine_id);

-- =============================================================================
-- 10. CUSTOMER UDHAAR PAYMENTS & SETTLEMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS customer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,        -- Format: RCP-2026-0042
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(20) NOT NULL DEFAULT 'CASH' CHECK (payment_mode IN ('CASH', 'UPI', 'CARD')),
    transaction_ref VARCHAR(100),
    notes TEXT,
    received_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_payments_cust ON customer_payments (customer_id);

-- =============================================================================
-- 11. PURCHASE INVOICES (STOCK INWARD FROM SUPPLIERS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,              -- Supplier's invoice number
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name_snapshot VARCHAR(255) NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'CREDIT')),
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchase_invoices (supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchase_invoices (invoice_date);

-- =============================================================================
-- 12. PURCHASE INVOICE LINE ITEMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_invoice_id UUID NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
    medicine_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    purchase_price NUMERIC(10,2) NOT NULL,
    mrp NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    free_quantity INTEGER NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_inv ON purchase_invoice_items (purchase_invoice_id);

-- =============================================================================
-- 13. PHYSICAL STOCK AUDIT & MANUAL ADJUSTMENTS LOG
-- =============================================================================
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES pharmacy_stores(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES medicine_batches(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    previous_stock INTEGER NOT NULL,
    adjusted_stock INTEGER NOT NULL,
    difference_qty INTEGER NOT NULL,                   -- e.g. -2, +5
    reason VARCHAR(255) NOT NULL,                      -- e.g. "Physical Stock Audit Count", "Broken/Damaged"
    adjusted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 14. REAL-TIME VIEWS FOR DASHBOARD & PERFORMANCE
-- =============================================================================

-- View A: Full Live Medicine Inventory with Calculated Total Stock & Status
CREATE OR REPLACE VIEW v_medicine_inventory_summary AS
SELECT 
    m.id AS medicine_id,
    m.name AS medicine_name,
    m.generic_name,
    c.name AS category_name,
    m.unit,
    m.min_stock_alert,
    m.gst_rate,
    m.rack_location,
    COALESCE(SUM(b.current_stock), 0)::INT AS total_stock,
    COALESCE(MIN(b.selling_price), 0.00) AS selling_price,
    COALESCE(MIN(b.mrp), 0.00) AS mrp,
    CASE 
        WHEN COALESCE(SUM(b.current_stock), 0) = 0 THEN 'OUT_OF_STOCK'
        WHEN COALESCE(SUM(b.current_stock), 0) <= m.min_stock_alert THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_status,
    COUNT(b.id)::INT AS active_batches_count,
    MIN(CASE WHEN b.current_stock > 0 THEN b.expiry_date END) AS earliest_expiry_date
FROM medicines m
LEFT JOIN medicine_categories c ON m.category_id = c.id
LEFT JOIN medicine_batches b ON m.id = b.medicine_id
WHERE m.is_active = true
GROUP BY m.id, m.name, m.generic_name, c.name, m.unit, m.min_stock_alert, m.gst_rate, m.rack_location;

-- View B: Batches Expiring in Next 180 Days (Early Warning Radar)
CREATE OR REPLACE VIEW v_expiring_soon_batches AS
SELECT 
    b.id AS batch_id,
    m.id AS medicine_id,
    m.name AS medicine_name,
    b.batch_number,
    b.expiry_date,
    b.current_stock,
    b.purchase_price,
    b.mrp,
    (b.current_stock * b.mrp) AS retail_at_risk_value,
    (b.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM medicine_batches b
JOIN medicines m ON b.medicine_id = m.id
WHERE b.current_stock > 0 
  AND b.expiry_date <= (CURRENT_DATE + INTERVAL '180 days')
ORDER BY b.expiry_date ASC;

-- View C: Pending Customer Udhaar Ledger with WhatsApp Messaging Parameters
CREATE OR REPLACE VIEW v_customer_udhaar_ledger AS
SELECT 
    c.id AS customer_id,
    c.full_name,
    c.mobile,
    c.address,
    c.current_due,
    c.total_purchases,
    c.total_bills,
    c.last_purchase_date,
    c.credit_limit,
    ROUND((c.current_due / NULLIF(c.credit_limit, 0) * 100), 1) AS credit_utilization_percent
FROM customers c
WHERE c.current_due > 0
ORDER BY c.current_due DESC;

-- View D: Today's Live Counter KPI Analytics
CREATE OR REPLACE VIEW v_today_counter_analytics AS
SELECT 
    CURRENT_DATE AS report_date,
    COALESCE(SUM(si.net_total), 0.00) AS today_gross_sales,
    COALESCE(SUM(si.net_total - (
        SELECT COALESCE(SUM(sii.quantity * sii.purchase_price), 0.00)
        FROM sales_invoice_items sii 
        WHERE sii.invoice_id = si.id
    )), 0.00) AS today_net_profit,
    COUNT(si.id)::INT AS today_bills_count,
    COALESCE(SUM(CASE WHEN si.payment_mode = 'CREDIT_UDHAAR' THEN si.net_total ELSE 0 END), 0.00) AS today_udhaar_given,
    COALESCE((
        SELECT SUM(cp.amount) 
        FROM customer_payments cp 
        WHERE cp.payment_date::DATE = CURRENT_DATE
    ), 0.00) AS today_udhaar_collected,
    COALESCE((
        SELECT SUM(pi.total_amount) 
        FROM purchase_invoices pi 
        WHERE pi.invoice_date = CURRENT_DATE
    ), 0.00) AS today_purchase_total
FROM sales_invoices si
WHERE si.invoice_date::DATE = CURRENT_DATE;

-- =============================================================================
-- 15. AUTOMATED TRIGGERS & PROCEDURES
-- =============================================================================

-- Auto Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_stores ON pharmacy_stores;
CREATE TRIGGER set_timestamp_stores BEFORE UPDATE ON pharmacy_stores
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_medicines ON medicines;
CREATE TRIGGER set_timestamp_medicines BEFORE UPDATE ON medicines
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_batches ON medicine_batches;
CREATE TRIGGER set_timestamp_batches BEFORE UPDATE ON medicine_batches
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customers ON customers;
CREATE TRIGGER set_timestamp_customers BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger: Automatically Deduct Batch Stock on Sales Invoice Item Entry
CREATE OR REPLACE FUNCTION fn_deduct_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.batch_id IS NOT NULL THEN
        UPDATE medicine_batches 
        SET current_stock = GREATEST(0, current_stock - NEW.quantity)
        WHERE id = NEW.batch_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_stock_on_sale ON sales_invoice_items;
CREATE TRIGGER trg_deduct_stock_on_sale AFTER INSERT ON sales_invoice_items
FOR EACH ROW EXECUTE FUNCTION fn_deduct_stock_on_sale();

-- Trigger: Automatically Add to Customer Udhaar Balance & Bill Count
CREATE OR REPLACE FUNCTION fn_update_customer_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_id IS NOT NULL THEN
        UPDATE customers
        SET 
            total_purchases = total_purchases + NEW.net_total,
            total_bills = total_bills + 1,
            last_purchase_date = NEW.invoice_date,
            current_due = current_due + (CASE WHEN NEW.payment_mode = 'CREDIT_UDHAAR' THEN NEW.net_total ELSE 0 END)
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_customer_on_sale ON sales_invoices;
CREATE TRIGGER trg_update_customer_on_sale AFTER INSERT ON sales_invoices
FOR EACH ROW EXECUTE FUNCTION fn_update_customer_on_sale();

-- Trigger: Automatically Reduce Customer Udhaar Balance on Payment Receipt
CREATE OR REPLACE FUNCTION fn_reduce_customer_due_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers
    SET current_due = GREATEST(0.00, current_due - NEW.amount)
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reduce_customer_due_on_payment ON customer_payments;
CREATE TRIGGER trg_reduce_customer_due_on_payment AFTER INSERT ON customer_payments
FOR EACH ROW EXECUTE FUNCTION fn_reduce_customer_due_on_payment();

-- =============================================================================
-- 16. SEED DATA (MIRRORING FRONTEND PRODUCTION MOCK DATA)
-- =============================================================================

-- Insert Default Pharmacy Store
INSERT INTO pharmacy_stores (
    id, store_name, dl_number, gstin, phone, whatsapp_number, email, 
    address_line, village_town, district, state, pincode
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'MedEasy Khed Shivapur Medical',
    'MH-PUN-2024-DL9012',
    '27AABCM9876E1Z4',
    '+91 9822334455',
    '+91 9822334455',
    'contact@medeasypharmacy.in',
    'Shop No. 4, Gram Panchayat Complex, Pune-Bangalore Highway',
    'Khed Shivapur',
    'Pune',
    'Maharashtra',
    '412205'
) ON CONFLICT (id) DO NOTHING;

-- Insert Admin & Staff Accounts
INSERT INTO users (
    id, store_id, username, password_hash, full_name, mobile, role, preferred_language
) VALUES 
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin_rahul',
    '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyvrk6pQO4g3s8Zq6N6LzO1W1e2i3k4m', -- hashed password123
    'Rahul Patil',
    '9822334455',
    'ADMIN',
    'mr'
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'staff_sachin',
    '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyvrk6pQO4g3s8Zq6N6LzO1W1e2i3k4m',
    'Sachin More',
    '9850123456',
    'STAFF',
    'mr'
) ON CONFLICT (username) DO NOTHING;

-- Insert Medicine Categories
INSERT INTO medicine_categories (id, store_id, name, description) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Analgesic', 'Pain relief and antipyretics'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Anti-Ulcer', 'Gastric acid reducers & PPIs'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Antibiotic', 'Bacterial infection treatments'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Supplement', 'Vitamins, minerals and electrolyte salts')
ON CONFLICT DO NOTHING;

-- Insert Medicine Master Records
INSERT INTO medicines (
    id, store_id, name, generic_name, category_id, unit, min_stock_alert, gst_rate, rack_location
) VALUES
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Dolo 650',
    'Paracetamol 650mg',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
    'strip',
    20,
    12.00,
    'A-04'
),
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Pantoprazole 40',
    'Pantoprazole 40mg',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02',
    'strip',
    20,
    12.00,
    'B-12'
),
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Azithromycin 500',
    'Azithromycin 500mg',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03',
    'strip',
    10,
    12.00,
    'C-01'
),
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d04',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Vitamin D3',
    'Cholecalciferol 60k',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04',
    'strip',
    10,
    12.00,
    'D-08'
),
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d05',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'ORS Oral Rehydration',
    'Electrolyte Salts',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04',
    'sachet',
    20,
    5.00,
    'Front Counter'
) ON CONFLICT (id) DO NOTHING;

-- Insert Batches (with FEFO dates & barcodes)
INSERT INTO medicine_batches (
    id, medicine_id, batch_number, barcode, expiry_date, purchase_price, mrp, selling_price, current_stock, initial_stock, is_serving
) VALUES
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
    'D1234',
    '8901234001',
    '2027-08-31',
    15.00,
    35.00,
    32.00,
    22,
    50,
    true
),
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
    'DS678',
    '8901234002',
    '2028-01-15',
    16.00,
    35.00,
    32.00,
    20,
    30,
    false
),
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02',
    'P4567',
    '8901234003',
    '2027-01-20',
    80.00,
    120.00,
    105.00,
    5,
    20,
    true
),
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03',
    'A7890',
    '8901234004',
    '2026-06-30',
    65.00,
    95.00,
    90.00,
    0,
    20,
    false
),
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d04',
    'V9012',
    '8901234005',
    '2027-12-10',
    85.00,
    135.00,
    120.00,
    15,
    30,
    true
),
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d05',
    'OR202',
    '8901234006',
    '2027-11-25',
    13.00,
    22.00,
    20.00,
    8,
    40,
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert Customers (with Udhaar Balances)
INSERT INTO customers (
    id, store_id, full_name, mobile, address, total_purchases, current_due, total_bills, last_purchase_date
) VALUES
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Rahul Patil',
    '9876543210',
    'Shivapur Main Road, Near Gram Panchayat',
    12450.00,
    1250.00,
    18,
    NOW() - INTERVAL '5 days'
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Amit Shinde',
    '8765432109',
    'Khed Bazaar, Opposite ST Stand',
    8230.00,
    850.00,
    11,
    NOW() - INTERVAL '8 days'
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Suresh Jagtap',
    '9012345678',
    'Wadi Shivapur Village',
    15670.00,
    2100.00,
    24,
    NOW() - INTERVAL '13 days'
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Priya More',
    '9321456780',
    'Kalyani Nagar, Khed',
    6210.00,
    0.00,
    7,
    NOW() - INTERVAL '15 days'
) ON CONFLICT (id) DO NOTHING;

-- Insert Suppliers
INSERT INTO suppliers (
    id, store_id, name, contact_person, mobile, gstin, current_due
) VALUES
(
    '10eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Pune Pharma Distributors',
    'Vikas Deshmukh',
    '9822012345',
    '27AABCP1234A1Z5',
    14500.00
),
(
    '10eebc99-9c0b-4ef8-bb6d-6bb9bd380002',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Shivapur Medical Agency',
    'Ganesh Kadam',
    '9850123456',
    '27BBCDP5678B1Z2',
    8200.00
),
(
    '10eebc99-9c0b-4ef8-bb6d-6bb9bd380003',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Cipla Direct Wholesale',
    'Rajesh Nair',
    '9890123456',
    '27CCEDP9012C1Z8',
    0.00
) ON CONFLICT (id) DO NOTHING;

-- Insert Sample Purchase Invoice
INSERT INTO purchase_invoices (
    id, store_id, invoice_number, supplier_id, supplier_name_snapshot, invoice_date, total_amount, payment_status
) VALUES (
    '20eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'INV-99214',
    '10eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
    'Pune Pharma Distributors',
    '2026-10-02',
    8750.00,
    'PAID'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_invoice_items (
    purchase_invoice_id, medicine_id, medicine_name, batch_number, expiry_date, purchase_price, mrp, quantity, total_amount
) VALUES
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Dolo 650', 'D1234', '2027-08-31', 15.00, 35.00, 100, 1500.00),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02', 'Pantoprazole 40', 'P4567', '2027-01-20', 80.00, 120.00, 50, 4000.00),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03', 'Azithromycin 500', 'A7890', '2026-06-30', 65.00, 95.00, 50, 3250.00);

-- Insert Sample Sales Invoice (INV-2026-0842)
INSERT INTO sales_invoices (
    id, store_id, invoice_number, customer_id, customer_name_snapshot, customer_mobile_snapshot,
    subtotal, discount_amount, gst_amount, net_total, payment_mode, payment_status, amount_paid, amount_due
) VALUES (
    '30eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'INV-2026-0842',
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01',
    'Rahul Patil',
    '9876543210',
    259.00,
    0.00,
    31.08,
    259.00,
    'CASH',
    'PAID',
    259.00,
    0.00
) ON CONFLICT (invoice_number) DO NOTHING;

INSERT INTO sales_invoice_items (
    invoice_id, medicine_id, batch_id, medicine_name, batch_number, expiry_date, quantity, purchase_price, mrp, selling_price, total_amount
) VALUES
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'Dolo 650', 'D1234', '08/2027', 2, 15.00, 35.00, 32.00, 64.00),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'Pantoprazole 40', 'P4567', '01/2027', 1, 80.00, 120.00, 105.00, 105.00),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04', 'Azithromycin 500', 'A7890', '06/2026', 1, 65.00, 95.00, 90.00, 90.00);

-- Insert Sample Udhaar Payment Receipt
INSERT INTO customer_payments (
    receipt_number, customer_id, amount, payment_mode, notes
) VALUES (
    'RCP-2026-0042',
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01',
    500.00,
    'UPI',
    'Partial Udhaar payment via PhonePe QR'
) ON CONFLICT (receipt_number) DO NOTHING;
