import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../../services/auth";

const ProtectedRoute = ({ children }) => {
  const token = auth.getToken();
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default ProtectedRoute;
