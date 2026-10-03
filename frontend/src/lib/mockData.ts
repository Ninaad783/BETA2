import type { Customer, DailyStats, Medicine, PurchaseInvoice, Supplier, StockAdjustment } from '../types/pharmacy.types';

export const INITIAL_STATS: DailyStats = {
  todaySales: 18450,
  todaySalesChangePercent: 12,
  todayProfit: 3840,
  todayProfitChangePercent: 8,
  todayBillsCount: 72,
  todayBillsChangePercent: 5,
  todayPurchaseTotal: 12600,
  lowStockCount: 2,
  expiringSoonBatchesCount: 1,
  expiringSoonValue: 1900,
  totalMedicinesCount: 5,
  totalCustomersCount: 4,
  totalSuppliersCount: 3
};

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
    name: 'Dolo 650',
    genericName: 'Paracetamol 650mg',
    category: 'Analgesic',
    unit: 'strip',
    minStockAlert: 20,
    gstRate: 12,
    totalStock: 42,
    sellingPrice: 32.00,
    mrp: 35.00,
    rackLocation: 'A-04',
    hsnCode: '3004',
    manufacturer: 'Micro Labs Ltd',
    requiresPrescription: false,
    status: 'IN_STOCK',
    batches: [
      {
        id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
        medicineId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
        batchNumber: 'D1234',
        barcode: '8901234001',
        expiryDate: '2027-08-31',
        purchasePrice: 15.00,
        mrp: 35.00,
        sellingPrice: 32.00,
        currentStock: 22,
        initialStock: 50,
        isServing: true
      },
      {
        id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02',
        medicineId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
        batchNumber: 'DS678',
        barcode: '8901234002',
        expiryDate: '2028-01-15',
        purchasePrice: 16.00,
        mrp: 35.00,
        sellingPrice: 32.00,
        currentStock: 20,
        initialStock: 30,
        isServing: false
      }
    ]
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02',
    name: 'Pantoprazole 40',
    genericName: 'Pantoprazole 40mg',
    category: 'Anti-Ulcer',
    unit: 'strip',
    minStockAlert: 20,
    gstRate: 12,
    totalStock: 5,
    sellingPrice: 105.00,
    mrp: 120.00,
    rackLocation: 'B-12',
    hsnCode: '3004',
    manufacturer: 'Alkem Laboratories',
    requiresPrescription: false,
    status: 'LOW_STOCK',
    batches: [
      {
        id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03',
        medicineId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02',
        batchNumber: 'P4567',
        barcode: '8901234003',
        expiryDate: '2027-01-20',
        purchasePrice: 80.00,
        mrp: 120.00,
        sellingPrice: 105.00,
        currentStock: 5,
        initialStock: 20,
        isServing: true
      }
    ]
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03',
    name: 'Azithromycin 500',
    genericName: 'Azithromycin 500mg',
    category: 'Antibiotic',
    unit: 'strip',
    minStockAlert: 10,
    gstRate: 12,
    totalStock: 1,
    sellingPrice: 90.00,
    mrp: 95.00,
    rackLocation: 'C-01',
    hsnCode: '3004',
    manufacturer: 'Cipla Ltd',
    requiresPrescription: true,
    status: 'LOW_STOCK',
    batches: [
      {
        id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04',
        medicineId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03',
        batchNumber: 'A7890',
        barcode: '8901234004',
        expiryDate: '2026-06-30',
        purchasePrice: 65.00,
        mrp: 95.00,
        sellingPrice: 90.00,
        currentStock: 1,
        initialStock: 20,
        isServing: true
      }
    ]
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d04',
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol 60k',
    category: 'Supplement',
    unit: 'strip',
    minStockAlert: 10,
    gstRate: 12,
    totalStock: 15,
    sellingPrice: 120.00,
    mrp: 135.00,
    rackLocation: 'D-08',
    hsnCode: '3004',
    manufacturer: 'Cadila Pharma',
    requiresPrescription: false,
    status: 'IN_STOCK',
    batches: [
      {
        id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05',
        medicineId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d04',
        batchNumber: 'V9012',
        barcode: '8901234005',
        expiryDate: '2027-12-10',
        purchasePrice: 85.00,
        mrp: 135.00,
        sellingPrice: 120.00,
        currentStock: 15,
        initialStock: 30,
        isServing: true
      }
    ]
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d05',
    name: 'ORS Oral Rehydration',
    genericName: 'Electrolyte Salts',
    category: 'Supplement',
    unit: 'sachet',
    minStockAlert: 20,
    gstRate: 5,
    totalStock: 8,
    sellingPrice: 20.00,
    mrp: 22.00,
    rackLocation: 'Front Counter',
    hsnCode: '3004',
    manufacturer: 'FDC Ltd',
    requiresPrescription: false,
    status: 'LOW_STOCK',
    batches: [
      {
        id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06',
        medicineId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d05',
        batchNumber: 'OR202',
        barcode: '8901234006',
        expiryDate: '2027-11-25',
        purchasePrice: 13.00,
        mrp: 22.00,
        sellingPrice: 20.00,
        currentStock: 8,
        initialStock: 40,
        isServing: true
      }
    ]
  }
];

// Seed customers matching PostgreSQL Schema v1.1 (Customer purchase statistics only, no Udhaar)
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01',
    fullName: 'Rahul Patil',
    mobile: '9876543210',
    address: 'Shivapur Main Road, Near Gram Panchayat',
    totalPurchases: 12450.00,
    totalBills: 18,
    lastPurchaseDate: '28 Sep 2026',
    isActive: true
  },
  {
    id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02',
    fullName: 'Amit Shinde',
    mobile: '8765432109',
    address: 'Khed Bazaar, Opposite ST Stand',
    totalPurchases: 8230.00,
    totalBills: 11,
    lastPurchaseDate: '25 Sep 2026',
    isActive: true
  },
  {
    id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03',
    fullName: 'Suresh Jagtap',
    mobile: '9012345678',
    address: 'Wadi Shivapur Village',
    totalPurchases: 15670.00,
    totalBills: 24,
    lastPurchaseDate: '20 Sep 2026',
    isActive: true
  },
  {
    id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04',
    fullName: 'Priya More',
    mobile: '9321456780',
    address: 'Kalyani Nagar, Khed',
    totalPurchases: 6210.00,
    totalBills: 7,
    lastPurchaseDate: '18 Sep 2026',
    isActive: true
  }
];

// Seed suppliers matching PostgreSQL Schema v1.1 (No Udhaar stored; invoices paid at purchase)
export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
    name: 'Pune Pharma Distributors',
    contactPerson: 'Vikas Deshmukh',
    mobile: '9822012345',
    email: 'orders@punepharma.com',
    gstin: '27AABCP1234A1Z5',
    dlNumber: 'MH-DL-001',
    address: 'Plot 14, Marketyard, Pune 411037',
    isActive: true
  },
  {
    id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380002',
    name: 'Shivapur Medical Agency',
    contactPerson: 'Ganesh Kadam',
    mobile: '9850123456',
    email: 'agency@shivapurmed.in',
    gstin: '27BBCDP5678B1Z2',
    dlNumber: 'MH-DL-002',
    address: 'Near ST Stand, Khed Shivapur 412205',
    isActive: true
  },
  {
    id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380003',
    name: 'Cipla Direct Wholesale',
    contactPerson: 'Rajesh Nair',
    mobile: '9890123456',
    email: 'direct@cipla-wholesale.com',
    gstin: '27CCEDP9012C1Z8',
    dlNumber: 'MH-DL-003',
    address: 'Bhosari MIDC, Pune 411026',
    isActive: true
  }
];

// Seed purchase history matching PostgreSQL Schema v1.1 (v_purchase_history view)
export const INITIAL_PURCHASES: PurchaseInvoice[] = [
  {
    id: '40eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
    supplierId: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
    supplierName: 'Pune Pharma Distributors',
    supplierInvoiceNumber: 'PPD-2026-1001',
    purchaseDate: '2026-09-30',
    subtotal: 1490.00,
    discountAmount: 0.00,
    taxableAmount: 1490.00,
    gstAmount: 178.80,
    netTotal: 1668.80,
    paymentMode: 'BANK_TRANSFER',
    status: 'RECEIVED',
    notes: 'Opening sample purchase history',
    lineCount: 3,
    totalUnits: 59,
    items: [
      {
        id: 'pi-1',
        lineNumber: 1,
        medicineName: 'Dolo 650',
        batchNumber: 'D1234',
        expiryDate: '2027-08-31',
        purchasePrice: 15.00,
        mrp: 35.00,
        sellingPrice: 32.00,
        quantity: 50,
        freeQuantity: 0,
        gstRate: 12.00,
        totalAmount: 840.00
      },
      {
        id: 'pi-2',
        lineNumber: 2,
        medicineName: 'Pantoprazole 40',
        batchNumber: 'P4567',
        expiryDate: '2027-01-20',
        purchasePrice: 80.00,
        mrp: 120.00,
        sellingPrice: 105.00,
        quantity: 5,
        freeQuantity: 0,
        gstRate: 12.00,
        totalAmount: 448.00
      },
      {
        id: 'pi-3',
        lineNumber: 3,
        medicineName: 'Vitamin D3',
        batchNumber: 'V9012',
        expiryDate: '2027-12-10',
        purchasePrice: 85.00,
        mrp: 135.00,
        sellingPrice: 120.00,
        quantity: 4,
        freeQuantity: 0,
        gstRate: 12.00,
        totalAmount: 380.80
      }
    ]
  }
];

export const INITIAL_STOCK_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'sa-1',
    medicineId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
    medicineName: 'Dolo 650',
    batchId: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    batchNumber: 'D1234',
    previousStock: 25,
    adjustedStock: 22,
    differenceQty: -3,
    reason: 'Damaged strip in transit',
    adjustedBy: 'Rahul Patil',
    createdAt: '2026-10-01 11:30 AM'
  }
];

export const SALES_TREND_DATA = [
  { day: 'Mon', sales: 14200, profit: 2950 },
  { day: 'Tue', sales: 16800, profit: 3420 },
  { day: 'Wed', sales: 12100, profit: 2480 },
  { day: 'Thu', sales: 19500, profit: 4100 },
  { day: 'Fri', sales: 22400, profit: 4680 },
  { day: 'Sat', sales: 24100, profit: 5120 },
  { day: 'Sun (Today)', sales: 18450, profit: 3840 }
];

export const TOP_SELLING_MEDICINES = [
  { name: 'Paracetamol 650mg (Dolo)', type: 'Tablet', soldQty: 120, revenue: 3840 },
  { name: 'Pantoprazole 40mg', type: 'Capsule', soldQty: 95, revenue: 9975 },
  { name: 'Azithromycin 500mg', type: 'Tablet', soldQty: 72, revenue: 6480 },
  { name: 'Vitamin D3 60k', type: 'Softgel', soldQty: 60, revenue: 7200 },
  { name: 'ORS Electrolyte Sachet', type: 'Sachet', soldQty: 55, revenue: 1100 }
];
