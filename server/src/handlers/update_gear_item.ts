
import { db } from '../db';
import { gearItemsTable } from '../db/schema';
import { type UpdateGearItemInput, type GearItem } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateGearItem(input: UpdateGearItemInput): Promise<GearItem> {
  try {
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.individual_weight !== undefined) {
      updateData.individual_weight = input.individual_weight.toString();
    }

    if (input.quantity !== undefined) {
      updateData.quantity = input.quantity;
    }

    if (input.category !== undefined) {
      updateData.category = input.category;
    }

    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    // Update the gear item
    const result = await db.update(gearItemsTable)
      .set(updateData)
      .where(eq(gearItemsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Gear item not found');
    }

    // Convert numeric fields back to numbers before returning
    const gearItem = result[0];
    return {
      ...gearItem,
      individual_weight: parseFloat(gearItem.individual_weight)
    };
  } catch (error) {
    console.error('Gear item update failed:', error);
    throw error;
  }
}
