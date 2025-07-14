
import { db } from '../db';
import { packingListsTable } from '../db/schema';
import { type UpdatePackingListInput, type PackingList } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const updatePackingList = async (input: UpdatePackingListInput): Promise<PackingList> => {
  try {
    // Build the update object only with provided fields
    const updateData: any = {
      updated_at: sql`now()` // Always update the timestamp
    };

    if (input.name !== undefined) {
      updateData['name'] = input.name;
    }

    if (input.description !== undefined) {
      updateData['description'] = input.description;
    }

    // Update the packing list
    const result = await db.update(packingListsTable)
      .set(updateData)
      .where(eq(packingListsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Packing list with ID ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Packing list update failed:', error);
    throw error;
  }
};
