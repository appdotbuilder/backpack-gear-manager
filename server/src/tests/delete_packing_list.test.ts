
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packingListsTable, gearItemsTable, alternateProductsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { deletePackingList } from '../handlers/delete_packing_list';

describe('deletePackingList', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing packing list', async () => {
    // Create test packing list
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Test Packing List',
        description: 'A test packing list'
      })
      .returning()
      .execute();

    const listId = packingList[0].id;

    // Delete the packing list
    const result = await deletePackingList(listId);

    // Verify success
    expect(result.success).toBe(true);

    // Verify the packing list is gone
    const lists = await db.select()
      .from(packingListsTable)
      .where(eq(packingListsTable.id, listId))
      .execute();

    expect(lists).toHaveLength(0);
  });

  it('should return false when deleting non-existent packing list', async () => {
    // Try to delete a non-existent packing list
    const result = await deletePackingList(999);

    // Verify failure
    expect(result.success).toBe(false);
  });

  it('should cascade delete related gear items and alternate products', async () => {
    // Create test packing list
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Test Packing List',
        description: 'A test packing list'
      })
      .returning()
      .execute();

    const listId = packingList[0].id;

    // Create gear item
    const gearItem = await db.insert(gearItemsTable)
      .values({
        packing_list_id: listId,
        name: 'Test Gear',
        individual_weight: '100.50',
        quantity: 2,
        category: 'shelter',
        notes: 'Test notes'
      })
      .returning()
      .execute();

    const gearItemId = gearItem[0].id;

    // Create alternate product
    await db.insert(alternateProductsTable)
      .values({
        gear_item_id: gearItemId,
        name: 'Alternate Product',
        weight: '75.25',
        product_link: 'https://example.com/product',
        notes: 'Alternative option'
      })
      .execute();

    // Delete the packing list
    const result = await deletePackingList(listId);

    // Verify success
    expect(result.success).toBe(true);

    // Verify packing list is gone
    const lists = await db.select()
      .from(packingListsTable)
      .where(eq(packingListsTable.id, listId))
      .execute();

    expect(lists).toHaveLength(0);

    // Verify gear item is gone (cascade delete)
    const gearItems = await db.select()
      .from(gearItemsTable)
      .where(eq(gearItemsTable.packing_list_id, listId))
      .execute();

    expect(gearItems).toHaveLength(0);

    // Verify alternate product is gone (cascade delete)
    const alternateProducts = await db.select()
      .from(alternateProductsTable)
      .where(eq(alternateProductsTable.gear_item_id, gearItemId))
      .execute();

    expect(alternateProducts).toHaveLength(0);
  });

  it('should handle empty database gracefully', async () => {
    // Try to delete from empty database
    const result = await deletePackingList(1);

    // Verify failure
    expect(result.success).toBe(false);
  });
});
