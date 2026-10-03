import React, { useState } from 'react';
import { Download } from 'lucide-react';
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

const MONTHLY_REVENUE_DATA = [
  { month: 'Jan', sales: 32000, profit: 6400 },
  { month: 'Feb', sales: 36000, profit: 7200 },
  { month: 'Mar', sales: 41000, profit: 8200 },
  { month: 'Apr', sales: 45000, profit: 9000 },
  { month: 'May', sales: 48000, profit: 9600 },
  { month: 'Jun', sales: 50000, profit: 10000 },
  { month: 'Jul', sales: 52000, profit: 10400 },
  { month: 'Aug', sales: 55000, profit: 11000 },
  { month: 'Sep', sales: 59000, profit: 11800 },
  { month: 'Oct', sales: 67200, profit: 13440 },
];

// Custom sleek tooltip component for Reports chart (cursor={false} removes ugly grey block)
interface ReportsTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const CustomReportsTooltip: React.FC<ReportsTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs pointer-events-none z-50">
        <div className="flex items-center gap-1.5 mb-1 text-slate-400 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>{label} 2026</span>
        </div>
        <p className="font-bold text-white text-sm tracking-tight font-sans">
          ₹{Number(payload[0].value).toLocaleString('en-IN')}
        </p>
        <span className="text-[10px] text-sky-400 font-medium block mt-0.5">
          Monthly Pharmacy Sales
        </span>
      </div>
    );
  }
  return null;
};

export const ReportsPage: React.FC = () => {
  const { t } = useUIStore();
  const [period, setPeriod] = useState('Current Financial Year (2026-27)');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            📊
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('reportsTitle')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('reportsSub')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option>Current Financial Year (2026-27)</option>
            <option>This Month (October 2026)</option>
            <option>Last 30 Days</option>
          </select>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportPdf')}</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            {t('totalSalesRevenue')}
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">₹4,85,200</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">
            ↑ 14% vs previous period
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            {t('totalPurchasesStock')}
          </span>
          <p className="text-2xl font-black text-slate-700 mt-1">₹3,21,450</p>
          <span className="text-[11px] text-slate-400 font-medium mt-2 block">
            Inventory stock added
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Bills Count
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">1,842</p>
          <span className="text-[11px] text-slate-400 font-medium mt-2 block">
            Retail invoices cleared
          </span>
        </div>

        <div className="bg-white border-l-4 border-l-emerald-500 border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
            {t('estimatedNetProfit')}
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹96,350</p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-2 block">
            Net Margin: ~19.8%
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('monthlySalesTrend')} (₹)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Financial Year 2026-27 breakdown</p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
              Jan 2026 – Oct 2026
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  cursor={false}
                  content={<CustomReportsTooltip />}
                />
                <Bar dataKey="sales" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 mb-3">{t('topCategories')}</h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-blue-700">● Analgesic / Pain Relief</span>
                <span>28%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[28%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-purple-700">● Antibiotics</span>
                <span>22%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full w-[22%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-700">● Anti-Ulcer / Acidity</span>
                <span>18%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[18%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-teal-700">● Supplements & Vitamins</span>
                <span>16%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full w-[16%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-600">● General / First Aid</span>
                <span>16%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-500 h-full w-[16%]"></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t text-[11px] text-slate-400 text-center font-medium">
            GST Summary: 12% Slab: ₹34,200 | 5% Slab: ₹4,120
          </div>
        </div>
      </div>
    </div>
  );
};
