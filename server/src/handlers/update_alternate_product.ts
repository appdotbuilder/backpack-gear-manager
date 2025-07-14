
import { db } from '../db';
import { alternateProductsTable } from '../db/schema';
import { type UpdateAlternateProductInput, type AlternateProduct } from '../schema';
import { eq } from 'drizzle-orm';

export const updateAlternateProduct = async (input: UpdateAlternateProductInput): Promise<AlternateProduct> => {
  try {
    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    
    if (input.name !== undefined) {
      updateData['name'] = input.name;
    }
    
    if (input.weight !== undefined) {
      updateData['weight'] = input.weight.toString(); // Convert number to string for numeric column
    }
    
    if (input.product_link !== undefined) {
      updateData['product_link'] = input.product_link;
    }
    
    if (input.notes !== undefined) {
      updateData['notes'] = input.notes;
    }

    // Update the alternate product
    const result = await db.update(alternateProductsTable)
      .set(updateData)
      .where(eq(alternateProductsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Alternate product not found');
    }

    // Convert numeric fields back to numbers before returning
    const alternateProduct = result[0];
    return {
      ...alternateProduct,
      weight: parseFloat(alternateProduct.weight) // Convert string back to number
    };
  } catch (error) {
    console.error('Alternate product update failed:', error);
    throw error;
  }
};
