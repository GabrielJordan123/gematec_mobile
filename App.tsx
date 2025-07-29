
import 'react-native-gesture-handler';
import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import AppRouter from "./src/Routers/AppRouter";
import { PermissionProvider } from "./src/Context/PermissionsContext";
import { UserProvider } from "./src/Context/UserContext";

const App = () => {
    return (
        <PermissionProvider>
            <UserProvider>
                <NavigationContainer>
                    <AppRouter isAuthenticated={false} />
                </NavigationContainer>
            </UserProvider>
        </PermissionProvider>
    );
};

export default App;
