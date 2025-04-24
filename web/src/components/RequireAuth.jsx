import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RequireAuth = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (user === undefined) return null; // still loading
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
};

export default RequireAuth;
