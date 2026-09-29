# Kirana Ledger — Bolke Hisaab Rakho 📱🌾
> **Your shop's ledger, understood by AI.**  
> An installable Android app (iOS-ready) built with Expo SDK 57 + React Native + TypeScript for Indian kirana shopkeepers and their customers.

---

## 🌟 What Is Kirana Ledger?
Kirana Ledger replaces paper bahi-khatas with an invisible, voice-driven digital ledger. A busy shopkeeper with hands coated in flour or oil can simply speak **ONE normal sentence** in Hinglish, Hindi, Marathi, or English:

> *"Ramesh ne 500 rupaye ka maal liya"*  
> *"रमेशने पाचशे रुपयांचा माल घेतला"*  
> *"Amit ne 200 de diye"*  
> *"Priya ne 2 kilo sugar liya 180 ki"*

### In 1 Second, Kirana Ledger Atomically Updates:
1. **Customer Balance** (Credit + / Payment −)
2. **Sequential Bill** (`HB-1042` digital parchi)
3. **Inventory Stock** (e.g. Sugar −2 kg)
4. **Instant 5-Second Undo Toast** to reverse if mistaken.

---

## 🚀 Quick Start Guide (For First-Time App Builders)

### 1. Install Dependencies
Make sure you have [Node.js](https://nodejs.org) installed on your computer.
```bash
npm install
```

### 2. Run the App Locally (Expo Go)
For immediate UI check on your computer or phone screen:
```bash
npx expo start
```
- Press `a` in the terminal to open in Android Emulator, or scan the terminal QR code using the **Expo Go** app on your Android phone.
- *Note:* Expo Go allows full testing of UI, navigation, offline ledger math, inventory, bills, WhatsApp reminders, and typed input. For live native continuous microphone speech recognition, create a development build as shown below.

### 3. Run Unit Tests (100% Passing)
Runs 42 unit test cases across pure ledger math, FIFO bill reduction, 25 seeded inventory products, and multilingual sentence parsing:
```bash
npm test
```

---

## 📦 How to Build the APK & Install on Your Phone

### Option A: Installable Test APK (Fastest way to get the app on your phone)
Run this single command to produce a direct `.apk` download link from Expo Application Services (EAS):
```bash
npx eas-cli login
npx eas-cli build -p android --profile preview
```
1. EAS will build your APK in the cloud.
2. When finished, it outputs a download link and QR code in your terminal.
3. Open the link on your Android phone to download and install `Kirana-Ledger.apk`!

### Option B: Development Build (With Native Microphone & Audio)
```bash
npx eas-cli build -p android --profile development
```
Or build locally if you have Android Studio installed:
```bash
npx expo run:android
```

### Option C: Production Release for Google Play Store (AAB)
```bash
npx eas-cli build -p android --profile production
```
To submit directly to Google Play:
```bash
npx eas-cli submit -p android
```

---

## 🔑 What You Must Do Yourself (Accounts & Keys)

1. **Expo Account (Free):**  
   Create a free account at [expo.dev](https://expo.dev) and run `npx eas-cli login`.
2. **Google Play Developer Account (~$25 one-time):**  
   Register at [play.google.com/console](https://play.google.com/console) if you wish to publish to the Google Play Store.
3. **Android Keystore:**  
   EAS automatically generates and manages your secure release keystore. You do not need to create one manually.
4. **Customizing Shop Name & UPI ID:**  
   Open the app, tap **More > Settings**, and change:
   - Shop Name (default: *Patil Kirana & General Store*)
   - Owner Name (default: *Ramesh Patil*)
   - Merchant UPI ID (e.g. `yourname@okhdfcbank` or `yourname@paytm`)
   All bills and QR codes will immediately generate using your custom UPI details!

---

## 🎨 Theme: "Hara Bharosa" (Green = Trust + Money)

Kirana Ledger adheres to a strict, accessible financial color palette:
- **PAYMENT / Positive / Paid:** Green (`#16A34A` / `#22C55E`). Indicated with `−` sign on due and down-arrow.
- **CREDIT / Udhaar / Pending:** Amber (`#F59E0B`). Indicated with `+` sign and up-arrow. High-contrast dark text.
- **OVERDUE (>30 Days) / Disputes:** Red (`#DC2626`). Used sparingly for critical debt situations.
- **AI Understanding Moments:** Info Blue (`#2563EB`). Outlines the AI confirmation card.

---

## 📁 Project Architecture & Clean Modules

```text
├── app.config.ts           # Expo app configuration, permissions & package ID
├── eas.json                # EAS cloud build profiles (development, preview, production)
├── package.json            # Expo SDK 57 dependencies
├── App.tsx                 # Root coordinator, bottom navigation, hardware back handling
├── index.ts                # Application registration entry point
├── tests/
│   ├── parser.test.ts      # 40+ sentences across EN, HI, MR, and Hinglish
│   ├── ledger.test.ts      # Ledger math, debtor status & FIFO bill allocation
│   └── inventory.test.ts   # 25 kirana products & stock management
├── src/
│   ├── config/
│   │   └── brand.ts        # Single source of truth for BRAND_NAME, TAGLINE, SUBLINE
│   ├── theme/
│   │   ├── colors.ts       # "Hara Bharosa" tokens (light & dark mode)
│   │   └── typography.ts   # 48dp tap targets, >=16sp body, >=20sp money
│   ├── core/
│   │   ├── parser/         # Rule-based multilingual Hinglish/Hindi/Marathi NLU parser
│   │   ├── ledger/         # Pure derived balance math: sum(CREDIT) - sum(PAYMENT)
│   │   ├── bills/          # Sequential HB-1042 bills & FIFO payment allocation
│   │   ├── inventory/      # 25 seeded kirana items & stock level checks
│   │   └── reminders/      # Multi-lingual polite templates (EN/HI/MR/Hinglish)
│   ├── db/
│   │   ├── schema.ts       # TypeScript domain models
│   │   ├── seedData.ts     # 7 realistic kirana customers over 60 days
│   │   └── repository.ts   # Atomic commit & atomic reversal (soft delete)
│   ├── store/
│   │   └── useAppStore.ts  # Zustand reactive state store
│   ├── i18n/
│   │   ├── en.json         # English translations
│   │   ├── hi.json         # Hindi (हिन्दी) translations
│   │   └── mr.json         # Marathi (मराठी) translations
│   ├── components/
│   │   ├── Header.tsx      # Brand header with language & role toggle
│   │   ├── BottomNav.tsx   # Bottom tabs with raised green center microphone button
│   │   ├── MicWaveform.tsx # Animated green pulsation voice assistant overlay
│   │   ├── UnderstandingCard.tsx # Blue AI confirmation card with inline edit
│   │   ├── SafetyModals.tsx# 7 safety modals (unclear amount/type/new customer/etc.)
│   │   ├── ServingModeModal.tsx  # Rush-hour hands-free drafts queue
│   │   ├── DailyClosingModal.tsx # Roz Ka Hisaab day-end closing modal
│   │   └── ReceiptModal.tsx      # Clean HB-1042 receipt with UPI QR code
│   └── screens/
│       ├── OverviewScreen.tsx    # Hero input, story strip, top metrics & debtors
│       ├── LedgerScreen.tsx      # Searchable customer list & add customer
│       ├── CustomerDetailScreen.tsx # Chronological timeline & inline mic input
│       ├── InventoryScreen.tsx   # 25 products with + / − stock adjustment
│       ├── BillsScreen.tsx       # Bills list with paid/unpaid filters
│       ├── RemindersScreen.tsx   # Amber reminder generator & WhatsApp deep-link
│       ├── InsightsScreen.tsx    # Weekly analytics & AI takeaway
│       ├── SuppliersScreen.tsx   # Wholesaler khata
│       ├── SettingsScreen.tsx    # Shop profile, PIN, language & data reset
│       ├── ParserTestsScreen.tsx # In-app 40+ sentence test runner
│       └── CustomerHomeScreen.tsx# "My Khata" view with [Sahi hai ✓] confirmation
```

---

## 🛠️ Common First-Time Troubleshooting

1. **"EAS command not found"**  
   Run: `npm install -g eas-cli` or prefix commands with `npx eas-cli`.
2. **"Permission Denied for Audio"**  
   If microphone access is denied in phone settings, the app gracefully falls back to typed input and demo phrases without crashing.
3. **"How to test on low-end Android phones?"**  
   The UI is optimized for 360dp width screens, uses FlatList virtualization, Hermes JavaScript engine, zero heavy Lottie animations, and lightweight reactive state.
