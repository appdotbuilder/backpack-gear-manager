
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packingListsTable, gearItemsTable, alternateProductsTable } from '../db/schema';
import { getPackingListById } from '../handlers/get_packing_list_by_id';

describe('getPackingListById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent packing list', async () => {
    const result = await getPackingListById(999);
    expect(result).toBeNull();
  });

  it('should return packing list with empty gear items', async () => {
    // Create a packing list with no gear items
    const packingListResult = await db.insert(packingListsTable)
      .values({
        name: 'Empty List',
        description: 'A list with no items'
      })
      .returning()
      .execute();

    const packingList = packingListResult[0];
    const result = await getPackingListById(packingList.id);

    expect(result).toBeDefined();
    expect(result?.id).toBe(packingList.id);
    expect(result?.name).toBe('Empty List');
    expect(result?.description).toBe('A list with no items');
    expect(result?.gear_items).toHaveLength(0);
    expect(result?.summary.total_weight).toBe(0);
    expect(result?.summary.total_items).toBe(0);
    expect(result?.summary.category_breakdown).toHaveLength(0);
  });

  it('should return detailed packing list with gear items', async () => {
    // Create a packing list
    const packingListResult = await db.insert(packingListsTable)
      .values({
        name: 'Backpacking Trip',
        description: 'Weekend trip gear'
      })
      .returning()
      .execute();

    const packingList = packingListResult[0];

    // Create gear items
    const gearItemsResult = await db.insert(gearItemsTable)
      .values([
        {
          packing_list_id: packingList.id,
          name: 'Tent',
          individual_weight: '1500.00', // 1500 grams
          quantity: 1,
          category: 'shelter',
          notes: 'Ultralight tent'
        },
        {
          packing_list_id: packingList.id,
          name: 'Sleeping Bag',
          individual_weight: '800.50', // 800.5 grams
          quantity: 1,
          category: 'sleep_system',
          notes: null
        },
        {
          packing_list_id: packingList.id,
          name: 'Energy Bars',
          individual_weight: '45.25', // 45.25 grams each
          quantity: 10,
          category: 'food',
          notes: null
        }
      ])
      .returning()
      .execute();

    const result = await getPackingListById(packingList.id);

    expect(result).toBeDefined();
    expect(result?.id).toBe(packingList.id);
    expect(result?.name).toBe('Backpacking Trip');
    expect(result?.description).toBe('Weekend trip gear');
    expect(result?.gear_items).toHaveLength(3);

    // Check gear items with numeric conversions and calculated totals
    const tent = result?.gear_items.find(item => item.name === 'Tent');
    expect(tent?.individual_weight).toBe(1500);
    expect(tent?.total_weight).toBe(1500); // 1500 * 1
    expect(tent?.quantity).toBe(1);
    expect(tent?.category).toBe('shelter');
    expect(tent?.notes).toBe('Ultralight tent');
    expect(tent?.alternate_products).toHaveLength(0);

    const energyBars = result?.gear_items.find(item => item.name === 'Energy Bars');
    expect(energyBars?.individual_weight).toBe(45.25);
    expect(energyBars?.total_weight).toBe(452.5); // 45.25 * 10
    expect(energyBars?.quantity).toBe(10);

    // Check summary calculations
    expect(result?.summary.packing_list_id).toBe(packingList.id);
    expect(result?.summary.total_weight).toBe(2753); // 1500 + 800.5 + 452.5
    expect(result?.summary.total_items).toBe(12); // 1 + 1 + 10

    // Check category breakdown
    expect(result?.summary.category_breakdown).toHaveLength(3);
    
    const shelterCategory = result?.summary.category_breakdown.find(cat => cat.category === 'shelter');
    expect(shelterCategory?.weight).toBe(1500);
    expect(shelterCategory?.item_count).toBe(1);

    const foodCategory = result?.summary.category_breakdown.find(cat => cat.category === 'food');
    expect(foodCategory?.weight).toBe(452.5);
    expect(foodCategory?.item_count).toBe(10);
  });

  it('should include alternate products for gear items', async () => {
    // Create a packing list
    const packingListResult = await db.insert(packingListsTable)
      .values({
        name: 'Hiking Trip',
        description: 'Day hike gear'
      })
      .returning()
      .execute();

    const packingList = packingListResult[0];

    // Create gear item
    const gearItemResult = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList.id,
        name: 'Backpack',
        individual_weight: '2000.00',
        quantity: 1,
        category: 'other',
        notes: 'Main pack'
      })
      .returning()
      .execute();

    const gearItem = gearItemResult[0];

    // Create alternate products
    await db.insert(alternateProductsTable)
      .values([
        {
          gear_item_id: gearItem.id,
          name: 'Lighter Backpack',
          weight: '1500.00',
          product_link: 'https://example.com/light-pack',
          notes: 'More expensive but lighter'
        },
        {
          gear_item_id: gearItem.id,
          name: 'Budget Backpack',
          weight: '2500.00',
          product_link: null,
          notes: 'Cheaper option'
        }
      ])
      .execute();

    const result = await getPackingListById(packingList.id);

    expect(result?.gear_items).toHaveLength(1);
    const backpack = result?.gear_items[0];
    expect(backpack?.alternate_products).toHaveLength(2);

    const lighterPack = backpack?.alternate_products.find(alt => alt.name === 'Lighter Backpack');
    expect(lighterPack?.weight).toBe(1500);
    expect(lighterPack?.product_link).toBe('https://example.com/light-pack');
    expect(lighterPack?.notes).toBe('More expensive but lighter');

    const budgetPack = backpack?.alternate_products.find(alt => alt.name === 'Budget Backpack');
    expect(budgetPack?.weight).toBe(2500);
    expect(budgetPack?.product_link).toBeNull();
    expect(budgetPack?.notes).toBe('Cheaper option');
  });

  it('should handle multiple categories in breakdown correctly', async () => {
    // Create a packing list
    const packingListResult = await db.insert(packingListsTable)
      .values({
        name: 'Multi-Category List',
        description: 'Testing category breakdown'
      })
      .returning()
      .execute();

    const packingList = packingListResult[0];

    // Create gear items in same category with different quantities
    await db.insert(gearItemsTable)
      .values([
        {
          packing_list_id: packingList.id,
          name: 'Jacket',
          individual_weight: '300.00',
          quantity: 1,
          category: 'clothing',
          notes: null
        },
        {
          packing_list_id: packingList.id,
          name: 'Socks',
          individual_weight: '50.00',
          quantity: 3,
          category: 'clothing',
          notes: null
        }
      ])
      .execute();

    const result = await getPackingListById(packingList.id);

    expect(result?.summary.category_breakdown).toHaveLength(1);
    
    const clothingCategory = result?.summary.category_breakdown.find(cat => cat.category === 'clothing');
    expect(clothingCategory?.weight).toBe(450); // 300 + (50 * 3)
    expect(clothingCategory?.item_count).toBe(4); // 1 + 3
  });
});
