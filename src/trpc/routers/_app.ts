import { createTRPCRouter } from "..";
import { groupRouter } from "./group";
import { itemRouter } from "./item";
import { memberRouter } from "./member";

export const appRouter = createTRPCRouter({
    group: groupRouter,
    item: itemRouter,
    member: memberRouter,
});

export type AppRouter = typeof appRouter;
