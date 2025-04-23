import { groupTable, groupMembershipTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc";
import { and, desc, eq, isNull } from "drizzle-orm";
import {
    createManyMembersSchema,
    getMembersForGroupSchema,
} from "./validators";

export const memberRouter = createTRPCRouter({
    createMany: protectedProcedure
        .input(createManyMembersSchema)
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
    getForGroup: protectedProcedure
        .input(getMembersForGroupSchema)
        .query(async ({ ctx, input }) => {
            const members = await ctx.db
                .select({ userId: groupMembershipTable.userId })
                .from(groupMembershipTable)
                .innerJoin(
                    groupTable,
                    eq(groupTable.id, groupMembershipTable.groupId),
                )
                .where(
                    and(
                        eq(groupTable.id, input.groupId),
                        isNull(groupTable.deletedAt),
                    ),
                );
            const users = await ctx.clerk.users.getUserList({
                userId: members.map((m) => m.userId),
            });
            const emails = users.data.reduce<string[]>((acc, cur) => {
                if (cur.primaryEmailAddress) {
                    acc.push(cur.primaryEmailAddress.emailAddress);
                }
                return acc;
            }, []);
            return emails;
        }),
});
