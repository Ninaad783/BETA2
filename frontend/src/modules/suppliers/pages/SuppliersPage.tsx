import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  CheckCircle2,
  FileCheck,
  Building2
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import { Modal } from '../../../components/ui/Modal';

export const SuppliersPage: React.FC = () => {
  const { t, language } = useUIStore();
  const isMr = language === 'mr';
  const navigate = useNavigate();
  const { suppliers, addSupplier, stats, purchases } = usePharmacyStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Supplier Form
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [address, setAddress] = useState('');

  // Filtered suppliers
  const filteredSuppliers = suppliers.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(term)) ||
      s.mobile.includes(term) ||
      (s.gstin && s.gstin.toLowerCase().includes(term)) ||
      (s.dlNumber && s.dlNumber.toLowerCase().includes(term))
    );
  });

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
                {isMr ? 'सप्लायर्स व औषध वितरक' : 'Suppliers & Wholesale Distributors'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200/60">
                <Truck className="w-3 h-3 text-sky-600" />
                {suppliers.length} Vendors
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isMr 
                ? 'औषध वितरकांची संपर्क माहिती, जीएसटी व ड्रग्ज लायसन्स नोंदणी आणि खरेदी इनव्हॉइस.'
                : 'Manage pharmaceutical wholesale agencies, Drug License (DL), GSTIN credentials, and inward orders.'}
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
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isMr ? 'सक्रिय वितरक' : 'Active Distributors'}
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {suppliers.length} <span className="text-xs font-normal text-slate-400">Agencies</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered wholesale partners</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isMr ? 'आजची खरेदी (Purchases)' : "Today's Inward Purchases"}
          </span>
          <p className="text-2xl font-black text-sky-700 mt-1 font-mono">
            ₹{stats.todayPurchaseTotal.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Paid at Inward (100% Settled)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isMr ? 'एकूण खरेदी इनव्हॉइसेस' : 'Inward Purchase Invoices'}
          </span>
          <p className="text-2xl font-black text-indigo-700 mt-1">
            {purchases.length} <span className="text-xs font-normal text-slate-400">Bills</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Recorded in purchase history</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isMr ? 'ड्रग्ज लायसन्स (DL)' : 'Verified Drug Licenses'}
          </span>
          <p className="text-2xl font-black text-teal-700 mt-1 flex items-center gap-1.5">
            <FileCheck className="w-5 h-5 text-teal-600" />
            {suppliers.filter((s) => s.dlNumber).length} Verified
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Form 20B/21B compliance</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isMr ? 'नाव, संपर्क, किंवा GSTIN शोधा...' : 'Search distributor, contact, GSTIN, DL...'}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredSuppliers.length} of {suppliers.length} distributors
        </span>
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
              <th className="p-3">{isMr ? 'पत्ता / शहर' : 'City / Warehouse'}</th>
              <th className="p-3 text-center">{isMr ? 'स्थिती' : 'Account Status'}</th>
              <th className="p-3 text-center">{isMr ? 'कृती' : 'Action'}</th>
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
                    <span className="text-slate-400 text-[10px]">DL: {sup.dlNumber || 'MH-DL-001'}</span>
                  </td>
                  <td className="p-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{sup.address || 'Pune District'}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px]">
                      Active Partner
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => navigate('/purchases')}
                      className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-lg font-semibold text-[11px] transition flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>{isMr ? 'खरेदी नोंद' : '+ Purchase Bill'}</span>
                    </button>
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
        subtitle="Add pharmaceutical wholesale agency details, GSTIN, and Drug License credentials"
        icon={<Building2 className="w-5 h-5 text-emerald-600" />}
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
    </div>
  );
};
