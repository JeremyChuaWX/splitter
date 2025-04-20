import { group, groupMembership } from "@/db/schema";
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
                    .insert(group)
                    .values({
                        data: {
                            name: input.name,
                        },
                    })
                    .returning({ id: group.id });
                await tx.insert(groupMembership).values({
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
        .input(updateGroupSchema)
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
        .input(deleteGroupSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(group)
                .set({
                    deletedAt: sql`NOW()`,
                })
                .where(eq(group.id, input.id));
        }),
});
