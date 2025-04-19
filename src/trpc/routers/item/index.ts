import { item } from "@/db/schema";
import { protectedProcedure, createTRPCRouter } from "@/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createItemSchema } from "./validators";

export const itemRouter = createTRPCRouter({
    create: protectedProcedure
        .input(createItemSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(item).values({
                groupId: input.groupId,
                data: {
                    name: input.name,
                },
            });
        }),
    getForGroup: protectedProcedure
        .input(
            z.object({
                groupId: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(item)
                .where(eq(item.groupId, input.groupId));
        }),
});
