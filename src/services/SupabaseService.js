import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bhkccrglfrkiynryobsy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoa2NjcmdsZnJraXlucnlvYnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MTMyODQsImV4cCI6MjEwNjE4OTI4NH0.n-II5PdQoN6TuefF3wJQglCHLTM5ahMpnubAMD9rp1g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SupabaseService = {
  // 1. PROFILES
  async getProfile(shopId = "shop-1") {
    try {
      const { data, error } = await supabase
        .from("hisab_profiles")
        .select("*")
        .eq("id", shopId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase getProfile fallback:", e.message);
      return null;
    }
  },

  async updateProfile(shopId = "shop-1", updates) {
    try {
      const { data, error } = await supabase
        .from("hisab_profiles")
        .update(updates)
        .eq("id", shopId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase updateProfile fallback:", e.message);
      return null;
    }
  },

  // 2. CUSTOMERS
  async getCustomers(shopId = "shop-1") {
    try {
      const { data, error } = await supabase
        .from("hisab_customers")
        .select("*")
        .eq("shopkeeper_id", shopId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase getCustomers fallback:", e.message);
      return null;
    }
  },

  async addCustomer(customer) {
    try {
      const { data, error } = await supabase
        .from("hisab_customers")
        .insert([customer])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase addCustomer fallback:", e.message);
      return null;
    }
  },

  // 3. TRANSACTIONS
  async getTransactions(shopId = "shop-1") {
    try {
      const { data, error } = await supabase
        .from("hisab_transactions")
        .select("*")
        .eq("shopkeeper_id", shopId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase getTransactions fallback:", e.message);
      return null;
    }
  },

  async addTransaction(tx) {
    try {
      const { data, error } = await supabase
        .from("hisab_transactions")
        .insert([tx])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase addTransaction fallback:", e.message);
      return null;
    }
  },

  async softDeleteTransaction(txId, shopId = "shop-1") {
    try {
      const { data, error } = await supabase
        .from("hisab_transactions")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", txId)
        .eq("shopkeeper_id", shopId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase softDeleteTransaction fallback:", e.message);
      return null;
    }
  },

  // 4. PROMISES TO PAY
  async getPromises(shopId = "shop-1") {
    try {
      const { data, error } = await supabase
        .from("hisab_promises")
        .select("*")
        .eq("shopkeeper_id", shopId)
        .order("promise_date", { ascending: true });

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase getPromises fallback:", e.message);
      return null;
    }
  },

  async addPromise(promiseData) {
    try {
      const { data, error } = await supabase
        .from("hisab_promises")
        .insert([promiseData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase addPromise fallback:", e.message);
      return null;
    }
  },

  // 5. AUDIT LOGS
  async addAuditLog(logEntry) {
    try {
      const { data, error } = await supabase
        .from("hisab_audit_logs")
        .insert([logEntry]);

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase addAuditLog fallback:", e.message);
      return null;
    }
  }
};
