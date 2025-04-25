import {
    creditTable,
    debitTable,
    groupMembershipTable,
    groupTable,
    itemTable,
    type Role,
} from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "..";
import { roleAllowed } from "./utils";
import * as v from "./validators";

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
                    data: {
                        role: "owner",
                    },
                });
                return group;
            });
        }),

    getGroups: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db
            .select({
                id: groupTable.id,
                name: groupTable.name,
                role: sql<Role>`${groupMembershipTable}->>'role'`,
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

    getDetailedGroups: protectedProcedure.query(async ({ ctx }) => {
        const groups = ctx.db
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
            )
            .as("groups");
        const members = await ctx.db
            .select({
                groupId: groups.id,
                groupName: groups.name,
                userId: groupMembershipTable.userId,
                userRole: sql<Role>`${groupMembershipTable.data}->>'role'`,
            })
            .from(groups)
            .innerJoin(
                groupMembershipTable,
                eq(groupMembershipTable.groupId, groups.id),
            );
        const result = new Map<
            string,
            {
                name: string;
                members: {
                    id: string;
                    role: Role;
                }[];
            }
        >();
        for (const member of members) {
            if (!result.has(member.groupId)) {
                result.set(member.groupId, {
                    name: member.groupName,
                    members: [],
                });
            }
            const group = result.get(member.groupId)!;
            group.members.push({
                id: member.userId,
                role: member.userRole,
            });
        }
        return Array.from(result.entries(), ([groupId, group]) => ({
            id: groupId,
            ...group,
        }));
    }),

    getDetailedGroup: protectedProcedure
        .input(v.getDetailedGroupSchema)
        .query(async ({ ctx, input }) => {
            const check = await ctx.db
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
            const members = await ctx.db
                .select({
                    id: groupMembershipTable.userId,
                    role: sql<Role>`${groupMembershipTable.data}->>'role'`,
                })
                .from(groupMembershipTable)
                .where(eq(groupMembershipTable.groupId, group.id));
            return {
                members: members,
                ...group,
            };
        }),

    updateGroup: protectedProcedure
        .input(v.updateGroupSchema)
        .mutation(async ({ ctx, input }) => {
            if (!input.name) {
                return;
            }
            const check = await ctx.db
                .select({
                    role: sql<Role>`${groupMembershipTable.data}->>role`,
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
            const [{ role }] = check;
            if (!roleAllowed(role, "admin")) {
                throw new TRPCError({
                    message: "user does not have required role",
                    code: "FORBIDDEN",
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
            const check = await ctx.db
                .select({
                    role: sql<Role>`${groupMembershipTable.data}->>role`,
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
            const [{ role }] = check;
            if (!roleAllowed(role, "admin")) {
                throw new TRPCError({
                    message: "user does not have required role",
                    code: "FORBIDDEN",
                });
            }
            await ctx.db
                .update(groupTable)
                .set({
                    deletedAt: sql`now()`,
                })
                .where(eq(groupTable.id, input.groupId));
        }),

    addMembers: protectedProcedure
        .input(v.addMembersSchema)
        .mutation(async ({ ctx, input }) => {
            if (input.members.length === 0) {
                return;
            }
            const check = await ctx.db
                .select({
                    role: sql<Role>`${groupMembershipTable.data}->>role`,
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
            const [{ role }] = check;
            if (!roleAllowed(role, "admin")) {
                throw new TRPCError({
                    message: "user does not have required role",
                    code: "FORBIDDEN",
                });
            }
            const emailMap = new Map<string, Role>();
            input.members.forEach((member) => {
                emailMap.set(member.email, member.role);
            });
            const members = (
                await ctx.clerk.users.getUserList({
                    emailAddress: Array.from(emailMap.keys()),
                })
            ).data.map((user) => ({
                groupId: input.groupId,
                userId: user.id,
                data: {
                    role: emailMap.get(user.primaryEmailAddress!.emailAddress)!,
                },
            })) satisfies (typeof groupMembershipTable.$inferInsert)[];
            await ctx.db
                .insert(groupMembershipTable)
                .values(members)
                .onConflictDoNothing();
        }),

    removeMembers: protectedProcedure
        .input(v.removeMembersSchema)
        .mutation(async ({ ctx, input }) => {
            if (input.memberIds.length === 0) {
                return;
            }
            const check = await ctx.db
                .select({
                    role: sql<Role>`${groupMembershipTable.data}->>role`,
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
            const [{ role }] = check;
            if (!roleAllowed(role, "admin")) {
                throw new TRPCError({
                    message: "user does not have required role",
                    code: "FORBIDDEN",
                });
            }
            await ctx.db
                .delete(groupMembershipTable)
                .where(
                    and(
                        eq(groupMembershipTable.groupId, input.groupId),
                        inArray(groupMembershipTable.userId, input.memberIds),
                    ),
                );
        }),

    updateMembersRoles: protectedProcedure
        .input(v.updateMembersRolesSchema)
        .mutation(async ({ ctx, input }) => {
            if (input.members.length === 0) {
                return;
            }
            const check = await ctx.db
                .select({
                    role: sql<Role>`${groupMembershipTable.data}->>role`,
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
            const [{ role }] = check;
            if (!roleAllowed(role, "admin")) {
                throw new TRPCError({
                    message: "user does not have required role",
                    code: "FORBIDDEN",
                });
            }
            await ctx.db.transaction(async (tx) => {
                for (const member of input.members) {
                    await tx
                        .update(groupMembershipTable)
                        .set({
                            data: {
                                role: member.role,
                            },
                        })
                        .where(
                            and(
                                eq(groupMembershipTable.groupId, input.groupId),
                                eq(groupMembershipTable.userId, member.userId),
                            ),
                        );
                }
            });
        }),

    addItem: protectedProcedure
        .input(v.addItemSchema)
        .mutation(async ({ ctx, input }) => {
            const check = await ctx.db
                .select({
                    role: sql<Role>`${groupMembershipTable.data}->>role`,
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
            const [{ role }] = check;
            if (!roleAllowed(role, "admin")) {
                throw new TRPCError({
                    message: "user does not have required role",
                    code: "FORBIDDEN",
                });
            }
            await ctx.db.transaction(async (tx) => {
                const [item] = await tx
                    .insert(itemTable)
                    .values({
                        groupId: input.groupId,
                        name: input.name,
                        amount: input.amount,
                        data: {},
                    })
                    .returning({ id: itemTable.id });
                if (input.creditUserIds.length > 0) {
                    const creditAmount = BigInt(0); // input.amount / input.creditUserIds.length
                    await tx.insert(creditTable).values(
                        input.creditUserIds.map(
                            (userId) =>
                                ({
                                    itemId: item.id,
                                    userId: userId,
                                    amount: creditAmount,
                                    data: {},
                                }) satisfies typeof creditTable.$inferInsert,
                        ),
                    );
                }
                if (input.debitUserIds.length > 0) {
                    const debitAmount = BigInt(0); // input.amount / input.debitUserIds.length
                    await tx.insert(debitTable).values(
                        input.debitUserIds.map(
                            (userId) =>
                                ({
                                    itemId: item.id,
                                    userId: userId,
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
            if (input.itemIds.length === 0) {
                return;
            }
            const check = await ctx.db
                .select({
                    role: sql<Role>`${groupMembershipTable.data}->>role`,
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
            const [{ role }] = check;
            if (!roleAllowed(role, "admin")) {
                throw new TRPCError({
                    message: "user does not have required role",
                    code: "FORBIDDEN",
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
                            inArray(itemTable.id, input.itemIds),
                            isNull(itemTable.deletedAt),
                        ),
                    );
            });
        }),

    updateItems: protectedProcedure
        .input(v.updateItemSchema)
        .mutation(async ({ ctx, input }) => {}),
});

export type AppRouter = typeof appRouter;
