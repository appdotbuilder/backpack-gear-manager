
import { db } from '../db';
import { gearItemsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteGearItem(id: number): Promise<{ success: boolean }> {
  try {
    // Delete the gear item - cascade will handle alternate products
    const result = await db.delete(gearItemsTable)
      .where(eq(gearItemsTable.id, id))
      .returning()
      .execute();

    // Return success based on whether a record was deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Gear item deletion failed:', error);
    throw error;
  }
}
