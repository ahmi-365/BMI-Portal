import React from "react";
import { Navigate } from "react-router-dom";
import { userAuth } from "../../services/auth";

const UserProtectedRoute = ({ children }) => {
  const token = userAuth.getToken();
  if (!token) {
    return <Navigate to="/user/login" replace />;
  }
  return children;
};

export default UserProtectedRoute;
