
import { db } from '../db';
import { packingListsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deletePackingList(id: number): Promise<{ success: boolean }> {
  try {
    // Delete the packing list - cascade will handle related records
    const result = await db.delete(packingListsTable)
      .where(eq(packingListsTable.id, id))
      .returning()
      .execute();

    // Return success based on whether a record was deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Packing list deletion failed:', error);
    throw error;
  }
}
