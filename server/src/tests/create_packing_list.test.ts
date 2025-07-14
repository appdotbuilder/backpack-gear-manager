
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packingListsTable } from '../db/schema';
import { type CreatePackingListInput } from '../schema';
import { createPackingList } from '../handlers/create_packing_list';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreatePackingListInput = {
  name: 'Weekend Backpacking Trip',
  description: 'Gear for a 2-day backpacking trip in the mountains'
};

describe('createPackingList', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a packing list', async () => {
    const result = await createPackingList(testInput);

    // Basic field validation
    expect(result.name).toEqual('Weekend Backpacking Trip');
    expect(result.description).toEqual('Gear for a 2-day backpacking trip in the mountains');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save packing list to database', async () => {
    const result = await createPackingList(testInput);

    // Query using proper drizzle syntax
    const packingLists = await db.select()
      .from(packingListsTable)
      .where(eq(packingListsTable.id, result.id))
      .execute();

    expect(packingLists).toHaveLength(1);
    expect(packingLists[0].name).toEqual('Weekend Backpacking Trip');
    expect(packingLists[0].description).toEqual('Gear for a 2-day backpacking trip in the mountains');
    expect(packingLists[0].created_at).toBeInstanceOf(Date);
    expect(packingLists[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create a packing list with null description', async () => {
    const inputWithNullDescription: CreatePackingListInput = {
      name: 'Day Hike',
      description: null
    };

    const result = await createPackingList(inputWithNullDescription);

    expect(result.name).toEqual('Day Hike');
    expect(result.description).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify in database
    const packingLists = await db.select()
      .from(packingListsTable)
      .where(eq(packingListsTable.id, result.id))
      .execute();

    expect(packingLists[0].description).toBeNull();
  });

  it('should create multiple packing lists with unique IDs', async () => {
    const input1: CreatePackingListInput = {
      name: 'First Trip',
      description: 'First description'
    };

    const input2: CreatePackingListInput = {
      name: 'Second Trip',
      description: 'Second description'
    };

    const result1 = await createPackingList(input1);
    const result2 = await createPackingList(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.name).toEqual('First Trip');
    expect(result2.name).toEqual('Second Trip');

    // Verify both are in database
    const allPackingLists = await db.select()
      .from(packingListsTable)
      .execute();

    expect(allPackingLists).toHaveLength(2);
  });
});
