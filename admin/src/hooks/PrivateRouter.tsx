import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ALLOWED_ROLES = ["admin", "user"] as const;

const getRoleFromStorageOrToken = (): string | undefined => {
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed && typeof parsed.role === "string") return parsed.role;
    }
  } catch (err) {
    // ignore json parse error
  }

  const token = localStorage.getItem("token");
  if (!token) return undefined;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return undefined;
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.role === "string" ? payload.role : undefined;
  } catch {
    return undefined;
  }
};

const PrivateRouter = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRouter;