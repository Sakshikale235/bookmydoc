// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    // Redirect to login if not logged in
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the page
  return <>{children}</>;
};

export default ProtectedRoute;
