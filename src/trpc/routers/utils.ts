import { type Role, ROLE } from "@/db/schema";

export function roleAllowed(role: Role, allowed: Role) {
    return ROLE[role] >= ROLE[allowed];
}
