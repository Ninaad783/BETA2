import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, AlertTriangle, Clock, Users, Database, Check, X, Pill, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { usePharmacyStore } from '../stores/pharmacyStore';

export const TopHeader: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, activeNotificationCount, sidebarOpen, toggleSidebar } = useUIStore();
  const { searchQuery, setSearchQuery, stats, medicines, customers } = usePharmacyStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close notification and search popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingMeds = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4);

  const matchingCusts = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery)
  ).slice(0, 3);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-xs sticky top-0 z-40">
      {/* Left Area: Toggle Side Panel & Global Quick Search */}
      <div className="flex items-center gap-3">
        {/* Toggle Side Panel Button */}
        <button
          onClick={toggleSidebar}
          className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 text-xs font-bold shadow-xs ${
            !sidebarOpen
              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200'
              : 'text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 bg-slate-50'
          }`}
          title={sidebarOpen ? "Hide side panel" : "Show side panel"}
        >
          {sidebarOpen ? (
            <>
              <PanelLeftClose className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Hide Menu</span>
            </>
          ) : (
            <>
              <PanelLeftOpen className="w-4 h-4 text-white" />
              <span>Show Menu</span>
            </>
          )}
        </button>

        {/* Global Quick Search with Live Dropdown */}
        <div className="relative w-72 sm:w-88" ref={searchRef}>
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search medicine, customer, rack location..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none transition bg-slate-50/70 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Live Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim() !== '' && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 divide-y divide-slate-100 text-xs animate-in fade-in zoom-in-95 duration-100">
            {matchingMeds.length > 0 || matchingCusts.length > 0 ? (
              <>
                {matchingMeds.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                      Medicines ({matchingMeds.length})
                    </span>
                    {matchingMeds.map((med) => (
                      <div
                        key={med.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          navigate(`/stock/${med.id}`);
                        }}
                        className="px-2.5 py-2 hover:bg-sky-50/70 rounded-xl cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                            <Pill className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{med.name}</p>
                            <p className="text-[11px] text-slate-500">{med.genericName} • Rack {med.rackLocation || 'A-01'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">₹{med.sellingPrice.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 block">{med.totalStock} {med.unit}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {matchingCusts.length > 0 && (
                  <div className="p-2 bg-slate-50/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                      Customers ({matchingCusts.length})
                    </span>
                    {matchingCusts.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          navigate(`/customers/${cust.id}`);
                        }}
                        className="px-2.5 py-2 hover:bg-sky-50/70 rounded-xl cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{cust.fullName}</p>
                            <p className="text-[11px] text-slate-500">{cust.mobile}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-700 font-semibold font-mono text-[11px]">
                            ₹{cust.totalPurchases.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{cust.totalBills} bills</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-slate-400">
                <p className="font-semibold text-slate-600">No results found</p>
                <p className="text-[11px] mt-0.5">Try searching medicine name, generic salt, or customer mobile</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

      {/* Notification & Language Controls */}
      <div className="flex items-center space-x-3">
        {/* Notifications Bell with Modern Popover */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl border transition cursor-pointer ${
              showNotifications
                ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-xs'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
            }`}
            title="Pharmacy Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-xs animate-bounce">
                {activeNotificationCount}
              </span>
            )}
          </button>

          {/* Sleek Notification Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs tracking-wide">Live Pharmacy Alerts</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automated store warnings</p>
                </div>
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  17 Critical
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {/* Low Stock Alert */}
                <div className="p-3.5 hover:bg-amber-50/50 flex gap-3 transition">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Low Stock Warning</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {stats.lowStockCount} medicines are below minimum threshold (e.g. Pantoprazole 40, ORS).
                    </p>
                    <span className="text-[10px] text-amber-700 font-semibold mt-1 inline-block">Action: Reorder list generated</span>
                  </div>
                </div>

                {/* Expiry Alert */}
                <div className="p-3.5 hover:bg-rose-50/50 flex gap-3 transition">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Near-Expiry Warning</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {stats.expiringSoonBatchesCount} batches expiring within 90 days. Total value: <strong className="text-rose-700">₹{stats.expiringSoonValue}</strong>.
                    </p>
                    <span className="text-[10px] text-rose-700 font-semibold mt-1 inline-block">Action: Prioritize in counter sales</span>
                  </div>
                </div>

                {/* Customer Base Overview */}
                <div className="p-3.5 hover:bg-sky-50/50 flex gap-3 transition">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Registered Customer Profiles</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {stats.totalCustomersCount} active customer profiles for fast bill identification and purchase tracking.
                    </p>
                    <span className="text-[10px] text-sky-700 font-semibold mt-1 inline-block">Counter directory active</span>
                  </div>
                </div>

                {/* System Backup */}
                <div className="p-3.5 hover:bg-emerald-50/50 flex gap-3 transition">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Daily Cloud Backup Safe</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Database snapshot synchronized at 02:00 PM today.
                    </p>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-flex items-center gap-1">
                      <Check className="w-3 h-3" /> Integrity verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Close Notification Center
                </button>
              </div>
            </div>
          )}
        </div>

        {/* English / Marathi Language Switcher */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-0.5 rounded-md font-semibold transition ${
              language === 'en'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('mr')}
            className={`px-2.5 py-0.5 rounded-md font-semibold transition ${
              language === 'mr'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            मराठी
          </button>
        </div>
      </div>
    </header>
  );
};
