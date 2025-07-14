
import { db } from '../db';
import { packingListsTable } from '../db/schema';
import { type CreatePackingListInput, type PackingList } from '../schema';

export const createPackingList = async (input: CreatePackingListInput): Promise<PackingList> => {
  try {
    // Insert packing list record
    const result = await db.insert(packingListsTable)
      .values({
        name: input.name,
        description: input.description
      })
      .returning()
      .execute();

    // Return the created packing list
    return result[0];
  } catch (error) {
    console.error('Packing list creation failed:', error);
    throw error;
  }
};
