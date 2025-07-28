import 'react-native-gesture-handler';
import React, { useEffect, useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import AppRouter from "./src/Routers/AppRouter";
import { PermissionProvider } from "./src/Context/PermissionsContext";
import { UserProvider } from "./src/Context/UserContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const keepLoggedIn = await AsyncStorage.getItem('keep_logged_in');
                const token = await AsyncStorage.getItem('sliding_token');

                if (keepLoggedIn === 'true' && token) {
                    setIsAuthenticated(true);
                } else {
                    await AsyncStorage.removeItem('sliding_token');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Erro ao verificar a autenticação:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <PermissionProvider>
            <UserProvider>
                <NavigationContainer>
                    <AppRouter isAuthenticated={isAuthenticated} />
                </NavigationContainer>
            </UserProvider>
        </PermissionProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default App;