import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Receipt, 
  Clock, 
  Package, 
  ShoppingBag, 
  Plus, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import { SALES_TREND_DATA, TOP_SELLING_MEDICINES } from '../../../lib/mockData';

// Custom sleek tooltip component for Dashboard chart (cursor={false} removes ugly grey block)
interface DashboardTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const CustomDashboardTooltip: React.FC<DashboardTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs pointer-events-none z-50">
        <div className="flex items-center gap-1.5 mb-1 text-slate-400 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{label}</span>
        </div>
        <p className="font-bold text-white text-sm tracking-tight font-sans">
          ₹{Number(payload[0].value).toLocaleString('en-IN')}
        </p>
        <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
          Gross Sales Revenue
        </span>
      </div>
    );
  }
  return null;
};

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

        {/* Today's Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('todaysProfit')}
            </span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 tracking-tight">
              ₹{stats.todayProfit.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100">
              <TrendingUp className="w-3 h-3" /> +{stats.todayProfitChangePercent}%
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Estimated Margin: ~20.8%</span>
            <span className="text-emerald-600 font-semibold">Net</span>
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
            <span>Avg ₹{Math.round(stats.todaySales / Math.max(1, stats.todayBillsCount))} / bill</span>
            <span className="text-sky-600 font-semibold">Counter</span>
          </div>
        </div>

        {/* Today's Inward Purchases (v_today_counter_analytics) */}
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

      {/* Charts & Movers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('salesTrend7Days')}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Daily gross counter collection</p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
              Current Week
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_TREND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  cursor={false}
                  content={<CustomDashboardTooltip />}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Medicines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('topSellingMedicines')}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Highest volume this week</p>
              </div>
              <button onClick={() => navigate('/reports')} className="text-xs text-sky-600 hover:text-sky-700 font-semibold cursor-pointer">
                Full Report →
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              {TOP_SELLING_MEDICINES.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg flex justify-between items-center transition hover:bg-slate-50 border border-transparent hover:border-slate-200/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.type} • {item.soldQty} strips
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/50">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/stock')}
            className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold text-center border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Manage Pharmacy Inventory</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
