import { createTRPCRouter, protectedProcedure, type TRPCContext } from "..";
import * as v from "./validators";
import {
    creditTable,
    debitTable,
    membershipTable,
    groupTable,
    itemTable,
} from "@/db/schema";
import { numberToBigint } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNull, sql, sum } from "drizzle-orm";

export const appRouter = createTRPCRouter({
    createGroup: protectedProcedure
        .input(v.createGroupSchema)
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.transaction(async (tx) => {
                const [group] = await tx
                    .insert(groupTable)
                    .values({
                        data: {
                            name: input.name,
                        },
                    })
                    .returning({ id: groupTable.id });
                await tx.insert(membershipTable).values({
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
                name: sql<string>`${groupTable.data}->>'name'`,
            })
            .from(groupTable)
            .innerJoin(
                membershipTable,
                eq(membershipTable.groupId, groupTable.id),
            )
            .where(
                and(
                    eq(membershipTable.userId, ctx.auth.userId),
                    isNull(groupTable.deletedAt),
                ),
            );
    }),

    getGroup: protectedProcedure
        .input(v.getDetailedGroupSchema)
        .query(async ({ ctx, input }) => {
            const check = await ctx.db
                .select({
                    name: sql<string>`${groupTable.data}->>'name'`,
                })
                .from(groupTable)
                .innerJoin(
                    membershipTable,
                    eq(membershipTable.groupId, groupTable.id),
                )
                .where(
                    and(
                        eq(membershipTable.userId, ctx.auth.userId),
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
                    data: {
                        name: input.name,
                    },
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
                    id: membershipTable.userId,
                })
                .from(membershipTable)
                .where(eq(membershipTable.groupId, input.groupId));
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
            })) satisfies (typeof membershipTable.$inferInsert)[];
            await ctx.db
                .insert(membershipTable)
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
            await ctx.db.delete(membershipTable).where(
                and(
                    eq(membershipTable.groupId, input.groupId),
                    inArray(
                        membershipTable.userId,
                        input.members.map((member) => member.id),
                    ),
                ),
            );
        }),

    getItemsWithTotal: protectedProcedure
        .input(v.getItemsWithTotalSchema)
        .query(async ({ ctx, input }) => {
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }
            return await ctx.db.transaction(async (tx) => {
                const [items, total] = await Promise.all([
                    tx
                        .select({
                            id: itemTable.id,
                            name: sql<string>`${itemTable.data}->>'name'`,
                            amount: itemTable.amount,
                            data: itemTable.data,
                        })
                        .from(itemTable)
                        .where(eq(itemTable.groupId, input.groupId)),
                    tx
                        .select({
                            total: sum(itemTable.amount).mapWith(BigInt),
                        })
                        .from(itemTable)
                        .where(eq(itemTable.groupId, input.groupId)),
                ]);

                return { items, total: total[0].total ?? 0 };
            });
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
                        amount: parsedAmount,
                        data: {
                            name: input.name,
                        },
                    })
                    .returning({ id: itemTable.id });

                const numPayers = BigInt(input.payerIds.length);
                const creditAmount = parsedAmount / numPayers;
                const creditRemainder = parsedAmount % numPayers;
                const creditsToInsert = input.payerIds.map((payerId, index) => {
                    const remainder = BigInt(index) < creditRemainder ? 1n : 0n;
                    const amount = creditAmount + remainder;
                    return {
                        itemId: item.id,
                        userId: payerId,
                        amount: amount,
                        data: {},
                    } satisfies typeof creditTable.$inferInsert;
                });

                const numPayees = BigInt(input.payeeIds.length);
                const debitAmount = parsedAmount / numPayees;
                const debitRemainder = parsedAmount % numPayees;
                const debitsToInsert = input.payeeIds.map((payerId, index) => {
                    const remainder = BigInt(index) < debitRemainder ? 1n : 0n;
                    const amount = debitAmount + remainder;
                    return {
                        itemId: item.id,
                        userId: payerId,
                        amount: amount,
                        data: {},
                    } satisfies typeof debitTable.$inferInsert;
                });

                await Promise.all([
                    tx.insert(creditTable).values(creditsToInsert),
                    tx.insert(debitTable).values(debitsToInsert),
                ]);
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

    getBalances: protectedProcedure
        .input(v.getBalancesSchema)
        .query(async ({ ctx, input }) => {
            if (!(await isGroupMember(ctx, input.groupId))) {
                throw new TRPCError({
                    message: "group not found",
                    code: "NOT_FOUND",
                });
            }

            const credits = ctx.db
                .select({
                    userId: creditTable.userId,
                    totalCredit: sum(creditTable.amount).as("total_credit"),
                })
                .from(creditTable)
                .innerJoin(
                    membershipTable,
                    eq(membershipTable.userId, creditTable.userId),
                )
                .where(eq(membershipTable.groupId, input.groupId))
                .groupBy(creditTable.userId)
                .as("credits");

            const debits = ctx.db
                .select({
                    userId: debitTable.userId,
                    totalDebit: sum(debitTable.amount).as("total_debit"),
                })
                .from(debitTable)
                .innerJoin(
                    membershipTable,
                    eq(membershipTable.userId, debitTable.userId),
                )
                .where(eq(membershipTable.groupId, input.groupId))
                .groupBy(debitTable.userId)
                .as("debits");

            const members = await ctx.db
                .select({
                    id: membershipTable.userId,
                    balance:
                        sql<string>`coalesce(${credits.totalCredit}, 0) - coalesce(${debits.totalDebit}, 0)`.mapWith(
                            BigInt,
                        ),
                })
                .from(membershipTable)
                .leftJoin(credits, eq(credits.userId, membershipTable.userId))
                .leftJoin(debits, eq(debits.userId, membershipTable.userId))
                .where(eq(membershipTable.groupId, input.groupId));

            const balanceMap = new Map<string, bigint>();
            for (const member of members) {
                balanceMap.set(member.id, member.balance);
            }

            const clerkUsers = (
                await ctx.clerk.users.getUserList({
                    userId: Array.from(balanceMap.keys()),
                    orderBy: "username",
                })
            ).data;

            return clerkUsers.map((clerkUser) => ({
                id: clerkUser.id,
                username: clerkUser.username,
                balance: balanceMap.get(clerkUser.id)!,
            }));
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
        .innerJoin(membershipTable, eq(membershipTable.groupId, groupTable.id))
        .where(
            and(
                eq(membershipTable.userId, ctx.auth.userId),
                eq(groupTable.id, groupId),
                isNull(groupTable.deletedAt),
            ),
        );
    return check.length === 1;
}
