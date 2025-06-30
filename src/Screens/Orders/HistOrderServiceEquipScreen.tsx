import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../Routers/AppRouter";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Picker } from "@react-native-picker/picker";
import { API_BASE_URL } from "../../config/apiConfig";

interface OrderService {
    id: number;
    status: string;
    created_at: string;
    equipment: {
        tag: string;
        brand: string;
        equipment_type: string;
    };
}

interface HistOrderServiceEquipScreenProps {
    route: RouteProp<RootStackParamList, "HistOrderServiceEquipScreen">;
    navigation: DrawerNavigationProp<RootStackParamList, "HistOrderServiceEquipScreen">;
}

const HistOrderServiceEquipScreen = ({ route }: HistOrderServiceEquipScreenProps) => {
    const { equipmentId } = route.params;
    const [orders, setOrders] = useState<OrderService[]>([]);
    const [loading, setLoading] = useState(false);
    const [activityType, setActivityType] = useState<string>("order_service");
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);

    const fetchOrderHistory = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem("access_token");
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/equipments/${equipmentId}/activities?activity_type=${activityType}&page=${page}&per_page=${perPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Erro ao buscar ordens de serviço.");

            const data = await response.json();
            setOrders(data.results);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderHistory();
    }, [activityType, page]);

    const renderOrder = ({ item }: { item: OrderService }) => (
        <View style={styles.row}>
            <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
            <Text>{item.status}</Text>
            <Text>{item.equipment.equipment_type}</Text>
            <Text>{item.equipment.brand}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histórico de Ordens de Serviço</Text>

            {/* Filtro para selecionar o tipo de atividade */}
            <Picker
                selectedValue={activityType}
                onValueChange={(value) => setActivityType(value)}
            >
                <Picker.Item label="Ordem de Serviço" value="order_service" />
            </Picker>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrder}
                    ListEmptyComponent={<Text>Nenhuma ordem de serviço encontrada.</Text>}
                />
            )}

            {/* Botões de navegação para páginas */}
            <View style={styles.pagination}>
                <Button
                    title="Página Anterior"
                    onPress={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
                />
                <Button title="Próxima Página" onPress={() => setPage((prevPage) => prevPage + 1)} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    pagination: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
});

export default HistOrderServiceEquipScreen;
