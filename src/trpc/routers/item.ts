import { item } from "@/db/schema";
import { protectedProcedure, createTRPCRouter } from "..";
import { z } from "zod";

export const itemRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                groupId: z.string(),
                name: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(item).values({
                groupId: input.groupId,
                data: {
                    name: input.name,
                },
            });
        }),
});
