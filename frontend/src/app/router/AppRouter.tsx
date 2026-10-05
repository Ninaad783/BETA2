import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { SuppliersPage } from '../../modules/suppliers/pages/SuppliersPage';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { DashboardPage } from '../../modules/dashboard/pages/DashboardPage';
import { BillingPage } from '../../modules/billing/pages/BillingPage';
import { StockPage } from '../../modules/inventory/pages/StockPage';
import { MedicineDetailsPage } from '../../modules/inventory/pages/MedicineDetailsPage';
import { PurchasePage } from '../../modules/purchases/pages/PurchasePage';
import { CustomersPage } from '../../modules/customers/pages/CustomersPage';
import { CustomerDetailsPage } from '../../modules/customers/pages/CustomerDetailsPage';
import { SettingsPage } from '../../modules/settings/pages/SettingsPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected App Shell Layout (Guarded by ProtectedRoute) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Accessible to all authenticated roles (ADMIN, PHARMACIST, STAFF) */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailsPage />} />

            {/* Inventory, Purchases & Suppliers: Accessible to ADMIN and PHARMACIST */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']} />}>
              <Route path="/stock" element={<StockPage />} />
              <Route path="/stock/:id" element={<MedicineDetailsPage />} />
              <Route path="/purchases" element={<PurchasePage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
            </Route>

            {/* System Configuration & Store Settings: ADMIN only */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Fallbacks */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
