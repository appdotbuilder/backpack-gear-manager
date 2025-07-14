
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packingListsTable, gearItemsTable, alternateProductsTable } from '../db/schema';
import { deleteGearItem } from '../handlers/delete_gear_item';
import { eq } from 'drizzle-orm';

describe('deleteGearItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing gear item', async () => {
    // Create a packing list first
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Test List',
        description: 'Test Description'
      })
      .returning()
      .execute();

    // Create a gear item
    const gearItem = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList[0].id,
        name: 'Test Gear',
        individual_weight: '100.50',
        quantity: 2,
        category: 'shelter',
        notes: 'Test notes'
      })
      .returning()
      .execute();

    // Delete the gear item
    const result = await deleteGearItem(gearItem[0].id);

    // Verify success
    expect(result.success).toBe(true);

    // Verify gear item was deleted
    const remainingGearItems = await db.select()
      .from(gearItemsTable)
      .where(eq(gearItemsTable.id, gearItem[0].id))
      .execute();

    expect(remainingGearItems).toHaveLength(0);
  });

  it('should delete gear item and cascade delete alternate products', async () => {
    // Create a packing list
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Test List',
        description: 'Test Description'
      })
      .returning()
      .execute();

    // Create a gear item
    const gearItem = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList[0].id,
        name: 'Test Gear',
        individual_weight: '100.50',
        quantity: 2,
        category: 'shelter',
        notes: 'Test notes'
      })
      .returning()
      .execute();

    // Create alternate products
    await db.insert(alternateProductsTable)
      .values([
        {
          gear_item_id: gearItem[0].id,
          name: 'Alternative 1',
          weight: '95.25',
          product_link: 'https://example.com/alt1',
          notes: 'Lighter alternative'
        },
        {
          gear_item_id: gearItem[0].id,
          name: 'Alternative 2',
          weight: '110.75',
          product_link: 'https://example.com/alt2',
          notes: 'Heavier alternative'
        }
      ])
      .execute();

    // Verify alternate products exist before deletion
    const alternatesBefore = await db.select()
      .from(alternateProductsTable)
      .where(eq(alternateProductsTable.gear_item_id, gearItem[0].id))
      .execute();

    expect(alternatesBefore).toHaveLength(2);

    // Delete the gear item
    const result = await deleteGearItem(gearItem[0].id);

    // Verify success
    expect(result.success).toBe(true);

    // Verify gear item was deleted
    const remainingGearItems = await db.select()
      .from(gearItemsTable)
      .where(eq(gearItemsTable.id, gearItem[0].id))
      .execute();

    expect(remainingGearItems).toHaveLength(0);

    // Verify alternate products were cascade deleted
    const alternatesAfter = await db.select()
      .from(alternateProductsTable)
      .where(eq(alternateProductsTable.gear_item_id, gearItem[0].id))
      .execute();

    expect(alternatesAfter).toHaveLength(0);
  });

  it('should return false for non-existent gear item', async () => {
    // Try to delete a non-existent gear item
    const result = await deleteGearItem(999);

    // Verify failure
    expect(result.success).toBe(false);
  });

  it('should not affect other gear items', async () => {
    // Create a packing list
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Test List',
        description: 'Test Description'
      })
      .returning()
      .execute();

    // Create multiple gear items
    const gearItems = await db.insert(gearItemsTable)
      .values([
        {
          packing_list_id: packingList[0].id,
          name: 'Test Gear 1',
          individual_weight: '100.50',
          quantity: 2,
          category: 'shelter',
          notes: 'Test notes 1'
        },
        {
          packing_list_id: packingList[0].id,
          name: 'Test Gear 2',
          individual_weight: '200.75',
          quantity: 1,
          category: 'cooking',
          notes: 'Test notes 2'
        }
      ])
      .returning()
      .execute();

    // Delete the first gear item
    const result = await deleteGearItem(gearItems[0].id);

    // Verify success
    expect(result.success).toBe(true);

    // Verify first gear item was deleted
    const deletedGearItem = await db.select()
      .from(gearItemsTable)
      .where(eq(gearItemsTable.id, gearItems[0].id))
      .execute();

    expect(deletedGearItem).toHaveLength(0);

    // Verify second gear item still exists
    const remainingGearItem = await db.select()
      .from(gearItemsTable)
      .where(eq(gearItemsTable.id, gearItems[1].id))
      .execute();

    expect(remainingGearItem).toHaveLength(1);
    expect(remainingGearItem[0].name).toBe('Test Gear 2');
  });
});
