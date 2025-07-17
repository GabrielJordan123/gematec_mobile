import React from "react";
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../Routers/AppRouter";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { usePermissions } from "../../Context/PermissionsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../Context/ApiClient";
import { API_BASE_URL } from "../../config/apiConfig";

type Props = {
    equipmentId: number;
};

interface NewServiceOrderScreenProps {
    route: RouteProp<RootStackParamList, "NewServiceOrderScreen">;
    navigation: DrawerNavigationProp<RootStackParamList, "NewServiceOrderScreen">;
}
const NewServiceOrderScreen: React.FC<NewServiceOrderScreenProps> = ({ route, navigation }) => {
    const [loading, setLoading] = React.useState(false);
    const { equipmentId } = route.params;
    const { hasPermission, permissions } = usePermissions();

    const createServiceOrder = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const response = await apiClient.post(`${API_BASE_URL}/service_orders`, {
                equipment_id: equipmentId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Alert.alert("Sucesso", "Ordem de Serviço criada com sucesso!");
            navigation.navigate("ViewOrderActivityScreen", {
                serviceOrderId: Number(response.data.id), // Garantir que seja number
                equipmentId,
            });
        } catch (error) {
            Alert.alert("Erro", "Erro ao criar Ordem de Serviço");
        } finally {
            setLoading(false);
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Detalhes do Equipamento</Text>
            <Button title="Criar Ordem de Serviço" onPress={createServiceOrder} disabled={loading} />
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#007BFF",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "#ccc",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    container: { padding: 16 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },

    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: 20,
    },
});

export default NewServiceOrderScreen;
