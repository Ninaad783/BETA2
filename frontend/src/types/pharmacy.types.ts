export type UserRole = 'ADMIN' | 'PHARMACIST' | 'STAFF';

export type PaymentMode = 'CASH' | 'UPI' | 'CARD';

export type PurchasePaymentMode = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';

export type PurchaseStatus = 'RECEIVED' | 'CANCELLED';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface MedicineBatch {
  id: string;
  medicineId: string;
  batchNumber: string;
  barcode?: string;
  expiryDate: string; // ISO string e.g. "2027-08-31"
  purchasePrice: number;
  mrp: number;
  sellingPrice: number;
  currentStock: number;
  initialStock?: number;
  isServing?: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  unit: string;
  minStockAlert: number;
  gstRate: number;
  totalStock: number;
  sellingPrice: number;
  mrp: number;
  rackLocation?: string;
  hsnCode?: string;
  manufacturer?: string;
  requiresPrescription?: boolean;
  status: StockStatus;
  batches: MedicineBatch[];
}

export interface CartItem {
  id: string;
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  discountPercent: number;
  total: number;
  requiresPrescription?: boolean;
}

// Customers - No Udhaar/Credit fields. Customer data is only for bill identity and purchase history.
export interface Customer {
  id: string;
  fullName: string;
  mobile: string;
  address?: string;
  totalPurchases: number;
  totalBills: number;
  lastPurchaseDate: string;
  isActive?: boolean;
}

export interface CustomerInvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  medicinesSummary: string;
  amount: number;
  paymentMode: PaymentMode;
  status: 'COMPLETED' | 'CANCELLED';
}

// Suppliers - No Udhaar/Credit balance stored. Invoices are paid at purchase.
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  mobile: string;
  email?: string;
  gstin?: string;
  dlNumber?: string;
  address?: string;
  isActive?: boolean;
}

// Purchase Invoice Line Items - Permanent purchase history snapshot
export interface PurchaseInvoiceItem {
  id: string;
  purchaseInvoiceId?: string;
  lineNumber: number;
  medicineId?: string;
  batchId?: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  purchasePrice: number;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  freeQuantity?: number;
  gstRate?: number;
  discountAmount?: number;
  taxableAmount?: number;
  gstAmount?: number;
  totalAmount: number;
}

// Purchase Invoices - Proper Purchase History
export interface PurchaseInvoice {
  id: string;
  supplierId?: string;
  supplierName: string;
  supplierInvoiceNumber: string;
  purchaseDate: string;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  netTotal: number;
  paymentMode: PurchasePaymentMode;
  status: PurchaseStatus;
  notes?: string;
  items: PurchaseInvoiceItem[];
  lineCount?: number;
  totalUnits?: number;
}

// Stock Adjustment Audit Log
export interface StockAdjustment {
  id: string;
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  previousStock: number;
  adjustedStock: number;
  differenceQty: number;
  reason: string;
  adjustedBy?: string;
  createdAt: string;
}

// Counter Analytics matching v_today_counter_analytics
export interface DailyStats {
  todaySales: number;
  todaySalesChangePercent: number;
  todayProfit: number;
  todayProfitChangePercent: number;
  todayBillsCount: number;
  todayBillsChangePercent: number;
  todayPurchaseTotal: number;
  lowStockCount: number;
  expiringSoonBatchesCount: number;
  expiringSoonValue: number;
  totalMedicinesCount: number;
  totalCustomersCount: number;
  totalSuppliersCount: number;
}
