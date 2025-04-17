import { group, groupMembership } from "@/db/schema";
import { protectedProcedure, createTRPCRouter } from "..";
import { z } from "zod";
import { and, eq, isNotNull, sql } from "drizzle-orm";

export const groupRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(group).values({
                data: {
                    name: input.name,
                },
            });
        }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db
            .select()
            .from(group)
            .innerJoin(groupMembership, eq(groupMembership.groupId, group.id))
            .where(
                and(
                    eq(groupMembership.userId, ctx.auth.userId),
                    isNotNull(group.deletedAt),
                ),
            );
    }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(group)
                .set({
                    data: {
                        name: input.name,
                    },
                })
                .where(eq(group.id, input.id));
        }),
    delete: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(group)
                .set({
                    deletedAt: sql`NOW()`,
                })
                .where(eq(group.id, input.id));
        }),
});
