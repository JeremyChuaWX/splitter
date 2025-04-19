import { groupMembership } from "@/db/schema";
import { protectedProcedure, createTRPCRouter } from "@/trpc";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
    joinGroup: protectedProcedure
        .input(
            z.object({
                groupId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(groupMembership).values({
                groupId: input.groupId,
                userId: ctx.auth.userId,
            });
        }),
    leaveGroup: protectedProcedure
        .input(
            z.object({
                groupId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .delete(groupMembership)
                .where(
                    and(
                        eq(groupMembership.groupId, input.groupId),
                        eq(groupMembership.userId, ctx.auth.userId),
                    ),
                );
        }),
});
