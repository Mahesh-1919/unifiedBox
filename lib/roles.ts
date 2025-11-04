export type UserRole = "VIEWER" | "EDITOR" | "ADMIN";

export const ROLES = {
  VIEWER: "VIEWER" as const,
  EDITOR: "EDITOR" as const,
  ADMIN: "ADMIN" as const,
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.VIEWER]: {
    canView: true,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canSendMessages: false,
  },
  [ROLES.EDITOR]: {
    canView: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canSendMessages: true,
  },
  [ROLES.ADMIN]: {
    canView: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canSendMessages: true,
  },
} as const;

export function hasPermission(
  role: UserRole | undefined,
  permission: keyof (typeof ROLE_PERMISSIONS)[typeof ROLES.VIEWER]
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

export function canSendMessages(role: UserRole | undefined): boolean {
  return hasPermission(role, "canSendMessages");
}

export function canEditContacts(role: UserRole | undefined): boolean {
  return hasPermission(role, "canEdit");
}

export function canManageUsers(role: UserRole | undefined): boolean {
  return hasPermission(role, "canManageUsers");
}
