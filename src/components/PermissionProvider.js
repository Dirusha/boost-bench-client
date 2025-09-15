import React, { createContext, useContext, useMemo } from "react";
import { useSelector } from "react-redux";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { permissions } = useSelector((state) => state.login);

  const hasPermission = (requiredPermission) => {
    return permissions.includes(requiredPermission);
  };

  const value = useMemo(() => ({ hasPermission }), [permissions]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
};
