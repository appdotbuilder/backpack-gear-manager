
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { alternateProductsTable, gearItemsTable, packingListsTable } from '../db/schema';
import { type CreateAlternateProductInput } from '../schema';
import { createAlternateProduct } from '../handlers/create_alternate_product';
import { eq } from 'drizzle-orm';

describe('createAlternateProduct', () => {
  let testGearItemId: number;
  let testPackingListId: number;

  beforeEach(async () => {
    await createDB();
    
    // Create a packing list first
    const packingListResult = await db.insert(packingListsTable)
      .values({
        name: 'Test Packing List',
        description: 'Test description'
      })
      .returning()
      .execute();
    
    testPackingListId = packingListResult[0].id;

    // Create a gear item for testing
    const gearItemResult = await db.insert(gearItemsTable)
      .values({
        packing_list_id: testPackingListId,
        name: 'Test Gear Item',
        individual_weight: '100.00',
        quantity: 1,
        category: 'shelter',
        notes: 'Test notes'
      })
      .returning()
      .execute();
    
    testGearItemId = gearItemResult[0].id;
  });

  afterEach(resetDB);

  it('should create an alternate product', async () => {
    const testInput: CreateAlternateProductInput = {
      gear_item_id: testGearItemId,
      name: 'Alternative Tent',
      weight: 1200.5,
      product_link: 'https://example.com/tent',
      notes: 'Lighter alternative'
    };

    const result = await createAlternateProduct(testInput);

    // Basic field validation
    expect(result.gear_item_id).toBe(testGearItemId);
    expect(result.name).toBe('Alternative Tent');
    expect(result.weight).toBe(1200.5);
    expect(typeof result.weight).toBe('number');
    expect(result.product_link).toBe('https://example.com/tent');
    expect(result.notes).toBe('Lighter alternative');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save alternate product to database', async () => {
    const testInput: CreateAlternateProductInput = {
      gear_item_id: testGearItemId,
      name: 'Alternative Tent',
      weight: 1200.5,
      product_link: 'https://example.com/tent',
      notes: 'Lighter alternative'
    };

    const result = await createAlternateProduct(testInput);

    // Query database to verify the record was saved
    const alternateProducts = await db.select()
      .from(alternateProductsTable)
      .where(eq(alternateProductsTable.id, result.id))
      .execute();

    expect(alternateProducts).toHaveLength(1);
    expect(alternateProducts[0].gear_item_id).toBe(testGearItemId);
    expect(alternateProducts[0].name).toBe('Alternative Tent');
    expect(parseFloat(alternateProducts[0].weight)).toBe(1200.5);
    expect(alternateProducts[0].product_link).toBe('https://example.com/tent');
    expect(alternateProducts[0].notes).toBe('Lighter alternative');
    expect(alternateProducts[0].created_at).toBeInstanceOf(Date);
  });

  it('should create alternate product with null optional fields', async () => {
    const testInput: CreateAlternateProductInput = {
      gear_item_id: testGearItemId,
      name: 'Basic Alternative',
      weight: 500.0,
      product_link: null,
      notes: null
    };

    const result = await createAlternateProduct(testInput);

    expect(result.gear_item_id).toBe(testGearItemId);
    expect(result.name).toBe('Basic Alternative');
    expect(result.weight).toBe(500.0);
    expect(result.product_link).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error when gear item does not exist', async () => {
    const testInput: CreateAlternateProductInput = {
      gear_item_id: 99999, // Non-existent gear item ID
      name: 'Alternative Tent',
      weight: 1200.5,
      product_link: 'https://example.com/tent',
      notes: 'Lighter alternative'
    };

    await expect(createAlternateProduct(testInput)).rejects.toThrow(/gear item.*not found/i);
  });
});
