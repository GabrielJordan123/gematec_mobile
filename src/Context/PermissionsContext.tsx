import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
interface PermissionContextType {
  permissions: string[];
  setPermissions: (permissions: string[]) => void;
  hasPermission: (permission: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  setPermissions: () => { },
  hasPermission: () => false,
});

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const loadPermissions = async () => {
      const storedPermissions = await AsyncStorage.getItem("permissions");
      if (storedPermissions) {
        setPermissions(JSON.parse(storedPermissions));
      }
    };
    loadPermissions();
  }, []);

  const savePermissions = async (newPermissions: string[]) => {
    await AsyncStorage.setItem("permissions", JSON.stringify(newPermissions));
    setPermissions(newPermissions);
  };

  const hasPermission = (permission: string): boolean => {
    console.log("[PermissionProvider] Permissões atuais:", permissions);
    if (!Array.isArray(permissions) || permissions === undefined) {
      console.error("[PermissionProvider] Permissões não são um array ou estão indefinidas:", permissions);
      return false;
    }
    return permissions.includes(permission);
  };

  return (
    <PermissionContext.Provider value={{ permissions, setPermissions, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;