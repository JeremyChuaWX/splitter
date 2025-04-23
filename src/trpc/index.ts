import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";

export const createTRPCContext = cache(async () => {
    return {
        auth: await auth(),
        clerk: await clerkClient(),
        db: db,
    };
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
    transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

const isAuthed = t.middleware(({ next, ctx }) => {
    if (!ctx.auth.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
            auth: ctx.auth,
        },
    });
});

export const protectedProcedure = t.procedure.use(isAuthed);
