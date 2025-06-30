import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  username: string;
  setUsername: (name: string) => void;
  clientId: number | null;
  setClientId: (id: number | null) => void;
  sectorId: number | null;
  setSectorId: (id: number | null) => void;
  equipmentId: number | null;
  setEquipmentId: (id: number | null) => void;
  accountId: number | null;
  setAccountId: (id: number | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string>("");
  const [clientId, setClientId] = useState<number | null>(null);
  const [sectorId, setSectorId] = useState<number | null>(null);
  const [equipmentId, setEquipmentId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);

  useEffect(() => {
    const loadPersistedData = async () => {
      const storedClientId = await AsyncStorage.getItem("selectedClientId");
      const storedSectorId = await AsyncStorage.getItem("selectedSectorId");
      const storedAccountId = await AsyncStorage.getItem("selectedAccountId");
      const storedEquipmentId = await AsyncStorage.getItem("selectedEquipmentId");
      if (storedClientId) setClientId(parseInt(storedClientId));
      if (storedSectorId) setSectorId(parseInt(storedSectorId));
      if (storedEquipmentId) setEquipmentId(parseInt(storedEquipmentId));
      if (storedAccountId) setAccountId(parseInt(storedAccountId));
    };
    loadPersistedData();
  }, []);
  const saveAccountId = async (id: number | null) => {
    if (id) {
      await AsyncStorage.setItem("selectedAccountId", id.toString());
    } else {
      await AsyncStorage.removeItem("selectedAccountId");
    }
    setAccountId(id);
  };
  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        clientId,
        setClientId,
        sectorId,
        setSectorId,
        equipmentId,
        setEquipmentId,
        accountId,
        setAccountId: saveAccountId,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};