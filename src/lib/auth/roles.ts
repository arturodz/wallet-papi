export type Role = "owner" | "editor" | "viewer";

const RANK: Record<Role, number> = { viewer: 0, editor: 1, owner: 2 };

export function hasAtLeast(role: Role, required: Role): boolean {
  return RANK[role] >= RANK[required];
}

export const canWrite = (role: Role) => hasAtLeast(role, "editor");
export const canManageUsers = (role: Role) => hasAtLeast(role, "owner");
