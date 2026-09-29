# Privacy Policy & Data Safety — Kirana Ledger

**Effective Date:** September 2026  
**Product:** Kirana Ledger ("Bolke hisaab rakho")  
**Package:** `com.kiranaledger.app`

---

## 1. Overview
Kirana Ledger is an offline-first mobile bookkeeping assistant designed specifically for Indian small business owners (kirana shops, general stores, tea stalls, and local merchants) and their customers. 

**Core Privacy Principle:** We believe a shopkeeper's financial ledger is sacred and private. Your data stays on your device.

---

## 2. What Data Is Collected & Where It Lives
- **Local On-Device Storage:** All ledger entries, customer names, phone numbers, credit/payment records, inventory quantities, bills (`HB-1042`), promises to pay, and dispute logs are stored **strictly on your physical device** in local encrypted SQLite database storage.
- **No Remote Tracking or Analytics:** The app contains zero third-party tracking SDKs, zero advertising networks, and zero passive telemetry trackers.
- **Microphone & Speech Processing:** 
  - Microphone access is requested only when you tap the voice button or use Serving Mode.
  - Natural speech is parsed into ledger entries. Voice audio recordings are **never stored on remote servers or sold to third parties**.
- **Camera Access:**
  - Used solely for scanning product barcodes to add items to inventory or scanning merchant UPI QR codes.
  - Images captured during barcode scanning are processed directly on-device and discarded immediately.

---

## 3. Data That Leaves Your Device
Data only leaves your phone when **YOU explicitly initiate an action**:
1. **WhatsApp Share:** When you choose to share a bill parchi or payment reminder with a customer, the formatted text and receipt summary are transferred directly to your device's WhatsApp application.
2. **UPI Apps:** When payment is requested, standard deep-links (`upi://pay?pa=...`) invoke installed UPI applications (Google Pay, PhonePe, Paytm, BHIM) on the customer or merchant device.
3. **Receipt Sanitization:** All shared receipts automatically strip internal database primary keys, private merchant notes, and system metadata to prevent accidental information leaks.

---

## 4. User Rights & Data Deletion
- **Full Data Ownership:** You retain complete and total ownership over all records.
- **Instant Data Reset / Purge:** You can wipe all stored data at any time from **Settings > Reset Demo Data** or **Settings > Clear All Ledger Data**.
- **No Account Lock-in:** The offline application does not require a password-protected cloud account or subscription to function.

---

## 5. Regulatory Disclaimer
Kirana Ledger is a **digital bookkeeping and record-keeping tool**. It is **not** a bank, a registered non-banking financial company (NBFC), an escrow agent, or a payment aggregator. It does not hold customer funds or intermediate monetary settlements.

---

## 6. Contact
For questions regarding data safety or this policy, contact the Kirana Ledger team at:  
`support@kiranaledger.app`
