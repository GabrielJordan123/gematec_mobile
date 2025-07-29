import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../Routers/AppRouter";
import ManualService from "../Services/ManualService";
import { Manual } from "../Models/Manual";

interface ManualDetailsScreenProps {
    route: RouteProp<RootStackParamList, "ManualDetailsScreen">;
    navigation: DrawerNavigationProp<RootStackParamList, "ManualDetailsScreen">;
}

const ManualDetailsScreen: React.FC<ManualDetailsScreenProps> = ({ route, navigation }) => {
    const { manualId } = route.params;
    const [manual, setManual] = useState<Manual | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchManualDetails = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("access_token");
                if (!token) throw new Error("Token de acesso não encontrado.");

                const response = await ManualService.fetchManualDetails(token, manualId);
                setManual(response);
            } catch (error: any) {
                console.error("[ManualDetailsScreen] Erro ao buscar detalhes do manual:", error);
                Alert.alert("Erro", error.message || "Não foi possível carregar os detalhes do manual.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        fetchManualDetails();
    }, [manualId, navigation]);

    const handleDownload = async () => {
        if (!manual?.file_url) {
            Alert.alert("Erro", "URL do arquivo não disponível.");
            return;
        }
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) throw new Error("Token de acesso não encontrado.");
            const fileUri = await ManualService.downloadManual(manual.file_url, token);
            Alert.alert("Sucesso", `Manual baixado em: ${fileUri}`);
        } catch (error: any) {
            console.error("[ManualDetailsScreen] Erro ao baixar manual:", error);
            Alert.alert("Erro", error.message || "Não foi possível baixar o manual.");
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    if (!manual) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Manual não encontrado.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{manual.name}</Text>
            </View>
            <Text style={styles.category}>Categoria: {manual.category.name}</Text>
            <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                <Text style={styles.downloadButtonText}>Baixar Manual</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    backButton: {
        backgroundColor: "#007BFF",
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 14,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    category: {
        fontSize: 16,
        color: "#555",
        marginBottom: 15,
    },
    downloadButton: {
        backgroundColor: "#28a745",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    downloadButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorText: {
        fontSize: 16,
        color: "#FF0000",
        textAlign: "center",
        marginTop: 20,
    },
});

export default ManualDetailsScreen;