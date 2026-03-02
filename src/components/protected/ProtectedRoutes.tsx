import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedProps) {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  // ⏳ Wait until localStorage is resolved
  if (!token || !userRaw) {
    return <Navigate to="/signin" replace />;
  }

  const user = JSON.parse(userRaw);

  // 🔐 Role check
  if (!user?.role) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
