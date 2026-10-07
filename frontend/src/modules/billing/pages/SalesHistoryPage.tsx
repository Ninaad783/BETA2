import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  X,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import { API_BASE_URL } from '../../../lib/apiClient';
import type { SaleInvoice } from '../../../types/pharmacy.types';

export const SalesHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { salesInvoices, fetchSales, fetchMedicines } = usePharmacyStore();

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'CASH' | 'UPI' | 'CARD'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingInvoice, setCancellingInvoice] = useState<SaleInvoice | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);
  const [storeInfo, setStoreInfo] = useState<{
    storeName: string;
    dlNumber: string;
    gstin: string;
    phone: string;
    addressLine: string;
    thermalHeader: string;
    thermalFooter: string;
  }>({
    storeName: 'MedEasy Pharmacy',
    dlNumber: 'MH-PUN-2026-DL789',
    gstin: '27ABCDE1234F1Z5',
    phone: '8380036778',
    addressLine: 'Shop No 4, Station Road, Pune',
    thermalHeader: 'MEDEASY PHARMACY',
    thermalFooter: 'Thank you for your visit! Wishing you good health.'
  });

  useEffect(() => {
    fetchSales();
    // Fetch live store profile for accurate thermal reprints
    fetch(`${API_BASE_URL}/api/store`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.store) {
          setStoreInfo({
            storeName: data.store.storeName || 'MedEasy Pharmacy',
            dlNumber: data.store.dlNumber || '',
            gstin: data.store.gstin || '',
            phone: data.store.phone || '8380036778',
            addressLine: data.store.addressLine || '',
            thermalHeader: data.store.thermalHeader || 'MEDEASY PHARMACY',
            thermalFooter: data.store.thermalFooter || 'Thank you for your visit! Wishing you good health.'
          });
        }
      })
      .catch(() => {});
  }, [fetchSales]);

  // Filter invoices
  const filteredInvoices = (salesInvoices || []).filter((inv) => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (inv.customerMobile && inv.customerMobile.includes(search)) ||
      (inv.doctorName && inv.doctorName.toLowerCase().includes(search.toLowerCase()));

    const matchesPayment = paymentFilter === 'ALL' || inv.paymentMode === paymentFilter;
    const matchesStatus = statusFilter === 'ALL' || (inv.status || 'COMPLETED') === statusFilter;

    return matchesSearch && matchesPayment && matchesStatus;
  });

  // KPI Calculations
  const completedInvoices = (salesInvoices || []).filter(i => (i.status || 'COMPLETED') === 'COMPLETED');
  const totalRevenue = completedInvoices.reduce((sum, i) => sum + (Number(i.netTotal) || 0), 0);
  const totalBills = completedInvoices.length;
  const avgBill = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;
  const cancelledCount = (salesInvoices || []).filter(i => i.status === 'CANCELLED').length;

  // Handle thermal reprint
  const handlePrintThermal = (inv: SaleInvoice) => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) return;

    const itemsHtml = (inv.items || []).map(it => `
      <div style="display:flex; justify-content:space-between; margin-bottom: 3px; font-size: 11px;">
        <div style="flex: 2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          <strong>${it.medicineName}</strong><br/>
          <span style="font-size:9px; color:#555;">Batch: ${it.batchNumber || 'N/A'} | Exp: ${it.expiryDate || 'N/A'}</span>
        </div>
        <div style="flex: 0.6; text-align:center;">${it.quantity}</div>
        <div style="flex: 0.8; text-align:right;">₹${Number(it.sellingPrice || it.mrp || 0).toFixed(1)}</div>
        <div style="flex: 0.8; text-align:right; font-weight:bold;">₹${Number(it.total || ((it.sellingPrice || it.mrp || 0) * it.quantity)).toFixed(1)}</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${inv.invoiceNumber}</title>
          <style>
            @page { size: 80mm auto; margin: 3mm; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 72mm; 
              margin: 0 auto; 
              font-size: 11px; 
              color: #000;
              line-height: 1.25;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
            .flex-between { display: flex; justify-content: space-between; }
            @media print {
              body { width: 100%; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 14px; text-transform: uppercase;">${storeInfo.thermalHeader}</div>
          <div class="center" style="font-size: 10px;">${storeInfo.addressLine}</div>
          <div class="center" style="font-size: 10px;">Ph: ${storeInfo.phone} | DL: ${storeInfo.dlNumber}</div>
          <div class="center" style="font-size: 10px;">GSTIN: ${storeInfo.gstin}</div>
          
          <div class="divider"></div>
          
          <div class="flex-between"><span>Bill No: <strong>${inv.invoiceNumber}</strong></span><span>Date: ${inv.date}</span></div>
          <div class="flex-between"><span>Cust: ${inv.customerName || 'Walk-in'}</span><span>Mob: ${inv.customerMobile || 'N/A'}</span></div>
          ${inv.doctorName ? `<div class="flex-between"><span>Rx Doctor: ${inv.doctorName}</span></div>` : ''}
          ${inv.patientName ? `<div class="flex-between"><span>Patient: ${inv.patientName}</span></div>` : ''}
          
          <div class="divider"></div>
          
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:10px; margin-bottom:4px;">
            <div style="flex: 2;">Item</div>
            <div style="flex: 0.6; text-align:center;">Qty</div>
            <div style="flex: 0.8; text-align:right;">Rate</div>
            <div style="flex: 0.8; text-align:right;">Total</div>
          </div>
          
          <div class="divider"></div>
          
          ${itemsHtml}
          
          <div class="divider"></div>
          
          <div class="flex-between"><span>Subtotal:</span><span>₹${Number(inv.subtotal || inv.netTotal).toFixed(2)}</span></div>
          ${Number(inv.discountAmount || 0) > 0 ? `<div class="flex-between"><span>Discount:</span><span>-₹${Number(inv.discountAmount).toFixed(2)}</span></div>` : ''}
          <div class="flex-between"><span>GST Included (12%):</span><span>₹${Number(inv.gstAmount || (inv.netTotal * 0.12)).toFixed(2)}</span></div>
          <div class="divider"></div>
          <div class="flex-between bold" style="font-size: 14px;">
            <span>NET TOTAL:</span>
            <span>₹${Number(inv.netTotal).toFixed(2)}</span>
          </div>
          <div class="flex-between" style="font-size: 10px; margin-top:2px;">
            <span>Payment Mode:</span>
            <span><strong>${inv.paymentMode}</strong> (${inv.status || 'PAID'})</span>
          </div>
          
          <div class="divider"></div>
          <div class="center" style="font-size: 9px; margin-top: 4px;">${storeInfo.thermalFooter}</div>
          <div class="center" style="font-size: 8px; color: #666; margin-top: 2px;">*** REPRINT COPY ***</div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // WhatsApp Share
  const handleShareWhatsApp = (inv: SaleInvoice) => {
    const phone = inv.customerMobile ? inv.customerMobile.replace(/\D/g, '') : '';
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

    const itemsText = (inv.items || [])
      .map((it, idx) => `${idx + 1}. ${it.medicineName} (Qty: ${it.quantity}) - ₹${Number(it.total || 0).toFixed(0)}`)
      .join('%0A');

    const msg = `🧾 *${storeInfo.storeName} - Bill Receipt*%0A--------------------------------%0A*Invoice:* ${inv.invoiceNumber}%0A*Date:* ${inv.date}%0A*Customer:* ${inv.customerName || 'Walk-in'}%0A${inv.doctorName ? `*Doctor:* ${inv.doctorName}%0A` : ''}--------------------------------%0A*Items:*%0A${itemsText}%0A--------------------------------%0A*Total Amount:* ₹${Number(inv.netTotal).toFixed(2)}%0A*Paid Via:* ${inv.paymentMode}%0A%0AThank you for trusting ${storeInfo.storeName}! Wishing you speedy recovery. 🌿`;

    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  // Cancel & Refund Invoice Handler
  const handleConfirmCancel = async () => {
    if (!cancellingInvoice) return;
    setIsCancelling(true);
    setCancelSuccessMsg(null);

    try {
      const token = localStorage.getItem('medeasy_auth_token');
      const res = await fetch(`${API_BASE_URL}/api/sales/${cancellingInvoice.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCancelSuccessMsg(`Invoice #${cancellingInvoice.invoiceNumber} has been cancelled. Batches restored to stock!`);
        // Refresh sales and medicines
        await fetchSales();
        await fetchMedicines();
        setTimeout(() => {
          setShowCancelModal(false);
          setCancellingInvoice(null);
          setCancelSuccessMsg(null);
        }, 1500);
      } else {
        alert(data.message || 'Failed to cancel invoice');
      }
    } catch (e: any) {
      alert('Error connecting to server to cancel bill');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            🧾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales Invoices & Billing History</h1>
              <span className="text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 px-2.5 py-0.5 rounded-full">
                {totalBills} Settled Bills
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse, reprint, resend WhatsApp receipts, and process customer returns / refunds.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate('/billing')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Counter Bill</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Invoiced Value
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1.5 block">
            Across {totalBills} completed transactions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Ticket Size
          </span>
          <p className="text-2xl font-black text-sky-700 mt-1">₹{avgBill.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">
            Per customer invoice
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Payment Breakdown
          </span>
          <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700">
              <Banknote className="w-3.5 h-3.5" />
              {completedInvoices.filter(i => i.paymentMode === 'CASH').length} Cash
            </span>
            <span className="flex items-center gap-1 text-sky-700">
              <QrCode className="w-3.5 h-3.5" />
              {completedInvoices.filter(i => i.paymentMode === 'UPI').length} UPI
            </span>
            <span className="flex items-center gap-1 text-violet-700">
              <CreditCard className="w-3.5 h-3.5" />
              {completedInvoices.filter(i => i.paymentMode === 'CARD').length} Card
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Payment modes recorded
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Returns / Cancelled
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">{cancelledCount}</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">
            Restored to stock inventory
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer name, mobile, doctor..."
            className="w-full text-xs border border-slate-300 rounded-xl pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="CASH">Cash Only</option>
            <option value="UPI">UPI Only</option>
            <option value="CARD">Card Only</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed Only</option>
            <option value="CANCELLED">Cancelled / Returned Only</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Customer / Patient</th>
                <th className="p-3.5">Items Summary</th>
                <th className="p-3.5 text-center">Payment</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-sky-700">
                      {inv.invoiceNumber}
                      {inv.doctorName && (
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          Rx: {inv.doctorName}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500 font-medium">
                      {inv.date}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {inv.customerName || 'Walk-in Customer'}
                      {inv.customerMobile && (
                        <span className="block text-[11px] text-slate-500 font-mono font-normal">
                          {inv.customerMobile}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate" title={inv.itemsSummary}>
                      {inv.itemsSummary || `${inv.items?.length || 0} items`}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        inv.paymentMode === 'UPI' 
                          ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                          : inv.paymentMode === 'CARD' 
                            ? 'bg-violet-50 text-violet-700 border border-violet-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {inv.paymentMode}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-slate-900 text-sm">
                      ₹{Number(inv.netTotal).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (inv.status || 'COMPLETED') === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {inv.status || 'COMPLETED'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Modal */}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                          title="View Bill Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Thermal Print */}
                        <button
                          onClick={() => handlePrintThermal(inv)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Reprint 80mm Thermal Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* WhatsApp Share */}
                        <button
                          onClick={() => handleShareWhatsApp(inv)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Send to Customer WhatsApp"
                        >
                          <span className="text-xs">💬</span>
                        </button>

                        {/* Cancel / Refund */}
                        {(inv.status || 'COMPLETED') !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              setCancellingInvoice(inv);
                              setShowCancelModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Cancel Bill & Return Stock"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No sales invoices found matching "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Invoice Details: {selectedInvoice.invoiceNumber}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Recorded on {selectedInvoice.date}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Doctor Summary */}
            <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer / Patient:</span>
                <span className="font-bold text-slate-800">{selectedInvoice.customerName || 'Walk-in Customer'}</span>
                {selectedInvoice.customerMobile && (
                  <span className="block text-slate-500 font-mono">{selectedInvoice.customerMobile}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Doctor & Rx:</span>
                <span className="font-semibold text-slate-700">{selectedInvoice.doctorName || 'Over The Counter (OTC)'}</span>
                <span className="block text-slate-500">Paid via: <strong>{selectedInvoice.paymentMode}</strong></span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2.5">Medicine Name</th>
                    <th className="p-2.5">Batch</th>
                    <th className="p-2.5">Expiry</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedInvoice.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-900">{it.medicineName}</td>
                      <td className="p-2.5 font-mono text-slate-500">{it.batchNumber || 'N/A'}</td>
                      <td className="p-2.5 text-slate-500">{it.expiryDate || 'N/A'}</td>
                      <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                      <td className="p-2.5 text-right font-mono">₹{Number(it.sellingPrice || it.mrp || 0).toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold font-mono">₹{Number(it.total || ((it.sellingPrice || it.mrp || 0) * it.quantity)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{Number(selectedInvoice.subtotal || selectedInvoice.netTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (Included):</span>
                <span>₹{Number(selectedInvoice.gstAmount || (selectedInvoice.netTotal * 0.12)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t">
                <span>Net Total:</span>
                <span className="text-emerald-700">₹{Number(selectedInvoice.netTotal).toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t">
              <button
                onClick={() => handlePrintThermal(selectedInvoice)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Reprint Receipt</span>
              </button>
              <button
                onClick={() => handleShareWhatsApp(selectedInvoice)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>WhatsApp Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Invoice Confirmation Modal */}
      {showCancelModal && cancellingInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cancel Bill & Refund?</h3>
                <p className="text-xs text-slate-500">Invoice: {cancellingInvoice.invoiceNumber}</p>
              </div>
            </div>

            {cancelSuccessMsg ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{cancelSuccessMsg}</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Cancelling this bill will:
                  <br />• <strong>Restore medicine items</strong> back into batch stock inventory.
                  <br />• Deduct <strong>₹{Number(cancellingInvoice.netTotal).toFixed(2)}</strong> from customer's lifetime purchase record.
                  <br />• Mark invoice status as <strong>CANCELLED</strong>.
                </p>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    disabled={isCancelling}
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancellingInvoice(null);
                    }}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Keep Invoice
                  </button>
                  <button
                    disabled={isCancelling}
                    onClick={handleConfirmCancel}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {isCancelling ? 'Processing...' : 'Confirm Return / Cancel'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistoryPage;
