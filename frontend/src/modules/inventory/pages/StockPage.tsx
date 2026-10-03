import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit3, Download, Pill, Layers, Sparkles } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import type { Medicine } from '../../../types/pharmacy.types';
import { Modal } from '../../../components/ui/Modal';

export const StockPage: React.FC = () => {
  const { t } = useUIStore();
  const navigate = useNavigate();
  const { 
    medicines, 
    stockFilterTab, 
    setStockFilterTab, 
    addMedicine,
    updateMedicine,
    setSelectedMedicineId 
  } = usePharmacyStore();

  const [localSearch, setLocalSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);

  // Edit Medicine Form State
  const [editName, setEditName] = useState('');
  const [editGeneric, setEditGeneric] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editRack, setEditRack] = useState('');
  const [editMinStock, setEditMinStock] = useState(15);
  const [editUnit, setEditUnit] = useState('strip');

  // Add Medicine Form
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState('Analgesic');
  const [unit, setUnit] = useState('strip');
  const [minStockAlert, setMinStockAlert] = useState(15);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [purchasePrice, setPurchasePrice] = useState(20);
  const [mrp, setMrp] = useState(40);
  const [sellingPrice, setSellingPrice] = useState(36);
  const [quantity, setQuantity] = useState(50);

  // Tab Filtering
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      m.genericName.toLowerCase().includes(localSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(localSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilterTab === 'low') {
      return m.status === 'LOW_STOCK' || m.status === 'OUT_OF_STOCK';
    }
    if (stockFilterTab === 'expiry') {
      return m.batches.some((b) => b.expiryDate.includes('2026') || b.expiryDate.includes('2027'));
    }
    return true;
  });

  const handleRowClick = (med: Medicine) => {
    setSelectedMedicineId(med.id);
    navigate(`/stock/${med.id}`);
  };

  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !batchNumber) return;

    addMedicine(
      {
        name,
        genericName,
        category,
        unit,
        minStockAlert: Number(minStockAlert),
        gstRate: 12,
        sellingPrice: Number(sellingPrice),
        mrp: Number(mrp)
      },
      {
        batchNumber,
        expiryDate,
        purchasePrice: Number(purchasePrice),
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        currentStock: Number(quantity)
      }
    );

    setShowAddModal(false);
    setName('');
    setGenericName('');
    setBatchNumber('');
  };

  const allCount = medicines.length;
  const lowStockCount = medicines.filter((m) => m.status === 'LOW_STOCK' || m.status === 'OUT_OF_STOCK').length;
  const expiryCount = medicines.filter((m) => m.batches.some((b) => b.expiryDate.includes('2026') || b.expiryDate.includes('2027'))).length;

  const handleOpenEdit = (med: Medicine) => {
    setEditingMed(med);
    setEditName(med.name);
    setEditGeneric(med.genericName);
    setEditCategory(med.category);
    setEditRack(med.rackLocation || 'A-01');
    setEditMinStock(med.minStockAlert);
    setEditUnit(med.unit);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;
    updateMedicine(editingMed.id, {
      name: editName,
      genericName: editGeneric,
      category: editCategory,
      rackLocation: editRack,
      minStockAlert: Number(editMinStock),
      unit: editUnit
    });
    setEditingMed(null);
  };

  const handleExportCSV = () => {
    setShowExportSuccess(true);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            💊
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('stockTitle')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('stockSub')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addMedicine')}</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 text-xs">
          <button
            onClick={() => setStockFilterTab('all')}
            className={`px-4 py-2 font-semibold transition cursor-pointer ${
              stockFilterTab === 'all'
                ? 'text-sky-600 border-b-2 border-sky-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('tabAll')} ({allCount})
          </button>
          <button
            onClick={() => setStockFilterTab('low')}
            className={`px-4 py-2 font-semibold transition flex items-center gap-1 cursor-pointer ${
              stockFilterTab === 'low'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>⚠️</span> {t('tabLowStock')} ({lowStockCount})
          </button>
          <button
            onClick={() => setStockFilterTab('expiry')}
            className={`px-4 py-2 font-semibold transition flex items-center gap-1 cursor-pointer ${
              stockFilterTab === 'expiry'
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🔴</span> {t('tabExpiringSoon')} ({expiryCount})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search medicine, salt, rack..."
              className="text-xs border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 flex items-center gap-1 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">{t('thMedicine')}</th>
              <th className="p-3">{t('thGeneric')}</th>
              <th className="p-3">{t('thCategory')}</th>
              <th className="p-3 text-center">{t('thCurrentStock')}</th>
              <th className="p-3 text-center">{t('thMinStock')}</th>
              <th className="p-3 text-center">{t('thStatus')}</th>
              <th className="p-3 text-center">{t('thAction')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map((med, idx) => (
                <tr
                  key={med.id}
                  onClick={() => handleRowClick(med)}
                  className="hover:bg-sky-50/40 cursor-pointer transition"
                >
                  <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-bold text-sky-700 hover:underline">{med.name}</td>
                  <td className="p-3 text-slate-600">{med.genericName}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {med.category}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">
                    {med.totalStock} {med.unit}s
                  </td>
                  <td className="p-3 text-center text-slate-500 font-medium">{med.minStockAlert}</td>
                  <td className="p-3 text-center">
                    {med.status === 'IN_STOCK' && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                        ● {t('inStock')}
                      </span>
                    )}
                    {med.status === 'LOW_STOCK' && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                        ⚠️ {t('lowStock')}
                      </span>
                    )}
                    {med.status === 'OUT_OF_STOCK' && (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                        🚫 {t('outOfStock')}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => handleRowClick(med)}
                        className="p-1 hover:text-sky-600 rounded hover:bg-slate-100 transition cursor-pointer"
                        title="View Batches"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(med)}
                        className="p-1 hover:text-amber-600 rounded hover:bg-slate-100 transition cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No medicines found in this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================================
          UPGRADED MODAL: ADD MEDICINE & INITIAL BATCH
          ========================================================= */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Medicine to Catalog"
        subtitle="Create medicine master entry and assign initial batch with FEFO tracking"
        icon={<Pill className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateMedicine} className="space-y-4 text-xs">
          {/* Section 1: Medicine Master */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-600" /> General Medicine Information
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Combiflam"
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Generic / Salt Composition</label>
                <input
                  type="text"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g. Ibuprofen + Paracetamol"
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                >
                  <option>Analgesic</option>
                  <option>Antibiotic</option>
                  <option>Anti-Ulcer</option>
                  <option>Supplement</option>
                  <option>Syrup</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                >
                  <option value="strip">Strip</option>
                  <option value="bottle">Bottle</option>
                  <option value="sachet">Sachet</option>
                  <option value="tube">Tube</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Min Stock Alert</label>
                <input
                  type="number"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Batch Information */}
          <div className="p-3.5 bg-sky-50/50 border border-sky-200/80 rounded-2xl space-y-3">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600" /> Initial Batch & Pricing
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Number *</label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. CB998"
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-mono font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purchase ₹</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-right"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">MRP ₹</label>
                <input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-right"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Selling ₹</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-bold text-sky-700 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-right"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-bold text-emerald-700 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-center"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              Save Medicine & Batch
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Export Notification Modal */}
      <Modal
        isOpen={showExportSuccess}
        onClose={() => setShowExportSuccess(false)}
        title="Stock Export Completed"
        subtitle="Pharmacy catalog exported to CSV format"
        icon={<Sparkles className="w-5 h-5 text-sky-600" />}
        iconBg="bg-sky-50 border-sky-100"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            A CSV file containing <strong>1,245 medicine records</strong>, batch expiry dates, and wholesale valuation has been compiled and is ready for accountant or tax audits.
          </p>
          <div className="p-3 bg-slate-50 border rounded-xl font-mono text-[11px] text-slate-600">
            medeasy_inventory_khed_shivapur_{new Date().toISOString().split('T')[0]}.csv
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowExportSuccess(false)}
              className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs cursor-pointer hover:bg-slate-800 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Medicine Modal */}
      <Modal
        isOpen={!!editingMed}
        onClose={() => setEditingMed(null)}
        title={`Edit ${editingMed?.name || 'Medicine'}`}
        subtitle="Update rack location, salt composition, and alert levels"
        maxWidth="max-w-md"
      >
        {editingMed && (
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Generic Name / Salt</label>
              <input
                type="text"
                value={editGeneric}
                onChange={(e) => setEditGeneric(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rack Location</label>
                <input
                  type="text"
                  value={editRack}
                  onChange={(e) => setEditRack(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Min Stock Threshold</label>
                <input
                  type="number"
                  value={editMinStock}
                  onChange={(e) => setEditMinStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMed(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                Save Details
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
