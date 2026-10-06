import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  CartItem, 
  Customer, 
  DailyStats, 
  Medicine, 
  MedicineBatch, 
  PaymentMode, 
  PurchaseInvoice, 
  Supplier,
  StockAdjustment,
  SaleInvoice 
} from '../types/pharmacy.types';
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_MEDICINES, 
  INITIAL_PURCHASES, 
  INITIAL_STATS, 
  INITIAL_SUPPLIERS,
  INITIAL_STOCK_ADJUSTMENTS
} from '../lib/mockData';
import { API_BASE_URL } from '../lib/apiClient';

interface PharmacyState {
  // Inventory
  medicines: Medicine[];
  selectedMedicineId: string | null;
  stockFilterTab: 'all' | 'low' | 'expiry';
  searchQuery: string;
  stockAdjustments: StockAdjustment[];
  fetchMedicines: () => Promise<void>;
  isLoadingMedicines: boolean;

  // POS / Cart
  cart: CartItem[];
  selectedCustomerId: string;
  paymentMode: PaymentMode;
  notes: string;
  doctorName: string;
  patientName: string;
  invoiceCounter: number;

  // Customers & Suppliers
  customers: Customer[];
  suppliers: Supplier[];
  purchases: PurchaseInvoice[];
  salesInvoices: SaleInvoice[];

  // Daily Dashboard Stats (v_today_counter_analytics)
  stats: DailyStats;

  // Actions
  setStockFilterTab: (tab: 'all' | 'low' | 'expiry') => void;
  setSearchQuery: (query: string) => void;
  setSelectedMedicineId: (id: string | null) => void;

  // Cart actions
  addItemToCart: (medicine: Medicine, preferredBatch?: MedicineBatch) => void;
  addMasterItemToCart: (masterMed: { id: string; name: string; typical_mrp?: number | string; requires_prescription?: boolean }) => void;
  updateCartItemQty: (cartItemId: string, newQty: number) => void;
  removeCartItem: (cartItemId: string) => void;
  clearCart: () => void;
  setSelectedCustomerId: (customerId: string) => void;
  setPaymentMode: (mode: PaymentMode) => void;
  setNotes: (notes: string) => void;
  setDoctorName: (name: string) => void;
  setPatientName: (name: string) => void;

  // Checkout (FEFO stock deduction + customer purchase history update)
  checkoutCurrentBill: () => { success: boolean; invoiceNumber: string; total: number };

  // Medicine & Batch actions
  addMedicine: (medicine: Omit<Medicine, 'id' | 'totalStock' | 'status' | 'batches'>, initialBatch: Omit<MedicineBatch, 'id' | 'medicineId'>) => void;
  updateMedicine: (id: string, updates: Partial<Omit<Medicine, 'id' | 'batches'>>) => void;
  adjustBatchStock: (medicineId: string, batchNumber: string, newStock: number, reason: string) => void;
  addBatchToMedicine: (medicineId: string, batchData: Omit<MedicineBatch, 'id' | 'medicineId'>) => void;

  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'totalPurchases' | 'totalBills' | 'lastPurchaseDate'>) => Promise<void>;
  fetchCustomers: () => Promise<void>;
  isLoadingCustomers: boolean;

  // Sales actions
  fetchSales: () => Promise<void>;
  isLoadingSales: boolean;

  // Supplier actions
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  fetchSuppliers: () => Promise<void>;

  // Purchase actions
  addPurchase: (purchase: Omit<PurchaseInvoice, 'id'>) => Promise<void>;
  fetchPurchases: () => Promise<void>;
}

export const usePharmacyStore = create<PharmacyState>()(
  persist(
    (set, get) => ({
      medicines: INITIAL_MEDICINES,
      isLoadingMedicines: false,
      selectedMedicineId: null,
  stockFilterTab: 'all',
  searchQuery: '',
  stockAdjustments: INITIAL_STOCK_ADJUSTMENTS,

  cart: [],
  selectedCustomerId: '',
  paymentMode: 'CASH',
  notes: '',
  doctorName: '',
  patientName: '',
  invoiceCounter: 1001,

  customers: INITIAL_CUSTOMERS,
  isLoadingCustomers: false,
  suppliers: INITIAL_SUPPLIERS,
  purchases: INITIAL_PURCHASES,
  salesInvoices: [],
  isLoadingSales: false,
  stats: INITIAL_STATS,

  setStockFilterTab: (tab) => set({ stockFilterTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedMedicineId: (id) => set({ selectedMedicineId: id }),
  setDoctorName: (name) => set({ doctorName: name }),
  setPatientName: (name) => set({ patientName: name }),

  addItemToCart: (medicine, preferredBatch) => {
    const { cart } = get();
    // Choose batch: either provided or FEFO earliest expiring batch with stock
    const batch = preferredBatch || [...medicine.batches]
      .filter((b) => b.currentStock > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0] 
      || medicine.batches[0];

    if (!batch) return;

    // Check if already in cart
    const existingIndex = cart.findIndex((item) => item.batchId === batch.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      const item = updatedCart[existingIndex];
      const newQty = item.quantity + 1;
      updatedCart[existingIndex] = {
        ...item,
        quantity: newQty,
        total: Number((newQty * item.sellingPrice * (1 - item.discountPercent / 100)).toFixed(2))
      };
      set({ cart: updatedCart });
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate.includes('-') 
          ? `${batch.expiryDate.split('-')[1]}/${batch.expiryDate.split('-')[0]}`
          : batch.expiryDate,
        mrp: batch.mrp,
        sellingPrice: batch.sellingPrice,
        quantity: 1,
        discountPercent: 0,
        total: batch.sellingPrice,
        requiresPrescription: medicine.requiresPrescription || false
      };
      set({ cart: [...cart, newItem] });
    }
  },

  addMasterItemToCart: (masterMed) => {
    const { cart } = get();
    const mrp = typeof masterMed.typical_mrp === 'string' 
      ? parseFloat(masterMed.typical_mrp) || 50 
      : Number(masterMed.typical_mrp || 50);
    const sellingPrice = Number((mrp * 0.95).toFixed(2));
    
    // Check if already in cart by name or id
    const existingIndex = cart.findIndex((item) => item.medicineName === masterMed.name);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      const item = updatedCart[existingIndex];
      const newQty = item.quantity + 1;
      updatedCart[existingIndex] = {
        ...item,
        quantity: newQty,
        total: Number((newQty * item.sellingPrice * (1 - item.discountPercent / 100)).toFixed(2))
      };
      set({ cart: updatedCart });
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        medicineId: masterMed.id,
        medicineName: masterMed.name,
        batchId: `batch-${masterMed.id.substring(0, 8)}`,
        batchNumber: 'B-STD',
        expiryDate: '12/28',
        mrp: mrp,
        sellingPrice: sellingPrice,
        quantity: 1,
        discountPercent: 0,
        total: sellingPrice,
        requiresPrescription: masterMed.requires_prescription || false
      };
      set({ cart: [...cart, newItem] });
    }
  },

  updateCartItemQty: (cartItemId, newQty) => {
    if (newQty <= 0) {
      get().removeCartItem(cartItemId);
      return;
    }
    const { cart } = get();
    const updated = cart.map((item) => {
      if (item.id === cartItemId) {
        return {
          ...item,
          quantity: newQty,
          total: Number((newQty * item.sellingPrice * (1 - item.discountPercent / 100)).toFixed(2))
        };
      }
      return item;
    });
    set({ cart: updated });
  },

  removeCartItem: (cartItemId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== cartItemId)
    }));
  },

  clearCart: () => set({ cart: [], doctorName: '', patientName: '' }),
  setSelectedCustomerId: (customerId) => set({ selectedCustomerId: customerId }),
  setPaymentMode: (mode) => set({ paymentMode: mode }),
  setNotes: (notes) => set({ notes: notes }),

  checkoutCurrentBill: () => {
    const { cart, selectedCustomerId, medicines, customers, stats, invoiceCounter, doctorName, patientName, paymentMode } = get();
    if (cart.length === 0) return { success: false, invoiceNumber: '', total: 0 };

    const total = cart.reduce((sum, item) => sum + item.total, 0);
    const invoiceNumber = `INV-2026-0${invoiceCounter + 1}`;

    // 1. Deduct stock across medicines and batches (FEFO)
    const updatedMedicines = medicines.map((med) => {
      const cartItemsForMed = cart.filter((c) => c.medicineId === med.id);
      if (cartItemsForMed.length === 0) return med;

      let medDeduction = 0;
      const updatedBatches = med.batches.map((b) => {
        const itemDeduct = cartItemsForMed.find((c) => c.batchId === b.id);
        if (itemDeduct) {
          const newBatchStock = Math.max(0, b.currentStock - itemDeduct.quantity);
          medDeduction += itemDeduct.quantity;
          return { ...b, currentStock: newBatchStock };
        }
        return b;
      });

      const newTotalStock = Math.max(0, med.totalStock - medDeduction);
      const newStatus = newTotalStock === 0 ? 'OUT_OF_STOCK' : newTotalStock <= med.minStockAlert ? 'LOW_STOCK' : 'IN_STOCK';

      return {
        ...med,
        totalStock: newTotalStock,
        status: newStatus as 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK',
        batches: updatedBatches
      };
    });

    // 2. Update customer statistics only (no Udhaar ledger)
    let updatedCustomers = customers;
    if (selectedCustomerId) {
      updatedCustomers = customers.map((c) => {
        if (c.id === selectedCustomerId) {
          return {
            ...c,
            totalPurchases: Number((c.totalPurchases + total).toFixed(2)),
            totalBills: c.totalBills + 1,
            lastPurchaseDate: 'Today'
          };
        }
        return c;
      });
    }

    // 3. Update dashboard stats (v_today_counter_analytics)
    const updatedStats: DailyStats = {
      ...stats,
      todaySales: Number((stats.todaySales + total).toFixed(2)),
      todayProfit: Number((stats.todayProfit + total * 0.20).toFixed(2)),
      todayBillsCount: stats.todayBillsCount + 1
    };

    // 4. Record real SaleInvoice
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const itemsSummary = cart
      .map((item) => `${item.medicineName} (${item.quantity}x)`)
      .join(', ');

    const newInvoice: SaleInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer?.fullName || patientName || 'Walk-in Customer',
      customerMobile: selectedCustomer?.mobile,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      doctorName: doctorName || undefined,
      patientName: patientName || undefined,
      itemsSummary,
      items: [...cart],
      subtotal: Number(total.toFixed(2)),
      discountAmount: 0,
      gstAmount: Number((total * 0.12).toFixed(2)),
      netTotal: Number(total.toFixed(2)),
      paymentMode,
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    };

    const { salesInvoices } = get();

    set({
      medicines: updatedMedicines,
      customers: updatedCustomers,
      stats: updatedStats,
      salesInvoices: [newInvoice, ...(salesInvoices || [])],
      cart: [],
      doctorName: '',
      patientName: '',
      invoiceCounter: invoiceCounter + 1
    });

    // 5. Asynchronously persist invoice to PostgreSQL backend
    try {
      const token = localStorage.getItem('medeasy_auth_token');
      const payload = {
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomer?.fullName || patientName || 'Walk-in Customer',
        customerMobile: selectedCustomer?.mobile,
        doctorName: doctorName || undefined,
        patientName: patientName || undefined,
        paymentMode,
        notes: get().notes,
        items: cart.map((it) => ({
          medicineId: it.medicineId,
          batchId: it.batchId,
          medicineName: it.medicineName,
          batchNumber: it.batchNumber,
          expiryDate: it.expiryDate,
          quantity: it.quantity,
          mrp: it.mrp,
          sellingPrice: it.sellingPrice,
          discountPercent: it.discountPercent,
          gstRate: (it as any).gstRate || 12.0,
          total: it.total
        })),
        subtotal: total,
        netTotal: total
      };

      fetch(`${API_BASE_URL}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      }).then(async (res) => {
        if (res.ok) {
          get().fetchCustomers();
          get().fetchSales();
        }
      }).catch((err) => {
        console.error('Async sale persistence failed:', err);
      });
    } catch (e) {
      console.error('Failed to dispatch sale sync:', e);
    }

    return { success: true, invoiceNumber, total };
  },

  fetchMedicines: async () => {
    set({ isLoadingMedicines: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/medicines`);
      if (res.ok) {
        const data = await res.json();
        if (data.medicines && data.medicines.length > 0) {
          set((state) => {
            const dbMap = new Map(data.medicines.map((m: Medicine) => [m.id, m]));
            const dbNameMap = new Map(data.medicines.map((m: Medicine) => [m.name.toLowerCase(), m]));
            
            const merged = [...data.medicines];
            state.medicines.forEach((localMed) => {
              if (!dbMap.has(localMed.id) && !dbNameMap.has(localMed.name.toLowerCase())) {
                merged.push(localMed);
              }
            });

            return {
              medicines: merged,
              stats: {
                ...state.stats,
                totalMedicinesCount: merged.length,
                lowStockCount: merged.filter((m) => m.status === 'LOW_STOCK' || m.status === 'OUT_OF_STOCK').length
              }
            };
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch medicines from DB:', e);
    } finally {
      set({ isLoadingMedicines: false });
    }
  },

  addMedicine: (medicineData, initialBatchData) => {
    const medId = `med-${Date.now()}`;
    const batchId = `batch-${Date.now()}`;
    const initialBatch: MedicineBatch = {
      ...initialBatchData,
      id: batchId,
      medicineId: medId,
      isServing: true
    };

    const newMedicine: Medicine = {
      ...medicineData,
      id: medId,
      totalStock: initialBatch.currentStock,
      sellingPrice: initialBatch.sellingPrice,
      mrp: initialBatch.mrp,
      status: initialBatch.currentStock === 0 
        ? 'OUT_OF_STOCK' 
        : initialBatch.currentStock <= medicineData.minStockAlert 
          ? 'LOW_STOCK' 
          : 'IN_STOCK',
      batches: [initialBatch]
    };

    set((state) => ({
      medicines: [newMedicine, ...state.medicines],
      stats: {
        ...state.stats,
        totalMedicinesCount: state.stats.totalMedicinesCount + 1
      }
    }));

    // Async persist to PostgreSQL backend
    try {
      const payload = {
        name: medicineData.name,
        genericName: medicineData.genericName,
        category: medicineData.category,
        unit: medicineData.unit,
        minStockAlert: medicineData.minStockAlert,
        gstRate: medicineData.gstRate,
        sellingPrice: initialBatchData.sellingPrice,
        mrp: initialBatchData.mrp,
        hsnCode: medicineData.hsnCode,
        manufacturer: medicineData.manufacturer,
        requiresPrescription: medicineData.requiresPrescription,
        batch: {
          batchNumber: initialBatchData.batchNumber,
          expiryDate: initialBatchData.expiryDate,
          purchasePrice: initialBatchData.purchasePrice,
          mrp: initialBatchData.mrp,
          sellingPrice: initialBatchData.sellingPrice,
          currentStock: initialBatchData.currentStock
        }
      };

      fetch(`${API_BASE_URL}/api/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.medicine) {
            set((state) => ({
              medicines: state.medicines.map((m) => m.id === medId ? data.medicine : m)
            }));
          }
        }
      }).catch((err) => console.error('Failed to sync new medicine to backend:', err));
    } catch (e) {
      console.error('Error dispatching medicine sync:', e);
    }
  },

  updateMedicine: (id, updates) => {
    set((state) => {
      const updatedMedicines = state.medicines.map((med) => {
        if (med.id === id) {
          const updated = { ...med, ...updates };
          const newStatus = updated.totalStock === 0 ? 'OUT_OF_STOCK' : updated.totalStock <= updated.minStockAlert ? 'LOW_STOCK' : 'IN_STOCK';
          return {
            ...updated,
            status: newStatus as 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
          };
        }
        return med;
      });
      const lowStockCount = updatedMedicines.filter((m) => m.status === 'LOW_STOCK' || m.status === 'OUT_OF_STOCK').length;
      return {
        medicines: updatedMedicines,
        stats: {
          ...state.stats,
          lowStockCount
        }
      };
    });

    // Async sync to PostgreSQL if valid UUID
    try {
      fetch(`${API_BASE_URL}/api/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch((e) => console.error('Failed to sync medicine update to DB:', e));
    } catch (e) {
      console.error('Error dispatching updateMedicine:', e);
    }
  },

  adjustBatchStock: (medicineId, batchNumber, newStock, reason) => {
    set((state) => {
      let prevStock = 0;
      let matchedMedName = '';
      let matchedBatchId = '';

      const updatedMedicines = state.medicines.map((med) => {
        if (med.id === medicineId) {
          matchedMedName = med.name;
          const updatedBatches = med.batches.map((b) => {
            if (b.batchNumber === batchNumber) {
              prevStock = b.currentStock;
              matchedBatchId = b.id;
              return { ...b, currentStock: Math.max(0, newStock) };
            }
            return b;
          });
          const newTotalStock = updatedBatches.reduce((sum, b) => sum + b.currentStock, 0);
          const newStatus = newTotalStock === 0 ? 'OUT_OF_STOCK' : newTotalStock <= med.minStockAlert ? 'LOW_STOCK' : 'IN_STOCK';
          return {
            ...med,
            totalStock: newTotalStock,
            status: newStatus as 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK',
            batches: updatedBatches
          };
        }
        return med;
      });

      const adjustmentLog: StockAdjustment = {
        id: `sa-${Date.now()}`,
        medicineId,
        medicineName: matchedMedName || 'Medicine',
        batchId: matchedBatchId || 'batch',
        batchNumber,
        previousStock: prevStock,
        adjustedStock: newStock,
        differenceQty: newStock - prevStock,
        reason: reason || 'Manual Physical Audit Adjustment',
        adjustedBy: 'Rahul Patil (Admin)',
        createdAt: new Date().toLocaleString('en-IN')
      };

      const lowStockCount = updatedMedicines.filter((m) => m.status === 'LOW_STOCK' || m.status === 'OUT_OF_STOCK').length;
      return {
        medicines: updatedMedicines,
        stockAdjustments: [adjustmentLog, ...state.stockAdjustments],
        stats: {
          ...state.stats,
          lowStockCount
        }
      };
    });
  },

  addBatchToMedicine: (medicineId, batchData) => {
    set((state) => {
      const updatedMedicines = state.medicines.map((med) => {
        if (med.id === medicineId) {
          const newBatch: MedicineBatch = {
            ...batchData,
            id: `batch-${Date.now()}`,
            medicineId,
            isServing: false
          };
          const allBatches = [...med.batches, newBatch].sort(
            (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );
          // Set first batch as serving
          if (allBatches.length > 0) allBatches[0].isServing = true;

          const newTotalStock = med.totalStock + newBatch.currentStock;
          const newStatus = newTotalStock === 0 ? 'OUT_OF_STOCK' : newTotalStock <= med.minStockAlert ? 'LOW_STOCK' : 'IN_STOCK';

          return {
            ...med,
            totalStock: newTotalStock,
            status: newStatus as 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK',
            batches: allBatches
          };
        }
        return med;
      });

      return { medicines: updatedMedicines };
    });
  },

  addCustomer: async (customerData) => {
    const tempId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id: tempId,
      totalPurchases: 0,
      totalBills: 0,
      lastPurchaseDate: 'None',
      isActive: true
    };

    set((state) => ({
      customers: [newCustomer, ...state.customers],
      stats: {
        ...state.stats,
        totalCustomersCount: state.stats.totalCustomersCount + 1
      }
    }));

    try {
      const token = localStorage.getItem('medeasy_auth_token');
      const res = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(customerData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.customer) {
          set((state) => ({
            customers: state.customers.map((c) => c.id === tempId ? data.customer : c)
          }));
        }
      }
    } catch (err) {
      console.error('Failed to sync new customer to backend:', err);
    }
  },

  fetchCustomers: async () => {
    set({ isLoadingCustomers: true });
    try {
      const token = localStorage.getItem('medeasy_auth_token');
      const res = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.customers && data.customers.length > 0) {
          set((state) => ({
            customers: data.customers,
            stats: {
              ...state.stats,
              totalCustomersCount: data.customers.length
            }
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch customers from backend:', err);
    } finally {
      set({ isLoadingCustomers: false });
    }
  },

  fetchSales: async () => {
    set({ isLoadingSales: true });
    try {
      const token = localStorage.getItem('medeasy_auth_token');
      const res = await fetch(`${API_BASE_URL}/api/sales`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.invoices) {
          set((state) => ({
            salesInvoices: data.invoices,
            stats: {
              ...state.stats,
              todaySales: data.stats?.todaySales ?? state.stats.todaySales,
              todayBillsCount: data.stats?.todayBillsCount ?? state.stats.todayBillsCount,
              todayProfit: data.stats?.todayProfit ?? state.stats.todayProfit
            }
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch sales from backend:', err);
    } finally {
      set({ isLoadingSales: false });
    }
  },

  addPurchase: async (purchaseData) => {
    const newPurchase: PurchaseInvoice = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
      lineCount: purchaseData.items.length,
      totalUnits: purchaseData.items.reduce((sum, item) => sum + item.quantity + (item.freeQuantity || 0), 0)
    };

    // Increment stocks for items in purchase
    const { medicines } = get();
    const updatedMedicines = medicines.map((med) => {
      const matchingItems = purchaseData.items.filter((pi) => pi.medicineName.toLowerCase() === med.name.toLowerCase());
      if (matchingItems.length === 0) return med;

      let addedStock = 0;
      let newBatches = [...med.batches];

      matchingItems.forEach((pi) => {
        const itemQty = pi.quantity + (pi.freeQuantity || 0);
        addedStock += itemQty;
        const existingBatch = newBatches.find((b) => b.batchNumber === pi.batchNumber);
        if (existingBatch) {
          existingBatch.currentStock += itemQty;
        } else {
          newBatches.push({
            id: `batch-${Date.now()}-${pi.batchNumber}`,
            medicineId: med.id,
            batchNumber: pi.batchNumber,
            expiryDate: pi.expiryDate,
            purchasePrice: pi.purchasePrice,
            mrp: pi.mrp,
            sellingPrice: pi.sellingPrice || pi.mrp * 0.9,
            currentStock: itemQty,
            initialStock: itemQty,
            isServing: false
          });
        }
      });

      const newTotal = med.totalStock + addedStock;
      return {
        ...med,
        totalStock: newTotal,
        status: (newTotal === 0 ? 'OUT_OF_STOCK' : newTotal <= med.minStockAlert ? 'LOW_STOCK' : 'IN_STOCK') as 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK',
        batches: newBatches
      };
    });

    set((state) => ({
      purchases: [newPurchase, ...state.purchases],
      medicines: updatedMedicines,
      stats: {
        ...state.stats,
        todayPurchaseTotal: Number((state.stats.todayPurchaseTotal + purchaseData.netTotal).toFixed(2))
      }
    }));

    // Async DB persistence
    try {
      const token = localStorage.getItem('medeasy_auth_token');
      const payload = {
        supplierId: purchaseData.supplierId,
        supplierName: purchaseData.supplierName,
        supplierInvoiceNumber: purchaseData.supplierInvoiceNumber,
        purchaseDate: purchaseData.purchaseDate,
        paymentMode: purchaseData.paymentMode || 'BANK_TRANSFER',
        items: purchaseData.items.map((it) => ({
          medicineName: it.medicineName,
          batchNumber: it.batchNumber,
          expiryDate: it.expiryDate,
          quantity: it.quantity,
          freeQuantity: it.freeQuantity || 0,
          purchasePrice: it.purchasePrice,
          mrp: it.mrp,
          sellingPrice: it.sellingPrice || it.mrp * 0.9,
          gstRate: it.gstRate || 12.0,
          total: it.totalAmount || (it.quantity * it.purchasePrice)
        })),
        subtotal: purchaseData.subtotal,
        discountAmount: purchaseData.discountAmount || 0,
        gstAmount: purchaseData.gstAmount || 0,
        netTotal: purchaseData.netTotal,
        notes: purchaseData.notes
      };

      fetch(`${API_BASE_URL}/api/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      }).then(async (res) => {
        if (res.ok) {
          get().fetchPurchases();
        }
      }).catch((e) => console.error('Failed to sync purchase to DB:', e));
    } catch (e) {
      console.error('Failed to dispatch purchase sync:', e);
    }
  },

  addSupplier: async (supplierData) => {
    const tempId = `sup-${Date.now()}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id: tempId,
      isActive: true
    };
    set((state) => ({
      suppliers: [newSupplier, ...state.suppliers],
      stats: {
        ...state.stats,
        totalSuppliersCount: state.stats.totalSuppliersCount + 1
      }
    }));

    try {
      const token = localStorage.getItem('medeasy_auth_token');
      const res = await fetch(`${API_BASE_URL}/api/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(supplierData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.supplier) {
          set((state) => ({
            suppliers: state.suppliers.map((s) => s.id === tempId ? data.supplier : s)
          }));
        }
      }
    } catch (e) {
      console.error('Failed to sync supplier to DB:', e);
    }
  },

  fetchSuppliers: async () => {
    try {
      const token = localStorage.getItem('medeasy_auth_token');
      const res = await fetch(`${API_BASE_URL}/api/suppliers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suppliers && data.suppliers.length > 0) {
          set((state) => ({
            suppliers: data.suppliers,
            stats: {
              ...state.stats,
              totalSuppliersCount: data.suppliers.length
            }
          }));
        }
      }
    } catch (e) {
      console.error('Failed to fetch suppliers from DB:', e);
    }
  },

  fetchPurchases: async () => {
    try {
      const token = localStorage.getItem('medeasy_auth_token');
      const res = await fetch(`${API_BASE_URL}/api/purchases`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.purchases) {
          set({ purchases: data.purchases });
        }
      }
    } catch (e) {
      console.error('Failed to fetch purchases from DB:', e);
    }
  }
    }),
    {
      name: 'medeasy_pharmacy_store_data',
      partialize: (state) => ({
        medicines: state.medicines,
        customers: state.customers,
        suppliers: state.suppliers,
        purchases: state.purchases,
        salesInvoices: state.salesInvoices,
        stats: state.stats,
        invoiceCounter: state.invoiceCounter,
        stockAdjustments: state.stockAdjustments,
      }),
    }
  )
);

// Auto-load medicines, customers, sales, suppliers, and purchases from backend when app boots
if (typeof window !== 'undefined') {
  setTimeout(() => {
    usePharmacyStore.getState().fetchMedicines();
    usePharmacyStore.getState().fetchCustomers();
    usePharmacyStore.getState().fetchSales();
    usePharmacyStore.getState().fetchSuppliers();
    usePharmacyStore.getState().fetchPurchases();
  }, 100);
}

