import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

interface PermissionGateProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export default function PermissionGate({
  permissions,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission } = useAuth();

  const allowed = permissions.some(hasPermission);

  return allowed ? <>{children}</> : <>{fallback}</>;
}