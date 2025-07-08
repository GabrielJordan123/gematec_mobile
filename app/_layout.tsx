import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from "@react-navigation/native";
import AppRouter from "../src/Routers/AppRouter";
import { PermissionProvider } from "../src/Context/PermissionsContext";
import { UserProvider } from "../src/Context/UserContext";
import { NavigationProvider } from "../src/Context/NavigationContext";

// Required hook for Expo Router framework initialization
function useFrameworkReady() {
  useEffect(() => {
    // Framework initialization logic
    console.log('Framework ready');
  }, []);
}

export default function RootLayout() {
  // CRITICAL: This hook is required and must never be removed
  useFrameworkReady();

  return (
    <>
      <NavigationContainer>
        <PermissionProvider>
          <UserProvider>
            <AppRouter />
          </UserProvider>
        </PermissionProvider>
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
}