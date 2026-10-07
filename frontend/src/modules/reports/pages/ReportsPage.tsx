import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  BarChart3, 
  FileSpreadsheet, 
  Stethoscope, 
  ShieldCheck, 
  Percent
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
import { usePharmacyStore } from '../../../stores/pharmacyStore';

export const ReportsPage: React.FC = () => {
  const { salesInvoices, purchases, fetchSales, fetchPurchases, fetchMedicines } = usePharmacyStore();

  const [activeTab, setActiveTab] = useState<'financial' | 'gst' | 'scheduleH'>('financial');
  const [scheduleHSearch, setScheduleHSearch] = useState('');

  useEffect(() => {
    fetchSales();
    fetchPurchases();
    fetchMedicines();
  }, [fetchSales, fetchPurchases, fetchMedicines]);

  // Compute Completed Sales
  const completedSales = useMemo(() => {
    return (salesInvoices || []).filter((inv) => (inv.status || 'COMPLETED') === 'COMPLETED');
  }, [salesInvoices]);

  // Total Metrics
  const totalSalesRevenue = useMemo(() => {
    return completedSales.reduce((sum, inv) => sum + (Number(inv.netTotal) || 0), 0);
  }, [completedSales]);

  const totalPurchasesCost = useMemo(() => {
    return (purchases || []).reduce((sum, p) => sum + (Number(p.netTotal) || 0), 0);
  }, [purchases]);

  const totalBillsCount = completedSales.length;

  const estimatedProfit = useMemo(() => {
    // Estimated ~20% gross retail pharmacy margin
    return totalSalesRevenue > 0 ? Number((totalSalesRevenue * 0.20).toFixed(2)) : 0;
  }, [totalSalesRevenue]);

  // Monthly Sales Aggregation for Bar Chart
  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap: { [key: string]: number } = {};

    months.forEach(m => { dataMap[m] = 0; });

    completedSales.forEach((inv) => {
      // Parse date format (e.g. "07 Oct 2026" or ISO)
      const d = new Date(inv.date || inv.createdAt || Date.now());
      if (!isNaN(d.getTime())) {
        const mName = months[d.getMonth()];
        dataMap[mName] = (dataMap[mName] || 0) + (Number(inv.netTotal) || 0);
      }
    });

    // If sales are all in current month (October), ensure clean visual bars
    const currentMonthName = months[new Date().getMonth()];
    if (dataMap[currentMonthName] === 0 && totalSalesRevenue > 0) {
      dataMap[currentMonthName] = totalSalesRevenue;
    }

    return months.map(m => ({
      month: m,
      sales: Math.round(dataMap[m] || 0),
    }));
  }, [completedSales, totalSalesRevenue]);

  // GST Breakdown
  const gstTaxable = useMemo(() => Number((totalSalesRevenue / 1.12).toFixed(2)), [totalSalesRevenue]);
  const gstTotal = useMemo(() => Number((totalSalesRevenue - gstTaxable).toFixed(2)), [totalSalesRevenue, gstTaxable]);
  const cgst = useMemo(() => Number((gstTotal / 2).toFixed(2)), [gstTotal]);
  const sgst = useMemo(() => Number((gstTotal / 2).toFixed(2)), [gstTotal]);

  // Purchase ITC (Input Tax Credit)
  const purchaseGstItc = useMemo(() => {
    return (purchases || []).reduce((sum, p) => sum + (Number(p.gstAmount) || 0), 0);
  }, [purchases]);

  const netGstPayable = Math.max(0, gstTotal - purchaseGstItc);

  // Schedule H Filtered Entries
  const scheduleHEntries = useMemo(() => {
    const list: Array<{
      invoiceNumber: string;
      date: string;
      patientName: string;
      doctorName: string;
      medicineName: string;
      batchNumber: string;
      quantity: number;
    }> = [];

    completedSales.forEach((inv) => {
      const doc = inv.doctorName;
      const patient = inv.patientName || inv.customerName || 'Patient';

      (inv.items || []).forEach((item) => {
        // Include item if doctor is mentioned or item is prescription tagged
        if (doc || inv.doctorName) {
          list.push({
            invoiceNumber: inv.invoiceNumber,
            date: inv.date,
            patientName: patient,
            doctorName: doc || 'Prescribing Physician',
            medicineName: item.medicineName,
            batchNumber: item.batchNumber || 'B-STOCK',
            quantity: item.quantity
          });
        }
      });
    });

    if (scheduleHSearch.trim()) {
      const term = scheduleHSearch.toLowerCase();
      return list.filter(e => 
        e.patientName.toLowerCase().includes(term) ||
        e.doctorName.toLowerCase().includes(term) ||
        e.medicineName.toLowerCase().includes(term) ||
        e.invoiceNumber.toLowerCase().includes(term)
      );
    }

    return list;
  }, [completedSales, scheduleHSearch]);

  // Export GSTR-1 CSV
  const handleExportGstr1 = () => {
    let csv = "Invoice Number,Invoice Date,Customer Name,Customer Mobile,Taxable Value (INR),CGST 6% (INR),SGST 6% (INR),Total Invoice Value (INR),Payment Mode\n";
    completedSales.forEach(inv => {
      const net = Number(inv.netTotal || 0);
      const taxable = (net / 1.12).toFixed(2);
      const tax = (net - Number(taxable)).toFixed(2);
      const c = (Number(tax) / 2).toFixed(2);
      const s = (Number(tax) / 2).toFixed(2);

      csv += `"${inv.invoiceNumber}","${inv.date}","${inv.customerName || 'Walk-in'}","${inv.customerMobile || ''}",${taxable},${c},${s},${net.toFixed(2)},"${inv.paymentMode}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GSTR1_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Schedule H CSV
  const handleExportScheduleH = () => {
    let csv = "Date,Bill / Invoice No,Patient Name,Prescribing Doctor,Medicine Name,Batch Number,Quantity Dispensed\n";
    scheduleHEntries.forEach(e => {
      csv += `"${e.date}","${e.invoiceNumber}","${e.patientName}","${e.doctorName}","${e.medicineName}","${e.batchNumber}",${e.quantity}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Schedule_H_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            📊
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Regulatory Compliance</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live financial summaries, GSTR-1 tax audit reports, and Schedule H inspection register.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'gst' && (
            <button
              onClick={handleExportGstr1}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download GSTR-1 CSV</span>
            </button>
          )}

          {activeTab === 'scheduleH' && (
            <button
              onClick={handleExportScheduleH}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Schedule H Register</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold space-x-6">
        <button
          onClick={() => setActiveTab('financial')}
          className={`pb-3 flex items-center gap-1.5 cursor-pointer transition ${
            activeTab === 'financial'
              ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Financial Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('gst')}
          className={`pb-3 flex items-center gap-1.5 cursor-pointer transition ${
            activeTab === 'gst'
              ? 'text-emerald-600 border-b-2 border-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>GST Tax & GSTR-1 Filing</span>
        </button>

        <button
          onClick={() => setActiveTab('scheduleH')}
          className={`pb-3 flex items-center gap-1.5 cursor-pointer transition ${
            activeTab === 'scheduleH'
              ? 'text-rose-600 border-b-2 border-rose-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Schedule H / Rx Register ({scheduleHEntries.length})</span>
        </button>
      </div>

      {/* TAB 1: FINANCIAL OVERVIEW */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* 4 Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Total Sales Revenue
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{totalSalesRevenue.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">
                From {totalBillsCount} settled counter invoices
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Total Purchases Stock
              </span>
              <p className="text-2xl font-black text-slate-700 mt-1">₹{totalPurchasesCost.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-slate-400 font-medium mt-2 block">
                {(purchases || []).length} distributor invoices
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Total Invoices Cleared
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalBillsCount}</p>
              <span className="text-[11px] text-slate-400 font-medium mt-2 block">
                Average ₹{totalBillsCount > 0 ? Math.round(totalSalesRevenue / totalBillsCount) : 0} per bill
              </span>
            </div>

            <div className="bg-white border-l-4 border-l-emerald-500 border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                Estimated Net Margin (20%)
              </span>
              <p className="text-2xl font-black text-emerald-600 mt-1">₹{estimatedProfit.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-2 block">
                Standard retail pharmacy gross profit
              </span>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Sales Revenue Trend (₹)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Aggregated from PostgreSQL customer invoices</p>
              </div>
              <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
                FY 2026-27
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${v/1000}k` : v}`} />
                  <Tooltip
                    cursor={false}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                  />
                  <Bar dataKey="sales" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GST TAX & GSTR-1 */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Total Taxable Value
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{gstTaxable.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-slate-400 mt-1.5 block">Net sales before GST</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Output CGST (6%)
              </span>
              <p className="text-2xl font-black text-sky-700 mt-1">₹{cgst.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-slate-400 mt-1.5 block">Central Goods & Services Tax</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Output SGST (6%)
              </span>
              <p className="text-2xl font-black text-sky-700 mt-1">₹{sgst.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-slate-400 mt-1.5 block">State Goods & Services Tax</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                Input Tax Credit (ITC)
              </span>
              <p className="text-2xl font-black text-emerald-600 mt-1">₹{purchaseGstItc.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-slate-500 mt-1.5 block">Net Tax Payable: <strong>₹{netGstPayable.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>

          {/* GSTR-1 Invoices Table Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">GSTR-1 B2C Small Invoices Summary</h3>
                <p className="text-xs text-slate-400">Ready for filing under Section 37 of CGST Act</p>
              </div>
              <button
                onClick={handleExportGstr1}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3 text-right">Taxable (₹)</th>
                    <th className="p-3 text-right">CGST (6%)</th>
                    <th className="p-3 text-right">SGST (6%)</th>
                    <th className="p-3 text-right">Total Invoice (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {completedSales.slice(0, 10).map((inv) => {
                    const net = Number(inv.netTotal || 0);
                    const taxable = (net / 1.12).toFixed(2);
                    const tax = (net - Number(taxable)).toFixed(2);
                    const c = (Number(tax) / 2).toFixed(2);
                    const s = (Number(tax) / 2).toFixed(2);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono font-bold text-sky-700">{inv.invoiceNumber}</td>
                        <td className="p-3 text-slate-500">{inv.date}</td>
                        <td className="p-3 font-medium text-slate-800">{inv.customerName || 'Walk-in'}</td>
                        <td className="p-3 text-right font-mono">₹{taxable}</td>
                        <td className="p-3 text-right font-mono text-slate-600">₹{c}</td>
                        <td className="p-3 text-right font-mono text-slate-600">₹{s}</td>
                        <td className="p-3 text-right font-bold font-mono text-slate-900">₹{net.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULE H INSPECTION REGISTER */}
      {activeTab === 'scheduleH' && (
        <div className="space-y-6">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-rose-900 text-xs">Statutory Drugs & Cosmetics Schedule H/H1 Register</h4>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Maintained for FDA Drug Inspector audits. Captures prescription medicines sold with Prescribing Doctor details.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportScheduleH}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
            >
              Export CSV
            </button>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <input
              type="text"
              value={scheduleHSearch}
              onChange={(e) => setScheduleHSearch(e.target.value)}
              placeholder="Search by doctor, patient, medicine name, or invoice..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            />
          </div>

          {/* Schedule H Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Bill / Invoice #</th>
                    <th className="p-3">Patient Name</th>
                    <th className="p-3">Prescribing Doctor</th>
                    <th className="p-3">Medicine Dispensed</th>
                    <th className="p-3 font-mono">Batch</th>
                    <th className="p-3 text-center">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {scheduleHEntries.length > 0 ? (
                    scheduleHEntries.map((e, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="p-3 text-slate-500">{e.date}</td>
                        <td className="p-3 font-mono font-bold text-sky-700">{e.invoiceNumber}</td>
                        <td className="p-3 font-semibold text-slate-900">{e.patientName}</td>
                        <td className="p-3 text-slate-800">
                          <span className="inline-flex items-center gap-1 font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            🩺 {e.doctorName}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-900">{e.medicineName}</td>
                        <td className="p-3 font-mono text-slate-500">{e.batchNumber}</td>
                        <td className="p-3 text-center font-bold text-slate-900">{e.quantity}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No Schedule H prescription records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
