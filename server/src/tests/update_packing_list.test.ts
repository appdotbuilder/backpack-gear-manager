
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { packingListsTable } from '../db/schema';
import { type UpdatePackingListInput, type CreatePackingListInput } from '../schema';
import { updatePackingList } from '../handlers/update_packing_list';
import { eq } from 'drizzle-orm';

// Helper function to create a packing list for testing
const createTestPackingList = async (input: CreatePackingListInput) => {
  const result = await db.insert(packingListsTable)
    .values({
      name: input.name,
      description: input.description
    })
    .returning()
    .execute();

  return result[0];
};

describe('updatePackingList', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update packing list name', async () => {
    // Create a packing list first
    const createInput: CreatePackingListInput = {
      name: 'Original List',
      description: 'Original description'
    };
    const created = await createTestPackingList(createInput);

    // Update the name
    const updateInput: UpdatePackingListInput = {
      id: created.id,
      name: 'Updated List Name'
    };
    const result = await updatePackingList(updateInput);

    expect(result.id).toEqual(created.id);
    expect(result.name).toEqual('Updated List Name');
    expect(result.description).toEqual('Original description'); // Should remain unchanged
    expect(result.created_at).toEqual(created.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });

  it('should update packing list description', async () => {
    // Create a packing list first
    const createInput: CreatePackingListInput = {
      name: 'Test List',
      description: 'Original description'
    };
    const created = await createTestPackingList(createInput);

    // Update the description
    const updateInput: UpdatePackingListInput = {
      id: created.id,
      description: 'Updated description'
    };
    const result = await updatePackingList(updateInput);

    expect(result.id).toEqual(created.id);
    expect(result.name).toEqual('Test List'); // Should remain unchanged
    expect(result.description).toEqual('Updated description');
    expect(result.created_at).toEqual(created.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });

  it('should update both name and description', async () => {
    // Create a packing list first
    const createInput: CreatePackingListInput = {
      name: 'Original Name',
      description: 'Original description'
    };
    const created = await createTestPackingList(createInput);

    // Update both fields
    const updateInput: UpdatePackingListInput = {
      id: created.id,
      name: 'New Name',
      description: 'New description'
    };
    const result = await updatePackingList(updateInput);

    expect(result.id).toEqual(created.id);
    expect(result.name).toEqual('New Name');
    expect(result.description).toEqual('New description');
    expect(result.created_at).toEqual(created.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });

  it('should set description to null', async () => {
    // Create a packing list with description
    const createInput: CreatePackingListInput = {
      name: 'Test List',
      description: 'Original description'
    };
    const created = await createTestPackingList(createInput);

    // Update description to null
    const updateInput: UpdatePackingListInput = {
      id: created.id,
      description: null
    };
    const result = await updatePackingList(updateInput);

    expect(result.id).toEqual(created.id);
    expect(result.name).toEqual('Test List'); // Should remain unchanged
    expect(result.description).toBeNull();
    expect(result.created_at).toEqual(created.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });

  it('should save changes to database', async () => {
    // Create a packing list first
    const createInput: CreatePackingListInput = {
      name: 'Original List',
      description: 'Original description'
    };
    const created = await createTestPackingList(createInput);

    // Update the packing list
    const updateInput: UpdatePackingListInput = {
      id: created.id,
      name: 'Updated List',
      description: 'Updated description'
    };
    const result = await updatePackingList(updateInput);

    // Verify changes were saved to database
    const saved = await db.select()
      .from(packingListsTable)
      .where(eq(packingListsTable.id, result.id))
      .execute();

    expect(saved).toHaveLength(1);
    expect(saved[0].name).toEqual('Updated List');
    expect(saved[0].description).toEqual('Updated description');
    expect(saved[0].created_at).toEqual(created.created_at);
    expect(saved[0].updated_at).toBeInstanceOf(Date);
    expect(saved[0].updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });

  it('should throw error for non-existent packing list', async () => {
    const updateInput: UpdatePackingListInput = {
      id: 9999,
      name: 'Updated Name'
    };

    await expect(updatePackingList(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should only update updated_at when no fields are provided', async () => {
    // Create a packing list first
    const createInput: CreatePackingListInput = {
      name: 'Test List',
      description: 'Test description'
    };
    const created = await createTestPackingList(createInput);

    // Update with only id (no other fields)
    const updateInput: UpdatePackingListInput = {
      id: created.id
    };
    const result = await updatePackingList(updateInput);

    expect(result.id).toEqual(created.id);
    expect(result.name).toEqual('Test List'); // Should remain unchanged
    expect(result.description).toEqual('Test description'); // Should remain unchanged
    expect(result.created_at).toEqual(created.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });
});
