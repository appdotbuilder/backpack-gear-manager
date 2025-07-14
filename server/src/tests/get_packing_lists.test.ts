
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packingListsTable } from '../db/schema';
import { getPackingLists } from '../handlers/get_packing_lists';

describe('getPackingLists', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no packing lists exist', async () => {
    const result = await getPackingLists();
    expect(result).toEqual([]);
  });

  it('should return all packing lists', async () => {
    // Create test packing lists
    await db.insert(packingListsTable).values([
      {
        name: 'Weekend Camping',
        description: 'Gear for a weekend camping trip'
      },
      {
        name: 'Day Hike',
        description: 'Essential gear for day hiking'
      },
      {
        name: 'Backpacking',
        description: null
      }
    ]).execute();

    const result = await getPackingLists();

    expect(result).toHaveLength(3);
    
    // Check first packing list
    expect(result[0].name).toEqual('Weekend Camping');
    expect(result[0].description).toEqual('Gear for a weekend camping trip');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check second packing list
    expect(result[1].name).toEqual('Day Hike');
    expect(result[1].description).toEqual('Essential gear for day hiking');

    // Check third packing list with null description
    expect(result[2].name).toEqual('Backpacking');
    expect(result[2].description).toBeNull();
  });

  it('should return packing lists ordered by creation time', async () => {
    // Create test packing lists at different times
    await db.insert(packingListsTable).values({
      name: 'First List',
      description: 'Created first'
    }).execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(packingListsTable).values({
      name: 'Second List',
      description: 'Created second'
    }).execute();

    const result = await getPackingLists();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First List');
    expect(result[1].name).toEqual('Second List');
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });
});
