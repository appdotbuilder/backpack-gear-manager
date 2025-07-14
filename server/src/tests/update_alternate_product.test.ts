
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packingListsTable, gearItemsTable, alternateProductsTable } from '../db/schema';
import { type UpdateAlternateProductInput } from '../schema';
import { updateAlternateProduct } from '../handlers/update_alternate_product';
import { eq } from 'drizzle-orm';

describe('updateAlternateProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update alternate product name', async () => {
    // Create prerequisite data
    const [packingList] = await db.insert(packingListsTable)
      .values({
        name: 'Test List',
        description: 'Test description'
      })
      .returning()
      .execute();

    const [gearItem] = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList.id,
        name: 'Test Gear',
        individual_weight: '100.50',
        quantity: 1,
        category: 'shelter',
        notes: null
      })
      .returning()
      .execute();

    const [alternateProduct] = await db.insert(alternateProductsTable)
      .values({
        gear_item_id: gearItem.id,
        name: 'Original Product',
        weight: '75.25',
        product_link: 'https://example.com',
        notes: 'Original notes'
      })
      .returning()
      .execute();

    const input: UpdateAlternateProductInput = {
      id: alternateProduct.id,
      name: 'Updated Product Name'
    };

    const result = await updateAlternateProduct(input);

    expect(result.id).toEqual(alternateProduct.id);
    expect(result.name).toEqual('Updated Product Name');
    expect(result.weight).toEqual(75.25);
    expect(result.product_link).toEqual('https://example.com');
    expect(result.notes).toEqual('Original notes');
    expect(result.gear_item_id).toEqual(gearItem.id);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(typeof result.weight).toBe('number');
  });

  it('should update alternate product weight', async () => {
    // Create prerequisite data
    const [packingList] = await db.insert(packingListsTable)
      .values({
        name: 'Test List',
        description: 'Test description'
      })
      .returning()
      .execute();

    const [gearItem] = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList.id,
        name: 'Test Gear',
        individual_weight: '100.50',
        quantity: 1,
        category: 'shelter',
        notes: null
      })
      .returning()
      .execute();

    const [alternateProduct] = await db.insert(alternateProductsTable)
      .values({
        gear_item_id: gearItem.id,
        name: 'Test Product',
        weight: '75.25',
        product_link: null,
        notes: null
      })
      .returning()
      .execute();

    const input: UpdateAlternateProductInput = {
      id: alternateProduct.id,
      weight: 125.75
    };

    const result = await updateAlternateProduct(input);

    expect(result.id).toEqual(alternateProduct.id);
    expect(result.name).toEqual('Test Product');
    expect(result.weight).toEqual(125.75);
    expect(result.product_link).toBeNull();
    expect(result.notes).toBeNull();
    expect(typeof result.weight).toBe('number');
  });

  it('should update multiple fields at once', async () => {
    // Create prerequisite data
    const [packingList] = await db.insert(packingListsTable)
      .values({
        name: 'Test List',
        description: 'Test description'
      })
      .returning()
      .execute();

    const [gearItem] = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList.id,
        name: 'Test Gear',
        individual_weight: '100.50',
        quantity: 1,
        category: 'shelter',
        notes: null
      })
      .returning()
      .execute();

    const [alternateProduct] = await db.insert(alternateProductsTable)
      .values({
        gear_item_id: gearItem.id,
        name: 'Original Product',
        weight: '75.25',
        product_link: 'https://example.com',
        notes: 'Original notes'
      })
      .returning()
      .execute();

    const input: UpdateAlternateProductInput = {
      id: alternateProduct.id,
      name: 'Updated Product',
      weight: 90.5,
      product_link: 'https://newlink.com',
      notes: 'Updated notes'
    };

    const result = await updateAlternateProduct(input);

    expect(result.id).toEqual(alternateProduct.id);
    expect(result.name).toEqual('Updated Product');
    expect(result.weight).toEqual(90.5);
    expect(result.product_link).toEqual('https://newlink.com');
    expect(result.notes).toEqual('Updated notes');
    expect(typeof result.weight).toBe('number');
  });

  it('should save updates to database', async () => {
    // Create prerequisite data
    const [packingList] = await db.insert(packingListsTable)
      .values({
        name: 'Test List',
        description: 'Test description'
      })
      .returning()
      .execute();

    const [gearItem] = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList.id,
        name: 'Test Gear',
        individual_weight: '100.50',
        quantity: 1,
        category: 'shelter',
        notes: null
      })
      .returning()
      .execute();

    const [alternateProduct] = await db.insert(alternateProductsTable)
      .values({
        gear_item_id: gearItem.id,
        name: 'Original Product',
        weight: '75.25',
        product_link: null,
        notes: null
      })
      .returning()
      .execute();

    const input: UpdateAlternateProductInput = {
      id: alternateProduct.id,
      name: 'Updated Product',
      weight: 125.75
    };

    await updateAlternateProduct(input);

    // Verify the update was saved to database
    const products = await db.select()
      .from(alternateProductsTable)
      .where(eq(alternateProductsTable.id, alternateProduct.id))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].name).toEqual('Updated Product');
    expect(parseFloat(products[0].weight)).toEqual(125.75);
  });

  it('should throw error for non-existent alternate product', async () => {
    const input: UpdateAlternateProductInput = {
      id: 999,
      name: 'Updated Product'
    };

    expect(updateAlternateProduct(input)).rejects.toThrow(/not found/i);
  });

  it('should handle nullable fields correctly', async () => {
    // Create prerequisite data
    const [packingList] = await db.insert(packingListsTable)
      .values({
        name: 'Test List',
        description: 'Test description'
      })
      .returning()
      .execute();

    const [gearItem] = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingList.id,
        name: 'Test Gear',
        individual_weight: '100.50',
        quantity: 1,
        category: 'shelter',
        notes: null
      })
      .returning()
      .execute();

    const [alternateProduct] = await db.insert(alternateProductsTable)
      .values({
        gear_item_id: gearItem.id,
        name: 'Test Product',
        weight: '75.25',
        product_link: 'https://example.com',
        notes: 'Some notes'
      })
      .returning()
      .execute();

    const input: UpdateAlternateProductInput = {
      id: alternateProduct.id,
      product_link: null,
      notes: null
    };

    const result = await updateAlternateProduct(input);

    expect(result.product_link).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.name).toEqual('Test Product');
    expect(result.weight).toEqual(75.25);
  });
});
