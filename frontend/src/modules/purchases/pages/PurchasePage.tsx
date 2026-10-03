import React, { useState } from 'react';
import { Save, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import type { PurchaseItemEntry } from '../../../types/pharmacy.types';
import { Modal } from '../../../components/ui/Modal';

export const PurchasePage: React.FC = () => {
  const { t } = useUIStore();
  const { suppliers, addPurchase } = usePharmacyStore();

  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || 'Pune Pharma Distributors');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-99214');
  const [invoiceDate, setInvoiceDate] = useState('2026-10-02');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'CREDIT'>('PAID');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmptyItemsModal, setShowEmptyItemsModal] = useState(false);
  const [lastSavedPurchase, setLastSavedPurchase] = useState<{ inv: string; total: number; supplier: string; itemsCount: number } | null>(null);

  const [items, setItems] = useState<PurchaseItemEntry[]>([
    {
      id: 'pi-1',
      medicineName: 'Dolo 650',
      batchNumber: 'D1234',
      expiryDate: '2027-08-31',
      purchasePrice: 15.00,
      mrp: 35.00,
      quantity: 100,
      total: 1500.00
    },
    {
      id: 'pi-2',
      medicineName: 'Pantoprazole 40',
      batchNumber: 'P4567',
      expiryDate: '2027-01-20',
      purchasePrice: 80.00,
      mrp: 120.00,
      quantity: 50,
      total: 4000.00
    },
    {
      id: 'pi-3',
      medicineName: 'Azithromycin 500',
      batchNumber: 'A7890',
      expiryDate: '2026-06-30',
      purchasePrice: 65.00,
      mrp: 95.00,
      quantity: 50,
      total: 3250.00
    }
  ]);

  const totalInvoiceAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleAddItemRow = () => {
    const newItem: PurchaseItemEntry = {
      id: `pi-${Date.now()}`,
      medicineName: 'ORS Oral Rehydration',
      batchNumber: 'OR99',
      expiryDate: '2027-10-30',
      purchasePrice: 13.00,
      mrp: 22.00,
      quantity: 50,
      total: 650.00
    };
    setItems([...items, newItem]);
  };

  const handleRemoveRow = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof PurchaseItemEntry, value: any) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'purchasePrice' || field === 'quantity') {
          updated.total = Number(updated.purchasePrice) * Number(updated.quantity);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSavePurchase = () => {
    if (items.length === 0) {
      setShowEmptyItemsModal(true);
      return;
    }

    addPurchase({
      invoiceNumber,
      supplierName,
      date: invoiceDate,
      totalAmount: totalInvoiceAmount,
      paymentStatus,
      items
    });

    setLastSavedPurchase({
      inv: invoiceNumber,
      total: totalInvoiceAmount,
      supplier: supplierName,
      itemsCount: items.length
    });
    setShowSuccessModal(true);
    setInvoiceNumber(`INV-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            📦
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('purchaseTitle')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('purchaseSub')}</p>
          </div>
        </div>
        <button
          onClick={handleSavePurchase}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{t('savePurchase')}</span>
        </button>
      </div>

      {/* Supplier & Invoice Header Information */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">{t('selectSupplier')} *</label>
          <select
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium"
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">{t('invoiceNumber')} *</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white font-mono font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">{t('invoiceDate')} *</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as 'PAID' | 'CREDIT')}
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          >
            <option value="PAID">Paid (Bank / Cash)</option>
            <option value="CREDIT">Credit (Supplier Due)</option>
          </select>
        </div>
      </div>

      {/* Purchase Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Medicine</th>
              <th className="p-3">Batch</th>
              <th className="p-3">Expiry Date</th>
              <th className="p-3 text-right">Purchase Price</th>
              <th className="p-3 text-right">MRP</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {items.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition">
                <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                <td className="p-3">
                  <input
                    type="text"
                    value={item.medicineName}
                    onChange={(e) => handleUpdateItem(item.id, 'medicineName', e.target.value)}
                    className="border border-slate-200 rounded px-2 py-1 font-semibold text-slate-900 w-44"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={item.batchNumber}
                    onChange={(e) => handleUpdateItem(item.id, 'batchNumber', e.target.value)}
                    className="border border-slate-200 rounded px-2 py-1 font-mono text-xs w-24"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={item.expiryDate}
                    onChange={(e) => handleUpdateItem(item.id, 'expiryDate', e.target.value)}
                    className="border border-slate-200 rounded px-2 py-1 text-xs w-28"
                  />
                </td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    value={item.purchasePrice}
                    onChange={(e) => handleUpdateItem(item.id, 'purchasePrice', Number(e.target.value))}
                    className="border border-slate-200 rounded px-2 py-1 text-right font-medium w-20"
                  />
                </td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    value={item.mrp}
                    onChange={(e) => handleUpdateItem(item.id, 'mrp', Number(e.target.value))}
                    className="border border-slate-200 rounded px-2 py-1 text-right text-slate-500 w-20"
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                    className="border border-slate-200 rounded px-2 py-1 text-center font-bold w-16"
                  />
                </td>
                <td className="p-3 text-right font-bold text-slate-900">
                  ₹{item.total.toFixed(2)}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleRemoveRow(item.id)}
                    className="text-rose-500 hover:text-rose-700 p-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom calculation bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <button
            onClick={handleAddItemRow}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Row</span>
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-slate-600 font-medium">Total Invoice Amount:</span>
            <span className="text-lg font-black text-slate-900">
              ₹{totalInvoiceAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          UPGRADED MODAL: PURCHASE SAVED SUCCESS
          ========================================================= */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Purchase Invoice Recorded!"
        subtitle="Medicine batch stock has been incremented"
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
      >
        {lastSavedPurchase && (
          <div className="space-y-4 text-center text-xs">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1">
              <p className="text-slate-500">Distributor: <strong className="text-slate-800">{lastSavedPurchase.supplier}</strong></p>
              <p className="text-sm font-black font-mono text-slate-800">#{lastSavedPurchase.inv}</p>
              <p className="text-2xl font-black text-emerald-600 mt-2">₹{lastSavedPurchase.total.toFixed(2)}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-100/70 px-2.5 py-0.5 rounded-full mt-2">
                <Sparkles className="w-3 h-3" /> {lastSavedPurchase.itemsCount} Items Added to Stock
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Empty Items Modal */}
      <Modal
        isOpen={showEmptyItemsModal}
        onClose={() => setShowEmptyItemsModal(false)}
        title="Empty Invoice"
        subtitle="Please add at least one medicine item to record this purchase"
        maxWidth="max-w-sm"
      >
        <div className="pt-2 text-center space-y-4">
          <p className="text-xs text-slate-500">
            Cannot record a purchase invoice with zero items. Click "+ Add Row" to add distributor medicines.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => {
                setShowEmptyItemsModal(false);
                handleAddItemRow();
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              + Add Item Row
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
