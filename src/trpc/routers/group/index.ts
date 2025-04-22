import { groupTable, groupMembershipTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import {
    addMembersSchema,
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
                    isNull(groupTable.deletedAt),
                ),
            )
            .orderBy(desc(groupTable.createdAt));
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
                .where(eq(groupTable.id, input.groupId));
        }),
    delete: protectedProcedure
        .input(deleteGroupSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(groupTable)
                .set({
                    deletedAt: sql`NOW()`,
                })
                .where(eq(groupTable.id, input.groupId));
        }),
    addMembers: protectedProcedure
        .input(addMembersSchema)
        .mutation(async ({ /*ctx,*/ input }) => {
            console.log(input);
            // await ctx.db.insert(groupMembershipTable).values(
            //     input.userIds.map((userId) => ({
            //         groupId: input.groupId,
            //         userId: userId,
            //         data: {
            //             role: "member",
            //         },
            //     })),
            // );
        }),
});
