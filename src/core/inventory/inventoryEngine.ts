/**
 * Pure Inventory Engine (Framework-free TypeScript)
 * Manages Kirana product catalog, stock movements, and low stock thresholds.
 */

export interface ProductRecord {
  productId: string;
  shopkeeperId?: string;
  productName: string;
  category: string;
  unit: string; // 'kg' | 'L' | 'packet' | 'pcs'
  sellingPrice: number;
  currentStock: number;
  lowStockThreshold: number;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  change: number; // positive = stock in, negative = sale/out
  reason: "sale" | "purchase" | "correction" | "return";
  linkedTransactionId?: string;
  createdAt: string;
}

export const initialKiranaProducts: ProductRecord[] = [
  { productId: "prod-1", productName: "Sugar (साखर / चीनी)", category: "Essentials", unit: "kg", sellingPrice: 44, currentStock: 35, lowStockThreshold: 10, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-2", productName: "Basmati Rice (बासमती तांदूळ)", category: "Grains", unit: "kg", sellingPrice: 110, currentStock: 4, lowStockThreshold: 10, createdAt: "2026-08-01", updatedAt: "2026-09-29" }, // Low Stock
  { productId: "prod-3", productName: "Kolam Rice (कोलम तांदूळ)", category: "Grains", unit: "kg", sellingPrice: 65, currentStock: 45, lowStockThreshold: 15, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-4", productName: "Fortune Sunflower Oil 1L", category: "Oils", unit: "L", sellingPrice: 145, currentStock: 18, lowStockThreshold: 6, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-5", productName: "Mustard Oil (सरसों का तेल) 1L", category: "Oils", unit: "L", sellingPrice: 160, currentStock: 0, lowStockThreshold: 5, createdAt: "2026-08-01", updatedAt: "2026-09-29" }, // Out of stock
  { productId: "prod-6", productName: "Aashirvaad Atta 10kg", category: "Flours", unit: "packet", sellingPrice: 420, currentStock: 8, lowStockThreshold: 4, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-7", productName: "Toor Dal (तूर डाळ)", category: "Pulses", unit: "kg", sellingPrice: 165, currentStock: 3, lowStockThreshold: 8, createdAt: "2026-08-01", updatedAt: "2026-09-29" }, // Low Stock
  { productId: "prod-8", productName: "Chana Dal (चना डाळ)", category: "Pulses", unit: "kg", sellingPrice: 95, currentStock: 22, lowStockThreshold: 6, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-9", productName: "Moong Dal (मूंग डाळ)", category: "Pulses", unit: "kg", sellingPrice: 120, currentStock: 14, lowStockThreshold: 5, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-10", productName: "Tata Salt 1kg", category: "Essentials", unit: "packet", sellingPrice: 28, currentStock: 40, lowStockThreshold: 12, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-11", productName: "Red Label Tea 500g", category: "Beverages", unit: "packet", sellingPrice: 260, currentStock: 12, lowStockThreshold: 5, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-12", productName: "Amul Butter 500g", category: "Dairy", unit: "packet", sellingPrice: 275, currentStock: 6, lowStockThreshold: 4, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-13", productName: "Amul Taaza Milk 500ml", category: "Dairy", unit: "packet", sellingPrice: 27, currentStock: 24, lowStockThreshold: 10, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-14", productName: "Parle-G Biscuit 100g", category: "Snacks", unit: "packet", sellingPrice: 10, currentStock: 65, lowStockThreshold: 20, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-15", productName: "Good Day Cookies", category: "Snacks", unit: "packet", sellingPrice: 35, currentStock: 28, lowStockThreshold: 10, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-16", productName: "Maggi 2-Minute Noodles", category: "Packaged", unit: "packet", sellingPrice: 14, currentStock: 50, lowStockThreshold: 15, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-17", productName: "Lifebuoy Soap 125g", category: "Personal Care", unit: "pcs", sellingPrice: 38, currentStock: 30, lowStockThreshold: 8, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-18", productName: "Dettol Soap 75g", category: "Personal Care", unit: "pcs", sellingPrice: 42, currentStock: 2, lowStockThreshold: 6, createdAt: "2026-08-01", updatedAt: "2026-09-29" }, // Low Stock
  { productId: "prod-19", productName: "Surf Excel 1kg", category: "Cleaning", unit: "packet", sellingPrice: 140, currentStock: 16, lowStockThreshold: 5, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-20", productName: "Vim Bar 300g", category: "Cleaning", unit: "pcs", sellingPrice: 20, currentStock: 35, lowStockThreshold: 10, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-21", productName: "Everest Turmeric Powder 100g", category: "Spices", unit: "packet", sellingPrice: 38, currentStock: 18, lowStockThreshold: 5, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-22", productName: "Everest Red Chilli 100g", category: "Spices", unit: "packet", sellingPrice: 48, currentStock: 15, lowStockThreshold: 5, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-23", productName: "Gowardhan Cow Ghee 500ml", category: "Dairy", unit: "L", sellingPrice: 360, currentStock: 7, lowStockThreshold: 3, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-24", productName: "Poha (पोहा / चिवडा पोहे) 1kg", category: "Grains", unit: "kg", sellingPrice: 55, currentStock: 19, lowStockThreshold: 6, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
  { productId: "prod-25", productName: "Besan (बेसन) 500g", category: "Flours", unit: "packet", sellingPrice: 58, currentStock: 11, lowStockThreshold: 4, createdAt: "2026-08-01", updatedAt: "2026-09-29" },
];

export function getProductStockStatus(product: ProductRecord): "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" {
  if (product.currentStock <= 0) return "OUT_OF_STOCK";
  if (product.currentStock <= product.lowStockThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

/**
 * Validates whether requested quantity can be fulfilled
 */
export function checkStockAvailability(
  product: ProductRecord,
  requestedQty: number
): { canFulfill: boolean; available: number; deficit: number } {
  const available = Math.max(0, product.currentStock);
  const deficit = Math.max(0, requestedQty - available);
  return {
    canFulfill: available >= requestedQty,
    available,
    deficit,
  };
}

/**
 * Applies stock changes and logs movement
 */
export function applyStockChange(
  products: ProductRecord[],
  productId: string,
  qtyChange: number,
  reason: "sale" | "purchase" | "correction" | "return",
  linkedTxId?: string
): { updatedProducts: ProductRecord[]; movement: StockMovement } {
  const movement: StockMovement = {
    id: `mov-${Date.now()}`,
    productId,
    change: qtyChange,
    reason,
    linkedTransactionId: linkedTxId,
    createdAt: new Date().toISOString(),
  };

  const updatedProducts = products.map((p) => {
    if (p.productId === productId) {
      const newStock = Math.max(0, p.currentStock + qtyChange);
      return {
        ...p,
        currentStock: newStock,
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  return { updatedProducts, movement };
}
