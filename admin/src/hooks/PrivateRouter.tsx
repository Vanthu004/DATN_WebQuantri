import React from "react";
import { Navigate, Outlet } from "react-router-dom";

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
  const token = localStorage.getItem("token");
  const role = getRoleFromStorageOrToken();
  const isAllowed = Boolean(token) && !!role && ALLOWED_ROLES.includes(role as any);

  return isAllowed ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRouter;
