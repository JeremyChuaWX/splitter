import { z } from "zod";

export const createGroupSchema = z.object({
    name: z.string().nonempty(),
});

export const updateGroupSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
});

export const deleteGroupSchema = z.object({
    id: z.string(),
});
