import { z } from "zod";

export const createGroupSchema = z.object({
    name: z.string(),
});

export const getDetailedGroupSchema = z.object({
    groupId: z.string(),
});

export const updateGroupSchema = z.object({
    groupId: z.string(),
    name: z.union([z.string().nonempty(), z.undefined()]),
});

export const deleteGroupSchema = z.object({
    groupId: z.string(),
});

export const getMembersSchema = z.object({
    groupId: z.string(),
});

export const addMembersSchema = z.object({
    groupId: z.string(),
    members: z.array(
        z.object({
            username: z.string(),
        }),
    ),
});

export const removeMembersSchema = z.object({
    groupId: z.string(),
    memberIds: z.array(z.string()),
});

export const getItemsSchema = z.object({
    groupId: z.string(),
});

export const addItemSchema = z.object({
    groupId: z.string(),
    name: z.string(),
    amount: z.number(),
    debitUserIds: z.array(z.string()).nonempty(),
    creditUserIds: z.array(z.string()).nonempty(),
});

export const removeItemsSchema = z.object({
    groupId: z.string(),
    itemIds: z.array(z.string()),
});

export const updateItemSchema = z.object({
    groupId: z.string(),
    name: z.union([z.string().nonempty(), z.undefined()]),
    amount: z.union([z.number(), z.undefined()]),
});
