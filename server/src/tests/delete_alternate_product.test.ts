
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packingListsTable, gearItemsTable, alternateProductsTable } from '../db/schema';
import { deleteAlternateProduct } from '../handlers/delete_alternate_product';
import { eq } from 'drizzle-orm';

describe('deleteAlternateProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an alternate product', async () => {
    // Create prerequisite data
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Test List',
        description: 'Test description'
      })
      .returning()
      .execute();

    const gearItem = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList[0].id,
        name: 'Test Gear',
        individual_weight: '100.00',
        quantity: 1,
        category: 'shelter',
        notes: null
      })
      .returning()
      .execute();

    const alternateProduct = await db.insert(alternateProductsTable)
      .values({
        gear_item_id: gearItem[0].id,
        name: 'Test Alternate',
        weight: '150.00',
        product_link: null,
        notes: null
      })
      .returning()
      .execute();

    // Delete the alternate product
    const result = await deleteAlternateProduct(alternateProduct[0].id);

    // Verify success response
    expect(result.success).toBe(true);

    // Verify product was deleted from database
    const products = await db.select()
      .from(alternateProductsTable)
      .where(eq(alternateProductsTable.id, alternateProduct[0].id))
      .execute();

    expect(products).toHaveLength(0);
  });

  it('should return false when deleting non-existent alternate product', async () => {
    const result = await deleteAlternateProduct(999);

    expect(result.success).toBe(false);
  });

  it('should not affect other alternate products', async () => {
    // Create prerequisite data
    const packingList = await db.insert(packingListsTable)
      .values({
        name: 'Test List',
        description: 'Test description'
      })
      .returning()
      .execute();

    const gearItem = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList[0].id,
        name: 'Test Gear',
        individual_weight: '100.00',
        quantity: 1,
        category: 'shelter',
        notes: null
      })
      .returning()
      .execute();

    // Create two alternate products
    const alternateProduct1 = await db.insert(alternateProductsTable)
      .values({
        gear_item_id: gearItem[0].id,
        name: 'Test Alternate 1',
        weight: '150.00',
        product_link: null,
        notes: null
      })
      .returning()
      .execute();

    const alternateProduct2 = await db.insert(alternateProductsTable)
      .values({
        gear_item_id: gearItem[0].id,
        name: 'Test Alternate 2',
        weight: '200.00',
        product_link: null,
        notes: null
      })
      .returning()
      .execute();

    // Delete first alternate product
    const result = await deleteAlternateProduct(alternateProduct1[0].id);

    expect(result.success).toBe(true);

    // Verify first product was deleted
    const deletedProduct = await db.select()
      .from(alternateProductsTable)
      .where(eq(alternateProductsTable.id, alternateProduct1[0].id))
      .execute();

    expect(deletedProduct).toHaveLength(0);

    // Verify second product still exists
    const remainingProduct = await db.select()
      .from(alternateProductsTable)
      .where(eq(alternateProductsTable.id, alternateProduct2[0].id))
      .execute();

    expect(remainingProduct).toHaveLength(1);
    expect(remainingProduct[0].name).toBe('Test Alternate 2');
  });
});
