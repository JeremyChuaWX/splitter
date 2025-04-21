import { createTRPCRouter } from "..";
import { groupRouter } from "./group";
import { itemRouter } from "./item";

export const appRouter = createTRPCRouter({
    group: groupRouter,
    item: itemRouter,
});

export type AppRouter = typeof appRouter;
