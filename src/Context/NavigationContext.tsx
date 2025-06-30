import React, { createContext, useContext } from "react";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../Routers/AppRouter";

// Criar o contexto corretamente
const NavigationContext = createContext<NavigationProp<RootStackParamList> | null>(null);

interface NavigationProviderProps {
    navigation: NavigationProp<RootStackParamList>;
    children: React.ReactNode;
}

// Componente provedor do contexto
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ navigation, children }) => {
    return (
        <NavigationContext.Provider value= { navigation } >
        { children }
        </NavigationContext.Provider>
    );
};

// Hook personalizado para acessar o contexto
export const useAppNavigation = () => {
    const navigation = useContext(NavigationContext);
    if (!navigation) {
        throw new Error("useAppNavigation must be used within a NavigationProvider");
    }
    return navigation;
};
