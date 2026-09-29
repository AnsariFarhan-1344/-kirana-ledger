import { Customer, Transaction, Bill, PromiseToPay, ShopProfile, DisputeRecord } from "./schema";
import { initialKiranaProducts } from "../core/inventory/inventoryEngine";

const getRelativeDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

export const defaultShopProfile: ShopProfile = {
  id: "shop-1",
  shopName: "Gupta Kirana & General Store",
  ownerName: "Rajesh Gupta",
  phone: "+91 98200 45678",
  upiId: "guptakirana@okhdfcbank",
  address: "Shop No. 4, Station Road, Mulund West, Mumbai",
  preferredLanguage: "hi",
  autoSaveEnabled: false,
  fingerprintEnabled: true,
};

export const defaultCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Ramesh Patil",
    phone: "+91 98201 12345",
    address: "Bldg 3, Room 12, Subhash Nagar",
    language: "mr",
    creditLimit: 5000,
    aliases: ["Ramesh", "Ramesh bhai", "Patil ji", "रमेश"],
    createdAt: getRelativeDate(75),
  },
  {
    id: "cust-2",
    name: "Amit Sharma",
    phone: "+91 98202 23456",
    address: "Flat 402, Shivam Enclave",
    language: "hi",
    creditLimit: 6000,
    aliases: ["Amit", "Amit bhai", "Sharma ji", "अमित"],
    createdAt: getRelativeDate(60),
  },
  {
    id: "cust-3",
    name: "Suresh Khan",
    phone: "+91 98203 34567",
    address: "Shop 2, Market Lane",
    language: "hi",
    creditLimit: 4000,
    aliases: ["Suresh", "Suresh bhai", "Khan sahab", "सुरेश"],
    createdAt: getRelativeDate(55),
  },
  {
    id: "cust-4",
    name: "Priya Shah",
    phone: "+91 98204 45678",
    address: "A-14, Gokuldham Society",
    language: "en",
    creditLimit: 3000,
    aliases: ["Priya", "Priya ben", "Shah madam", "प्रिया"],
    createdAt: getRelativeDate(45),
  },
  {
    id: "cust-5",
    name: "Neha Gupta",
    phone: "+91 98205 56789",
    address: "Plot 88, Sector 4",
    language: "hinglish",
    creditLimit: 2500,
    aliases: ["Neha", "Neha bhabhi", "नेहा"],
    createdAt: getRelativeDate(40),
  },
  {
    id: "cust-6",
    name: "Imran Shaikh",
    phone: "+91 98206 67890",
    address: "10/B, Noor Manzil",
    language: "hi",
    creditLimit: 3000,
    aliases: ["Imran", "Imran bhai", "इमरान"],
    createdAt: getRelativeDate(30),
  },
  {
    id: "cust-7",
    name: "Rajesh Yadav",
    phone: "+91 98207 78901",
    address: "C-301, Radha Krishna Park",
    language: "hi",
    creditLimit: 5000,
    aliases: ["Rajesh", "Yadav ji", "राजेश"],
    createdAt: getRelativeDate(65),
  },
];

export const defaultTransactions: Transaction[] = [
  // Ramesh Patil (cust-1) - ~4250 net due
  { id: "tx-1", customerId: "cust-1", customerName: "Ramesh Patil", amount: 1250, type: "CREDIT", method: "unspecified", date: getRelativeDate(28), note: "Monthly groceries, Atta 10kg, Fortune Oil 2L", source: "text", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(28) },
  { id: "tx-2", customerId: "cust-1", customerName: "Ramesh Patil", amount: 500, type: "PAYMENT", method: "cash", date: getRelativeDate(20), note: "Cash payment at counter", source: "voice", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(20) },
  { id: "tx-3", customerId: "cust-1", customerName: "Ramesh Patil", amount: 3000, type: "CREDIT", method: "unspecified", date: getRelativeDate(8), note: "Basmati Rice 25kg bag, spices & tea packets", source: "voice", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(8) },
  { id: "tx-4", customerId: "cust-1", customerName: "Ramesh Patil", amount: 500, type: "CREDIT", method: "unspecified", date: getRelativeDate(1), note: "Dairy items, bread, eggs & biscuits", source: "voice", addedBy: "Rajesh Gupta", confirmedByCustomer: false, createdAt: getRelativeDate(1) },

  // Amit Sharma (cust-2) - ~2800 net due
  { id: "tx-5", customerId: "cust-2", customerName: "Amit Sharma", amount: 2500, type: "CREDIT", method: "unspecified", date: getRelativeDate(22), note: "Dry fruits, cashew, almonds & ghee 1L", source: "text", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(22) },
  { id: "tx-6", customerId: "cust-2", customerName: "Amit Sharma", amount: 1000, type: "PAYMENT", method: "upi", date: getRelativeDate(14), note: "Google Pay UPI payment", source: "voice", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(14) },
  { id: "tx-7", customerId: "cust-2", customerName: "Amit Sharma", amount: 1300, type: "CREDIT", method: "unspecified", date: getRelativeDate(0), note: "Toor Dal 3kg, sugar 5kg, detergent", source: "voice", addedBy: "Rajesh Gupta", confirmedByCustomer: false, createdAt: getRelativeDate(0) },

  // Suresh Khan (cust-3) - ~1950 net due (overdue)
  { id: "tx-8", customerId: "cust-3", customerName: "Suresh Khan", amount: 2450, type: "CREDIT", method: "unspecified", date: getRelativeDate(36), note: "Cold drinks crates & snacks for shop", source: "text", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(36) },
  { id: "tx-9", customerId: "cust-3", customerName: "Suresh Khan", amount: 500, type: "PAYMENT", method: "cash", date: getRelativeDate(32), note: "Partial cash settlement", source: "manual", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(32) },

  // Priya Shah (cust-4) - ~1200 net due
  { id: "tx-10", customerId: "cust-4", customerName: "Priya Shah", amount: 1500, type: "CREDIT", method: "unspecified", date: getRelativeDate(6), note: "Spices, refined oil 2L, poha & oats", source: "voice", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(6) },
  { id: "tx-11", customerId: "cust-4", customerName: "Priya Shah", amount: 300, type: "PAYMENT", method: "cash", date: getRelativeDate(2), note: "Cash handed by son", source: "voice", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(2) },

  // Neha Gupta (cust-5) - ~750 net due
  { id: "tx-12", customerId: "cust-5", customerName: "Neha Gupta", amount: 950, type: "CREDIT", method: "unspecified", date: getRelativeDate(5), note: "Soap, shampoo, toothpaste & biscuits", source: "voice", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(5) },
  { id: "tx-13", customerId: "cust-5", customerName: "Neha Gupta", amount: 200, type: "PAYMENT", method: "cash", date: getRelativeDate(1), note: "Cash return", source: "text", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(1) },

  // Imran Shaikh (cust-6) - ~620 net due
  { id: "tx-14", customerId: "cust-6", customerName: "Imran Shaikh", amount: 820, type: "CREDIT", method: "unspecified", date: getRelativeDate(12), note: "Chana dal, besan, mustard oil 1L", source: "text", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(12) },
  { id: "tx-15", customerId: "cust-6", customerName: "Imran Shaikh", amount: 200, type: "PAYMENT", method: "upi", date: getRelativeDate(8), note: "PhonePe payment", source: "voice", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(8) },

  // Rajesh Yadav (cust-7) - ~3100 net due (overdue)
  { id: "tx-16", customerId: "cust-7", customerName: "Rajesh Yadav", amount: 3600, type: "CREDIT", method: "unspecified", date: getRelativeDate(42), note: "Wheat flour 30kg, Mustard oil 5L tin", source: "manual", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(42) },
  { id: "tx-17", customerId: "cust-7", customerName: "Rajesh Yadav", amount: 500, type: "PAYMENT", method: "cash", date: getRelativeDate(35), note: "Paid at shop counter", source: "voice", addedBy: "Rajesh Gupta", confirmedByCustomer: true, createdAt: getRelativeDate(35) },
];

export const defaultBills: Bill[] = [
  {
    id: "bill-1041",
    billNumber: "HB-1041",
    customerId: "cust-1",
    customerName: "Ramesh Patil",
    date: getRelativeDate(8),
    items: [
      { name: "Basmati Rice 25kg", qty: 1, unit: "bag", price: 2400 },
      { name: "Red Label Tea 500g", qty: 2, unit: "packet", price: 520 },
      { name: "Everest Masala", qty: 2, unit: "packet", price: 80 },
    ],
    totalAmount: 3000,
    paidAmount: 0,
    remainingAmount: 3000,
    status: "UNPAID",
    linkedTransactionId: "tx-3",
    createdAt: getRelativeDate(8),
  },
  {
    id: "bill-1042",
    billNumber: "HB-1042",
    customerId: "cust-2",
    customerName: "Amit Sharma",
    date: getRelativeDate(0),
    items: [
      { name: "Toor Dal", qty: 3, unit: "kg", price: 495 },
      { name: "Sugar", qty: 5, unit: "kg", price: 220 },
      { name: "Surf Excel 1kg", qty: 4, unit: "packet", price: 560 },
    ],
    totalAmount: 1300,
    paidAmount: 0,
    remainingAmount: 1300,
    status: "UNPAID",
    linkedTransactionId: "tx-7",
    createdAt: getRelativeDate(0),
  },
];

export const defaultPromises: PromiseToPay[] = [
  {
    id: "prom-1",
    customerId: "cust-2",
    customerName: "Amit Sharma",
    amount: 500,
    promiseDate: getRelativeDate(-1), // Tomorrow
    status: "pending",
    note: "Amit promised ₹500 tomorrow evening",
    createdAt: getRelativeDate(0),
  },
  {
    id: "prom-2",
    customerId: "cust-6",
    customerName: "Imran Shaikh",
    amount: 620,
    promiseDate: getRelativeDate(-3), // In 3 days
    status: "pending",
    note: "Will clear full balance after Friday namaz",
    createdAt: getRelativeDate(2),
  },
];

export const defaultDisputes: DisputeRecord[] = [
  {
    id: "disp-1",
    transactionId: "tx-4",
    customerId: "cust-1",
    customerName: "Ramesh Patil",
    reason: "Incorrect item amount",
    status: "OPEN",
    customerNote: "Maine kal 2 bread liya tha, hisaab mein 500 rupaye likha hai.",
    createdAt: getRelativeDate(1),
  },
];
