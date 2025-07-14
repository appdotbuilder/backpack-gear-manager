
import { db } from '../db';
import { gearItemsTable } from '../db/schema';
import { type PackingListSummary } from '../schema';
import { eq } from 'drizzle-orm';

export async function getPackingListSummary(packingListId: number): Promise<PackingListSummary> {
  try {
    // Get all gear items for this packing list
    const gearItems = await db.select()
      .from(gearItemsTable)
      .where(eq(gearItemsTable.packing_list_id, packingListId))
      .execute();

    // Calculate total weight and total items
    let totalWeight = 0;
    let totalItems = 0;
    const categoryBreakdown = new Map<string, { weight: number; item_count: number }>();

    for (const item of gearItems) {
      const individualWeight = parseFloat(item.individual_weight);
      const itemTotalWeight = individualWeight * item.quantity;
      
      totalWeight += itemTotalWeight;
      totalItems += item.quantity;

      // Update category breakdown
      const existing = categoryBreakdown.get(item.category) || { weight: 0, item_count: 0 };
      categoryBreakdown.set(item.category, {
        weight: existing.weight + itemTotalWeight,
        item_count: existing.item_count + item.quantity
      });
    }

    // Convert category breakdown to array
    const categoryBreakdownArray = Array.from(categoryBreakdown.entries()).map(([category, data]) => ({
      category: category as any, // TypeScript will validate this matches the enum
      weight: data.weight,
      item_count: data.item_count
    }));

    return {
      packing_list_id: packingListId,
      total_weight: totalWeight,
      total_items: totalItems,
      category_breakdown: categoryBreakdownArray
    };
  } catch (error) {
    console.error('Get packing list summary failed:', error);
    throw error;
  }
}
