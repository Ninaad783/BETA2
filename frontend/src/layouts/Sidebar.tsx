import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Pill, 
  PackagePlus, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Globe,
  ExternalLink
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { usePharmacyStore } from '../stores/pharmacyStore';

export const Sidebar: React.FC = () => {
  const { t } = useUIStore();
  const { stats } = usePharmacyStore();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/billing', label: t('navBilling'), icon: ReceiptText },
    { to: '/stock', label: t('navStock'), icon: Pill, badge: stats.lowStockCount, badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    { to: '/purchases', label: t('navPurchases'), icon: PackagePlus },
    { to: '/customers', label: t('navUdhaar'), icon: Users, badge: stats.pendingDueCustomersCount, badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' },
    { to: '/reports', label: t('navReports'), icon: BarChart3 },
    { to: '/settings', label: t('navSettings'), icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white font-black text-xl shadow-md">
          <Plus className="w-5 h-5 stroke-[3]" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base leading-tight tracking-wide">MedEasy</h2>
          <p className="text-xs text-emerald-400 font-medium">Khed Shivapur</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Product Website Link */}
      <div className="px-3 pb-2">
        <NavLink
          to="/site"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/60 hover:text-emerald-200 transition"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Product Site</span>
          </div>
          <ExternalLink className="w-3 h-3 text-emerald-400" />
        </NavLink>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 bg-slate-950/70 border-t border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center ring-2 ring-emerald-500/30">
            R
          </div>
          <div>
            <p className="text-white font-semibold">Rahul (Admin)</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          title="Logout"
          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-slate-800 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
