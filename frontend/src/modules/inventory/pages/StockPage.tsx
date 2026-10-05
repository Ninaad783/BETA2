import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit3, Download, Pill, Layers, Sparkles, Database } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import type { Medicine } from '../../../types/pharmacy.types';
import { Modal } from '../../../components/ui/Modal';
import { API_BASE_URL } from '../../../lib/apiClient';

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
  const [editHsn, setEditHsn] = useState('3004');
  const [editManufacturer, setEditManufacturer] = useState('');
  const [editRequiresPrescription, setEditRequiresPrescription] = useState(false);

  // Add Medicine Form
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState('Analgesic');
  const [unit, setUnit] = useState('strip');
  const [minStockAlert, setMinStockAlert] = useState(15);
  const [hsnCode, setHsnCode] = useState('3004');
  const [manufacturer, setManufacturer] = useState('');
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [purchasePrice, setPurchasePrice] = useState(20);
  const [mrp, setMrp] = useState(40);
  const [sellingPrice, setSellingPrice] = useState(36);
  const [quantity, setQuantity] = useState(50);
  const [masterSuggestions, setMasterSuggestions] = useState<any[]>([]);
  const [showMasterSuggestions, setShowMasterSuggestions] = useState(false);

  useEffect(() => {
    if (!name || name.trim().length < 2 || !showAddModal) {
      setMasterSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/medicines/master?q=${encodeURIComponent(name.trim())}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setMasterSuggestions(data.medicines || []);
        }
      } catch (err) {
        console.error('Failed to query master medicines in stock modal:', err);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [name, showAddModal]);

  const handleSelectMasterForStock = (sug: any) => {
    setName(sug.name);
    setGenericName(sug.generic_name);
    setCategory(sug.category || 'Allopathy');
    setManufacturer(sug.manufacturer || '');
    setHsnCode(sug.hsn_code || '300490');
    setRequiresPrescription(sug.requires_prescription || false);
    const typicalMrp = Number(sug.typical_mrp) || 50;
    setMrp(typicalMrp);
    setSellingPrice(Number((typicalMrp * 0.95).toFixed(2)));
    setPurchasePrice(Number((typicalMrp * 0.70).toFixed(2)));
    if (!batchNumber) {
      setBatchNumber(`B-${Math.floor(1000 + Math.random() * 9000)}`);
    }
    setShowMasterSuggestions(false);
  };

  // Tab Filtering
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      m.genericName.toLowerCase().includes(localSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(localSearch.toLowerCase()) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(localSearch.toLowerCase()));

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
        mrp: Number(mrp),
        hsnCode,
        manufacturer,
        requiresPrescription
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
    setManufacturer('');
    setRequiresPrescription(false);
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
    setEditHsn(med.hsnCode || '3004');
    setEditManufacturer(med.manufacturer || '');
    setEditRequiresPrescription(med.requiresPrescription || false);
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
      unit: editUnit,
      hsnCode: editHsn,
      manufacturer: editManufacturer,
      requiresPrescription: editRequiresPrescription
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
                  <td className="p-3 font-bold text-sky-700 hover:underline">
                    <div className="flex items-center gap-1.5">
                      <span>{med.name}</span>
                      {med.requiresPrescription && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wider">
                          Rx H
                        </span>
                      )}
                    </div>
                    {med.manufacturer && (
                      <span className="text-[10px] text-slate-400 font-normal block">{med.manufacturer}</span>
                    )}
                  </td>
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
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Brand Name *</label>
                  <span className="text-[10px] text-sky-600 font-medium flex items-center gap-1">
                    <Database className="w-3 h-3" /> Auto-fills from 1k catalog
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setShowMasterSuggestions(true);
                  }}
                  onFocus={() => setShowMasterSuggestions(true)}
                  placeholder="e.g. Dolo, Augmentin, Pan..."
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />

                {/* Master Catalog Dropdown */}
                {showMasterSuggestions && masterSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100">
                    {masterSuggestions.map((sug) => (
                      <div
                        key={sug.id}
                        onClick={() => handleSelectMasterForStock(sug)}
                        className="p-2.5 hover:bg-sky-50 cursor-pointer transition text-left flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{sug.name}</span>
                            <span className="text-[9px] bg-sky-100 text-sky-800 font-semibold px-1 py-0.5 rounded">
                              {sug.form}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {sug.generic_name} • {sug.manufacturer}
                          </span>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-xs font-bold text-emerald-600">MRP ₹{Number(sug.typical_mrp).toFixed(2)}</span>
                          <span className="text-[9px] text-sky-600 font-semibold block">Click to autofill</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. Cipla Ltd, Micro Labs"
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">HSN Code</label>
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  placeholder="3004"
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white font-medium font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="reqPresc"
                checked={requiresPrescription}
                onChange={(e) => setRequiresPrescription(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <label htmlFor="reqPresc" className="font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5">
                <span className="text-rose-600 font-bold">Rx</span> Schedule H Drug (Prescription Required)
              </label>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={editManufacturer}
                  onChange={(e) => setEditManufacturer(e.target.value)}
                  placeholder="e.g. Cipla Ltd, Micro Labs"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">HSN Code</label>
                <input
                  type="text"
                  value={editHsn}
                  onChange={(e) => setEditHsn(e.target.value)}
                  placeholder="3004"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editReqPresc"
                checked={editRequiresPrescription}
                onChange={(e) => setEditRequiresPrescription(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <label htmlFor="editReqPresc" className="font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5">
                <span className="text-rose-600 font-bold">Rx</span> Schedule H Drug (Prescription Required)
              </label>
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
