
import { db } from '../db';
import { packingListsTable } from '../db/schema';
import { type PackingList } from '../schema';

export async function getPackingLists(): Promise<PackingList[]> {
  try {
    const results = await db.select()
      .from(packingListsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch packing lists:', error);
    throw error;
  }
}
