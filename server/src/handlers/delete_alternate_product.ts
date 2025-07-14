
import { db } from '../db';
import { alternateProductsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteAlternateProduct(id: number): Promise<{ success: boolean }> {
  try {
    const result = await db.delete(alternateProductsTable)
      .where(eq(alternateProductsTable.id, id))
      .returning()
      .execute();

    // Return success based on whether a row was actually deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Alternate product deletion failed:', error);
    throw error;
  }
}
