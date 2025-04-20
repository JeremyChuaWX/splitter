import { groupMembershipTable } from "@/db/schema";
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
            await ctx.db.insert(groupMembershipTable).values({
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
                .delete(groupMembershipTable)
                .where(
                    and(
                        eq(groupMembershipTable.groupId, input.groupId),
                        eq(groupMembershipTable.userId, ctx.auth.userId),
                    ),
                );
        }),
});
