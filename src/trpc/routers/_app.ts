import { createTRPCRouter } from "..";
import { greetingRouter } from "./greeting";

export const appRouter = createTRPCRouter({
    greeting: greetingRouter,
});

export type AppRouter = typeof appRouter;
