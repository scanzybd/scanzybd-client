import React from "react";
import { Navigate } from "react-router";
import useAuth from "../hooks/useAuth";
import SmartLoader from "../components/SmartLoader";

const ProviderRoute = ({ children }) => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <SmartLoader fullPage label="Checking permissions..." />;
  }

  if (userRole !== "provider") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProviderRoute;
