import { groupTable, groupMembershipTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import {
    createGroupSchema,
    deleteGroupSchema,
    updateGroupSchema,
} from "./validators";

export const groupRouter = createTRPCRouter({
    create: protectedProcedure
        .input(createGroupSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db.transaction(async (tx) => {
                const [newGroup] = await tx
                    .insert(groupTable)
                    .values({
                        data: {
                            name: input.name,
                        },
                    })
                    .returning({ id: groupTable.id });
                await tx.insert(groupMembershipTable).values({
                    groupId: newGroup.id,
                    userId: ctx.auth.userId,
                    data: {
                        role: "owner",
                    },
                });
            });
        }),
    getForUser: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db
            .select()
            .from(groupTable)
            .innerJoin(
                groupMembershipTable,
                eq(groupMembershipTable.groupId, groupTable.id),
            )
            .where(
                and(
                    eq(groupMembershipTable.userId, ctx.auth.userId),
                    isNotNull(groupTable.deletedAt),
                ),
            );
    }),
    update: protectedProcedure
        .input(updateGroupSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(groupTable)
                .set({
                    data: {
                        name: input.name,
                    },
                })
                .where(eq(groupTable.id, input.id));
        }),
    delete: protectedProcedure
        .input(deleteGroupSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(groupTable)
                .set({
                    deletedAt: sql`NOW()`,
                })
                .where(eq(groupTable.id, input.id));
        }),
});
