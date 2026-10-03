export type Role = 'ADMIN' | 'STAFF';

export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'CREDIT_UDHAAR';

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
}

export interface Customer {
  id: string;
  fullName: string;
  mobile: string;
  address?: string;
  totalPurchases: number;
  currentDue: number;
  lastPurchaseDate: string;
  totalBills: number;
}

export interface CustomerInvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  medicinesSummary: string;
  amount: number;
  paymentMode: PaymentMode;
  isPaid: boolean;
}

export interface CustomerPaymentReceipt {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  paymentMode: PaymentMode;
  note?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  mobile: string;
  gstin?: string;
  currentDue: number;
}

export interface PurchaseItemEntry {
  id: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  purchasePrice: number;
  mrp: number;
  quantity: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  date: string;
  totalAmount: number;
  paymentStatus: 'PAID' | 'CREDIT';
  items: PurchaseItemEntry[];
}

export interface DailyStats {
  todaySales: number;
  todaySalesChangePercent: number;
  todayProfit: number;
  todayProfitChangePercent: number;
  todayBillsCount: number;
  todayBillsChangePercent: number;
  customerDuesTotal: number;
  pendingDueCustomersCount: number;
  lowStockCount: number;
  expiringSoonBatchesCount: number;
  expiringSoonValue: number;
  todayPurchaseTotal: number;
  totalMedicinesCount: number;
}
