import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Pill, 
  PackagePlus, 
  Truck,
  Users, 
  Settings, 
  LogOut,
  Plus,
  PanelLeftClose
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { usePharmacyStore } from '../stores/pharmacyStore';
import { useAuthStore } from '../stores/authStore';

export const Sidebar: React.FC = () => {
  const { t, sidebarOpen, toggleSidebar } = useUIStore();
  const { stats } = usePharmacyStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const allNavItems = [
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
    { to: '/billing', label: t('navBilling'), icon: ReceiptText, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
    { to: '/stock', label: t('navStock'), icon: Pill, badge: stats.lowStockCount, badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30', roles: ['ADMIN', 'PHARMACIST'] },
    { to: '/purchases', label: t('navPurchases'), icon: PackagePlus, roles: ['ADMIN', 'PHARMACIST'] },
    { to: '/suppliers', label: t('navSuppliers'), icon: Truck, roles: ['ADMIN', 'PHARMACIST'] },
    { to: '/customers', label: t('navCustomers'), icon: Users, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
    { to: '/settings', label: t('navSettings'), icon: Settings, roles: ['ADMIN'] },
  ];

  // Filter navigation items by staff user role
  const navItems = allNavItems.filter((item) => !user || item.roles.includes(user.role));

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && sidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside 
        className={`bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none transition-all duration-300 ease-in-out z-50 ${
          sidebarOpen 
            ? 'w-72 md:w-64 fixed md:static inset-y-0 left-0 shadow-2xl md:shadow-none translate-x-0' 
            : 'fixed md:static inset-y-0 left-0 -translate-x-full md:translate-x-0 md:w-0 border-none opacity-0 overflow-hidden'
        }`}
      >
        {/* Brand Header with Toggle Close Button */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white font-black text-xl shadow-md">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight tracking-wide">MedEasy</h2>
              <p className="text-xs text-emerald-400 font-medium">Pharmacy OS</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Close menu"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 md:py-2.5 rounded-xl transition-all text-xs font-semibold ${
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

        {/* User Footer Profile */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center ring-2 ring-emerald-500/30">
              {user?.fullName?.charAt(0) || 'N'}
            </div>
            <div>
              <p className="text-white font-semibold truncate max-w-[130px]">
                {user ? `${user.fullName} (${user.role})` : 'Ninaad Kumbhar (ADMIN)'}
              </p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Logout"
            className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
