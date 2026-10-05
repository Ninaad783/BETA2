import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  Send, 
  UserPlus, 
  AlertCircle, 
  RotateCcw,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
  ShoppingCart,
  Stethoscope,
  Database
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { usePharmacyStore } from '../../../stores/pharmacyStore';
import { Modal } from '../../../components/ui/Modal';

export const BillingPage: React.FC = () => {
  const { t } = useUIStore();
  const { 
    cart, 
    medicines, 
    customers, 
    selectedCustomerId, 
    paymentMode, 
    doctorName,
    patientName,
    invoiceCounter,
    addItemToCart, 
    addMasterItemToCart,
    updateCartItemQty, 
    removeCartItem, 
    clearCart, 
    setSelectedCustomerId, 
    setPaymentMode, 
    setDoctorName,
    setPatientName,
    checkoutCurrentBill,
    addCustomer
  } = usePharmacyStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmptyCartModal, setShowEmptyCartModal] = useState(false);

  // Selected customer details
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // WhatsApp form custom mobile
  const [whatsappMobile, setWhatsappMobile] = useState('');

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  const [lastCheckoutData, setLastCheckoutData] = useState<{ invoiceNumber: string; total: number } | null>(null);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = 0.00;
  const gstAmount = Number((subtotal * 0.12).toFixed(2));
  const netTotal = subtotal - discountAmount;
  const currentInvoiceNo = `INV-2026-0${invoiceCounter + 1}`;

  // Filter medicines for autocomplete
  const searchResults = medicines.filter((m) => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.batches.some((b) => b.barcode && b.barcode.includes(searchTerm))
  );

  // Master Medicine Catalog Suggestions (1,000+ Database in PostgreSQL)
  const [masterResults, setMasterResults] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Debounced query hitting live backend PostgreSQL database
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setMasterResults([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/medicines/search?q=${encodeURIComponent(searchTerm.trim())}&limit=12`);
        if (res.ok) {
          const data = await res.json();
          setMasterResults(data.masterMatches || []);
        }
      } catch (err) {
        console.error('Failed to query master medicines from backend:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 180);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSelectMedicine = (med: typeof medicines[0]) => {
    addItemToCart(med);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleSelectMasterMedicine = (masterMed: any) => {
    addMasterItemToCart(masterMed);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleTriggerAction = (actionType: 'save' | 'print' | 'whatsapp') => {
    if (cart.length === 0) {
      setShowEmptyCartModal(true);
      return;
    }

    if (actionType === 'print') {
      setShowPrintModal(true);
    } else if (actionType === 'whatsapp') {
      setWhatsappMobile(selectedCustomer?.mobile || '9876543210');
      setShowWhatsAppModal(true);
    } else {
      // Save Bill
      const result = checkoutCurrentBill();
      if (result.success) {
        setLastCheckoutData({ invoiceNumber: result.invoiceNumber, total: result.total });
        setShowSuccessModal(true);
      }
    }
  };

  const handleConfirmPrint = () => {
    const result = checkoutCurrentBill();
    if (result.success) {
      setLastCheckoutData({ invoiceNumber: result.invoiceNumber, total: result.total });
      setShowPrintModal(false);
      window.print();
    }
  };

  const handleConfirmWhatsApp = () => {
    const targetMobile = whatsappMobile || selectedCustomer?.mobile || '9876543210';
    const itemsListText = cart
      .map((item, idx) => `${idx + 1}. ${item.medicineName} (${item.quantity}x) - ₹${item.total.toFixed(2)}`)
      .join('\n');

    const messageText = 
      `🧾 *MEDEASY PHARMACY - TAX INVOICE*\n` +
      `📍 MedEasy Pharmacy\n` +
      `Invoice: *#${currentInvoiceNo}*\n` +
      `Date: ${new Date().toLocaleDateString('en-IN')}\n` +
      `Customer: ${selectedCustomer?.fullName || patientName || 'Walk-in Customer'}\n` +
      (doctorName ? `Prescribing Dr: ${doctorName}\n` : '') +
      (patientName && selectedCustomer ? `Patient: ${patientName}\n` : '') +
      `---------------------------------\n` +
      `*ITEMS PURCHASED:*\n` +
      `${itemsListText}\n` +
      `---------------------------------\n` +
      `Subtotal: ₹${subtotal.toFixed(2)}\n` +
      `GST (12%): ₹${gstAmount.toFixed(2)}\n` +
      `*Net Total: ₹${netTotal.toFixed(2)}*\n` +
      `Payment Mode: ${paymentMode}\n` +
      `---------------------------------\n` +
      `Thank you for choosing MedEasy!\nWishing you a speedy recovery. 🙏`;

    const encoded = encodeURIComponent(messageText);
    const result = checkoutCurrentBill();
    if (result.success) {
      setLastCheckoutData({ invoiceNumber: result.invoiceNumber, total: result.total });
      setShowWhatsAppModal(false);
      window.open(`https://wa.me/91${targetMobile}?text=${encoded}`, '_blank');
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustMobile) return;
    addCustomer({
      fullName: newCustName,
      mobile: newCustMobile,
      address: newCustAddress || ''
    });
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustMobile('');
    setNewCustAddress('');
  };

  const handleAddSampleItem = () => {
    if (medicines.length > 0) {
      addItemToCart(medicines[0]); // Adds Dolo 650
    }
    setShowEmptyCartModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('billingTitle')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t('billingSub')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg font-mono font-bold border border-emerald-200">
            Invoice #{currentInvoiceNo}
          </span>
          <button
            onClick={clearCart}
            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (F5)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Search, Customer, Cart Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Medicine Search Bar with Live Autocomplete */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (searchResults.length > 0) {
                        e.preventDefault();
                        handleSelectMedicine(searchResults[0]);
                      } else if (masterResults.length > 0) {
                        e.preventDefault();
                        handleSelectMasterMedicine(masterResults[0]);
                      }
                    }
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <button
                onClick={() => {
                  if (searchResults.length > 0) {
                    addItemToCart(searchResults[0]);
                  } else if (masterResults.length > 0) {
                    addMasterItemToCart(masterResults[0]);
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addItem')}</span>
              </button>
            </div>

            {/* Autocomplete Dropdown: Local Inventory + 1,000+ Master Catalog */}
            {showSearchResults && searchTerm.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-80 overflow-y-auto z-50 divide-y divide-slate-100">
                {/* Local Store Inventory Results */}
                {searchResults.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 bg-slate-100/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>In Store Inventory</span>
                      <span className="text-emerald-600 font-semibold">{searchResults.length} in stock</span>
                    </div>
                    {searchResults.map((med) => (
                      <div
                        key={med.id}
                        onClick={() => handleSelectMedicine(med)}
                        className="p-3 hover:bg-emerald-50/60 cursor-pointer flex justify-between items-center transition"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{med.name}</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">Ready to Bill</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {med.genericName} • Stock: {med.totalStock} {med.unit}s
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-emerald-600">₹{med.sellingPrice.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 block line-through">MRP ₹{med.mrp.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Master Medicines Catalog Results (1,000+ Database) */}
                {masterResults.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 bg-sky-50 text-[10px] font-bold uppercase tracking-wider text-sky-700 flex items-center justify-between border-t border-sky-100">
                      <div className="flex items-center gap-1">
                        <Database className="w-3 h-3 text-sky-600" />
                        <span>Master Drug Catalog (India)</span>
                      </div>
                      <span className="text-sky-600 font-semibold">{masterResults.length} matches</span>
                    </div>
                    {masterResults.map((med) => (
                      <div
                        key={med.id}
                        onClick={() => handleSelectMasterMedicine(med)}
                        className="p-3 hover:bg-sky-50/70 cursor-pointer flex justify-between items-center transition"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{med.name}</span>
                            <span className="text-[9px] bg-sky-100 text-sky-800 font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              {med.form}
                            </span>
                            {med.requires_prescription && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">Rx</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            <span className="font-medium text-slate-700">{med.generic_name}</span>
                            <span className="mx-1">•</span>
                            <span className="text-slate-400">{med.manufacturer}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Pack: {med.pack_size} | HSN: {med.hsn_code} | GST: {med.gst_rate}%
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className="font-bold text-xs text-sky-600">MRP ₹{Number(med.typical_mrp).toFixed(2)}</span>
                          <span className="text-[10px] text-emerald-600 block font-semibold">+ 1-Click Bill</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State / Loading State */}
                {isLoadingSuggestions && (
                  <div className="p-3 text-xs text-slate-400 text-center flex items-center justify-center gap-2">
                    <span className="animate-spin w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full" />
                    <span>Searching 1,000+ medicine catalog...</span>
                  </div>
                )}

                {!isLoadingSuggestions && searchResults.length === 0 && masterResults.length === 0 && (
                  <div className="p-4 text-xs text-slate-400 text-center">
                    No medicines found matching "{searchTerm}" in local stock or master catalog.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Selector Bar */}
          <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-600">{t('customer')}:</span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">{t('walkInCustomer')}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} (Mob: {c.mobile}) — {c.totalBills} bills
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ New Customer</span>
            </button>
          </div>

          {/* Schedule H / Doctor & Patient Details Bar */}
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold shrink-0">
              <Stethoscope className="w-3.5 h-3.5 text-rose-500" />
              <span>Rx / Doctor:</span>
            </div>
            <div className="flex-1 min-w-[160px]">
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Prescribing Doctor (e.g. Dr. Kulkarni MBBS)"
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient Name (Optional)"
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">{t('thMedicine')}</th>
                  <th className="p-3">{t('thBatch')}</th>
                  <th className="p-3">{t('thExpiry')}</th>
                  <th className="p-3 text-right">{t('thMrp')}</th>
                  <th className="p-3 text-right">{t('thPrice')}</th>
                  <th className="p-3 text-center">{t('thQty')}</th>
                  <th className="p-3 text-right">{t('thDisc')}</th>
                  <th className="p-3 text-right">{t('thTotal')}</th>
                  <th className="p-3 text-center">{t('thAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {cart.length > 0 ? (
                  cart.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.medicineName}</span>
                          {item.requiresPrescription && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wider">
                              Rx Schedule H
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs bg-slate-50/80 px-2 py-0.5 rounded">
                        {item.batchNumber}
                      </td>
                      <td className="p-3 text-slate-500">{item.expiryDate}</td>
                      <td className="p-3 text-right text-slate-400">₹{item.mrp.toFixed(2)}</td>
                      <td className="p-3 text-right font-medium">₹{item.sellingPrice.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateCartItemQty(item.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer font-bold text-xs select-none"
                            title="Decrease Quantity"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            min={1}
                            onChange={(e) => updateCartItemQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-10 text-center py-0.5 text-xs font-bold text-slate-900 border-x border-slate-200 bg-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateCartItemQty(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer font-bold text-xs select-none"
                            title="Increase Quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right">{item.discountPercent}%</td>
                      <td className="p-3 text-right font-bold text-slate-900">₹{item.total.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeCartItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ShoppingCart className="w-8 h-8 text-slate-300" />
                        <p className="font-medium text-slate-500">Cart is empty</p>
                        <p className="text-[11px] text-slate-400">Search above or click "+ Add Item" to add medicines to this counter bill.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Payment & Checkout Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3.5">
              {t('paymentSummary')}
            </h3>

            {/* Payment Mode Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {t('paymentMode')}:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMode('CASH')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    paymentMode === 'CASH'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-300'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-base">💵</span>
                  <span>{t('cash')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    paymentMode === 'UPI'
                      ? 'bg-sky-50 text-sky-800 border-sky-400 ring-2 ring-sky-300'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-base">📱</span>
                  <span>{t('upi')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CARD')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    paymentMode === 'CARD'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-400 ring-2 ring-indigo-300'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-base">💳</span>
                  <span>{t('card')}</span>
                </button>
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="space-y-2 text-xs border-t pt-3">
              <div className="flex justify-between text-slate-600">
                <span>{t('subtotal')}:</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('discount')}:</span>
                <span className="font-semibold text-slate-900">- ₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('gst12')}:</span>
                <span className="font-semibold text-slate-900">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">{t('netTotal')}:</span>
                <span className="text-2xl font-black text-emerald-600">₹{netTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <button
              onClick={() => handleTriggerAction('save')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveBill')}</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTriggerAction('print')}
                className="py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{t('printBill')}</span>
              </button>
              <button
                onClick={() => handleTriggerAction('whatsapp')}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t('whatsappBill')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          UPGRADED MODAL: EMPTY CART WARNING
          (Replaces browser native "localhost:5173 says: Your cart is empty!")
          ========================================================= */}
      <Modal
        isOpen={showEmptyCartModal}
        onClose={() => setShowEmptyCartModal(false)}
        title="Your Cart is Empty!"
        subtitle="Please add medicines before proceeding"
        icon={<ShoppingCart className="w-5 h-5 text-amber-600" />}
        iconBg="bg-amber-50 border-amber-200"
      >
        <div className="space-y-4 text-xs text-center">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-left space-y-2">
            <p className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              No items selected for this invoice
            </p>
            <p className="text-slate-600 leading-relaxed">
              To save a bill, print a thermal receipt, or send a WhatsApp invoice, your cart must contain at least 1 medicine item.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowEmptyCartModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleAddSampleItem}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sample Medicine (Dolo 650)</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* =========================================================
          UPGRADED MODAL: PRINT BILL THERMAL PREVIEW MODAL
          ========================================================= */}
      <Modal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Print Invoice Receipt"
        subtitle="3-inch Thermal / Standard POS Slip Preview"
        icon={<Printer className="w-5 h-5 text-sky-600" />}
        iconBg="bg-sky-50 border-sky-100"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs">
          {/* Printable Thermal Receipt Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 font-mono text-slate-800 space-y-3 shadow-inner">
            {/* Store Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h4 className="font-black text-base tracking-wider text-slate-900">MEDEASY PHARMACY</h4>
              <p className="text-[11px] text-slate-500">Retail Tax Invoice</p>
              <p className="text-[10px] text-slate-500 mt-1">Ph: +91 8380036778</p>
            </div>

            {/* Meta Row */}
            <div className="flex justify-between items-center text-[11px] border-b border-dashed border-slate-300 pb-2">
              <div>
                <p>Inv: <strong>#{currentInvoiceNo}</strong></p>
                <p>Customer: <strong>{selectedCustomer?.fullName || patientName || 'Walk-in Customer'}</strong></p>
                {doctorName && <p>Dr: <strong>{doctorName}</strong></p>}
                {patientName && selectedCustomer && <p>Patient: <strong>{patientName}</strong></p>}
              </div>
              <div className="text-right">
                <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
                <p>Tender: <strong>{paymentMode}</strong></p>
              </div>
            </div>

            {/* Cart Items Slip Table */}
            <div className="border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500 mb-1">
                <span>Item [Batch]</span>
                <span>Qty x Rate = Total</span>
              </div>
              <div className="space-y-1.5">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-baseline text-[11px]">
                    <div>
                      <span className="font-bold">{item.medicineName}</span>
                      <span className="text-[10px] text-slate-400 ml-1">[{item.batchNumber}]</span>
                    </div>
                    <div className="font-bold text-slate-900">
                      {item.quantity} x ₹{item.sellingPrice.toFixed(2)} = ₹{item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>CGST (6%) + SGST (6%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-dashed border-slate-300 pt-2 font-sans">
                <span>NET PAYABLE:</span>
                <span className="text-emerald-700">₹{netTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Thermal Footer */}
            <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-dashed border-slate-300 space-y-0.5">
              <p>*** THANK YOU! GET WELL SOON ***</p>
              <p>Medicines once sold cannot be taken back without bill.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowPrintModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPrint}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-md shadow-sky-600/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Thermal Slip (3-inch)</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* =========================================================
          UPGRADED MODAL: WHATSAPP BILL DIGITAL RECEIPT MODAL
          ========================================================= */}
      <Modal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        title="Send WhatsApp Digital Bill"
        subtitle="Instant paperless tax invoice sent to customer's WhatsApp"
        icon={<Send className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs">
          {/* Recipient Phone Configuration */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="block font-semibold text-slate-700">
              Recipient WhatsApp Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={whatsappMobile}
                onChange={(e) => setWhatsappMobile(e.target.value)}
                placeholder="10 digit mobile number"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Customer: <strong>{selectedCustomer?.fullName || 'Walk-in Customer'}</strong>
            </p>
          </div>

          {/* Live WhatsApp Chat Bubble Preview */}
          <div className="bg-[#e5ddd5] p-3.5 rounded-2xl space-y-2 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-900 uppercase">
              <Send className="w-3 h-3 text-emerald-700" /> WhatsApp Message Preview
            </div>

            <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-xs text-slate-800 space-y-2 font-mono text-[11px] border border-slate-100">
              <p className="font-bold text-emerald-800">🧾 *MEDEASY PHARMACY - TAX INVOICE*</p>
              <p className="text-slate-500 text-[10px]">📍 MedEasy Pharmacy</p>
              <p>Invoice: <strong>#{currentInvoiceNo}</strong></p>
              <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
              <p>Customer: <strong>{selectedCustomer?.fullName || patientName || 'Walk-in Customer'}</strong></p>
              {doctorName && <p>👨‍⚕️ Prescribing Dr: <strong>{doctorName}</strong></p>}
              {patientName && selectedCustomer && <p>Patient: <strong>{patientName}</strong></p>}
              <div className="border-t border-dashed border-slate-200 pt-1.5 space-y-1">
                <p className="font-bold text-slate-600 text-[10px]">*ITEMS:*</p>
                {cart.map((item, idx) => (
                  <p key={item.id}>
                    {idx + 1}. {item.medicineName} ({item.quantity}x) = ₹{item.total.toFixed(2)}
                  </p>
                ))}
              </div>
              <div className="border-t border-dashed border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
                <span>Net Total:</span>
                <span className="text-emerald-700">₹{netTotal.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1">Thank you! Wishing you a speedy recovery. 🙏</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowWhatsAppModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmWhatsApp}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp Bill</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </button>
          </div>
        </div>
      </Modal>

      {/* =========================================================
          UPGRADED MODAL: NEW CUSTOMER QUICK ADD
          ========================================================= */}
      <Modal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        title="Add New Customer"
        subtitle="Register customer for counter sales and Udhaar (credit) ledger"
        icon={<UserPlus className="w-5 h-5 text-sky-600" />}
        iconBg="bg-sky-50 border-sky-100"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="e.g. Ramesh Shankar More"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              WhatsApp Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={newCustMobile}
                onChange={(e) => setNewCustMobile(e.target.value)}
                placeholder="e.g. 9822334455"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Village / Residential Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newCustAddress}
                onChange={(e) => setNewCustAddress(e.target.value)}
                placeholder="e.g. Near Shivapur Gram Panchayat"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowNewCustomerModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================
          UPGRADED MODAL: BILL SAVED SUCCESS MODAL
          ========================================================= */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Bill Saved Successfully!"
        subtitle="Inventory updated & FEFO batch deduction recorded"
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50 border-emerald-100"
      >
        {lastCheckoutData && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs space-y-1">
              <p className="text-slate-500">Invoice Generated</p>
              <p className="text-lg font-black text-slate-900 font-mono">#{lastCheckoutData.invoiceNumber}</p>
              <p className="text-2xl font-black text-emerald-600 mt-2">₹{lastCheckoutData.total.toFixed(2)}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-100/70 px-2.5 py-0.5 rounded-full mt-2">
                <Sparkles className="w-3 h-3" /> FEFO Stock Deducted
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  window.print();
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Thermal Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md transition cursor-pointer text-xs"
              >
                Start New Bill (F2)
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
