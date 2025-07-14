
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gearItemsTable, packingListsTable } from '../db/schema';
import { type CreateGearItemInput, type CreatePackingListInput } from '../schema';
import { createGearItem } from '../handlers/create_gear_item';
import { eq } from 'drizzle-orm';

describe('createGearItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testPackingListId: number;

  beforeEach(async () => {
    // Create prerequisite packing list
    const packingListInput: CreatePackingListInput = {
      name: 'Test Packing List',
      description: 'A list for testing gear items'
    };

    const packingListResult = await db.insert(packingListsTable)
      .values(packingListInput)
      .returning()
      .execute();

    testPackingListId = packingListResult[0].id;
  });

  const testInput: CreateGearItemInput = {
    packing_list_id: 0, // Will be set dynamically
    name: 'Test Tent',
    individual_weight: 1250.5,
    quantity: 1,
    category: 'shelter',
    notes: 'Lightweight backpacking tent'
  };

  it('should create a gear item', async () => {
    const input = { ...testInput, packing_list_id: testPackingListId };
    const result = await createGearItem(input);

    // Basic field validation
    expect(result.name).toEqual('Test Tent');
    expect(result.individual_weight).toEqual(1250.5);
    expect(typeof result.individual_weight).toBe('number');
    expect(result.quantity).toEqual(1);
    expect(result.category).toEqual('shelter');
    expect(result.notes).toEqual('Lightweight backpacking tent');
    expect(result.packing_list_id).toEqual(testPackingListId);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save gear item to database', async () => {
    const input = { ...testInput, packing_list_id: testPackingListId };
    const result = await createGearItem(input);

    // Query using proper drizzle syntax
    const gearItems = await db.select()
      .from(gearItemsTable)
      .where(eq(gearItemsTable.id, result.id))
      .execute();

    expect(gearItems).toHaveLength(1);
    expect(gearItems[0].name).toEqual('Test Tent');
    expect(parseFloat(gearItems[0].individual_weight)).toEqual(1250.5);
    expect(gearItems[0].quantity).toEqual(1);
    expect(gearItems[0].category).toEqual('shelter');
    expect(gearItems[0].notes).toEqual('Lightweight backpacking tent');
    expect(gearItems[0].packing_list_id).toEqual(testPackingListId);
    expect(gearItems[0].created_at).toBeInstanceOf(Date);
    expect(gearItems[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create gear item with null notes', async () => {
    const input = { 
      ...testInput, 
      packing_list_id: testPackingListId,
      notes: null 
    };
    const result = await createGearItem(input);

    expect(result.notes).toBeNull();
  });

  it('should create gear item with different categories', async () => {
    const categories = ['cooking', 'clothing', 'safety', 'electronics'] as const;
    
    for (const category of categories) {
      const input = {
        ...testInput,
        packing_list_id: testPackingListId,
        name: `Test ${category} item`,
        category
      };
      
      const result = await createGearItem(input);
      expect(result.category).toEqual(category);
    }
  });

  it('should throw error for non-existent packing list', async () => {
    const input = { ...testInput, packing_list_id: 999999 };
    
    await expect(createGearItem(input)).rejects.toThrow(/packing list.*not found/i);
  });

  it('should handle multiple gear items for same packing list', async () => {
    const input1 = {
      ...testInput,
      packing_list_id: testPackingListId,
      name: 'Sleeping Bag',
      category: 'sleep_system' as const
    };
    
    const input2 = {
      ...testInput,
      packing_list_id: testPackingListId,
      name: 'Cooking Pot',
      category: 'cooking' as const
    };

    const result1 = await createGearItem(input1);
    const result2 = await createGearItem(input2);

    expect(result1.packing_list_id).toEqual(testPackingListId);
    expect(result2.packing_list_id).toEqual(testPackingListId);
    expect(result1.id).not.toEqual(result2.id);
  });

  it('should handle decimal weights correctly', async () => {
    const input = {
      ...testInput,
      packing_list_id: testPackingListId,
      individual_weight: 123.45
    };

    const result = await createGearItem(input);
    expect(result.individual_weight).toEqual(123.45);
    expect(typeof result.individual_weight).toBe('number');
  });
});
