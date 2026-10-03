import type { Customer, DailyStats, Medicine, PurchaseInvoice, Supplier } from '../types/pharmacy.types';

export const INITIAL_STATS: DailyStats = {
  todaySales: 18450,
  todaySalesChangePercent: 12,
  todayProfit: 3840,
  todayProfitChangePercent: 8,
  todayBillsCount: 72,
  todayBillsChangePercent: 5,
  customerDuesTotal: 4250,
  pendingDueCustomersCount: 3,
  lowStockCount: 11,
  expiringSoonBatchesCount: 6,
  expiringSoonValue: 8450,
  todayPurchaseTotal: 12600,
  totalMedicinesCount: 1245
};

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
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
        id: 'batch-1',
        medicineId: 'med-1',
        batchNumber: 'D1234',
        barcode: '8901234001',
        expiryDate: '2027-08-31',
        purchasePrice: 15.00,
        mrp: 35.00,
        sellingPrice: 32.00,
        currentStock: 22,
        isServing: true
      },
      {
        id: 'batch-2',
        medicineId: 'med-1',
        batchNumber: 'DS678',
        barcode: '8901234002',
        expiryDate: '2028-01-15',
        purchasePrice: 16.00,
        mrp: 35.00,
        sellingPrice: 32.00,
        currentStock: 20,
        isServing: false
      }
    ]
  },
  {
    id: 'med-2',
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
        id: 'batch-3',
        medicineId: 'med-2',
        batchNumber: 'P4567',
        barcode: '8901234003',
        expiryDate: '2027-01-20',
        purchasePrice: 80.00,
        mrp: 120.00,
        sellingPrice: 105.00,
        currentStock: 5,
        isServing: true
      }
    ]
  },
  {
    id: 'med-3',
    name: 'Azithromycin 500',
    genericName: 'Azithromycin 500mg',
    category: 'Antibiotic',
    unit: 'strip',
    minStockAlert: 10,
    gstRate: 12,
    totalStock: 0,
    sellingPrice: 90.00,
    mrp: 95.00,
    rackLocation: 'C-01',
    hsnCode: '3004',
    manufacturer: 'Cipla Ltd',
    requiresPrescription: true,
    status: 'OUT_OF_STOCK',
    batches: [
      {
        id: 'batch-4',
        medicineId: 'med-3',
        batchNumber: 'A7890',
        barcode: '8901234004',
        expiryDate: '2026-06-30',
        purchasePrice: 65.00,
        mrp: 95.00,
        sellingPrice: 90.00,
        currentStock: 0,
        isServing: false
      }
    ]
  },
  {
    id: 'med-4',
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
        id: 'batch-5',
        medicineId: 'med-4',
        batchNumber: 'V9012',
        barcode: '8901234005',
        expiryDate: '2027-12-10',
        purchasePrice: 85.00,
        mrp: 135.00,
        sellingPrice: 120.00,
        currentStock: 15,
        isServing: true
      }
    ]
  },
  {
    id: 'med-5',
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
        id: 'batch-6',
        medicineId: 'med-5',
        batchNumber: 'OR202',
        barcode: '8901234006',
        expiryDate: '2027-11-25',
        purchasePrice: 13.00,
        mrp: 22.00,
        sellingPrice: 20.00,
        currentStock: 8,
        isServing: true
      }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    fullName: 'Rahul Patil',
    mobile: '9876543210',
    address: 'Shivapur Main Road, Near Gram Panchayat',
    totalPurchases: 12450,
    currentDue: 1250,
    lastPurchaseDate: '28 Sep 2026',
    totalBills: 18
  },
  {
    id: 'cust-2',
    fullName: 'Amit Shinde',
    mobile: '8765432109',
    address: 'Khed Bazaar, Opposite ST Stand',
    totalPurchases: 8230,
    currentDue: 850,
    lastPurchaseDate: '25 Sep 2026',
    totalBills: 11
  },
  {
    id: 'cust-3',
    fullName: 'Suresh Jagtap',
    mobile: '9012345678',
    address: 'Wadi Shivapur Village',
    totalPurchases: 15670,
    currentDue: 2100,
    lastPurchaseDate: '20 Sep 2026',
    totalBills: 24
  },
  {
    id: 'cust-4',
    fullName: 'Priya More',
    mobile: '9321456780',
    address: 'Kalyani Nagar, Khed',
    totalPurchases: 6210,
    currentDue: 0,
    lastPurchaseDate: '18 Sep 2026',
    totalBills: 7
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Pune Pharma Distributors',
    contactPerson: 'Vikas Deshmukh',
    mobile: '9822012345',
    email: 'orders@punepharma.com',
    gstin: '27AABCP1234A1Z5',
    dlNumber: '20B/21B-PUN-8921',
    address: 'Plot 14, Marketyard, Pune 411037',
    currentDue: 14500
  },
  {
    id: 'sup-2',
    name: 'Shivapur Medical Agency',
    contactPerson: 'Ganesh Kadam',
    mobile: '9850123456',
    email: 'agency@shivapurmed.in',
    gstin: '27BBCDP5678B1Z2',
    dlNumber: '20B/21B-PUN-7712',
    address: 'Near ST Stand, Khed Shivapur 412205',
    currentDue: 8200
  },
  {
    id: 'sup-3',
    name: 'Cipla Direct Wholesale',
    contactPerson: 'Rajesh Nair',
    mobile: '9890123456',
    email: 'direct@cipla-wholesale.com',
    gstin: '27CCEDP9012C1Z8',
    dlNumber: '20B/21B-MH-5541',
    address: 'Bhosari MIDC, Pune 411026',
    currentDue: 0
  }
];

export const INITIAL_PURCHASES: PurchaseInvoice[] = [
  {
    id: 'pur-1',
    invoiceNumber: 'INV-99214',
    supplierName: 'Pune Pharma Distributors',
    date: '2026-10-02',
    totalAmount: 8750.00,
    paymentStatus: 'PAID',
    items: [
      {
        id: 'pi-1',
        medicineName: 'Dolo 650mg',
        batchNumber: 'D1234',
        expiryDate: '08/2027',
        purchasePrice: 15.00,
        mrp: 35.00,
        quantity: 100,
        total: 1500.00
      },
      {
        id: 'pi-2',
        medicineName: 'Pantoprazole 40',
        batchNumber: 'P4567',
        expiryDate: '01/2027',
        purchasePrice: 80.00,
        mrp: 120.00,
        quantity: 50,
        total: 4000.00
      },
      {
        id: 'pi-3',
        medicineName: 'Azithromycin 500',
        batchNumber: 'A7890',
        expiryDate: '06/2026',
        purchasePrice: 65.00,
        mrp: 95.00,
        quantity: 50,
        total: 3250.00
      }
    ]
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
  { name: 'Paracetamol 500mg', type: 'Tablet', soldQty: 120, revenue: 2400 },
  { name: 'Pantoprazole 40mg', type: 'Capsule', soldQty: 95, revenue: 9975 },
  { name: 'Azithromycin 500mg', type: 'Tablet', soldQty: 72, revenue: 6480 },
  { name: 'Dolo 650mg', type: 'Tablet', soldQty: 70, revenue: 2240 },
  { name: 'Vitamin D3 60k', type: 'Softgel', soldQty: 60, revenue: 7200 }
];
