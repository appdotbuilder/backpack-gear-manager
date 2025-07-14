
import { db } from '../db';
import { packingListsTable, gearItemsTable, alternateProductsTable } from '../db/schema';
import { type DetailedPackingList, type GearCategory } from '../schema';
import { eq } from 'drizzle-orm';

export async function getPackingListById(id: number): Promise<DetailedPackingList | null> {
  try {
    // First, get the packing list
    const packingListResults = await db.select()
      .from(packingListsTable)
      .where(eq(packingListsTable.id, id))
      .execute();

    if (packingListResults.length === 0) {
      return null;
    }

    const packingList = packingListResults[0];

    // Get gear items for this packing list
    const gearItemResults = await db.select()
      .from(gearItemsTable)
      .where(eq(gearItemsTable.packing_list_id, id))
      .execute();

    // Get alternate products for all gear items
    const alternateProductResults = await db.select()
      .from(alternateProductsTable)
      .innerJoin(gearItemsTable, eq(alternateProductsTable.gear_item_id, gearItemsTable.id))
      .where(eq(gearItemsTable.packing_list_id, id))
      .execute();

    // Group alternate products by gear item ID
    const alternateProductsByGearItem = alternateProductResults.reduce((acc, result) => {
      const gearItemId = result.gear_items.id;
      if (!acc[gearItemId]) {
        acc[gearItemId] = [];
      }
      acc[gearItemId].push({
        ...result.alternate_products,
        weight: parseFloat(result.alternate_products.weight)
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Build gear items with their alternate products and calculate totals
    const gearItemsWithAlternates = gearItemResults.map(item => {
      const individualWeight = parseFloat(item.individual_weight);
      const totalWeight = individualWeight * item.quantity;
      
      return {
        ...item,
        individual_weight: individualWeight,
        total_weight: totalWeight,
        alternate_products: alternateProductsByGearItem[item.id] || []
      };
    });

    // Calculate summary statistics
    const totalWeight = gearItemsWithAlternates.reduce((sum, item) => sum + item.total_weight, 0);
    const totalItems = gearItemsWithAlternates.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate category breakdown
    const categoryBreakdown = gearItemsWithAlternates.reduce((acc, item) => {
      const category = item.category as GearCategory;
      if (!acc[category]) {
        acc[category] = { weight: 0, item_count: 0 };
      }
      acc[category].weight += item.total_weight;
      acc[category].item_count += item.quantity;
      return acc;
    }, {} as Record<GearCategory, { weight: number; item_count: number }>);

    const categoryBreakdownArray = Object.entries(categoryBreakdown).map(([category, data]) => ({
      category: category as GearCategory,
      weight: data.weight,
      item_count: data.item_count
    }));

    const summary = {
      packing_list_id: id,
      total_weight: totalWeight,
      total_items: totalItems,
      category_breakdown: categoryBreakdownArray
    };

    return {
      ...packingList,
      gear_items: gearItemsWithAlternates,
      summary
    };
  } catch (error) {
    console.error('Failed to get packing list by ID:', error);
    throw error;
  }
}
