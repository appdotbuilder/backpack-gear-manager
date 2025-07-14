
import { db } from '../db';
import { alternateProductsTable, gearItemsTable } from '../db/schema';
import { type CreateAlternateProductInput, type AlternateProduct } from '../schema';
import { eq } from 'drizzle-orm';

export async function createAlternateProduct(input: CreateAlternateProductInput): Promise<AlternateProduct> {
  try {
    // Verify the gear item exists
    const gearItem = await db.select()
      .from(gearItemsTable)
      .where(eq(gearItemsTable.id, input.gear_item_id))
      .execute();

    if (gearItem.length === 0) {
      throw new Error(`Gear item with id ${input.gear_item_id} not found`);
    }

    // Insert alternate product record
    const result = await db.insert(alternateProductsTable)
      .values({
        gear_item_id: input.gear_item_id,
        name: input.name,
        weight: input.weight.toString(), // Convert number to string for numeric column
        product_link: input.product_link,
        notes: input.notes
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const alternateProduct = result[0];
    return {
      ...alternateProduct,
      weight: parseFloat(alternateProduct.weight) // Convert string back to number
    };
  } catch (error) {
    console.error('Alternate product creation failed:', error);
    throw error;
  }
}
