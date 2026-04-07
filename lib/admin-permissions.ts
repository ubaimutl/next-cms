export type AdminRole = "OWNER" | "ADMIN" | "EDITOR";

export const ADMIN_ACCESS_ROLES: AdminRole[] = ["OWNER", "ADMIN", "EDITOR"];
export const SETTINGS_ACCESS_ROLES: AdminRole[] = ["OWNER", "ADMIN"];
export const USER_MANAGEMENT_ROLES: AdminRole[] = ["OWNER"];

type RoleAwareRecord = {
  role: AdminRole;
  active: boolean;
};

function hasAllowedRole(role: AdminRole, allowedRoles: AdminRole[]) {
  return allowedRoles.includes(role);
}

export function canAccessAdmin(user: RoleAwareRecord) {
  return user.active && hasAllowedRole(user.role, ADMIN_ACCESS_ROLES);
}

export function canManageSettings(user: RoleAwareRecord) {
  return user.active && hasAllowedRole(user.role, SETTINGS_ACCESS_ROLES);
}

export function canManageAdminUsers(user: RoleAwareRecord) {
  return user.active && hasAllowedRole(user.role, USER_MANAGEMENT_ROLES);
}
