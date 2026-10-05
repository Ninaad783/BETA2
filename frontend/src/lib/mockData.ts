import type { Customer, DailyStats, Medicine, PurchaseInvoice, Supplier, StockAdjustment } from '../types/pharmacy.types';

export const INITIAL_STATS: DailyStats = {
  todaySales: 0,
  todaySalesChangePercent: 0,
  todayProfit: 0,
  todayProfitChangePercent: 0,
  todayBillsCount: 0,
  todayBillsChangePercent: 0,
  todayPurchaseTotal: 0,
  lowStockCount: 0,
  expiringSoonBatchesCount: 0,
  expiringSoonValue: 0,
  totalMedicinesCount: 0,
  totalCustomersCount: 0,
  totalSuppliersCount: 0,
};

export const INITIAL_MEDICINES: Medicine[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_PURCHASES: PurchaseInvoice[] = [];

export const INITIAL_STOCK_ADJUSTMENTS: StockAdjustment[] = [];

export const SALES_TREND_DATA = [
  { day: 'Mon', sales: 0, profit: 0 },
  { day: 'Tue', sales: 0, profit: 0 },
  { day: 'Wed', sales: 0, profit: 0 },
  { day: 'Thu', sales: 0, profit: 0 },
  { day: 'Fri', sales: 0, profit: 0 },
  { day: 'Sat', sales: 0, profit: 0 },
  { day: 'Sun', sales: 0, profit: 0 },
];

export const TOP_SELLING_MEDICINES: Array<{ name: string; type: string; soldQty: number; revenue: number }> = [];
