import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#edf0f5] text-slate-800 antialiased overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto bg-[#edf0f5] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
