import { z } from "zod";

export const createGroupSchema = z.object({
    name: z.string().nonempty(),
});

export const getDetailedGroupSchema = z.object({
    groupId: z.string().nonempty(),
});

export const updateGroupSchema = z.object({
    groupId: z.string().nonempty(),
    name: z.union([z.string().nonempty(), z.undefined()]),
});

export const deleteGroupSchema = z.object({
    groupId: z.string().nonempty(),
});

export const getMembersSchema = z.object({
    groupId: z.string().nonempty(),
});

export const addMembersSchema = z.object({
    groupId: z.string().nonempty(),
    members: z.array(z.object({ username: z.string().nonempty() })).min(1),
});

export const removeMembersSchema = z.object({
    groupId: z.string().nonempty(),
    members: z.array(z.object({ id: z.string() })).min(1),
});

export const getItemsSchema = z.object({
    groupId: z.string(),
});

export const getItemsWithTotalSchema = z.object({
    groupId: z.string(),
});

export const addItemSchema = z.object({
    groupId: z.string().nonempty(),
    name: z.string().nonempty(),
    amount: z.number().positive(),
    payeeIds: z.array(z.string().nonempty()).min(1),
    payerIds: z.array(z.string().nonempty()).min(1),
});

export const removeItemsSchema = z.object({
    groupId: z.string().nonempty(),
    items: z.array(z.object({ id: z.string().nonempty() })).min(1),
});

export const updateItemSchema = z.object({
    groupId: z.string().nonempty(),
    name: z.union([z.string().nonempty(), z.undefined()]),
    amount: z.union([z.number().nonnegative(), z.undefined()]),
});

export const getBalancesSchema = z.object({
    groupId: z.string().nonempty(),
});
