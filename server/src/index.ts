
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createPackingListInputSchema,
  updatePackingListInputSchema,
  createGearItemInputSchema,
  updateGearItemInputSchema,
  createAlternateProductInputSchema,
  updateAlternateProductInputSchema
} from './schema';

// Import handlers
import { createPackingList } from './handlers/create_packing_list';
import { getPackingLists } from './handlers/get_packing_lists';
import { getPackingListById } from './handlers/get_packing_list_by_id';
import { updatePackingList } from './handlers/update_packing_list';
import { deletePackingList } from './handlers/delete_packing_list';
import { createGearItem } from './handlers/create_gear_item';
import { updateGearItem } from './handlers/update_gear_item';
import { deleteGearItem } from './handlers/delete_gear_item';
import { createAlternateProduct } from './handlers/create_alternate_product';
import { updateAlternateProduct } from './handlers/update_alternate_product';
import { deleteAlternateProduct } from './handlers/delete_alternate_product';
import { getPackingListSummary } from './handlers/get_packing_list_summary';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Packing List routes
  createPackingList: publicProcedure
    .input(createPackingListInputSchema)
    .mutation(({ input }) => createPackingList(input)),

  getPackingLists: publicProcedure
    .query(() => getPackingLists()),

  getPackingListById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getPackingListById(input.id)),

  updatePackingList: publicProcedure
    .input(updatePackingListInputSchema)
    .mutation(({ input }) => updatePackingList(input)),

  deletePackingList: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePackingList(input.id)),

  // Gear Item routes
  createGearItem: publicProcedure
    .input(createGearItemInputSchema)
    .mutation(({ input }) => createGearItem(input)),

  updateGearItem: publicProcedure
    .input(updateGearItemInputSchema)
    .mutation(({ input }) => updateGearItem(input)),

  deleteGearItem: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteGearItem(input.id)),

  // Alternate Product routes
  createAlternateProduct: publicProcedure
    .input(createAlternateProductInputSchema)
    .mutation(({ input }) => createAlternateProduct(input)),

  updateAlternateProduct: publicProcedure
    .input(updateAlternateProductInputSchema)
    .mutation(({ input }) => updateAlternateProduct(input)),

  deleteAlternateProduct: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteAlternateProduct(input.id)),

  // Summary route
  getPackingListSummary: publicProcedure
    .input(z.object({ packingListId: z.number() }))
    .query(({ input }) => getPackingListSummary(input.packingListId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
