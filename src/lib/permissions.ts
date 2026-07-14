export type WorkspaceRole = "owner" | "admin" | "member";

export function canAdministerWorkspace(role: WorkspaceRole | null | undefined) {
  return role === "owner" || role === "admin";
}
