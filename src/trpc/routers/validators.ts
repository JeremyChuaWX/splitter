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

export const addMembersSchema = z.object({
    groupId: z.string(),
    members: z.array(
        z.object({
            email: z.string().email(),
            role: z.enum(["owner", "admin", "user"]),
        }),
    ),
});

export const removeMembersSchema = z.object({
    groupId: z.string(),
    memberIds: z.array(z.string()),
});

export const updateMembersRolesSchema = z.object({
    groupId: z.string(),
    members: z.array(
        z.object({
            userId: z.string(),
            role: z.enum(["owner", "admin", "user"]),
        }),
    ),
});

export const addItemSchema = z.object({
    groupId: z.string(),
    name: z.string(),
    amount: z.string(),
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
    amount: z.union([z.string().nonempty(), z.undefined()]),
});
