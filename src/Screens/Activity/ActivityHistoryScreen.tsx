import React, { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Button,
    TouchableOpacity,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../Routers/AppRouter";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import ActivityService from "../../Services/ActivityService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePermissions } from "../../Context/PermissionsContext";
import { API_BASE_URL } from "../../config/apiConfig"; // Adicione esta importação no topo
interface ActivityHistoryScreenProps {
    navigation: DrawerNavigationProp<RootStackParamList, "ActivityHistoryScreen">;
    route: RouteProp<RootStackParamList, "ActivityHistoryScreen">;
}

const ActivityHistoryScreen: React.FC<ActivityHistoryScreenProps> = ({ route, navigation }) => {
    const { equipmentId } = route.params;
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string>("pmoc"); // Padrão é PMOC
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const { hasPermission } = usePermissions();
    const activityService = new ActivityService();

    // Permissões
    const canViewPmoc = hasPermission("pmocs.view_pmoc");
    const canViewServiceOrder = hasPermission("service_orders.view_serviceorder");
    const canViewTechnicalAssistance = hasPermission("technical_assistances.view_technicalassistance");

    if (!canViewPmoc && !canViewServiceOrder && !canViewTechnicalAssistance) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Você não tem permissão para visualizar atividades.</Text>
            </View>
        );
    }

    useEffect(() => {
        fetchActivities();
    }, [currentPage, selectedType]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await AsyncStorage.getItem("access_token");
            if (!token) throw new Error("Token não encontrado");

            const params = {
                page: currentPage,
                per_page: perPage,
                activity_type: selectedType !== "all" ? selectedType : undefined,
                token: token,
            };

            const response = await activityService.fetchActivities(equipmentId, params);
            setActivities(response.results || []);
            setTotalPages(Math.ceil(response.count / perPage) || 1);
        } catch (error: any) {
            const errorMessage = error.response?.status === 500
                ? "Erro interno no servidor ao buscar atividades. Tente novamente ou contate o suporte."
                : error.message || "Falha ao buscar atividades.";
            setError(errorMessage);
            console.error("[ActivityHistoryScreen] Erro ao buscar atividades:", errorMessage);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const statusTranslations: { [key: string]: string } = {
        open: "Aberto",
        closed: "Fechado",
        pending: "Pendente",
    };

    const statusColors: { [key: string]: string } = {
        open: "blue",
        closed: "green",
        pending: "orange",
    };

    const renderActivityItem = ({ item }: { item: any }) => {
        const isPmoc = item.type === "pmoc" && canViewPmoc;
        const isServiceOrder = item.type === "service_order" && canViewServiceOrder;
        const isTechnicalAssistance = item.type === "technical_assistance" && canViewTechnicalAssistance;

        if (!isPmoc && !isServiceOrder && !isTechnicalAssistance) {
            return null;
        }

        const navigateToDetails = () => {
            if (isPmoc) {
                navigation.navigate("PmocDetailsScreen", { pmocId: item.id });
            } else if (isServiceOrder) {
                navigation.navigate("ViewOrderActivityScreen", {
                    serviceOrderId: item.id,
                    equipmentId: item.equipment?.id || equipmentId,
                });
            } else if (isTechnicalAssistance) {
                navigation.navigate("TechnicalAssistanceDetails", { id: item.id });
            }
        };

        return (
            <TouchableOpacity style={styles.tableRow} onPress={navigateToDetails}>
                <Text style={styles.cellText}>{item.client?.name || "N/A"}</Text>
                <Text style={styles.cellText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <Text style={[styles.cellText, { color: statusColors[item.status] || "black" }]}>
                    {statusTranslations[item.status] || item.status}
                </Text>
                <Text style={styles.cellText}>{item.deadline || "N/A"}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histórico de Atividades do Equipamento</Text>

            {/* Filtro de Tipo de Atividade */}
            <Picker
                selectedValue={selectedType}
                onValueChange={(itemValue) => {
                    setSelectedType(itemValue);
                    setCurrentPage(1); // Reseta para a primeira página ao mudar o filtro
                }}
                style={styles.picker}
            >
                {(canViewPmoc || canViewServiceOrder || canViewTechnicalAssistance) && (
                    <Picker.Item label="Todos" value="all" />
                )}
                {canViewPmoc && <Picker.Item label="PMOC" value="pmoc" />}
                {canViewServiceOrder && <Picker.Item label="Ordem de Serviço" value="service_order" />}
                {canViewTechnicalAssistance && <Picker.Item label="Assistência Técnica" value="technical_assistance" />}
                {/* "Todos" será adicionado no futuro */}
            </Picker>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : error ? (
                <View>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button title="Tentar Novamente" onPress={fetchActivities} />
                </View>
            ) : (
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.headerText}>Cliente</Text>
                        <Text style={styles.headerText}>Data de Abertura</Text>
                        <Text style={styles.headerText}>Status</Text>
                        <Text style={styles.headerText}>Deadline</Text>
                    </View>
                    <FlatList
                        data={activities}
                        renderItem={renderActivityItem}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma atividade encontrada.</Text>}
                    />
                    <View style={styles.pagination}>
                        <Button
                            title="Anterior"
                            onPress={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                        />
                        <Text style={styles.pageText}>Página {currentPage} de {totalPages}</Text>
                        <Button
                            title="Próximo"
                            onPress={() => setCurrentPage((p) => (p < totalPages ? p + 1 : p))}
                            disabled={currentPage === totalPages}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    picker: {
        backgroundColor: "#fff",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
    },
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
        marginVertical: 20,
    },
    table: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f5f5f5",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerText: {
        flex: 1,
        fontWeight: "bold",
        textAlign: "center",
    },
    cellText: {
        flex: 1,
        textAlign: "center",
        fontSize: 14,
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        marginTop: 20,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    pageText: {
        fontSize: 14,
        color: "#333",
    },
});

export default ActivityHistoryScreen;