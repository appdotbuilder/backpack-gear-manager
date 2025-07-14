
import { serial, text, pgTable, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Gear category enum
export const gearCategoryEnum = pgEnum('gear_category', [
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

// Packing lists table
export const packingListsTable = pgTable('packing_lists', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Gear items table
export const gearItemsTable = pgTable('gear_items', {
  id: serial('id').primaryKey(),
  packing_list_id: integer('packing_list_id').notNull().references(() => packingListsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  individual_weight: numeric('individual_weight', { precision: 10, scale: 2 }).notNull(), // in grams
  quantity: integer('quantity').notNull(),
  category: gearCategoryEnum('category').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Alternate products table
export const alternateProductsTable = pgTable('alternate_products', {
  id: serial('id').primaryKey(),
  gear_item_id: integer('gear_item_id').notNull().references(() => gearItemsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  weight: numeric('weight', { precision: 10, scale: 2 }).notNull(), // in grams
  product_link: text('product_link'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const packingListsRelations = relations(packingListsTable, ({ many }) => ({
  gear_items: many(gearItemsTable)
}));

export const gearItemsRelations = relations(gearItemsTable, ({ one, many }) => ({
  packing_list: one(packingListsTable, {
    fields: [gearItemsTable.packing_list_id],
    references: [packingListsTable.id]
  }),
  alternate_products: many(alternateProductsTable)
}));

export const alternateProductsRelations = relations(alternateProductsTable, ({ one }) => ({
  gear_item: one(gearItemsTable, {
    fields: [alternateProductsTable.gear_item_id],
    references: [gearItemsTable.id]
  })
}));

// TypeScript types for the table schemas
export type PackingList = typeof packingListsTable.$inferSelect;
export type NewPackingList = typeof packingListsTable.$inferInsert;
export type GearItem = typeof gearItemsTable.$inferSelect;
export type NewGearItem = typeof gearItemsTable.$inferInsert;
export type AlternateProduct = typeof alternateProductsTable.$inferSelect;
export type NewAlternateProduct = typeof alternateProductsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  packingLists: packingListsTable,
  gearItems: gearItemsTable,
  alternateProducts: alternateProductsTable
};
