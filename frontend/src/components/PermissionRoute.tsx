import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PermissionRouteProps {
  permissions: string[];
}

export default function PermissionRoute({
  permissions,
}: PermissionRouteProps) {
  const {
    hasPermission,
    initializing,
  } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Carregando RHFlow...
      </div>
    );
  }

  const allowed = permissions.some(hasPermission);

  if (!allowed) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}