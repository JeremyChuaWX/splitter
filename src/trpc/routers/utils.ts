import { type Role, ROLE_MAP } from "@/db/schema";

export function roleAllowed(role: Role, allowed: Role) {
    return ROLE_MAP[role] >= ROLE_MAP[allowed];
}
