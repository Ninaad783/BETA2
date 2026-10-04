import React from 'react';
import { Outlet } from 'react-router-dom';
import { PanelLeftOpen } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { useUIStore } from '../stores/uiStore';

export const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen bg-[#edf0f5] text-slate-800 antialiased overflow-hidden font-sans relative">
      <Sidebar />

      {/* Docked Left-Edge Tab to Reopen Side Panel when Closed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-0 top-20 z-50 bg-slate-900 hover:bg-sky-600 text-white px-3.5 py-2.5 rounded-r-2xl shadow-2xl flex items-center gap-2 text-xs font-bold transition-all border-y border-r border-slate-700 cursor-pointer animate-in fade-in slide-in-from-left duration-150 group"
          title="Click to Open Side Menu"
        >
          <PanelLeftOpen className="w-4 h-4 text-emerald-400 group-hover:text-white" />
          <span>Open Menu</span>
        </button>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto bg-[#edf0f5] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
