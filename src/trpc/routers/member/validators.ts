import { z } from "zod";

export const createManyMembersSchema = z.object({
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

export const getMembersForGroupSchema = z.object({
    groupId: z.string().uuid(),
});
