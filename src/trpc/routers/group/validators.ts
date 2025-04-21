import { z } from "zod";

export const createGroupSchema = z.object({
    name: z.string().nonempty(),
});

export const updateGroupSchema = z.object({
    groupId: z.string().uuid(),
    name: z.string().optional(),
});

export const deleteGroupSchema = z.object({
    groupId: z.string().uuid(),
});

export const addMembersSchema = z.object({
    groupId: z.string().uuid(),
    members: z
        .array(
            z.object({
                email: z.string().email(),
                role: z.enum(["admin", "member"]),
            }),
        )
        .nonempty(),
});
