export type AdminRole = "OWNER" | "ADMIN" | "EDITOR";

export const ADMIN_ACCESS_ROLES: AdminRole[] = ["OWNER", "ADMIN", "EDITOR"];
export const SETTINGS_ACCESS_ROLES: AdminRole[] = ["OWNER", "ADMIN"];
export const USER_MANAGEMENT_ROLES: AdminRole[] = ["OWNER", "ADMIN"];
export const OPERATIONS_ACCESS_ROLES: AdminRole[] = ["OWNER", "ADMIN"];
export const ASSIGNABLE_ADMIN_ROLES: Array<Exclude<AdminRole, "OWNER">> = [
  "ADMIN",
  "EDITOR",
];

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

export function canAccessAdminOperations(user: RoleAwareRecord) {
  return user.active && hasAllowedRole(user.role, OPERATIONS_ACCESS_ROLES);
}

export function isProtectedAdminRole(role: AdminRole) {
  return role === "OWNER";
}

export function isProtectedAdminUser(user: RoleAwareRecord) {
  return isProtectedAdminRole(user.role);
}

export function getAssignableAdminRoles(user: RoleAwareRecord) {
  if (!canManageAdminUsers(user)) {
    return [] as Array<Exclude<AdminRole, "OWNER">>;
  }

  return ASSIGNABLE_ADMIN_ROLES;
}

export function canAssignAdminRole(
  user: RoleAwareRecord,
  nextRole: AdminRole,
) {
  if (!canManageAdminUsers(user)) {
    return false;
  }

  return ASSIGNABLE_ADMIN_ROLES.includes(nextRole as Exclude<AdminRole, "OWNER">);
}

export function canManageTargetAdminUser(
  actor: RoleAwareRecord,
  target: RoleAwareRecord,
) {
  if (!canManageAdminUsers(actor)) {
    return false;
  }

  return !isProtectedAdminUser(target);
}
