import {
    creditTable,
    debitTable,
    groupMembershipTable,
    groupTable,
    itemTable,
} from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, type TRPCContext } from "..";
import * as v from "./validators";
import { numberToBigint } from "@/lib/utils";

export const appRouter = createTRPCRouter({
    createGroup: protectedProcedure
        .input(v.createGroupSchema)
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.transaction(async (tx) => {
                const [group] = await tx
                    .insert(groupTable)
                    .values({
                        name: input.name,
                        data: {},
                    })
                    .returning({ id: groupTable.id });
                await tx.insert(groupMembershipTable).values({
                    groupId: group.id,
                    userId: ctx.auth.userId,
                    data: {},
                });
                return group;
            });
        }),

    getGroups: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db
            .select({
                id: groupTable.id,
                name: groupTable.name,
            })
            .from(groupTable)
            .innerJoin(
                groupMembershipTable,
                eq(groupMembershipTable.groupId, groupTable.id),
            )
            .where(
                and(
                    eq(groupMembershipTable.userId, ctx.auth.userId),
                    isNull(groupTable.deletedAt),
                ),
            );
    }),

    getGroup: protectedProcedure
        .input(v.getDetailedGroupSchema)
        .query(async ({ ctx, input }) => {
            const check = await ctx.db
                .select({
                    name: groupTable.name,
                })
                .from(groupTable)
                .innerJoin(
                    groupMembershipTable,
                    eq(groupMembershipTable.groupId, groupTable.id),
                )
                .where(
                    and(
                        eq(groupMembershipTable.userId, ctx.auth.userId),
                        eq(groupTable.id, input.groupId),
                        isNull(groupTable.deletedAt),
                    ),
                );
            if (check.length !== 1) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
            const [group] = check;
            return group;
        }),

    updateGroup: protectedProcedure
        .input(v.updateGroupSchema)
        .mutation(async ({ ctx, input }) => {
            if (!input.name) {
                return;
            }
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
            await ctx.db
                .update(groupTable)
                .set({
                    name: input.name,
                })
                .where(
                    and(
                        eq(groupTable.id, input.groupId),
                        isNull(groupTable.deletedAt),
                    ),
                );
        }),

    deleteGroup: protectedProcedure
        .input(v.deleteGroupSchema)
        .mutation(async ({ ctx, input }) => {
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
            await ctx.db
                .update(groupTable)
                .set({
                    deletedAt: sql`now()`,
                })
                .where(eq(groupTable.id, input.groupId));
        }),

    getMembers: protectedProcedure
        .input(v.getMembersSchema)
        .query(async ({ ctx, input }) => {
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
            const members = await ctx.db
                .select({
                    id: groupMembershipTable.userId,
                })
                .from(groupMembershipTable)
                .where(eq(groupMembershipTable.groupId, input.groupId));
            const clerkUsers = (
                await ctx.clerk.users.getUserList({
                    userId: members.map((member) => member.id),
                    orderBy: "username",
                })
            ).data;
            return clerkUsers.map((clerkUser) => ({
                id: clerkUser.id,
                username: clerkUser.username,
            }));
        }),

    addMembers: protectedProcedure
        .input(v.addMembersSchema)
        .mutation(async ({ ctx, input }) => {
            if (input.members.length === 0) {
                return;
            }
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
            const members = (
                await ctx.clerk.users.getUserList({
                    username: input.members.map((member) => member.username),
                })
            ).data.map((user) => ({
                groupId: input.groupId,
                userId: user.id,
                data: {},
            })) satisfies (typeof groupMembershipTable.$inferInsert)[];
            await ctx.db
                .insert(groupMembershipTable)
                .values(members)
                .onConflictDoNothing();
        }),

    removeMembers: protectedProcedure
        .input(v.removeMembersSchema)
        .mutation(async ({ ctx, input }) => {
            if (input.members.length === 0) {
                return;
            }
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
            await ctx.db.delete(groupMembershipTable).where(
                and(
                    eq(groupMembershipTable.groupId, input.groupId),
                    inArray(
                        groupMembershipTable.userId,
                        input.members.map((member) => member.id),
                    ),
                ),
            );
        }),

    getItems: protectedProcedure
        .input(v.getItemsSchema)
        .query(async ({ ctx, input }) => {
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
            return await ctx.db
                .select({
                    id: itemTable.id,
                    name: itemTable.name,
                    amount: itemTable.amount,
                    data: itemTable.data,
                })
                .from(itemTable)
                .where(eq(itemTable.groupId, input.groupId));
        }),

    addItem: protectedProcedure
        .input(v.addItemSchema)
        .mutation(async ({ ctx, input }) => {
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
            const parsedAmount = numberToBigint(input.amount);
            await ctx.db.transaction(async (tx) => {
                const [item] = await tx
                    .insert(itemTable)
                    .values({
                        groupId: input.groupId,
                        name: input.name,
                        amount: parsedAmount,
                        data: {},
                    })
                    .returning({ id: itemTable.id });
                if (input.payerIds.length > 0) {
                    const creditAmount = BigInt(0); // input.amount / input.creditUserIds.length
                    await tx.insert(creditTable).values(
                        input.payerIds.map(
                            (payerId) =>
                                ({
                                    itemId: item.id,
                                    userId: payerId,
                                    amount: creditAmount,
                                    data: {},
                                }) satisfies typeof creditTable.$inferInsert,
                        ),
                    );
                }
                if (input.payeeIds.length > 0) {
                    const debitAmount = BigInt(0); // input.amount / input.debitUserIds.length
                    await tx.insert(debitTable).values(
                        input.payeeIds.map(
                            (payeeId) =>
                                ({
                                    itemId: item.id,
                                    userId: payeeId,
                                    amount: debitAmount,
                                    data: {},
                                }) satisfies typeof debitTable.$inferInsert,
                        ),
                    );
                }
            });
        }),

    removeItems: protectedProcedure
        .input(v.removeItemsSchema)
        .mutation(async ({ ctx, input }) => {
            if (input.items.length === 0) {
                return;
            }
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
            await ctx.db.transaction(async (tx) => {
                await tx
                    .update(itemTable)
                    .set({
                        deletedAt: sql`now()`,
                    })
                    .where(
                        and(
                            eq(itemTable.groupId, input.groupId),
                            inArray(
                                itemTable.id,
                                input.items.map((item) => item.id),
                            ),
                            isNull(itemTable.deletedAt),
                        ),
                    );
            });
        }),

    updateItems: protectedProcedure
        .input(v.updateItemSchema)
        .mutation(async ({ ctx, input }) => {
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
        }),
});

export type AppRouter = typeof appRouter;

async function isGroupMember(ctx: TRPCContext, groupId: string) {
    const userId = ctx.auth.userId;
    if (!userId) {
        return false;
    }
    const check = await ctx.db
        .select({})
        .from(groupTable)
        .innerJoin(
            groupMembershipTable,
            eq(groupMembershipTable.groupId, groupTable.id),
        )
        .where(
            and(
                eq(groupMembershipTable.userId, ctx.auth.userId),
                eq(groupTable.id, groupId),
                isNull(groupTable.deletedAt),
            ),
        );
    return check.length === 1;
}
