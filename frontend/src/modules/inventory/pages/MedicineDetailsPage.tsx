import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Plus, Layers, Calendar, DollarSign, Package } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import { Modal } from '../../../components/ui/Modal';

export const MedicineDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useUIStore();
  const navigate = useNavigate();
  const { medicines, addBatchToMedicine, adjustBatchStock, updateMedicine } = usePharmacyStore();

  const medicine = medicines.find((m) => m.id === id) || medicines[0];

  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchNo, setNewBatchNo] = useState('');
  const [newExpiry, setNewExpiry] = useState('2028-06-30');
  const [newCost, setNewCost] = useState(16.0);
  const [newMrp, setNewMrp] = useState(35.0);
  const [newSelling, setNewSelling] = useState(32.0);
  const [newStock, setNewStock] = useState(30);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(medicine?.name || '');
  const [editGeneric, setEditGeneric] = useState(medicine?.genericName || '');
  const [editCategory, setEditCategory] = useState(medicine?.category || '');
  const [editRack, setEditRack] = useState(medicine?.rackLocation || 'A-01');
  const [editMinStock, setEditMinStock] = useState(medicine?.minStockAlert || 15);
  const [editHsn, setEditHsn] = useState(medicine?.hsnCode || '3004');
  const [editManufacturer, setEditManufacturer] = useState(medicine?.manufacturer || '');
  const [editRequiresPrescription, setEditRequiresPrescription] = useState(medicine?.requiresPrescription || false);

  const [adjustingBatch, setAdjustingBatch] = useState<{ batchNumber: string; currentStock: number } | null>(null);
  const [adjustedQty, setAdjustedQty] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Physical Stock Audit Count');

  const handleOpenEdit = () => {
    if (medicine) {
      setEditName(medicine.name);
      setEditGeneric(medicine.genericName);
      setEditCategory(medicine.category);
      setEditRack(medicine.rackLocation || 'A-01');
      setEditMinStock(medicine.minStockAlert);
      setEditHsn(medicine.hsnCode || '3004');
      setEditManufacturer(medicine.manufacturer || '');
      setEditRequiresPrescription(medicine.requiresPrescription || false);
    }
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine) return;
    updateMedicine(medicine.id, {
      name: editName,
      genericName: editGeneric,
      category: editCategory,
      rackLocation: editRack,
      minStockAlert: Number(editMinStock),
      hsnCode: editHsn,
      manufacturer: editManufacturer,
      requiresPrescription: editRequiresPrescription
    });
    setShowEditModal(false);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine || !adjustingBatch) return;
    adjustBatchStock(medicine.id, adjustingBatch.batchNumber, adjustedQty, adjustmentReason);
    setAdjustingBatch(null);
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchNo || !medicine) return;

    addBatchToMedicine(medicine.id, {
      batchNumber: newBatchNo,
      expiryDate: newExpiry,
      purchasePrice: Number(newCost),
      mrp: Number(newMrp),
      sellingPrice: Number(newSelling),
      currentStock: Number(newStock)
    });

    setShowAddBatchModal(false);
    setNewBatchNo('');
  };

  if (!medicine) {
    return (
      <div className="p-8 text-center text-slate-500">
        Medicine not found. <button onClick={() => navigate('/stock')} className="text-sky-600 underline">Back to catalog</button>
      </div>
    );
  }

  // Sort batches by expiry date (FEFO)
  const sortedBatches = [...medicine.batches].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Top Bar with Back and Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => navigate('/stock')}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToMedicines')}</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{medicine.name}</h1>
              {medicine.requiresPrescription && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wider">
                  Rx Schedule H
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {medicine.genericName} • {medicine.category} • HSN: {medicine.hsnCode || '3004'} {medicine.manufacturer ? `• Mfr: ${medicine.manufacturer}` : ''} • Rack: {medicine.rackLocation || 'A-01'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenEdit}
            className="px-3.5 py-2 bg-slate-100 border border-slate-200 text-xs rounded-xl font-semibold text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('editMedicine')}</span>
          </button>
          <button
            onClick={() => setShowAddBatchModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addNewBatch')}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            {t('totalStockUnits')}
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {medicine.totalStock} <span className="text-xs font-normal text-slate-500">{medicine.unit}s</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Maximum Retail Price (MRP)
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ₹{medicine.mrp.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Counter Selling Price
          </span>
          <p className="text-2xl font-black text-sky-600 mt-1">
            ₹{medicine.sellingPrice.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Min Stock Alert Level
          </span>
          <p className="text-2xl font-black text-slate-700 mt-1">
            {medicine.minStockAlert} <span className="text-xs font-normal text-slate-500">{medicine.unit}s</span>
          </p>
        </div>
      </div>

      {/* Batch-wise Stock Breakdown (FEFO Order) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Batch-wise Stock Breakdown (FEFO Order)</h3>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md font-mono font-semibold">
            Earliest expiring batch is billed first
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Batch No</th>
              <th className="p-3">Expiry Date</th>
              <th className="p-3 text-right">Purchase Cost</th>
              <th className="p-3 text-right">MRP</th>
              <th className="p-3 text-center">Remaining Stock</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sortedBatches.map((batch, idx) => {
              const isFirstWithStock = idx === 0 && batch.currentStock > 0;
              return (
                <tr
                  key={batch.id}
                  className={isFirstWithStock ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}
                >
                  <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{batch.batchNumber}</td>
                  <td className="p-3 font-semibold text-slate-700">
                    {batch.expiryDate}{' '}
                    {isFirstWithStock && <span className="text-emerald-700 text-[10px] font-bold">(Active)</span>}
                  </td>
                  <td className="p-3 text-right font-medium">₹{batch.purchasePrice.toFixed(2)}</td>
                  <td className="p-3 text-right text-slate-500">₹{batch.mrp.toFixed(2)}</td>
                  <td className="p-3 text-center font-bold text-slate-900">
                    {batch.currentStock} {medicine.unit}s
                  </td>
                  <td className="p-3 text-center">
                    {isFirstWithStock ? (
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200">
                        {t('servingNow')}
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-medium">
                        {t('queuedBatch')}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        setAdjustingBatch(batch);
                        setAdjustedQty(batch.currentStock);
                      }}
                      className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer hover:underline"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =========================================================
          UPGRADED MODAL: ADD NEW BATCH
          ========================================================= */}
      <Modal
        isOpen={showAddBatchModal}
        onClose={() => setShowAddBatchModal(false)}
        title={`Add Batch for ${medicine.name}`}
        subtitle="Record new batch number, expiry date, and unit cost"
        icon={<Layers className="w-5 h-5 text-sky-600" />}
        iconBg="bg-sky-50 border-sky-100"
      >
        <form onSubmit={handleAddBatch} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Batch Number *</label>
            <div className="relative">
              <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={newBatchNo}
                onChange={(e) => setNewBatchNo(e.target.value)}
                placeholder="e.g. DL992"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Expiry Date (FEFO Sorted) *</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Purchase Cost (₹)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Maximum Retail Price (₹)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={newMrp}
                  onChange={(e) => setNewMrp(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Selling Price (₹)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={newSelling}
                  onChange={(e) => setNewSelling(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-sky-700 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Quantity ({medicine.unit}s)</label>
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-emerald-700 text-center focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddBatchModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              Add Batch to Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Details Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${medicine.name}`}
        subtitle="Update generic composition, rack location, and alerts"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Medicine Name *</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Generic Name / Composition</label>
            <input
              type="text"
              value={editGeneric}
              onChange={(e) => setEditGeneric(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rack Location</label>
              <input
                type="text"
                value={editRack}
                onChange={(e) => setEditRack(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Stock Alert</label>
              <input
                type="number"
                value={editMinStock}
                onChange={(e) => setEditMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer</label>
              <input
                type="text"
                value={editManufacturer}
                onChange={(e) => setEditManufacturer(e.target.value)}
                placeholder="e.g. Cipla Ltd, Micro Labs"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code</label>
              <input
                type="text"
                value={editHsn}
                onChange={(e) => setEditHsn(e.target.value)}
                placeholder="3004"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-800"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editDetailReqPresc"
              checked={editRequiresPrescription}
              onChange={(e) => setEditRequiresPrescription(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
            />
            <label htmlFor="editDetailReqPresc" className="font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 text-xs">
              <span className="text-rose-600 font-bold">Rx</span> Schedule H Drug (Prescription Required)
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal (Feature 8) */}
      <Modal
        isOpen={!!adjustingBatch}
        onClose={() => setAdjustingBatch(null)}
        title="Stock Adjustment"
        subtitle={`Adjust on-hand count for Batch #${adjustingBatch?.batchNumber || ''}`}
        maxWidth="max-w-md"
      >
        {adjustingBatch && (
          <form onSubmit={handleSaveAdjustment} className="space-y-4 pt-1 text-xs">
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <span className="text-amber-800 font-semibold block">Batch #{adjustingBatch.batchNumber}</span>
              <p className="text-slate-600">
                Current Registered Stock: <strong>{adjustingBatch.currentStock} {medicine.unit}s</strong>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Physical Stock Count</label>
              <input
                type="number"
                value={adjustedQty}
                min={0}
                onChange={(e) => setAdjustedQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason for Adjustment</label>
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option>Physical Stock Audit Count</option>
                <option>Damaged in Store / Broken Packaging</option>
                <option>Expired / Returned to Distributor</option>
                <option>Theft / Shrinkage</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustingBatch(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                Save Adjustment
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
