import React from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@react-navigation/native";
import AppRouter from "./src/Routers/AppRouter";
import { PermissionProvider } from "./src/Context/PermissionsContext";
import { UserProvider } from "./src/Context/UserContext";
import { RootStackParamList } from "./src/Routers/AppRouter";
import { NavigationProvider } from "./src/Context/NavigationContext";

// Componente interno que usa o useNavigation
const AppContent = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <NavigationProvider navigation={navigation}>
      <AppRouter />
    </NavigationProvider>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <PermissionProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </PermissionProvider>
    </NavigationContainer>
  );
};

export default App;