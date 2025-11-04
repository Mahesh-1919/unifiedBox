"use client";

import { useAuth } from "@/hooks/useAuth";
import { hasPermission, type UserRole, ROLE_PERMISSIONS } from "@/lib/roles";
import { ReactNode, useEffect, useState } from "react";

interface RoleGuardProps {
  children: ReactNode;
  permission?: keyof typeof ROLE_PERMISSIONS.VIEWER;
  roles?: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, permission, roles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // During SSR or before mounting, show fallback to prevent hydration mismatch
  if (!mounted) {
    return <>{fallback}</>;
  }
  
  const userRole = (user?.role as UserRole) || "VIEWER";

  // Check role-based access
  if (roles && !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (permission && !hasPermission(userRole, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
