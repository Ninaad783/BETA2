import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2 
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import { Modal } from '../../../components/ui/Modal';
import type { Supplier } from '../../../types/pharmacy.types';

export const SuppliersPage: React.FC = () => {
  const { t, language } = useUIStore();
  const isMr = language === 'mr';
  const navigate = useNavigate();
  const { suppliers, addSupplier, settleSupplierDue, stats } = usePharmacyStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'due' | 'settled'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [settlingSupplier, setSettlingSupplier] = useState<Supplier | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settlePaymentMode, setSettlePaymentMode] = useState<'UPI' | 'NEFT' | 'CASH'>('UPI');
  const [settleNotes, setSettleNotes] = useState('');

  // Add Supplier Form
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [address, setAddress] = useState('');

  // Stats
  const totalDueAmount = suppliers.reduce((sum, s) => sum + s.currentDue, 0);
  const suppliersWithDue = suppliers.filter((s) => s.currentDue > 0).length;

  // Filtered
  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.mobile.includes(searchTerm) ||
      (s.gstin && s.gstin.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'due') return s.currentDue > 0;
    if (filterTab === 'settled') return s.currentDue === 0;
    return true;
  });

  const handleOpenSettle = (s: Supplier) => {
    setSettlingSupplier(s);
    setSettleAmount(s.currentDue);
    setSettleNotes('');
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingSupplier || settleAmount <= 0) return;
    settleSupplierDue(settlingSupplier.id, settleAmount);
    setSettlingSupplier(null);
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;

    addSupplier({
      name,
      contactPerson,
      mobile,
      email,
      gstin: gstin || '27AABCP1234A1Z5',
      dlNumber: dlNumber || '20B/21B-PUN-0000',
      address: address || 'Pune, Maharashtra'
    });

    setShowAddModal(false);
    setName('');
    setContactPerson('');
    setMobile('');
    setEmail('');
    setGstin('');
    setDlNumber('');
    setAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            🚚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {isMr ? 'सप्लायर्स व वितरक व्यवस्थापन' : 'Suppliers & Distributors Directory'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200/60">
                <Truck className="w-3 h-3 text-sky-600" />
                {suppliers.length} Vendors
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isMr 
                ? 'औषध वितरकांची देणी, जीएसटी व ड्रग्ज लायसन्स नोंदणी आणि खरेदी व्यवहार.'
                : 'Manage pharmaceutical wholesale distributors, GSTIN, DL numbers, and payable ledger.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isMr ? '+ नवीन सप्लायर' : '+ Add Supplier'}</span>
          </button>
          <button
            onClick={() => navigate('/purchases')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('purchaseEntryBtn')}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isMr ? 'एकूण सप्लायर्स' : 'Active Distributors'}
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {suppliers.length} <span className="text-xs font-normal text-slate-400">Agencies</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200/90 shadow-xs bg-rose-50/20">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
            {isMr ? 'एकूण देणी (Outstanding Payable)' : 'Total Outstanding Payable'}
          </span>
          <p className="text-2xl font-black text-rose-700 mt-1">
            ₹{totalDueAmount.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isMr ? 'देणी असलेले वितरक' : 'Vendors with Pending Dues'}
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {suppliersWithDue} <span className="text-xs font-normal text-slate-400">of {suppliers.length}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isMr ? 'आजची खरेदी (Purchases)' : "Today's Inward Purchases"}
          </span>
          <p className="text-2xl font-black text-sky-700 mt-1">
            ₹{stats.todayPurchaseTotal.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 border border-slate-200 p-1 rounded-xl bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterTab === 'all' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isMr ? 'सर्व सप्लायर्स' : 'All Suppliers'} ({suppliers.length})
          </button>
          <button
            onClick={() => setFilterTab('due')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterTab === 'due' ? 'bg-white shadow-xs text-rose-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isMr ? 'देणी बाकी' : 'With Pending Dues'} ({suppliersWithDue})
          </button>
          <button
            onClick={() => setFilterTab('settled')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterTab === 'settled' ? 'bg-white shadow-xs text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isMr ? 'पूर्ण चुकती' : 'Settled (₹0 Due)'} ({suppliers.length - suppliersWithDue})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isMr ? 'नाव, संपर्क, किंवा GSTIN शोधा...' : 'Search vendor, contact, GSTIN...'}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">{isMr ? 'सप्लायर / कंपनी' : 'Distributor / Agency'}</th>
              <th className="p-3">{isMr ? 'संपर्क व्यक्ती व फोन' : 'Contact & Mobile'}</th>
              <th className="p-3">{isMr ? 'जीएसटी व ड्रग्ज लायसन्स' : 'GSTIN & DL Number'}</th>
              <th className="p-3">{isMr ? 'पत्ता / शहर' : 'City / Address'}</th>
              <th className="p-3 text-right">{isMr ? 'देणी बाकी (Payable Due)' : 'Outstanding Due'}</th>
              <th className="p-3 text-center">{isMr ? 'कृती' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((sup, idx) => (
                <tr key={sup.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block text-xs">{sup.name}</span>
                    {sup.email && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-2.5 h-2.5" /> {sup.email}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-slate-800 block">{sup.contactPerson || 'Office Sales'}</span>
                    <span className="text-[11px] text-sky-600 flex items-center gap-1 font-mono">
                      <Phone className="w-2.5 h-2.5" /> +91 {sup.mobile}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    <span className="text-slate-700 block font-semibold">{sup.gstin || '27AABCP1234A1Z5'}</span>
                    <span className="text-slate-400 text-[10px]">DL: {sup.dlNumber || 'MH-PUN-20B/21B'}</span>
                  </td>
                  <td className="p-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[160px]">{sup.address || 'Pune District'}</span>
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {sup.currentDue > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold font-mono text-xs">
                        ₹{sup.currentDue.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                        ✓ Fully Paid
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {sup.currentDue > 0 && (
                        <button
                          onClick={() => handleOpenSettle(sup)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>{isMr ? 'पैसे द्या' : 'Pay Due'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/purchases')}
                        className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-lg font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>{isMr ? 'खरेदी बिल' : '+ Bill'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                  {isMr ? 'कोणतेही सप्लायर आढळले नाहीत.' : 'No suppliers matching filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD SUPPLIER */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isMr ? 'नवीन सप्लायर नोंदवा' : 'Register New Distributor / Supplier'}
        subtitle="Add pharmaceutical vendor details, GSTIN, and Drug License credentials"
        icon={<Truck className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4 pt-1 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isMr ? 'कंपनी / सप्लायर नाव *' : 'Distributor / Agency Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pune Pharma Distributors"
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isMr ? 'संपर्क व्यक्ती नाव' : 'Contact Person'}
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Vikas Deshmukh"
                className="w-full border border-slate-300 rounded-xl p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isMr ? 'मोबाईल नंबर *' : 'Mobile Number *'}
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9822012345"
                className="w-full border border-slate-300 rounded-xl p-2 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="27AABCP1234A1Z5"
                className="w-full border border-slate-300 rounded-xl p-2 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Drug License (DL) Number</label>
              <input
                type="text"
                value={dlNumber}
                onChange={(e) => setDlNumber(e.target.value)}
                placeholder="20B/21B-PUN-8921"
                className="w-full border border-slate-300 rounded-xl p-2 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orders@agency.com"
                className="w-full border border-slate-300 rounded-xl p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Office / Warehouse Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Marketyard, Pune"
                className="w-full border border-slate-300 rounded-xl p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isMr ? 'सप्लायर सेव्ह करा' : 'Save Supplier'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SETTLE SUPPLIER PAYMENT */}
      <Modal
        isOpen={!!settlingSupplier}
        onClose={() => setSettlingSupplier(null)}
        title={isMr ? 'सप्लायर पेमेंट नोंद' : 'Record Supplier Payment'}
        subtitle={`Settle outstanding payable for ${settlingSupplier?.name || ''}`}
        icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
        maxWidth="max-w-md"
      >
        {settlingSupplier && (
          <form onSubmit={handleConfirmSettle} className="space-y-4 pt-1 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex justify-between items-center">
              <div>
                <span className="font-bold text-rose-900 block">{settlingSupplier.name}</span>
                <span className="text-[11px] text-rose-700">Mobile: +91 {settlingSupplier.mobile}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-rose-600 uppercase font-bold block">Current Due</span>
                <span className="text-lg font-black text-rose-800 font-mono">
                  ₹{settlingSupplier.currentDue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                required
                min={1}
                max={settlingSupplier.currentDue}
                value={settleAmount}
                onChange={(e) => setSettleAmount(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-white font-mono font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tender / Transfer Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'NEFT', 'CASH'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSettlePaymentMode(mode)}
                    className={`p-2 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                      settlePaymentMode === mode
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reference / Note</label>
              <input
                type="text"
                value={settleNotes}
                onChange={(e) => setSettleNotes(e.target.value)}
                placeholder="e.g. Bank Ref / Cheque No / PhonePe"
                className="w-full border border-slate-300 rounded-xl p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSettlingSupplier(null)}
                className="px-4 py-2 font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Payment (₹{settleAmount})</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
