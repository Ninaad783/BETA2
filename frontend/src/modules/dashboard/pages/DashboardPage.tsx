import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Receipt, 
  Clock, 
  Package, 
  ShoppingBag, 
  Plus, 
  ArrowUpRight,
  ChevronRight,
  Users
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';

interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  time: string;
  customerName: string;
  customerMobile?: string;
  itemsSummary: string;
  itemCount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD';
  totalAmount: number;
}

const RECENT_INVOICES: RecentInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0072',
    time: '11:42 AM',
    customerName: 'Walk-in Customer',
    itemsSummary: 'Paracetamol 650mg, Pantoprazole 40',
    itemCount: 2,
    paymentMode: 'UPI',
    totalAmount: 256.00,
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0071',
    time: '11:15 AM',
    customerName: 'Suresh Shinde',
    customerMobile: '9822112233',
    itemsSummary: 'Azithromycin 500, ORS Sachet',
    itemCount: 2,
    paymentMode: 'CASH',
    totalAmount: 345.00,
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0070',
    time: '10:50 AM',
    customerName: 'Ramesh Deshmukh',
    customerMobile: '9822334455',
    itemsSummary: 'Dolo 650 (2 strips), Vitamin D3 60k',
    itemCount: 3,
    paymentMode: 'CASH',
    totalAmount: 680.00,
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-0069',
    time: '10:20 AM',
    customerName: 'Sunita Jadhav',
    customerMobile: '9890445566',
    itemsSummary: 'Cetirizine 10, Cough Syrup',
    itemCount: 2,
    paymentMode: 'UPI',
    totalAmount: 190.00,
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-0068',
    time: '09:45 AM',
    customerName: 'Walk-in Customer',
    itemsSummary: 'Bandage, Antiseptic Cream',
    itemCount: 2,
    paymentMode: 'CARD',
    totalAmount: 140.00,
  },
];

export const DashboardPage: React.FC = () => {
  const { t } = useUIStore();
  const navigate = useNavigate();
  const { stats } = usePharmacyStore();

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            🏪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('dashTitle')}</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Counter
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t('dashSub')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate('/billing')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('newBillBtn')}</span>
          </button>
          <button
            onClick={() => navigate('/purchases')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('purchaseEntryBtn')}</span>
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('todaysSales')}
            </span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{stats.todaySales.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100">
              <TrendingUp className="w-3 h-3" /> +{stats.todaySalesChangePercent}%
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>{stats.todayBillsCount} invoices generated</span>
            <span className="text-emerald-600 font-semibold">Today</span>
          </div>
        </div>

        {/* Average Bill Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Ticket Value
            </span>
            <span className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{Math.round(stats.todaySales / Math.max(1, stats.todayBillsCount)).toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-sky-100">
              Per Invoice
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Average Counter Basket</span>
            <span className="text-sky-600 font-semibold">Active</span>
          </div>
        </div>

        {/* Total Bills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('totalBills')}
            </span>
            <span className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{stats.todayBillsCount}</span>
            <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-sky-100">
              <Receipt className="w-3 h-3" /> +{stats.todayBillsChangePercent}%
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Live Counter Invoices Cleared</span>
            <span className="text-sky-600 font-semibold">Counter</span>
          </div>
        </div>

        {/* Today's Inward Purchases */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>{t('todaysPurchase')}</span>
            </span>
            <span className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              ₹{stats.todayPurchaseTotal.toLocaleString('en-IN')}
            </span>
            <button
              onClick={() => navigate('/purchases')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 underline flex items-center gap-0.5 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100 cursor-pointer"
            >
              <span>Invoices</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Stock Inward Received</span>
            <span className="text-sky-600 font-semibold">100% Settled</span>
          </div>
        </div>
      </div>

      {/* 4 Operational Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Low Stock Alert */}
        <div className="bg-white border-l-4 border-l-amber-500 border border-slate-200/90 p-4 rounded-xl shadow-xs flex items-center justify-between hover:shadow-sm transition">
          <div>
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
              ⚠️ {t('alertLowStock')}
            </span>
            <span className="text-lg font-bold text-amber-700 mt-0.5 block">
              {stats.lowStockCount} <span className="text-xs font-normal text-amber-800">medicines below min</span>
            </span>
          </div>
          <button
            onClick={() => navigate('/stock')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            View
          </button>
        </div>

        {/* Expiring Soon Alert */}
        <div className="bg-white border-l-4 border-l-rose-500 border border-slate-200/90 p-4 rounded-xl shadow-xs flex items-center justify-between hover:shadow-sm transition">
          <div>
            <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-rose-600 inline" /> {t('alertExpiry')}
            </span>
            <span className="text-lg font-bold text-rose-700 mt-0.5 block">
              {stats.expiringSoonBatchesCount}{' '}
              <span className="text-xs font-normal text-rose-800">
                batches (₹{stats.expiringSoonValue.toLocaleString('en-IN')})
              </span>
            </span>
          </div>
          <button
            onClick={() => navigate('/stock')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            View
          </button>
        </div>

        {/* Customer Base Profile Card */}
        <div className="bg-white border-l-4 border-l-sky-500 border border-slate-200/90 p-4 rounded-xl shadow-xs flex items-center justify-between hover:shadow-sm transition">
          <div>
            <span className="text-xs font-bold text-sky-900 flex items-center gap-1">
              👥 {t('totalCustomers')}
            </span>
            <span className="text-lg font-bold text-sky-700 mt-0.5 block">
              {stats.totalCustomersCount} <span className="text-xs font-normal text-sky-800">active buyers</span>
            </span>
          </div>
          <button
            onClick={() => navigate('/customers')}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Directory
          </button>
        </div>

        {/* Total Medicines */}
        <div className="bg-white border-l-4 border-l-slate-600 border border-slate-200/90 p-4 rounded-xl shadow-xs flex items-center justify-between hover:shadow-sm transition">
          <div>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-slate-500 inline" /> {t('totalMedicines')}
            </span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">
              {stats.totalMedicinesCount}{' '}
              <span className="text-xs font-normal text-slate-500">items in catalog</span>
            </span>
          </div>
          <button
            onClick={() => navigate('/stock')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Catalog
          </button>
        </div>
      </div>

      {/* Recent Counter Activity & Fast Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Counter Invoices Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Counter Invoices</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Live retail bills cleared today</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/billing')}
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200/70 transition flex items-center gap-1 cursor-pointer"
              >
                <span>New Bill (F2)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5">Invoice #</th>
                    <th className="pb-2.5">Customer</th>
                    <th className="pb-2.5">Items Summary</th>
                    <th className="pb-2.5">Payment</th>
                    <th className="pb-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_INVOICES.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 font-bold text-slate-900 font-mono">
                        {inv.invoiceNumber}
                        <span className="block text-[10px] text-slate-400 font-normal">{inv.time}</span>
                      </td>
                      <td className="py-3 text-slate-700">
                        <span className="font-semibold block">{inv.customerName}</span>
                        {inv.customerMobile && (
                          <span className="text-[10px] text-slate-400 font-mono">{inv.customerMobile}</span>
                        )}
                      </td>
                      <td className="py-3 text-slate-600">
                        <span className="truncate max-w-[200px] block font-medium">{inv.itemsSummary}</span>
                        <span className="text-[10px] text-slate-400">{inv.itemCount} items cleared</span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          inv.paymentMode === 'UPI'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            : inv.paymentMode === 'CARD'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}>
                          {inv.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900 font-mono text-sm">
                        ₹{inv.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing latest {RECENT_INVOICES.length} invoices cleared today</span>
            <button
              onClick={() => navigate('/billing')}
              className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Open POS Counter</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Fast Counter Shortcuts Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Fast Counter Shortcuts</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Quick access for pharmacy staff</p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/billing')}
                className="w-full p-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-200 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs group-hover:text-emerald-700">New Bill (POS Counter)</p>
                    <p className="text-[11px] text-slate-500">Press F2 for quick customer invoice</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </button>

              <button
                onClick={() => navigate('/purchases')}
                className="w-full p-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-sky-50/60 hover:border-sky-200 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs group-hover:text-sky-700">Inward Purchase Entry</p>
                    <p className="text-[11px] text-slate-500">Stock in from Pune distributors</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition" />
              </button>

              <button
                onClick={() => navigate('/stock')}
                className="w-full p-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-amber-50/60 hover:border-amber-200 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs group-hover:text-amber-700">Stock & Rack Vault</p>
                    <p className="text-[11px] text-slate-500">Check FEFO batches & low alerts</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
              </button>

              <button
                onClick={() => navigate('/customers')}
                className="w-full p-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-purple-50/60 hover:border-purple-200 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs group-hover:text-purple-700">Customer Directory</p>
                    <p className="text-[11px] text-slate-500">Lookup mobile & purchase records</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Terminal: Counter #1 (Admin)</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
