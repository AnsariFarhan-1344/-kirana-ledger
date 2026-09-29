import { initialCustomers, initialShopProfile, initialTransactions } from "../data/seedData";

const STORAGE_KEYS = {
  PROFILE: "kirana_ledger_profile",
  CUSTOMERS: "kirana_ledger_customers",
  TRANSACTIONS: "kirana_ledger_transactions",
};

export const storageService = {
  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : initialShopProfile;
    } catch {
      return initialShopProfile;
    }
  },

  saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  },

  getCustomers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  },

  saveCustomers(customers) {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error("Failed to save customers:", e);
    }
  },

  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  },

  saveTransactions(transactions) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error("Failed to save transactions:", e);
    }
  },

  resetAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    } catch (e) {
      console.error("Failed to reset:", e);
    }
  }
};
