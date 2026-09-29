import {
  initialKiranaProducts,
  getProductStockStatus,
  checkStockAvailability,
} from '../src/core/inventory/inventoryEngine';
import { repository } from '../src/db/repository';

describe('Kirana Ledger - Inventory Engine Test Suite', () => {
  test('Seeds at least 25 standard kirana products', () => {
    expect(initialKiranaProducts.length).toBeGreaterThanOrEqual(25);

    const names = initialKiranaProducts.map((p) => p.productName.toLowerCase());
    expect(names.some((n) => n.includes('rice'))).toBe(true);
    expect(names.some((n) => n.includes('sugar'))).toBe(true);
    expect(names.some((n) => n.includes('oil'))).toBe(true);
    expect(names.some((n) => n.includes('atta'))).toBe(true);
    expect(names.some((n) => n.includes('tea'))).toBe(true);
    expect(names.some((n) => n.includes('salt'))).toBe(true);
    expect(names.some((n) => n.includes('milk'))).toBe(true);
  });

  test('Stock status categorization', () => {
    const inStockItem = {
      productId: 'p-test',
      shopkeeperId: 'sk-1',
      productName: 'Rice',
      category: 'Grains',
      unit: 'kg',
      sellingPrice: 50,
      currentStock: 25,
      lowStockThreshold: 5,
      createdAt: '2026-09-01',
      updatedAt: '2026-09-01',
    };
    expect(getProductStockStatus(inStockItem)).toBe('IN_STOCK');

    const lowStockItem = { ...inStockItem, currentStock: 4 };
    expect(getProductStockStatus(lowStockItem)).toBe('LOW_STOCK');

    const outOfStockItem = { ...inStockItem, currentStock: 0 };
    expect(getProductStockStatus(outOfStockItem)).toBe('OUT_OF_STOCK');
  });

  test('Stock availability check prevents silent negative stock', () => {
    const products = [...initialKiranaProducts];
    const sugar = products.find((p) => p.productName.toLowerCase().includes('sugar'))!;

    // Requesting more than available stock should flag canFulfill: false
    const check = checkStockAvailability(sugar, sugar.currentStock + 50);
    expect(check.canFulfill).toBe(false);
    expect(check.available).toBe(sugar.currentStock);
  });

  test('Repository stock adjustment maintains non-negative limits', () => {
    repository.resetAll();
    const products = repository.getProducts();
    const item = products[0];

    // Decrement stock
    const adjusted = repository.adjustStock(item.productId, -1000);
    expect(adjusted?.currentStock).toBe(0); // Clamped at 0, never negative!
  });
});
