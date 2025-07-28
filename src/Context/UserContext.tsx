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
  isAuthenticated: boolean;
  login: (token: string, keepLoggedIn: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const storedClientId = await AsyncStorage.getItem("selectedClientId");
        const storedSectorId = await AsyncStorage.getItem("selectedSectorId");
        const storedAccountId = await AsyncStorage.getItem("selectedAccountId");
        const storedEquipmentId = await AsyncStorage.getItem("selectedEquipmentId");
        const slidingToken = await AsyncStorage.getItem('sliding_token');
        const keepLoggedIn = await AsyncStorage.getItem('keep_logged_in');
        let accessToken = await AsyncStorage.getItem('access_token');

        if (storedClientId) setClientId(parseInt(storedClientId));
        if (storedSectorId) setSectorId(parseInt(storedSectorId));
        if (storedEquipmentId) setEquipmentId(parseInt(storedEquipmentId));
        if (storedAccountId) setAccountId(parseInt(storedAccountId));

        if (keepLoggedIn === 'true' && slidingToken && storedAccountId) {
          if (!accessToken) {
            // Troca de conta para obter access_token
            try {
              const { access } = await import('../Services/AuthService').then(m => m.default.switchAccount(slidingToken, Number(storedAccountId)));
              accessToken = access;
              await AsyncStorage.setItem('access_token', accessToken);
              console.log('[UserContext] access_token obtido e salvo:', accessToken);
            } catch (e) {
              console.error('[UserContext] Erro ao obter access_token:', e);
            }
          }
          if (accessToken) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
          await AsyncStorage.removeItem('sliding_token');
          await AsyncStorage.removeItem('access_token');
        }
      } catch (error) {
        console.error("Failed to load persisted data:", error);
      } finally {
        console.log("[UserContext] loadPersistedData finished. Setting isLoading to false.");
        setIsLoading(false);
      }
    };
    console.log("[UserContext] Calling loadPersistedData...");
    loadPersistedData();
  }, []);

  const login = async (token: string, keepLoggedIn: boolean) => {
    await AsyncStorage.setItem('sliding_token', token);
    await AsyncStorage.setItem('keep_logged_in', String(keepLoggedIn));
    setIsAuthenticated(true);
    // LOG: sliding_token salvo
    const savedSlidingToken = await AsyncStorage.getItem('sliding_token');
    console.log('[UserContext] sliding_token salvo:', savedSlidingToken);
    // LOG: access_token salvo (se já existir)
    const savedAccessToken = await AsyncStorage.getItem('access_token');
    console.log('[UserContext] access_token salvo:', savedAccessToken);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('sliding_token');
    await AsyncStorage.removeItem('keep_logged_in');
    setIsAuthenticated(false);
    setUsername("");
    setClientId(null);
    setSectorId(null);
    setEquipmentId(null);
    setAccountId(null);
  };

  const saveUsername = async (name: string) => {
    await AsyncStorage.setItem("username", name);
    setUsername(name);
  };

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
        setUsername: saveUsername,
        clientId,
        setClientId,
        sectorId,
        setSectorId,
        equipmentId,
        setEquipmentId,
        accountId,
        setAccountId: saveAccountId,
        isAuthenticated,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};