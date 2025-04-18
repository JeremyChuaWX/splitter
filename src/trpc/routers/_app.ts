import { createTRPCRouter } from "..";
import { groupRouter } from "./group";
import { itemRouter } from "./item";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
    group: groupRouter,
    item: itemRouter,
    user: userRouter,
});

export type AppRouter = typeof appRouter;
