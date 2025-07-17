import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../Routers/AppRouter";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { usePermissions } from "../../Context/PermissionsContext";
import ServiceOrderService from "../../Services/ServiceOrderService";
import { API_BASE_URL } from "../../config/apiConfig";

interface ViewResponseActivityScreenProps {
    route: RouteProp<RootStackParamList, "ViewResponseActivityScreen">;
    navigation: DrawerNavigationProp<RootStackParamList, "ViewResponseActivityScreen">;
}

const ViewResponseActivityScreen = ({ route, navigation }: ViewResponseActivityScreenProps) => {
    const { serviceOrderId, equipmentStatus } = route.params;
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { hasPermission, permissions } = usePermissions();
    const [isSavingDisabled, setIsSavingDisabled] = useState(false);



    useEffect(() => {
        setIsSavingDisabled(equipmentStatus === "open");
        fetchAnswers();
    }, [serviceOrderId, equipmentStatus]);

    const fetchAnswers = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) throw new Error("Token não encontrado");
            const data = await ServiceOrderService.fetchAnswers(token, serviceOrderId);
            setAnswers(data || []);
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    const renderAnswerInput = (questionId: number, value: string) => (
        <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Resposta" value={value} editable={false} />
        </View>
    );

    if (loading) return <ActivityIndicator size="large" color="#007BFF" />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Respostas do Plano de Atividade</Text>
            {answers.length === 0 ? (
                <Text>Nenhuma resposta encontrada.</Text>
            ) : (
                answers.map((answer) => (
                    <View key={answer.question_id} style={styles.answerContainer}>
                        <Text style={styles.questionTitle}>Pergunta {answer.question_id}</Text>
                        {renderAnswerInput(answer.question_id, answer.value)}
                    </View>
                ))
            )}
            <View style={styles.buttonContainer}>
                <Button title="Salvar como Rascunho" onPress={() => Alert.alert("Rascunho salvo!")} disabled={isSavingDisabled} />
                <Button title="Salvar" onPress={() => Alert.alert("Respostas salvas!")} disabled={isSavingDisabled} />
                <Button title="Cancelar" onPress={() => navigation.goBack()} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    answerContainer: { marginBottom: 20 },
    questionTitle: { fontSize: 16, fontWeight: "bold" },
    inputContainer: { marginTop: 8 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8 },
    buttonContainer: { marginTop: 16, flexDirection: "row", justifyContent: "space-around" },
    emptyText: { fontSize: 14, color: "#666", textAlign: "center", marginVertical: 10 },
    errorText: { fontSize: 16, color: "#FF0000", textAlign: "center", marginTop: 20 },
});

export default ViewResponseActivityScreen;