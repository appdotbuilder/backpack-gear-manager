
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packingListsTable, gearItemsTable } from '../db/schema';
import { type UpdateGearItemInput, type CreatePackingListInput } from '../schema';
import { updateGearItem } from '../handlers/update_gear_item';
import { eq } from 'drizzle-orm';

describe('updateGearItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let packingListId: number;
  let gearItemId: number;

  beforeEach(async () => {
    // Create a test packing list
    const packingListInput: CreatePackingListInput = {
      name: 'Test Packing List',
      description: 'A test packing list'
    };

    const packingListResult = await db.insert(packingListsTable)
      .values(packingListInput)
      .returning()
      .execute();

    packingListId = packingListResult[0].id;

    // Create a test gear item
    const gearItemResult = await db.insert(gearItemsTable)
      .values({
        packing_list_id: packingListId,
        name: 'Original Item',
        individual_weight: '50.5',
        quantity: 2,
        category: 'shelter',
        notes: 'Original notes'
      })
      .returning()
      .execute();

    gearItemId = gearItemResult[0].id;
  });

  it('should update gear item name', async () => {
    const input: UpdateGearItemInput = {
      id: gearItemId,
      name: 'Updated Item Name'
    };

    const result = await updateGearItem(input);

    expect(result.id).toEqual(gearItemId);
    expect(result.name).toEqual('Updated Item Name');
    expect(result.individual_weight).toEqual(50.5);
    expect(result.quantity).toEqual(2);
    expect(result.category).toEqual('shelter');
    expect(result.notes).toEqual('Original notes');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update gear item weight', async () => {
    const input: UpdateGearItemInput = {
      id: gearItemId,
      individual_weight: 75.25
    };

    const result = await updateGearItem(input);

    expect(result.individual_weight).toEqual(75.25);
    expect(result.name).toEqual('Original Item');
    expect(result.quantity).toEqual(2);
    expect(result.category).toEqual('shelter');
    expect(result.notes).toEqual('Original notes');
  });

  it('should update gear item quantity', async () => {
    const input: UpdateGearItemInput = {
      id: gearItemId,
      quantity: 5
    };

    const result = await updateGearItem(input);

    expect(result.quantity).toEqual(5);
    expect(result.name).toEqual('Original Item');
    expect(result.individual_weight).toEqual(50.5);
    expect(result.category).toEqual('shelter');
    expect(result.notes).toEqual('Original notes');
  });

  it('should update gear item category', async () => {
    const input: UpdateGearItemInput = {
      id: gearItemId,
      category: 'cooking'
    };

    const result = await updateGearItem(input);

    expect(result.category).toEqual('cooking');
    expect(result.name).toEqual('Original Item');
    expect(result.individual_weight).toEqual(50.5);
    expect(result.quantity).toEqual(2);
    expect(result.notes).toEqual('Original notes');
  });

  it('should update gear item notes', async () => {
    const input: UpdateGearItemInput = {
      id: gearItemId,
      notes: 'Updated notes'
    };

    const result = await updateGearItem(input);

    expect(result.notes).toEqual('Updated notes');
    expect(result.name).toEqual('Original Item');
    expect(result.individual_weight).toEqual(50.5);
    expect(result.quantity).toEqual(2);
    expect(result.category).toEqual('shelter');
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateGearItemInput = {
      id: gearItemId,
      name: 'Multi-Updated Item',
      individual_weight: 100.75,
      quantity: 3,
      category: 'electronics',
      notes: 'Multi-updated notes'
    };

    const result = await updateGearItem(input);

    expect(result.name).toEqual('Multi-Updated Item');
    expect(result.individual_weight).toEqual(100.75);
    expect(result.quantity).toEqual(3);
    expect(result.category).toEqual('electronics');
    expect(result.notes).toEqual('Multi-updated notes');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update gear item notes to null', async () => {
    const input: UpdateGearItemInput = {
      id: gearItemId,
      notes: null
    };

    const result = await updateGearItem(input);

    expect(result.notes).toBeNull();
    expect(result.name).toEqual('Original Item');
    expect(result.individual_weight).toEqual(50.5);
    expect(result.quantity).toEqual(2);
    expect(result.category).toEqual('shelter');
  });

  it('should save updated gear item to database', async () => {
    const input: UpdateGearItemInput = {
      id: gearItemId,
      name: 'Database Updated Item',
      individual_weight: 200.5
    };

    await updateGearItem(input);

    const gearItems = await db.select()
      .from(gearItemsTable)
      .where(eq(gearItemsTable.id, gearItemId))
      .execute();

    expect(gearItems).toHaveLength(1);
    expect(gearItems[0].name).toEqual('Database Updated Item');
    expect(parseFloat(gearItems[0].individual_weight)).toEqual(200.5);
    expect(gearItems[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent gear item', async () => {
    const input: UpdateGearItemInput = {
      id: 99999,
      name: 'Non-existent Item'
    };

    await expect(updateGearItem(input)).rejects.toThrow(/not found/i);
  });
});
