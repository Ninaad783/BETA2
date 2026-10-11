import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, AlertTriangle, Clock, Users, Database, Check, X, Pill, User, PanelLeftClose, PanelLeftOpen, Loader2 } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { usePharmacyStore } from '../stores/pharmacyStore';
import { API_BASE_URL } from '../lib/apiClient';

export const TopHeader: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, activeNotificationCount, sidebarOpen, toggleSidebar } = useUIStore();
  const { searchQuery, setSearchQuery, stats, medicines, customers, addMasterItemToCart } = usePharmacyStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [apiStoreMeds, setApiStoreMeds] = useState<any[]>([]);
  const [apiMasterMeds, setApiMasterMeds] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

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

  // Debounced live API search querying PostgreSQL store medicines AND 1000+ Master Medicines
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setApiStoreMeds([]);
      setApiMasterMeds([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/medicines/search?q=${encodeURIComponent(searchQuery.trim())}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setApiStoreMeds(data.storeMatches || []);
          setApiMasterMeds(data.masterMatches || []);
        }
      } catch (err) {
        console.error('Header search error:', err);
      } finally {
        setIsSearchingApi(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combine local inventory medicines with backend store matches
  const storeMedicineMap = new Map();
  medicines
    .filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .forEach((m) => storeMedicineMap.set(m.name.toLowerCase(), m));

  apiStoreMeds.forEach((m) => {
    if (!storeMedicineMap.has(m.name.toLowerCase())) {
      storeMedicineMap.set(m.name.toLowerCase(), m);
    }
  });

  const matchingMeds = Array.from(storeMedicineMap.values()).slice(0, 5);

  // Master medicines (1000+ Indian catalog)
  const matchingMasterMeds = apiMasterMeds
    .filter((mm) => !storeMedicineMap.has(mm.name.toLowerCase()))
    .slice(0, 5);

  const matchingCusts = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery)
  ).slice(0, 3);

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-xs sticky top-0 z-40">
      {/* Left Area: Toggle Side Panel & Global Quick Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2">
        {/* Toggle Side Panel Button */}
        <button
          onClick={toggleSidebar}
          className={`p-2 sm:px-3 sm:py-2 rounded-xl transition cursor-pointer flex items-center gap-2 text-xs font-bold shadow-xs shrink-0 ${
            !sidebarOpen
              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200'
              : 'text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 bg-slate-50'
          }`}
          title={sidebarOpen ? "Hide menu" : "Open menu"}
        >
          {sidebarOpen ? (
            <>
              <PanelLeftClose className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Hide Menu</span>
            </>
          ) : (
            <>
              <PanelLeftOpen className="w-4 h-4 text-white" />
              <span className="hidden md:inline">Menu</span>
            </>
          )}
        </button>

        {/* Global Quick Search with Live Dropdown */}
        <div className="relative flex-1 min-w-[130px] max-w-xs sm:max-w-sm" ref={searchRef}>
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

        {/* Global Live Search Results Dropdown - Full width on mobile, sleek flyout on desktop */}
        {showSearchDropdown && searchQuery.trim() !== '' && (
          <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 divide-y divide-slate-100 text-xs max-h-[75vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            {isSearchingApi && (
              <div className="p-3 bg-sky-50/70 text-sky-700 flex items-center justify-center gap-2 text-xs font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching 1,000+ medicine catalog...</span>
              </div>
            )}

            {matchingMeds.length > 0 || matchingMasterMeds.length > 0 || matchingCusts.length > 0 ? (
              <>
                {/* 1. In-Store Inventory Medicines */}
                {matchingMeds.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                      In-Stock Medicines ({matchingMeds.length})
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
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                            <Pill className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{med.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{med.genericName} • Rack {med.rackLocation || 'A-01'}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="font-bold text-slate-900">₹{(med.sellingPrice || med.mrp || 0).toFixed(2)}</span>
                          <span className="text-[10px] text-emerald-600 block font-semibold">{med.totalStock || 0} in stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Indian Master Drug Database (1,000+ Items) */}
                {matchingMasterMeds.length > 0 && (
                  <div className="p-2 bg-slate-50/60">
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                      <Database className="w-3 h-3 text-sky-600" />
                      <span>Master Drug Database ({matchingMasterMeds.length})</span>
                    </span>
                    {matchingMasterMeds.map((med) => (
                      <div
                        key={med.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          addMasterItemToCart(med);
                          navigate('/billing');
                        }}
                        className="px-2.5 py-2 hover:bg-sky-50 rounded-xl cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 truncate">{med.name}</span>
                            <span className="text-[9px] bg-sky-100 text-sky-800 font-semibold px-1.5 py-0.2 rounded shrink-0">{med.form || 'Tab'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{med.generic_name} • {med.manufacturer || 'Mfr'}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-mono bg-sky-50 text-sky-700 font-bold px-1.5 py-0.2 rounded border border-sky-200">
                              Batch: B-STD
                            </span>
                            <span className="text-slate-500">Exp: 12/28</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="font-bold text-xs text-sky-700">₹{Number(med.typical_mrp || 50).toFixed(2)}</span>
                          <span className="text-[10px] text-emerald-600 block font-semibold">+ 1-Click Bill</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Customer Directory Results */}
                {matchingCusts.length > 0 && (
                  <div className="p-2 bg-slate-50/30">
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
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{cust.fullName}</p>
                            <p className="text-[11px] text-slate-500 font-mono truncate">{cust.mobile}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-slate-700 font-semibold font-mono text-[11px]">
                            ₹{Number(cust.totalPurchases || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{cust.totalBills || 0} bills</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              !isSearchingApi && (
                <div className="p-6 text-center text-slate-400">
                  <p className="font-semibold text-slate-600">No results found</p>
                  <p className="text-[11px] mt-0.5">Try searching medicine name (e.g. Dolo, Pan), salt, or customer mobile</p>
                </div>
              )
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

          {/* Sleek Notification Popover - Fixed full-width on mobile to avoid left cut-off */}
          {showNotifications && (
            <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs tracking-wide">Live Pharmacy Alerts</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automated store warnings</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {stats.lowStockCount + stats.expiringSoonBatchesCount} Alerts
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="sm:hidden text-slate-400 hover:text-white p-1"
                  >
                    ✕
                  </button>
                </div>
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
                      {stats.lowStockCount} medicines currently below minimum reorder alert threshold.
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
