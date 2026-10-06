import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  History, 
  PackagePlus, 
  Search, 
  Building2, 
  Eye
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import type { PurchaseInvoice, PurchaseInvoiceItem, PurchasePaymentMode } from '../../../types/pharmacy.types';
import { Modal } from '../../../components/ui/Modal';

export const PurchasePage: React.FC = () => {
  const { t } = useUIStore();
  const { suppliers, purchases, addPurchase, fetchPurchases, fetchSuppliers } = usePharmacyStore();

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
  }, [fetchPurchases, fetchSuppliers]);

  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');
  const [historySearch, setHistorySearch] = useState('');

  // Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || '');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<PurchasePaymentMode>('BANK_TRANSFER');
  const [notes, setNotes] = useState('');

  // Items State
  const [items, setItems] = useState<PurchaseInvoiceItem[]>([]);

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmptyItemsModal, setShowEmptyItemsModal] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<PurchaseInvoice | null>(null);
  const [lastSavedPurchase, setLastSavedPurchase] = useState<{ inv: string; total: number; supplier: string; itemsCount: number } | null>(null);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
  const gstAmount = Number((subtotal * 0.12).toFixed(2));
  const netTotal = Number((subtotal + gstAmount).toFixed(2));

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supId = e.target.value;
    setSelectedSupplierId(supId);
    const sup = suppliers.find((s) => s.id === supId);
    if (sup) setSupplierName(sup.name);
  };

  const handleAddItemRow = () => {
    const nextLine = items.length + 1;
    const newItem: PurchaseInvoiceItem = {
      id: `pi-${Date.now()}`,
      lineNumber: nextLine,
      medicineName: '',
      batchNumber: '',
      expiryDate: '2028-12-31',
      purchasePrice: 0.00,
      mrp: 0.00,
      sellingPrice: 0.00,
      quantity: 1,
      freeQuantity: 0,
      gstRate: 12.00,
      totalAmount: 0.00
    };
    setItems([...items, newItem]);
  };

  const handleRemoveRow = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof PurchaseInvoiceItem, value: any) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'purchasePrice' || field === 'quantity' || field === 'gstRate') {
          const rawTotal = Number(updated.purchasePrice) * Number(updated.quantity);
          const itemGst = rawTotal * (Number(updated.gstRate || 12) / 100);
          updated.totalAmount = Number((rawTotal + itemGst).toFixed(2));
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
      supplierId: selectedSupplierId,
      supplierName,
      supplierInvoiceNumber,
      purchaseDate,
      subtotal,
      discountAmount: 0,
      taxableAmount: subtotal,
      gstAmount,
      netTotal,
      paymentMode,
      status: 'RECEIVED',
      notes,
      items
    });

    setLastSavedPurchase({
      inv: supplierInvoiceNumber,
      total: netTotal,
      supplier: supplierName,
      itemsCount: items.length
    });
    setShowSuccessModal(true);
    setSupplierInvoiceNumber(`PPD-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Filter history
  const filteredPurchases = purchases.filter((p) => {
    const term = historySearch.toLowerCase();
    return (
      p.supplierInvoiceNumber.toLowerCase().includes(term) ||
      p.supplierName.toLowerCase().includes(term) ||
      p.purchaseDate.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            📦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('purchaseTitle')}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                FEFO Vault Auto-Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t('purchaseSub')}</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('entry')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'entry' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('tabPurchaseEntry')}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white shadow-xs text-sky-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-sky-600" />
            <span>{t('tabPurchaseHistory')} ({purchases.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'entry' ? (
        <div className="space-y-5">
          {/* Top Inward Metadata Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Distributor & Invoice Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('selectSupplier')} *</label>
                <select
                  value={selectedSupplierId}
                  onChange={handleSupplierChange}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.dlNumber || 'Verified'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('invoiceNumber')} *</label>
                <input
                  type="text"
                  value={supplierInvoiceNumber}
                  onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('invoiceDate')} *</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Mode (Settled) *</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PurchasePaymentMode)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS)</option>
                  <option value="UPI">UPI / QR Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Debit / Corporate Card</option>
                </select>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs">
              <label className="block font-semibold text-slate-700 mb-1">Inward Notes / Physical Challan Ref</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Physical challan verified, tamper seals intact"
                className="w-full border border-slate-200 rounded-xl p-2 bg-slate-50 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Inward Medicine Batches</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Saving this invoice will automatically increment current stock in the FEFO database.
                </p>
              </div>
              <button
                onClick={handleAddItemRow}
                className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item Row</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3 w-10">#</th>
                    <th className="p-3">Medicine Name</th>
                    <th className="p-3 w-28">Batch No</th>
                    <th className="p-3 w-32">Expiry (YYYY-MM-DD)</th>
                    <th className="p-3 w-24 text-right">Cost (₹)</th>
                    <th className="p-3 w-24 text-right">MRP (₹)</th>
                    <th className="p-3 w-24 text-right">Selling (₹)</th>
                    <th className="p-3 w-20 text-center">Qty</th>
                    <th className="p-3 w-20 text-center">GST %</th>
                    <th className="p-3 w-28 text-right">Line Total</th>
                    <th className="p-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <PackagePlus className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                          <p className="font-semibold text-slate-600 text-sm">No items added to this inward invoice yet</p>
                          <p className="text-[11px] text-slate-400">Click '+ Add Item Row' above to start entering received medicines.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.medicineName}
                          onChange={(e) => handleUpdateItem(item.id, 'medicineName', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-1.5 font-bold text-slate-900 bg-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(e) => handleUpdateItem(item.id, 'batchNumber', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-1.5 font-mono uppercase bg-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => handleUpdateItem(item.id, 'expiryDate', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-[11px]"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.purchasePrice}
                          onChange={(e) => handleUpdateItem(item.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                          className="w-20 border border-slate-200 rounded-lg p-1.5 text-right font-mono font-medium bg-white"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.mrp}
                          onChange={(e) => handleUpdateItem(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                          className="w-20 border border-slate-200 rounded-lg p-1.5 text-right font-mono bg-white"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.sellingPrice}
                          onChange={(e) => handleUpdateItem(item.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                          className="w-20 border border-slate-200 rounded-lg p-1.5 text-right font-mono font-semibold text-emerald-600 bg-white"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-16 border border-slate-200 rounded-lg p-1.5 text-center font-bold bg-white"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={item.gstRate || 12}
                          onChange={(e) => handleUpdateItem(item.id, 'gstRate', parseFloat(e.target.value) || 12)}
                          className="w-14 border border-slate-200 rounded-lg p-1.5 text-center font-mono text-[11px] bg-white"
                        />
                      </td>
                      <td className="p-3 text-right font-black text-slate-900 font-mono">
                        ₹{item.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRemoveRow(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>

            {/* Inward Calculation Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span>Total Items: <strong>{items.length} lines</strong></span>
                <span className="mx-2">•</span>
                <span>Total Units: <strong>{items.reduce((s, i) => s + i.quantity, 0)} units</strong></span>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right text-xs space-y-1">
                  <div className="text-slate-500">Subtotal: <strong className="text-slate-800">₹{subtotal.toFixed(2)}</strong></div>
                  <div className="text-slate-500">GST (12%): <strong className="text-slate-800">₹{gstAmount.toFixed(2)}</strong></div>
                  <div className="text-sm font-bold text-slate-900">
                    Net Inward Total: <span className="text-xl font-black text-emerald-600 font-mono">₹{netTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSavePurchase}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('savePurchase')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Proper Purchase History View (matching v_purchase_history) */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by invoice number or distributor..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
            </div>
            <span className="text-xs text-slate-500">
              Showing {filteredPurchases.length} recorded supplier invoices
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Invoice Number</th>
                <th className="p-3">Distributor Agency</th>
                <th className="p-3">Purchase Date</th>
                <th className="p-3 text-center">Lines</th>
                <th className="p-3 text-center">Total Units</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Net Amount</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPurchases.map((pur, idx) => (
                <tr key={pur.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{pur.supplierInvoiceNumber}</td>
                  <td className="p-3 font-semibold text-sky-700">{pur.supplierName}</td>
                  <td className="p-3 text-slate-600">{pur.purchaseDate}</td>
                  <td className="p-3 text-center font-medium">{pur.lineCount || pur.items.length}</td>
                  <td className="p-3 text-center font-bold text-slate-800">
                    {pur.totalUnits || pur.items.reduce((s, i) => s + i.quantity, 0)}
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {pur.paymentMode}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                      {pur.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-black text-slate-900 font-mono text-xs">
                    ₹{pur.netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setViewingPurchase(pur)}
                      className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-lg font-semibold text-[11px] transition flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Items</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: VIEW PURCHASE ITEMS */}
      <Modal
        isOpen={!!viewingPurchase}
        onClose={() => setViewingPurchase(null)}
        title={`Purchase Invoice ${viewingPurchase?.supplierInvoiceNumber || ''}`}
        subtitle={`Supplier: ${viewingPurchase?.supplierName || ''} • Date: ${viewingPurchase?.purchaseDate || ''}`}
        maxWidth="max-w-2xl"
      >
        {viewingPurchase && (
          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500">Tender Mode:</span>{' '}
                <strong className="text-slate-800">{viewingPurchase.paymentMode}</strong>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>{' '}
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  {viewingPurchase.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Net Invoice Total:</span>{' '}
                <strong className="text-emerald-600 font-mono text-sm">₹{viewingPurchase.netTotal.toFixed(2)}</strong>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Medicine</th>
                  <th className="p-2.5">Batch</th>
                  <th className="p-2.5">Expiry</th>
                  <th className="p-2.5 text-right">Cost</th>
                  <th className="p-2.5 text-right">MRP</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewingPurchase.items.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900">{it.medicineName}</td>
                    <td className="p-2.5 font-mono">{it.batchNumber}</td>
                    <td className="p-2.5 text-slate-600">{it.expiryDate}</td>
                    <td className="p-2.5 text-right font-mono">₹{it.purchasePrice.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-mono">₹{it.mrp.toFixed(2)}</td>
                    <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      ₹{it.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingPurchase(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: SUCCESS */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Purchase Inward Saved"
        subtitle="Stock has been added to FEFO vault"
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
      >
        {lastSavedPurchase && (
          <div className="space-y-4 text-center text-xs">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
              <p className="text-slate-500">Invoice: <strong className="text-slate-800">{lastSavedPurchase.inv}</strong></p>
              <p className="text-slate-500">Supplier: <strong className="text-slate-800">{lastSavedPurchase.supplier}</strong></p>
              <p className="text-2xl font-black text-emerald-600 font-mono mt-1">₹{lastSavedPurchase.total.toFixed(2)}</p>
              <p className="text-[11px] text-emerald-700">
                {lastSavedPurchase.itemsCount} medicine batches successfully entered into counter stock.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: EMPTY ITEMS WARNING */}
      <Modal
        isOpen={showEmptyItemsModal}
        onClose={() => setShowEmptyItemsModal(false)}
        title="No Items Added"
        subtitle="Please add at least one medicine batch before saving"
      >
        <div className="space-y-4 pt-1 text-xs">
          <p className="text-slate-600">
            A purchase invoice requires at least one medicine line item with quantity and purchase price.
          </p>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowEmptyItemsModal(false)}
              className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition cursor-pointer"
            >
              OK, Add Item
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
