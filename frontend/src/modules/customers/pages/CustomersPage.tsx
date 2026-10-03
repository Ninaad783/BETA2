import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, UserPlus, DollarSign, Phone, MapPin, User, CheckCircle2, Send } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import type { Customer } from '../../../types/pharmacy.types';
import { Modal } from '../../../components/ui/Modal';

export const CustomersPage: React.FC = () => {
  const { t } = useUIStore();
  const navigate = useNavigate();
  const { customers, addCustomer, settleCustomerDue } = usePharmacyStore();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [settlingCustomer, setSettlingCustomer] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSettleInfo, setLastSettleInfo] = useState<{ name: string; amount: number; remaining: number } | null>(null);

  // Add Customer Form
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search)
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.currentDue, 0);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;
    addCustomer({ fullName: name, mobile, address });
    setShowAddModal(false);
    setName('');
    setMobile('');
    setAddress('');
  };

  const handleOpenSettle = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setSettlingCustomer(c);
    setSettleAmount(c.currentDue);
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingCustomer || settleAmount <= 0) return;
    const remaining = Math.max(0, settlingCustomer.currentDue - settleAmount);
    settleCustomerDue(settlingCustomer.id, settleAmount);
    setLastSettleInfo({
      name: settlingCustomer.fullName,
      amount: settleAmount,
      remaining
    });
    setSettlingCustomer(null);
    setShowSuccessModal(true);
  };

  const handleQuickWhatsApp = (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Namaskar ${cust.fullName},\nThis is a friendly reminder from MedEasy Pharmacy (Khed Shivapur).\n\n💰 Outstanding Due Balance: ₹${cust.currentDue}\n\nKindly clear this at your next visit or via UPI. Thank you!`
    );
    window.open(`https://wa.me/91${cust.mobile}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            📒
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('udhaarTitle')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('udhaarSub')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addCustomer')}</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-l-4 border-l-rose-500 border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-md transition">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
            {t('totalOutstanding')}
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            ₹{totalOutstanding.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-500">
              across {customers.filter((c) => c.currentDue > 0).length} customers
            </span>
          </p>
        </div>

        <div className="bg-white border-l-4 border-l-emerald-500 border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-md transition">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            {t('collectedThisMonth')}
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹14,500</p>
        </div>

        <div className="bg-white border-l-4 border-l-sky-500 border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-md transition">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">
            {t('registeredCustomers')}
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {customers.length} <span className="text-xs font-normal text-slate-400">accounts</span>
          </p>
        </div>
      </div>

      {/* Customer Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer by name or mobile..."
              className="text-xs border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 w-72 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>
          <span className="text-xs text-slate-500">
            Showing {filteredCustomers.length} registered credit accounts
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">{t('thCustomerName')}</th>
              <th className="p-3">{t('thMobile')}</th>
              <th className="p-3 text-right">{t('thTotalPurchase')}</th>
              <th className="p-3 text-right text-rose-700">{t('thDueAmount')}</th>
              <th className="p-3">{t('thLastPurchase')}</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredCustomers.map((cust, idx) => (
              <tr
                key={cust.id}
                onClick={() => navigate(`/customers/${cust.id}`)}
                className="hover:bg-sky-50/40 cursor-pointer transition"
              >
                <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                <td className="p-3 font-bold text-sky-700 hover:underline">{cust.fullName}</td>
                <td className="p-3 font-mono">{cust.mobile}</td>
                <td className="p-3 text-right font-medium">₹{cust.totalPurchases.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right font-bold text-rose-600 bg-rose-50/40">
                  {cust.currentDue > 0 ? (
                    `₹${cust.currentDue.toLocaleString('en-IN')}`
                  ) : (
                    <span className="text-emerald-600">₹0 (Cleared)</span>
                  )}
                </td>
                <td className="p-3 text-slate-500">{cust.lastPurchaseDate}</td>
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center space-x-1.5">
                    <button
                      onClick={() => navigate(`/customers/${cust.id}`)}
                      className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold hover:bg-slate-200 transition cursor-pointer"
                    >
                      {t('ledgerBtn')}
                    </button>
                    {cust.currentDue > 0 ? (
                      <>
                        <button
                          onClick={(e) => handleQuickWhatsApp(cust, e)}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                          title="Quick WhatsApp Reminder"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleOpenSettle(cust, e)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                        >
                          {t('settleBtn')}
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600 px-2 py-1">
                        ✓ No Due
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================================================
          UPGRADED MODAL 1: ADD CUSTOMER
          ========================================================= */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Customer to Udhaar Ledger"
        subtitle="Register customer for credit account tracking and reminders"
        icon={<UserPlus className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Customer Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dnyaneshwar Jadhav"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Mobile Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. 9822112233"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Address / Village</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Khed Shivapur gaothan"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================
          UPGRADED MODAL 2: QUICK SETTLE UDHAAR
          ========================================================= */}
      <Modal
        isOpen={!!settlingCustomer}
        onClose={() => setSettlingCustomer(null)}
        title="Settle Customer Udhaar"
        subtitle={`Record payment received from ${settlingCustomer?.fullName}`}
        icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
      >
        {settlingCustomer && (
          <form onSubmit={handleConfirmSettle} className="space-y-4 text-xs">
            <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-rose-700 font-medium block">Current Outstanding Due:</span>
                <span className="text-2xl font-black text-rose-600">₹{settlingCustomer.currentDue}</span>
              </div>
              <button
                type="button"
                onClick={() => setSettleAmount(settlingCustomer.currentDue)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] transition shadow-xs cursor-pointer"
              >
                Clear Full Due
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Amount Received (₹) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min={1}
                  max={settlingCustomer.currentDue}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-lg font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Remaining due will be: <strong>₹{Math.max(0, settlingCustomer.currentDue - settleAmount)}</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSettlingCustomer(null)}
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
        )}
      </Modal>

      {/* =========================================================
          UPGRADED MODAL 3: PAYMENT RECORDED SUCCESS
          ========================================================= */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Payment Recorded Successfully"
        subtitle="Customer ledger balance has been updated"
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
      >
        {lastSettleInfo && (
          <div className="space-y-4 text-center text-xs">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1">
              <p className="text-slate-500">Customer: <strong className="text-slate-800">{lastSettleInfo.name}</strong></p>
              <p className="text-2xl font-black text-emerald-600">₹{lastSettleInfo.amount.toFixed(2)} Received</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Remaining Due Balance: <strong className="text-slate-800">₹{lastSettleInfo.remaining}</strong>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
