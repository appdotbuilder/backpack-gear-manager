
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packingListsTable, gearItemsTable } from '../db/schema';
import { getPackingListSummary } from '../handlers/get_packing_list_summary';

describe('getPackingListSummary', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty summary for packing list with no gear items', async () => {
    // Create a packing list
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Empty List',
        description: 'A list with no items'
      })
      .returning()
      .execute();

    const result = await getPackingListSummary(packingList[0].id);

    expect(result.packing_list_id).toEqual(packingList[0].id);
    expect(result.total_weight).toEqual(0);
    expect(result.total_items).toEqual(0);
    expect(result.category_breakdown).toEqual([]);
  });

  it('should calculate summary for packing list with single gear item', async () => {
    // Create a packing list
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Single Item List',
        description: 'A list with one item'
      })
      .returning()
      .execute();

    // Add one gear item
    await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList[0].id,
        name: 'Tent',
        individual_weight: '2000.00', // 2000g
        quantity: 1,
        category: 'shelter',
        notes: 'Main shelter'
      })
      .execute();

    const result = await getPackingListSummary(packingList[0].id);

    expect(result.packing_list_id).toEqual(packingList[0].id);
    expect(result.total_weight).toEqual(2000);
    expect(result.total_items).toEqual(1);
    expect(result.category_breakdown).toHaveLength(1);
    expect(result.category_breakdown[0]).toEqual({
      category: 'shelter',
      weight: 2000,
      item_count: 1
    });
  });

  it('should calculate summary for packing list with multiple gear items', async () => {
    // Create a packing list
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Multi Item List',
        description: 'A list with multiple items'
      })
      .returning()
      .execute();

    // Add multiple gear items
    await db.insert(gearItemsTable)
      .values([
        {
          packing_list_id: packingList[0].id,
          name: 'Tent',
          individual_weight: '2000.00', // 2000g
          quantity: 1,
          category: 'shelter',
          notes: 'Main shelter'
        },
        {
          packing_list_id: packingList[0].id,
          name: 'Sleeping Bag',
          individual_weight: '800.50', // 800.5g
          quantity: 1,
          category: 'sleep_system',
          notes: 'Down bag'
        },
        {
          packing_list_id: packingList[0].id,
          name: 'Socks',
          individual_weight: '50.00', // 50g each
          quantity: 3,
          category: 'clothing',
          notes: 'Merino wool'
        }
      ])
      .execute();

    const result = await getPackingListSummary(packingList[0].id);

    expect(result.packing_list_id).toEqual(packingList[0].id);
    expect(result.total_weight).toEqual(2950.5); // 2000 + 800.5 + (50 * 3)
    expect(result.total_items).toEqual(5); // 1 + 1 + 3
    expect(result.category_breakdown).toHaveLength(3);
    
    // Check each category breakdown
    const shelterCategory = result.category_breakdown.find(c => c.category === 'shelter');
    expect(shelterCategory).toEqual({
      category: 'shelter',
      weight: 2000,
      item_count: 1
    });

    const sleepCategory = result.category_breakdown.find(c => c.category === 'sleep_system');
    expect(sleepCategory).toEqual({
      category: 'sleep_system',
      weight: 800.5,
      item_count: 1
    });

    const clothingCategory = result.category_breakdown.find(c => c.category === 'clothing');
    expect(clothingCategory).toEqual({
      category: 'clothing',
      weight: 150, // 50 * 3
      item_count: 3
    });
  });

  it('should handle items with same category correctly', async () => {
    // Create a packing list
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Same Category List',
        description: 'Multiple items in same category'
      })
      .returning()
      .execute();

    // Add multiple gear items in same category
    await db.insert(gearItemsTable)
      .values([
        {
          packing_list_id: packingList[0].id,
          name: 'Base Layer Top',
          individual_weight: '150.00', // 150g
          quantity: 2,
          category: 'clothing',
          notes: 'Synthetic'
        },
        {
          packing_list_id: packingList[0].id,
          name: 'Base Layer Bottom',
          individual_weight: '120.00', // 120g
          quantity: 2,
          category: 'clothing',
          notes: 'Synthetic'
        }
      ])
      .execute();

    const result = await getPackingListSummary(packingList[0].id);

    expect(result.packing_list_id).toEqual(packingList[0].id);
    expect(result.total_weight).toEqual(540); // (150 * 2) + (120 * 2)
    expect(result.total_items).toEqual(4); // 2 + 2
    expect(result.category_breakdown).toHaveLength(1);
    expect(result.category_breakdown[0]).toEqual({
      category: 'clothing',
      weight: 540,
      item_count: 4
    });
  });

  it('should return empty summary for non-existent packing list', async () => {
    const result = await getPackingListSummary(999);

    expect(result.packing_list_id).toEqual(999);
    expect(result.total_weight).toEqual(0);
    expect(result.total_items).toEqual(0);
    expect(result.category_breakdown).toEqual([]);
  });
});
