import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { storageService } from "../services/storageService";
import { audioService } from "../services/audioService";
import { parserService } from "../services/ParserService";
import { SupabaseService } from "../services/SupabaseService";

const LedgerContext = createContext(null);

export function LedgerProvider({ children }) {
  const [profile, setProfile] = useState(() => storageService.getProfile());
  const [rawCustomers, setRawCustomers] = useState(() => storageService.getCustomers());
  const [transactions, setTransactions] = useState(() => storageService.getTransactions());
  const [promises, setPromises] = useState([
    {
      id: "prom-1",
      customerId: "cust-2",
      customerName: "Amit Sharma",
      amount: 500,
      promiseDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      status: "pending",
      note: "Amit promised to clear ₹500 tomorrow",
    },
  ]);

  // Serving Mode Drafts queue
  const [servingDrafts, setServingDrafts] = useState([]);
  const [isServingMode, setIsServingMode] = useState(false);

  // UI Modals & Navigation state
  const [currentView, setCurrentView] = useState("overview"); // 'overview' | 'ledger' | 'customers' | 'reminders' | 'analytics' | 'tests'
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [reminderCustomerId, setReminderCustomerId] = useState(null);
  const [receiptTx, setReceiptTx] = useState(null); // Proof & Receipt modal
  const [isDailyClosingOpen, setIsDailyClosingOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Interpretation & Ambiguity States
  const [pendingInterpretation, setPendingInterpretation] = useState(null);
  const [ambiguityData, setAmbiguityData] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [overpaymentWarning, setOverpaymentWarning] = useState(null);
  const [creditLimitWarning, setCreditLimitWarning] = useState(null);

  // Smart Confirmation Auto-Save & 5-Second Undo
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [undoState, setUndoState] = useState(null); // { txId, message, timer }

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync to Supabase & localStorage on mount
  useEffect(() => {
    async function initSupabaseData() {
      const dbProfile = await SupabaseService.getProfile();
      if (dbProfile) setProfile(dbProfile);

      const dbCusts = await SupabaseService.getCustomers();
      if (dbCusts && dbCusts.length > 0) {
        setRawCustomers(dbCusts);
      }

      const dbTxs = await SupabaseService.getTransactions();
      if (dbTxs && dbTxs.length > 0) {
        setTransactions(dbTxs);
      }

      const dbProms = await SupabaseService.getPromises();
      if (dbProms && dbProms.length > 0) {
        setPromises(dbProms);
      }
    }

    initSupabaseData();
  }, []);

  // Save to localStorage as immediate offline cache
  useEffect(() => {
    storageService.saveCustomers(rawCustomers);
  }, [rawCustomers]);

  useEffect(() => {
    storageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    storageService.saveProfile(profile);
  }, [profile]);

  // Compute live customer balances derived strictly from transactions
  // Formula: Total Credit - Total Payment = Outstanding
  const customers = useMemo(() => {
    return rawCustomers.map((cust) => {
      const custTxs = transactions.filter((t) => t.customerId === cust.id || t.customer_id === cust.id);

      const totalCredit = custTxs
        .filter((t) => (t.type || "").toUpperCase() === "CREDIT")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const totalPayment = custTxs
        .filter((t) => (t.type || "").toUpperCase() === "PAYMENT")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const outstanding = Math.max(0, totalCredit - totalPayment);
      const advance = Math.max(0, totalPayment - totalCredit);

      let status = "active";
      if (outstanding > 0) {
        const latestTx = custTxs.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const daysAgo = latestTx
          ? Math.floor((new Date() - new Date(latestTx.date)) / (1000 * 60 * 60 * 24))
          : 0;

        if (daysAgo > 30 || outstanding > 3000) {
          status = "overdue";
        } else if (daysAgo > 10 || outstanding > 1500) {
          status = "due";
        }
      }

      const lastTx = custTxs.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      return {
        ...cust,
        outstanding,
        advance,
        totalCredit,
        totalPayment,
        transactionCount: custTxs.length,
        status: cust.statusOverride || status,
        lastTransactionDate: lastTx ? lastTx.date : cust.lastActiveDate || "2026-09-28",
        creditLimit: cust.credit_limit || cust.creditLimit || 5000,
      };
    });
  }, [rawCustomers, transactions]);

  // Dashboard Aggregated Metrics derived strictly from real transactions
  const metrics = useMemo(() => {
    const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstanding || 0), 0);
    const customersWithDues = customers.filter((c) => c.outstanding > 0).length;

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const todayStr = now.toISOString().split("T")[0];

    let weeklyCredit = 0;
    let weeklyPayment = 0;
    let todayCredit = 0;
    let todayPayment = 0;
    let todayCash = 0;
    let todayUPI = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const isCredit = (tx.type || "").toUpperCase() === "CREDIT";
      const isPayment = (tx.type || "").toUpperCase() === "PAYMENT";
      const amt = Number(tx.amount || 0);

      if (txDate >= sevenDaysAgo) {
        if (isCredit) weeklyCredit += amt;
        if (isPayment) weeklyPayment += amt;
      }

      if (tx.date === todayStr) {
        if (isCredit) todayCredit += amt;
        if (isPayment) {
          todayPayment += amt;
          if ((tx.note || "").toLowerCase().includes("upi") || (tx.note || "").toLowerCase().includes("gpay")) {
            todayUPI += amt;
          } else {
            todayCash += amt;
          }
        }
      }
    });

    const netWeeklyChange = weeklyCredit - weeklyPayment;

    return {
      totalOutstanding,
      customersWithDues,
      weeklyCredit,
      weeklyPayment,
      netWeeklyChange,
      todayCredit,
      todayPayment,
      todayCash,
      todayUPI,
      todayNet: todayCredit - todayPayment,
    };
  }, [customers, transactions]);

  // Top Debtors ("Who owes the most?")
  const topDebtors = useMemo(() => {
    return [...customers]
      .filter((c) => c.outstanding > 0)
      .sort((a, b) => b.outstanding - a.outstanding);
  }, [customers]);

  // Add new customer
  const addCustomer = async ({ name, phone = "", address = "", language = "hinglish", creditLimit = 5000 }) => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const newCust = {
      id: `cust-${Date.now()}`,
      shopkeeper_id: "shop-1",
      name: trimmedName,
      phone: phone || "+91 98200 00000",
      address: address || "Local Customer",
      language,
      credit_limit: creditLimit,
      aliases: [trimmedName, `${trimmedName.split(" ")[0]} bhai`],
      created_at: new Date().toISOString(),
    };

    setRawCustomers((prev) => [newCust, ...prev]);
    SupabaseService.addCustomer(newCust);
    showToast(`✓ Added customer: ${trimmedName}`, "success");
    return newCust;
  };

  // Process transaction proposal from voice or text through ParserService
  const interpretInput = async (text, source = "voice") => {
    const result = await parserService.parse(text, customers);

    // 1. If promise to pay detected ("Amit kal dega")
    if (result.isPromise && result.promise) {
      const p = result.promise;
      const matchedCust = customers.find((c) => c.id === p.customerId || c.name === p.customerRef);
      const newProm = {
        id: `prom-${Date.now()}`,
        shopkeeper_id: "shop-1",
        customerId: matchedCust ? matchedCust.id : "cust-1",
        customerName: p.customerRef,
        amount: p.amount,
        promiseDate: p.promiseDate,
        status: "pending",
        note: p.note,
      };

      setPromises((prev) => [newProm, ...prev]);
      SupabaseService.addPromise(newProm);
      showToast(`📅 Recorded: ${p.customerRef} promised to pay ₹${p.amount} ${p.dateLabel}`, "info");
      return;
    }

    // 2. If multi-entry detected ("Ramesh 200 aur Amit 300 de gaye")
    if (result.isMultiEntry && result.entries?.length > 0) {
      if (isServingMode) {
        setServingDrafts((prev) => [...prev, ...result.entries.map((e) => ({ ...e, source }))]);
        showToast(`⚡ Added ${result.entries.length} entries to Serving Drafts`, "success");
        return;
      }

      // Save all multi-entries directly
      result.entries.forEach((entry) => {
        confirmTransaction({
          customerId: entry.customerId || "cust-1",
          customerName: entry.customerRef,
          amount: entry.amount,
          type: entry.type,
          date: entry.date,
          note: entry.note,
          source,
        }, true);
      });
      showToast(`✓ Recorded ${result.entries.length} transactions together`, "success");
      return;
    }

    const entry = result.entries[0];
    if (!entry) return;

    // Check serving mode
    if (isServingMode) {
      setServingDrafts((prev) => [
        ...prev,
        {
          customerRef: entry.customerRef,
          customerId: entry.customerId,
          amount: entry.amount,
          type: entry.type,
          date: entry.date,
          note: entry.note,
          source,
          rawText: text,
        },
      ]);
      audioService.playMicClick();
      showToast(`⚡ Draft added for ${entry.customerRef}`, "info");
      return;
    }

    // Check ambiguities:
    if (entry.ambiguities.includes("NEW_CUSTOMER")) {
      setAmbiguityData({
        type: "new_customer",
        candidateName: entry.customerRef,
        entry,
        rawText: text,
        source,
      });
      return;
    }

    if (entry.ambiguities.includes("UNCLEAR_AMOUNT")) {
      setAmbiguityData({
        type: "unclear_amount",
        customerName: entry.customerRef,
        entry,
        rawText: text,
        source,
      });
      return;
    }

    if (entry.ambiguities.includes("UNCLEAR_TYPE")) {
      setAmbiguityData({
        type: "unclear_type",
        customerName: entry.customerRef,
        amount: entry.amount,
        entry,
        rawText: text,
        source,
      });
      return;
    }

    // High confidence entry
    const matchedCust = customers.find((c) => c.id === entry.customerId || c.name === entry.customerRef);

    // Check overpayment (payment > outstanding)
    if (entry.type === "PAYMENT" && matchedCust && entry.amount > matchedCust.outstanding && matchedCust.outstanding > 0) {
      setOverpaymentWarning({
        customer: matchedCust,
        paymentAmount: entry.amount,
        outstanding: matchedCust.outstanding,
        excess: entry.amount - matchedCust.outstanding,
        entry,
        source,
      });
      return;
    }

    // Check credit limit
    if (entry.type === "CREDIT" && matchedCust) {
      const newPotentialDue = matchedCust.outstanding + entry.amount;
      if (newPotentialDue > matchedCust.creditLimit) {
        setCreditLimitWarning({
          customer: matchedCust,
          currentDue: matchedCust.outstanding,
          newAmount: entry.amount,
          creditLimit: matchedCust.creditLimit,
          entry,
          source,
        });
        return;
      }
    }

    // If auto-save enabled and confidence high: auto-save + 5-sec undo!
    if (autoSaveEnabled && entry.confidence >= 0.9) {
      confirmTransaction({
        customerId: matchedCust ? matchedCust.id : "cust-1",
        customerName: entry.customerRef,
        amount: entry.amount,
        type: entry.type,
        date: entry.date,
        note: entry.note,
        source,
      });
      return;
    }

    // Show Understanding Card
    setPendingInterpretation({
      customer: {
        id: matchedCust ? matchedCust.id : "cust-1",
        name: entry.customerRef,
        phone: matchedCust ? matchedCust.phone : "",
      },
      amount: entry.amount,
      type: entry.type,
      date: entry.date,
      dateLabel: entry.dateLabel,
      note: entry.note,
      rawText: text,
      source,
      confidence: entry.confidence,
    });
  };

  // Confirm and persist transaction
  const confirmTransaction = (txData, bypassChecks = false) => {
    // 1. Duplicate check (within 10 minutes)
    if (!bypassChecks) {
      const recentDup = transactions.find((t) => {
        const timeDiffMins = (Date.now() - new Date(t.createdAt || t.created_at).getTime()) / (1000 * 60);
        return (
          (t.customerId === txData.customerId || t.customer_id === txData.customerId) &&
          Number(t.amount) === Number(txData.amount) &&
          (t.type || "").toUpperCase() === (txData.type || "").toUpperCase() &&
          timeDiffMins < 10
        );
      });

      if (recentDup) {
        setDuplicateWarning({ duplicateTx: recentDup, newTxData: txData });
        return false;
      }
    }

    const newTxId = `tx-${Date.now()}`;
    const newTx = {
      id: newTxId,
      shopkeeper_id: "shop-1",
      customerId: txData.customerId,
      customer_id: txData.customerId,
      customerName: txData.customerName,
      customer_name: txData.customerName,
      amount: Number(txData.amount),
      type: (txData.type || "CREDIT").toUpperCase(),
      date: txData.date || new Date().toISOString().split("T")[0],
      note: txData.note || (txData.type === "CREDIT" ? "Kirana सामान" : "Payment received"),
      source: txData.source || "voice",
      confirmed_by_customer: false,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Save to Supabase
    SupabaseService.addTransaction(newTx);
    SupabaseService.addAuditLog({
      id: `audit-${Date.now()}`,
      shopkeeper_id: "shop-1",
      transaction_id: newTxId,
      action: "INSERT",
      new_value: newTx,
    });

    // Clear modals
    setPendingInterpretation(null);
    setAmbiguityData(null);
    setDuplicateWarning(null);
    setOverpaymentWarning(null);
    setCreditLimitWarning(null);

    // Audio & Confetti
    if (profile.soundEnabled !== false) {
      audioService.playSuccessChime();
    }

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#1E7D4F", "#F4B942", "#B3261E"],
    });

    // Set 5-Second Undo state
    const actionLabel = newTx.type === "CREDIT" ? "credit added" : "payment recorded";
    setUndoState({
      txId: newTxId,
      message: `✓ ${txData.customerName} — ₹${txData.amount} ${actionLabel}`,
      expiresAt: Date.now() + 5000,
    });

    showToast(`✓ ${actionLabel} of ₹${txData.amount} for ${txData.customerName}`, "success");
    return true;
  };

  // Perform Undo
  const triggerUndo = () => {
    if (!undoState) return;
    const targetId = undoState.txId;
    setTransactions((prev) => prev.filter((t) => t.id !== targetId));
    SupabaseService.softDeleteTransaction(targetId);
    setUndoState(null);
    showToast("↶ Transaction undone", "info");
  };

  // Delete transaction with soft-delete & audit log
  const deleteTransaction = (id) => {
    const tx = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    SupabaseService.softDeleteTransaction(id);
    if (tx) {
      SupabaseService.addAuditLog({
        id: `audit-${Date.now()}`,
        shopkeeper_id: "shop-1",
        transaction_id: id,
        action: "SOFT_DELETE",
        old_value: tx,
      });
    }
    showToast("Transaction deleted", "info");
  };

  return (
    <LedgerContext.Provider
      value={{
        profile,
        setProfile,
        customers,
        transactions,
        promises,
        setPromises,
        servingDrafts,
        setServingDrafts,
        isServingMode,
        setIsServingMode,
        metrics,
        topDebtors,
        currentView,
        setCurrentView,
        selectedCustomerId,
        setSelectedCustomerId,
        reminderCustomerId,
        setReminderCustomerId,
        receiptTx,
        setReceiptTx,
        isDailyClosingOpen,
        setIsDailyClosingOpen,
        isAddCustomerOpen,
        setIsAddCustomerOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        pendingInterpretation,
        setPendingInterpretation,
        ambiguityData,
        setAmbiguityData,
        duplicateWarning,
        setDuplicateWarning,
        overpaymentWarning,
        setOverpaymentWarning,
        creditLimitWarning,
        setCreditLimitWarning,
        autoSaveEnabled,
        setAutoSaveEnabled,
        undoState,
        triggerUndo,
        toast,
        showToast,
        interpretInput,
        confirmTransaction,
        addCustomer,
        deleteTransaction,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used within LedgerProvider");
  return ctx;
}
