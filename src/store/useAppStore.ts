import { create } from 'zustand';
import { repository } from '../db/repository';
import { Customer, Transaction, Bill, PromiseToPay, ShopProfile, DisputeRecord } from '../db/schema';
import { ProductRecord } from '../core/inventory/inventoryEngine';
import { ParsedEntry } from '../core/parser/ParserService';
import { changeLanguage } from '../i18n';

export type UserRole = 'shopkeeper' | 'customer';

export type TabKey =
  | 'overview'
  | 'ledger'
  | 'inventory'
  | 'bills'
  | 'reminders'
  | 'insights'
  | 'more'
  | 'settings'
  | 'tests'
  | 'suppliers';

export interface SafetyModalState {
  type:
    | 'NEW_CUSTOMER'
    | 'UNCLEAR_AMOUNT'
    | 'UNCLEAR_TYPE'
    | 'UNCLEAR_CUSTOMER'
    | 'INVALID_INPUT'
    | 'DUPLICATE'
    | 'OVERPAYMENT'
    | 'CREDIT_LIMIT'
    | 'LOW_STOCK';
  payload: any;
}

interface AppState {
  // Navigation & Role
  role: UserRole;
  activeTab: TabKey;
  activeCustomer: Customer | null;
  activeCustomerModeShop: ShopProfile | null;

  // Domain Data from Repository
  profile: ShopProfile;
  customers: Customer[];
  transactions: Transaction[];
  bills: Bill[];
  products: ProductRecord[];
  promises: PromiseToPay[];
  disputes: DisputeRecord[];

  // Serving Mode Drafts
  servingDrafts: ParsedEntry[];
  isServingModeOpen: boolean;

  // Dialogs & Modals
  isDailyClosingOpen: boolean;
  activeReceiptBill: Bill | null;
  activeSafetyModal: SafetyModalState | null;
  activeParsedEntry: ParsedEntry | null;
  isCalculatorOpen: boolean;
  isManualEntryOpen: boolean;
  isQrStandeeOpen: boolean;

  // Undo Notification
  undoToast: {
    txId: string;
    customerName: string;
    amount: number;
    type: 'CREDIT' | 'PAYMENT';
    timeLeft: number;
  } | null;

  // Settings
  autoSaveEnabled: boolean;
  currentLanguage: 'en' | 'hi' | 'mr';
  stockTrackingEnabled: boolean;
  badaTextMode: boolean;
  developerUnlocked: boolean;
  streakDays: number;
  speechLocale: 'hi-IN' | 'mr-IN' | 'en-IN';
  voiceQueryAnswer: any | null;
  isOnboardingDone: boolean;

  // Actions
  setRole: (role: UserRole) => void;
  setActiveTab: (tab: TabKey) => void;
  setActiveCustomer: (customer: Customer | null) => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
  setAutoSave: (enabled: boolean) => void;
  setStockTrackingEnabled: (enabled: boolean) => void;
  setBadaTextMode: (enabled: boolean) => void;
  setDeveloperUnlocked: (unlocked: boolean) => void;
  setSpeechLocale: (locale: 'hi-IN' | 'mr-IN' | 'en-IN') => void;
  setVoiceQueryAnswer: (answer: any | null) => void;
  setIsOnboardingDone: (done: boolean) => void;
  mergeCustomers: (sourceId: string, targetId: string) => void;
  repeatCustomerOrder: (customerId: string) => void;

  // Data Actions
  refreshData: () => void;
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  commitTransaction: (params: {
    customerId: string;
    customerName: string;
    amount: number;
    type: 'CREDIT' | 'PAYMENT';
    method?: 'cash' | 'upi' | 'unspecified';
    date?: string;
    note?: string;
    source?: 'voice' | 'text' | 'manual';
    items?: Array<{ name: string; qty: number; unit: string; price?: number }>;
  }) => { transaction: Transaction; bill?: Bill };
  undoTransaction: (txId: string) => void;
  adjustProductStock: (productId: string, change: number) => void;

  // Promises & Disputes
  addPromise: (p: Omit<PromiseToPay, 'id' | 'createdAt'>) => void;
  raiseDispute: (d: Omit<DisputeRecord, 'id' | 'createdAt'>) => void;
  resolveDispute: (id: string, status: 'RESOLVED' | 'REJECTED') => void;
  confirmCustomerAck: (txId: string) => void;

  // Serving Mode
  setServingMode: (open: boolean) => void;
  addServingDraft: (draft: ParsedEntry) => void;
  confirmServingDraft: (index: number) => void;
  clearServingDrafts: () => void;

  // Modals
  setDailyClosing: (open: boolean) => void;
  setReceiptBill: (bill: Bill | null) => void;
  setSafetyModal: (modal: SafetyModalState | null) => void;
  setActiveParsedEntry: (entry: ParsedEntry | null) => void;
  setIsCalculatorOpen: (open: boolean) => void;
  setIsManualEntryOpen: (open: boolean) => void;
  setIsQrStandeeOpen: (open: boolean) => void;
  clearUndoToast: () => void;

  // Reset
  resetDemoData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  role: 'shopkeeper',
  activeTab: 'overview',
  activeCustomer: null,
  activeCustomerModeShop: repository.getProfile(),

  profile: repository.getProfile(),
  customers: repository.getCustomers(),
  transactions: repository.getTransactions(),
  bills: repository.getBills(),
  products: repository.getProducts(),
  promises: repository.getPromises(),
  disputes: repository.getDisputes(),

  servingDrafts: [],
  isServingModeOpen: false,

  isDailyClosingOpen: false,
  activeReceiptBill: null,
  activeSafetyModal: null,
  activeParsedEntry: null,
  isCalculatorOpen: false,
  isManualEntryOpen: false,
  isQrStandeeOpen: false,

  undoToast: null,
  autoSaveEnabled: true,
  currentLanguage: 'en',
  stockTrackingEnabled: true,
  badaTextMode: false,
  developerUnlocked: false,
  streakDays: 7,
  speechLocale: 'hi-IN',
  voiceQueryAnswer: null,
  isOnboardingDone: true,

  setRole: (role) => set({ role, activeCustomer: null }),
  setActiveTab: (activeTab) => set({ activeTab, activeCustomer: null }),
  setActiveCustomer: (activeCustomer) => set({ activeCustomer }),

  setLanguage: (lang) => {
    changeLanguage(lang);
    set({ currentLanguage: lang });
  },

  setAutoSave: (autoSaveEnabled) => set({ autoSaveEnabled }),

  refreshData: () => {
    set({
      profile: repository.getProfile(),
      customers: repository.getCustomers(),
      transactions: repository.getTransactions(),
      bills: repository.getBills(),
      products: repository.getProducts(),
      promises: repository.getPromises(),
      disputes: repository.getDisputes(),
    });
  },

  addCustomer: (data) => {
    const cust = repository.addCustomer(data);
    get().refreshData();
    return cust;
  },

  commitTransaction: (params) => {
    const res = repository.atomicCommitTransaction(params);
    get().refreshData();

    // Trigger 5-second undo toast
    set({
      undoToast: {
        txId: res.transaction.id,
        customerName: res.transaction.customerName,
        amount: res.transaction.amount,
        type: res.transaction.type,
        timeLeft: 5,
      },
    });

    return { transaction: res.transaction, bill: res.bill };
  },

  undoTransaction: (txId) => {
    repository.atomicReverseTransaction(txId);
    get().refreshData();
    set({ undoToast: null });
  },

  adjustProductStock: (productId, change) => {
    repository.adjustStock(productId, change);
    get().refreshData();
  },

  addPromise: (p) => {
    repository.addPromise(p);
    get().refreshData();
  },

  raiseDispute: (d) => {
    repository.raiseDispute(d);
    get().refreshData();
  },

  resolveDispute: (id, status) => {
    repository.resolveDispute(id, status);
    get().refreshData();
  },

  confirmCustomerAck: (txId) => {
    repository.confirmCustomerAcknowledgement(txId);
    get().refreshData();
  },

  setServingMode: (open) => set({ isServingModeOpen: open }),

  addServingDraft: (draft) => {
    set((state) => ({ servingDrafts: [draft, ...state.servingDrafts] }));
  },

  confirmServingDraft: (index) => {
    const drafts = [...get().servingDrafts];
    const draft = drafts[index];
    if (!draft) return;

    // Find customer by alias or create
    let cust = get().customers.find((c) =>
      c.name.toLowerCase().includes(draft.customerRef.toLowerCase())
    );

    if (!cust) {
      cust = repository.addCustomer({
        name: draft.customerRef,
        phone: '9820199999',
        language: 'Hinglish',
        creditLimit: 5000,
        aliases: [draft.customerRef],
      });
    }

    repository.atomicCommitTransaction({
      customerId: cust.id,
      customerName: cust.name,
      amount: draft.amount,
      type: draft.type === 'UNKNOWN' ? 'CREDIT' : draft.type,
      method: draft.method,
      date: draft.date,
      note: draft.note,
      items: draft.items,
      source: 'voice',
    });

    drafts.splice(index, 1);
    set({ servingDrafts: drafts });
    get().refreshData();
  },

  clearServingDrafts: () => set({ servingDrafts: [] }),

  setDailyClosing: (open) => set({ isDailyClosingOpen: open }),
  setReceiptBill: (activeReceiptBill) => set({ activeReceiptBill }),
  setSafetyModal: (activeSafetyModal) => set({ activeSafetyModal }),
  setActiveParsedEntry: (activeParsedEntry) => set({ activeParsedEntry }),
  setIsCalculatorOpen: (isCalculatorOpen) => set({ isCalculatorOpen }),
  setIsManualEntryOpen: (isManualEntryOpen) => set({ isManualEntryOpen }),
  setIsQrStandeeOpen: (isQrStandeeOpen) => set({ isQrStandeeOpen }),
  clearUndoToast: () => set({ undoToast: null }),

  setStockTrackingEnabled: (stockTrackingEnabled) => set({ stockTrackingEnabled }),
  setBadaTextMode: (badaTextMode) => set({ badaTextMode }),
  setDeveloperUnlocked: (developerUnlocked) => set({ developerUnlocked }),
  setSpeechLocale: (speechLocale) => set({ speechLocale }),
  setVoiceQueryAnswer: (voiceQueryAnswer) => set({ voiceQueryAnswer }),
  setIsOnboardingDone: (isOnboardingDone) => set({ isOnboardingDone }),

  mergeCustomers: (sourceId, targetId) => {
    repository.mergeCustomers(sourceId, targetId);
    get().refreshData();
  },

  repeatCustomerOrder: (customerId) => {
    const cust = get().customers.find((c) => c.id === customerId);
    if (!cust) return;
    const credits = get().transactions
      .filter((t) => t.customerId === customerId && t.type === 'CREDIT')
      .sort((a, b) => b.date.localeCompare(a.date));
    const lastCredit = credits[0];
    if (!lastCredit) return;

    set({
      activeParsedEntry: {
        customerRef: cust.name,
        customerId: cust.id,
        amount: lastCredit.amount,
        type: 'CREDIT',
        method: lastCredit.method || 'unspecified',
        date: new Date().toISOString().split('T')[0],
        dateLabel: 'Today',
        items: lastCredit.items || [],
        note: `Dobara wahi maal (${lastCredit.note || 'Kirana'})`,
        confidence: 1,
        ambiguities: [],
      },
      activeTab: 'overview',
    });
  },

  resetDemoData: () => {
    repository.resetAll();
    get().refreshData();
  },
}));
