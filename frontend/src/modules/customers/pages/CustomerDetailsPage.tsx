import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, DollarSign, MessageSquare, ExternalLink } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import { Modal } from '../../../components/ui/Modal';

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useUIStore();
  const navigate = useNavigate();
  const { customers, settleCustomerDue } = usePharmacyStore();

  const customer = customers.find((c) => c.id === id) || customers[0];
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showWhatsAppConfirmModal, setShowWhatsAppConfirmModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState(customer?.currentDue || 0);
  const [viewingInvoice, setViewingInvoice] = useState<{ id: string; date: string; items: string; amount: number; status: string; mode: string } | null>(null);

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-500">
        Customer not found. <button onClick={() => navigate('/customers')} className="text-sky-600 underline">Back</button>
      </div>
    );
  }

  const handleOpenReminder = () => {
    setShowWhatsAppConfirmModal(true);
  };

  const confirmSendReminder = () => {
    const text = encodeURIComponent(
      `Namaskar ${customer.fullName},\nThis is a gentle payment reminder from MedEasy (Khed Shivapur).\n\n💰 Pending Udhaar Due: ₹${customer.currentDue}\n\nPlease visit the store or pay via UPI at your convenience. Thank you!`
    );
    window.open(`https://wa.me/91${customer.mobile}?text=${text}`, '_blank');
    setShowWhatsAppConfirmModal(false);
  };

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (settleAmount <= 0) return;
    settleCustomerDue(customer.id, settleAmount);
    setShowSettleModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header with Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => navigate('/customers')}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Udhaar List</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{customer.fullName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Mobile: +91 {customer.mobile} • Address: {customer.address || 'Khed Shivapur'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {customer.currentDue > 0 && (
            <button
              onClick={handleOpenReminder}
              className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-semibold rounded-xl hover:bg-emerald-100 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('sendWhatsAppReminder')}</span>
            </button>
          )}
          <button
            onClick={() => {
              setSettleAmount(customer.currentDue);
              setShowSettleModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{t('addPayment')}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Purchases
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ₹{customer.totalPurchases.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white border-l-4 border-l-rose-500 border border-slate-200/90 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-rose-700 font-semibold uppercase tracking-wider">
            {t('currentDueAmount')}
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            ₹{customer.currentDue.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            {t('totalBillsCount')}
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {customer.totalBills}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Last Purchase Date
          </span>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {customer.lastPurchaseDate}
          </p>
        </div>
      </div>

      {/* History Tabs (Purchase Invoices vs Payments) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex justify-between items-center">
          <div className="flex space-x-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`pb-1 transition cursor-pointer ${
                activeTab === 'invoices'
                  ? 'text-sky-600 border-b-2 border-sky-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('tabInvoices')}
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-1 transition cursor-pointer ${
                activeTab === 'payments'
                  ? 'text-sky-600 border-b-2 border-sky-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('tabPayments')}
            </button>
          </div>
          <span className="text-xs text-slate-400">Sorted by newest first</span>
        </div>

        {activeTab === 'invoices' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Date</th>
                <th className="p-3">Bill No</th>
                <th className="p-3">Items Purchased</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">Payment Status</th>
                <th className="p-3 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3 font-mono text-slate-400">1</td>
                <td className="p-3">28 Sep 2026</td>
                <td className="p-3 font-mono font-semibold text-slate-900">#91023</td>
                <td className="p-3">Dolo 650, Pan-D, ORS Sachet</td>
                <td className="p-3 text-right font-bold text-slate-900">₹650.00</td>
                <td className="p-3 text-right">
                  <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                    Unpaid (Udhaar)
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => setViewingInvoice({ id: '#91023', date: '28 Sep 2026', items: 'Dolo 650 (2x), Pan-D (1x), ORS Sachet (5x)', amount: 650, status: 'Unpaid (Udhaar)', mode: 'CREDIT_UDHAAR' })} 
                    className="text-sky-600 hover:underline cursor-pointer font-semibold"
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-slate-400">2</td>
                <td className="p-3">12 Sep 2026</td>
                <td className="p-3 font-mono font-semibold text-slate-900">#89587</td>
                <td className="p-3">Vitamin D3 60k, Becosules</td>
                <td className="p-3 text-right font-bold text-slate-900">₹600.00</td>
                <td className="p-3 text-right">
                  <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                    Unpaid (Udhaar)
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => setViewingInvoice({ id: '#89587', date: '12 Sep 2026', items: 'Vitamin D3 60k (4x), Becosules (2x)', amount: 600, status: 'Unpaid (Udhaar)', mode: 'CREDIT_UDHAAR' })} 
                    className="text-sky-600 hover:underline cursor-pointer font-semibold"
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-slate-400">3</td>
                <td className="p-3">05 Sep 2026</td>
                <td className="p-3 font-mono font-semibold text-slate-900">#86956</td>
                <td className="p-3">Azithromycin, Cough Syrup, Paracetamol</td>
                <td className="p-3 text-right font-bold text-slate-900">₹1,240.00</td>
                <td className="p-3 text-right">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                    Paid (UPI)
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => setViewingInvoice({ id: '#86956', date: '05 Sep 2026', items: 'Azithromycin 500 (1x), Cough Syrup (1x), Paracetamol (2x)', amount: 1240, status: 'Paid (UPI)', mode: 'UPI' })} 
                    className="text-sky-600 hover:underline cursor-pointer font-semibold"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3">Receipt No</th>
                <th className="p-3">Payment Date</th>
                <th className="p-3 text-right">Amount Received</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">#REC-4412</td>
                <td className="p-3">15 Sep 2026</td>
                <td className="p-3 text-right font-bold text-emerald-600">₹1,000.00</td>
                <td className="p-3">Cash</td>
                <td className="p-3 text-slate-500">Partial payment for August bill</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-slate-900">#REC-3901</td>
                <td className="p-3">01 Sep 2026</td>
                <td className="p-3 text-right font-bold text-emerald-600">₹2,000.00</td>
                <td className="p-3">UPI (PhonePe)</td>
                <td className="p-3 text-slate-500">Full clearance of July balance</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* =========================================================
          UPGRADED MODAL 1: SETTLE DUE / RECEIVE PAYMENT
          ========================================================= */}
      <Modal
        isOpen={showSettleModal}
        onClose={() => setShowSettleModal(false)}
        title="Receive Customer Payment"
        subtitle={`Record cash or UPI payment received from ${customer.fullName}`}
        icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
      >
        <form onSubmit={handleSettle} className="space-y-4 text-xs">
          <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-rose-700 font-medium block">Current Outstanding Due:</span>
              <span className="text-2xl font-black text-rose-600">₹{customer.currentDue}</span>
            </div>
            <button
              type="button"
              onClick={() => setSettleAmount(customer.currentDue)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] transition shadow-xs cursor-pointer"
            >
              Clear Entire Balance
            </button>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Payment Amount Received (₹) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                required
                min={1}
                max={customer.currentDue}
                value={settleAmount}
                onChange={(e) => setSettleAmount(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-lg font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              New due balance will be: <strong>₹{Math.max(0, customer.currentDue - settleAmount)}</strong>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowSettleModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================
          UPGRADED MODAL 2: WHATSAPP REMINDER CONFIRMATION
          ========================================================= */}
      <Modal
        isOpen={showWhatsAppConfirmModal}
        onClose={() => setShowWhatsAppConfirmModal(false)}
        title="Send WhatsApp Payment Reminder"
        subtitle={`Notify ${customer.fullName} regarding outstanding dues`}
        icon={<MessageSquare className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <p className="font-bold text-slate-800">Preview Message:</p>
            <p className="text-slate-600 bg-white p-3 rounded-xl border border-emerald-100 font-mono text-[11px] leading-relaxed">
              "Namaskar {customer.fullName}, This is a gentle payment reminder from MedEasy (Khed Shivapur). Pending Udhaar Due: ₹{customer.currentDue}. Please visit the store or pay via UPI at your convenience. Thank you!"
            </p>
            <p className="text-[11px] text-emerald-800">Recipient: +91 {customer.mobile}</p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowWhatsAppConfirmModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSendReminder}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp Now</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </button>
          </div>
        </div>
      </Modal>

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
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Invoice Date:</span>
                <span className="font-semibold text-slate-900">{viewingInvoice.date}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Items Billed:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px]">{viewingInvoice.items}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Payment Status:</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                  viewingInvoice.status.includes('Paid')
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {viewingInvoice.status}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-slate-900">Total Billed:</span>
                <span className="text-xl font-black text-emerald-600">₹{viewingInvoice.amount.toFixed(2)}</span>
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
