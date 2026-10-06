import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Pill, 
  PackagePlus, 
  Users 
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';

export const AppLayout: React.FC = () => {
  const { t } = useUIStore();
  const { user } = useAuthStore();

  const mobileNavItems = [
    { to: '/dashboard', label: t('navDashboard') || 'Dash', icon: LayoutDashboard, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
    { to: '/billing', label: t('navBilling') || 'Billing', icon: ReceiptText, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
    { to: '/stock', label: t('navStock') || 'Stock', icon: Pill, roles: ['ADMIN', 'PHARMACIST'] },
    { to: '/purchases', label: t('navPurchases') || 'Inward', icon: PackagePlus, roles: ['ADMIN', 'PHARMACIST'] },
    { to: '/customers', label: t('navCustomers') || 'Clients', icon: Users, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
  ].filter(item => !user || item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-[#edf0f5] text-slate-800 antialiased overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto bg-[#edf0f5] p-3 sm:p-5 lg:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on screens < md) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] flex items-center justify-around"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition text-[10px] font-semibold ${
                  isActive
                    ? 'text-sky-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg transition ${isActive ? 'bg-sky-50 text-sky-600' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="truncate max-w-[56px] text-center mt-0.5">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

