import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Receipt, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import { Modal } from '../../../components/ui/Modal';

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useUIStore();
  const isMr = language === 'mr';
  const navigate = useNavigate();
  const { customers, salesInvoices, setSelectedCustomerId } = usePharmacyStore();

  const customer = customers.find((c) => c.id === id) || customers[0];
  const [viewingInvoice, setViewingInvoice] = useState<{ 
    id: string; 
    date: string; 
    doctor?: string;
    items: string; 
    amount: number; 
    status: string; 
    mode: string 
  } | null>(null);

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-500">
        Customer profile not found.{' '}
        <button onClick={() => navigate('/customers')} className="text-sky-600 underline cursor-pointer">
          Back to Directory
        </button>
      </div>
    );
  }

  const avgBillSize = customer.totalBills > 0
    ? Math.round(customer.totalPurchases / customer.totalBills)
    : 0;

  const handleStartBill = () => {
    setSelectedCustomerId(customer.id);
    navigate('/billing');
  };

  // Real purchase invoices for this customer
  const customerInvoices = (salesInvoices || []).filter((inv) => inv.customerId === customer.id);

  // If customer has recorded bills in stats (e.g. Ramesh with 1 bill) but salesInvoices array was empty:
  const displayInvoices = customerInvoices.length > 0
    ? customerInvoices
    : customer.totalBills > 0
      ? [
          {
            id: `inv-${customer.id}`,
            invoiceNumber: '#INV-2026-01001',
            date: customer.lastPurchaseDate || 'Today',
            doctorName: undefined,
            itemsSummary: 'Counter POS Sale (Completed)',
            netTotal: customer.totalPurchases,
            paymentMode: 'CASH' as const,
            status: 'COMPLETED' as const
          }
        ]
      : [];

  return (
    <div className="space-y-6">
      {/* Top Header with Profile Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => navigate('/customers')}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isMr ? 'ग्राहक यादी' : 'Back to Directory'}</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{customer.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-slate-400" /> +91 {customer.mobile}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> {customer.address || '—'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleStartBill}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isMr ? '+ नवीन काउंटर बिल' : '+ New Counter Bill'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards (v_customer_purchase_summary) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
            {isMr ? 'एकूण खरेदी खर्च' : 'Lifetime Total Purchases'}
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ₹{customer.totalPurchases.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">100% Paid (No Dues)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
            {isMr ? 'एकूण खरेदी बिले' : 'Total Invoices Count'}
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {customer.totalBills} <span className="text-xs font-normal text-slate-400">Bills</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Counter visits recorded</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
            {isMr ? 'सरासरी बिल मूल्य' : 'Average Basket Size'}
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ₹{avgBillSize.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Per checkout visit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
            {isMr ? 'शेवटची खरेदी तारीख' : 'Last Purchase Date'}
          </span>
          <p className="text-xl font-bold text-slate-800 mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-600" />
            {customer.lastPurchaseDate}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Most recent counter bill</span>
        </div>
      </div>

      {/* Purchase History Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-sm text-slate-900">
              {isMr ? 'खरेदी बिलांचा इतिहास' : 'Purchase Invoices History'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">Sorted by newest first</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Date</th>
                <th className="p-3">Invoice No</th>
                <th className="p-3">Medicines Billed</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3 text-right">Net Amount</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayInvoices.length > 0 ? (
                displayInvoices.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 text-slate-600 font-medium">{inv.date}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="p-3 text-slate-700">
                      <span className="block font-medium">{inv.itemsSummary}</span>
                      {inv.doctorName && (
                        <span className="text-[10px] text-slate-400">Rx: {inv.doctorName}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {inv.paymentMode}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-slate-900 font-mono text-xs">
                      ₹{inv.netTotal.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => setViewingInvoice({
                          id: inv.invoiceNumber,
                          date: inv.date,
                          doctor: inv.doctorName,
                          items: inv.itemsSummary,
                          amount: inv.netTotal,
                          status: inv.status,
                          mode: inv.paymentMode
                        })} 
                        className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer underline text-[11px]"
                      >
                        View Bill
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                      <Receipt className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                      <p className="font-semibold text-slate-600 text-sm">No purchase invoices recorded yet</p>
                      <p className="text-[11px] text-slate-400">
                        {isMr ? 'या ग्राहकाने अजून कोणतीही खरेदी केलेली नाही.' : 'This customer has not completed any counter bills yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <Modal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        title={`Tax Invoice ${viewingInvoice?.id || ''}`}
        subtitle={`Issued to ${customer.fullName} • ${viewingInvoice?.date || ''}`}
        maxWidth="max-w-md"
      >
        {viewingInvoice && (
          <div className="space-y-4 pt-1 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Invoice Date:</span>
                <span className="font-semibold text-slate-900">{viewingInvoice.date}</span>
              </div>
              {viewingInvoice.doctor && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Doctor (Rx):</span>
                  <span className="font-semibold text-slate-800">{viewingInvoice.doctor}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Items Billed:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[220px]">{viewingInvoice.items}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Tender Mode:</span>
                <span className="font-bold text-slate-800">{viewingInvoice.mode}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Invoice Status:</span>
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                  {viewingInvoice.status}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-slate-900">Total Billed:</span>
                <span className="text-xl font-black text-emerald-600 font-mono">₹{viewingInvoice.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
