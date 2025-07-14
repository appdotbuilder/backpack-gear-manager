
import { z } from 'zod';

// Gear categories enum
export const gearCategorySchema = z.enum([
  'shelter',
  'sleep_system',
  'cooking',
  'clothing',
  'navigation',
  'safety',
  'hygiene',
  'electronics',
  'food',
  'water',
  'other'
]);

export type GearCategory = z.infer<typeof gearCategorySchema>;

// Packing list schema
export const packingListSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PackingList = z.infer<typeof packingListSchema>;

// Gear item schema
export const gearItemSchema = z.object({
  id: z.number(),
  packing_list_id: z.number(),
  name: z.string(),
  individual_weight: z.number(), // in grams
  quantity: z.number().int().positive(),
  category: gearCategorySchema,
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type GearItem = z.infer<typeof gearItemSchema>;

// Alternate product schema
export const alternateProductSchema = z.object({
  id: z.number(),
  gear_item_id: z.number(),
  name: z.string(),
  weight: z.number(), // in grams
  product_link: z.string().url().nullable(),
  notes: z.string().nullable(),
  created_at: z.coerce.date()
});

export type AlternateProduct = z.infer<typeof alternateProductSchema>;

// Input schemas for creating packing lists
export const createPackingListInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable()
});

export type CreatePackingListInput = z.infer<typeof createPackingListInputSchema>;

// Input schemas for updating packing lists
export const updatePackingListInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional()
});

export type UpdatePackingListInput = z.infer<typeof updatePackingListInputSchema>;

// Input schemas for creating gear items
export const createGearItemInputSchema = z.object({
  packing_list_id: z.number(),
  name: z.string().min(1),
  individual_weight: z.number().positive(),
  quantity: z.number().int().positive(),
  category: gearCategorySchema,
  notes: z.string().nullable()
});

export type CreateGearItemInput = z.infer<typeof createGearItemInputSchema>;

// Input schemas for updating gear items
export const updateGearItemInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  individual_weight: z.number().positive().optional(),
  quantity: z.number().int().positive().optional(),
  category: gearCategorySchema.optional(),
  notes: z.string().nullable().optional()
});

export type UpdateGearItemInput = z.infer<typeof updateGearItemInputSchema>;

// Input schemas for creating alternate products
export const createAlternateProductInputSchema = z.object({
  gear_item_id: z.number(),
  name: z.string().min(1),
  weight: z.number().positive(),
  product_link: z.string().url().nullable(),
  notes: z.string().nullable()
});

export type CreateAlternateProductInput = z.infer<typeof createAlternateProductInputSchema>;

// Input schemas for updating alternate products
export const updateAlternateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  weight: z.number().positive().optional(),
  product_link: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional()
});

export type UpdateAlternateProductInput = z.infer<typeof updateAlternateProductInputSchema>;

// Packing list summary schema
export const packingListSummarySchema = z.object({
  packing_list_id: z.number(),
  total_weight: z.number(),
  total_items: z.number(),
  category_breakdown: z.array(z.object({
    category: gearCategorySchema,
    weight: z.number(),
    item_count: z.number()
  }))
});

export type PackingListSummary = z.infer<typeof packingListSummarySchema>;

// Detailed packing list with items schema
export const detailedPackingListSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  gear_items: z.array(gearItemSchema.extend({
    total_weight: z.number(), // individual_weight * quantity
    alternate_products: z.array(alternateProductSchema)
  })),
  summary: packingListSummarySchema
});

export type DetailedPackingList = z.infer<typeof detailedPackingListSchema>;
