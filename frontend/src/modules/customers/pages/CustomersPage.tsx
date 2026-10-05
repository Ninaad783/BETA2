import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  UserPlus, 
  Phone, 
  MapPin, 
  User, 
  Users, 
  Receipt, 
  ShoppingBag, 
  History,
  CheckCircle2
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import { Modal } from '../../../components/ui/Modal';

export const CustomersPage: React.FC = () => {
  const { t, language } = useUIStore();
  const isMr = language === 'mr';
  const navigate = useNavigate();
  const { customers, addCustomer, setSelectedCustomerId } = usePharmacyStore();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Customer Form
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search)
  );

  const totalLifetimePurchases = customers.reduce((sum, c) => sum + c.totalPurchases, 0);
  const totalBillsAcrossCustomers = customers.reduce((sum, c) => sum + c.totalBills, 0);
  const frequentBuyersCount = customers.filter((c) => c.totalBills >= 10).length;
  const avgBillSize = totalBillsAcrossCustomers > 0 
    ? Math.round(totalLifetimePurchases / totalBillsAcrossCustomers) 
    : 0;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;
    addCustomer({ fullName: name, mobile, address: address || '' });
    setShowAddModal(false);
    setName('');
    setMobile('');
    setAddress('');
  };

  const handleStartBillForCustomer = (customerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomerId(customerId);
    navigate('/billing');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            👥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('customerTitle')}</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200/60">
                <Users className="w-3 h-3 text-sky-600" />
                {customers.length} {isMr ? 'नोंदणीकृत' : 'Profiles'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t('customerSub')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addCustomer')}</span>
          </button>
          <button
            onClick={() => navigate('/billing')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{t('newBillBtn')}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Analytics Cards (v_customer_purchase_summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-l-4 border-l-sky-500 border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-md transition">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">
            {t('registeredCustomers')}
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {customers.length} <span className="text-xs font-normal text-slate-400">clients</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Quick lookup on POS counter</span>
        </div>

        <div className="bg-white border-l-4 border-l-emerald-500 border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-md transition">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            {t('lifetimeCustomerSpend')}
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            ₹{totalLifetimePurchases.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Across {totalBillsAcrossCustomers} total invoices</span>
        </div>

        <div className="bg-white border-l-4 border-l-indigo-500 border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-md transition">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
            {t('frequentBuyers')}
          </span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {frequentBuyersCount} <span className="text-xs font-normal text-slate-400">loyal buyers</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">&gt; 10 repeat medicine bills</span>
        </div>

        <div className="bg-white border-l-4 border-l-teal-500 border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:shadow-md transition">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
            {t('avgBillValue')}
          </span>
          <p className="text-2xl font-black text-teal-600 mt-1">
            ₹{avgBillSize.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Average basket per checkout</span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isMr ? 'नाव किंवा मोबाईल नंबर शोधा...' : 'Search customer by name or mobile...'}
              className="text-xs border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 w-72 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>
          <span className="text-xs text-slate-500">
            Showing {filteredCustomers.length} registered counter customers
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">{t('thCustomerName')}</th>
              <th className="p-3">{t('thMobile')}</th>
              <th className="p-3 text-right">{t('thTotalPurchase')}</th>
              <th className="p-3 text-center">{t('thTotalBills')}</th>
              <th className="p-3">{t('thLastPurchase')}</th>
              <th className="p-3">{isMr ? 'पत्ता' : 'Location / Address'}</th>
              <th className="p-3 text-center">{isMr ? 'कृती' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((cust, idx) => (
                <tr
                  key={cust.id}
                  onClick={() => navigate(`/customers/${cust.id}`)}
                  className="hover:bg-sky-50/40 cursor-pointer transition"
                >
                  <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3">
                    <span className="font-bold text-sky-700 hover:underline block text-xs">
                      {cust.fullName}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      +91 {cust.mobile}
                    </span>
                  </td>
                  <td className="p-3 text-right font-black text-slate-900 font-mono">
                    ₹{cust.totalPurchases.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {cust.totalBills} {isMr ? 'बिले' : 'bills'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-medium">
                    {cust.lastPurchaseDate}
                  </td>
                  <td className="p-3 text-slate-500">
                    <span className="flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {cust.address || '—'}
                    </span>
                  </td>
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => navigate(`/customers/${cust.id}`)}
                        className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold hover:bg-slate-200 transition cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <History className="w-3 h-3 text-slate-500" />
                        <span>{t('historyBtn')}</span>
                      </button>
                      <button
                        onClick={(e) => handleStartBillForCustomer(cust.id, e)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <ShoppingBag className="w-3 h-3 text-emerald-600" />
                        <span>{isMr ? 'बिल' : 'New Bill'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  {isMr ? 'कोणतेही ग्राहक आढळले नाहीत.' : 'No customers matching search query.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD CUSTOMER */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isMr ? 'नवीन ग्राहक नोंदणी' : 'Register New Customer Profile'}
        subtitle="Save customer contact details for billing and purchase history tracking"
        icon={<UserPlus className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {isMr ? 'ग्राहकाचे पूर्ण नाव *' : 'Customer Full Name *'}
            </label>
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
            <label className="block font-semibold text-slate-700 mb-1.5">
              {isMr ? 'मोबाईल नंबर *' : 'Mobile Number *'}
            </label>
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
            <label className="block font-semibold text-slate-700 mb-1.5">
              {isMr ? 'पत्ता / गाव' : 'Address / Village'}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. MG Road, Near Bus Station"
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
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isMr ? 'ग्राहक सेव्ह करा' : 'Save Customer'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
