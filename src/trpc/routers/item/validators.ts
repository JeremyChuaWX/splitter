import { z } from "zod";

export const createItemSchema = z.object({
    groupId: z.string(),
    name: z.string().nonempty(),
});
