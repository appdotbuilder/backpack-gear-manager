
import { db } from '../db';
import { gearItemsTable, packingListsTable } from '../db/schema';
import { type CreateGearItemInput, type GearItem } from '../schema';
import { eq } from 'drizzle-orm';

export async function createGearItem(input: CreateGearItemInput): Promise<GearItem> {
  try {
    // Verify the packing list exists
    const packingList = await db.select()
      .from(packingListsTable)
      .where(eq(packingListsTable.id, input.packing_list_id))
      .limit(1)
      .execute();

    if (packingList.length === 0) {
      throw new Error(`Packing list with ID ${input.packing_list_id} not found`);
    }

    // Insert gear item record
    const result = await db.insert(gearItemsTable)
      .values({
        packing_list_id: input.packing_list_id,
        name: input.name,
        individual_weight: input.individual_weight.toString(), // Convert number to string for numeric column
        quantity: input.quantity, // Integer column - no conversion needed
        category: input.category,
        notes: input.notes
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const gearItem = result[0];
    return {
      ...gearItem,
      individual_weight: parseFloat(gearItem.individual_weight) // Convert string back to number
    };
  } catch (error) {
    console.error('Gear item creation failed:', error);
    throw error;
  }
}
