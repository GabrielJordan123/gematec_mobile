import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TechnicalAssistanceService from "../../Services/TechnicalAssistanceService";
import { RootStackParamList } from "../../Routers/AppRouter";
import { Picker } from "@react-native-picker/picker";
import { RadioButton } from "react-native-paper";
import { usePermissions } from "../../Context/PermissionsContext";
import { TechnicalAssistance, Question } from "../../Models/TechnicalAssistance";

type TechnicalAssistanceDetailsScreenRouteProp = RouteProp<RootStackParamList, "TechnicalAssistanceDetails">;
type TechnicalAssistanceDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, "TechnicalAssistanceDetails">;

interface TechnicalAssistanceDetailsScreenProps {
    route: TechnicalAssistanceDetailsScreenRouteProp;
    navigation: TechnicalAssistanceDetailsScreenNavigationProp;
}

const TechnicalAssistanceDetailsScreen: React.FC<TechnicalAssistanceDetailsScreenProps> = ({ route, navigation }) => {
    const { id } = route.params;
    const { hasPermission, permissions } = usePermissions();
    const [data, setData] = useState<TechnicalAssistance | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<{ [key: number]: { value: string; justification?: string } }>({});
    const service = new TechnicalAssistanceService();


    useEffect(() => {
        const fetchTechnicalAssistance = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("access_token");
                if (!token) throw new Error("Token não encontrado");
                const response = await service.fetchTechnicalAssistanceDetails(token, id);
                setData(response);
            } catch (error) {
                console.error("Erro ao buscar assistência técnica:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTechnicalAssistance();
    }, [id]);

    const handleAnswerChange = (questionId: number, value: string, justification?: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: { value, justification },
        }));
    };

    const renderQuestion = ({ item }: { item: Question }) => {
        const answer = answers[item.id] || { value: "", justification: "" };
        switch (item.answer_type) {
            case "select":
                return (
                    <View style={styles.questionContainer}>
                        <Text style={styles.questionTitle}>{item.title}</Text>
                        {item.description && <Text style={styles.questionDescription}>{item.description}</Text>}
                        <Picker
                            selectedValue={answer.value}
                            onValueChange={(value) => handleAnswerChange(item.id, value)}
                            style={styles.input}
                        >
                            <Picker.Item label="Selecione uma opção" value="" />
                            {item.meta.options?.map((option) => (
                                <Picker.Item key={option} label={option} value={option} />
                            ))}
                        </Picker>
                    </View>
                );
            case "radio":
                return (
                    <View style={styles.questionContainer}>
                        <Text style={styles.questionTitle}>{item.title}</Text>
                        {item.description && <Text style={styles.questionDescription}>{item.description}</Text>}
                        {item.meta.options?.map((option) => (
                            <View key={option} style={styles.radioOption}>
                                <RadioButton
                                    value={option}
                                    status={answer.value === option ? "checked" : "unchecked"}
                                    onPress={() => handleAnswerChange(item.id, option)}
                                />
                                <Text>{option}</Text>
                            </View>
                        ))}
                    </View>
                );
            case "radio_with_justification":
                const showJustification = answer.value === item.meta.justification_target;
                return (
                    <View style={styles.questionContainer}>
                        <Text style={styles.questionTitle}>{item.title}</Text>
                        {item.description && <Text style={styles.questionDescription}>{item.description}</Text>}
                        {item.meta.options?.map((option) => (
                            <View key={option} style={styles.radioOption}>
                                <RadioButton
                                    value={option}
                                    status={answer.value === option ? "checked" : "unchecked"}
                                    onPress={() => handleAnswerChange(item.id, option)}
                                />
                                <Text>{option}</Text>
                            </View>
                        ))}
                        {showJustification && (
                            <TextInput
                                style={styles.input}
                                placeholder="Justifique"
                                value={answer.justification || ""}
                                onChangeText={(text) => handleAnswerChange(item.id, answer.value, text.slice(0, 300))}
                                maxLength={300}
                                multiline
                            />
                        )}
                    </View>
                );
            case "measure":
                return (
                    <View style={styles.questionContainer}>
                        <Text style={styles.questionTitle}>{item.title}</Text>
                        {item.description && <Text style={styles.questionDescription}>{item.description}</Text>}
                        <View style={styles.measureContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                keyboardType="numeric"
                                value={answer.value}
                                onChangeText={(text) => handleAnswerChange(item.id, text)}
                            />
                            <Text style={styles.unit}>{item.meta.unit || "N/A"}</Text>
                        </View>
                    </View>
                );
            case "text":
                return (
                    <View style={styles.questionContainer}>
                        <Text style={styles.questionTitle}>{item.title}</Text>
                        {item.description && <Text style={styles.questionDescription}>{item.description}</Text>}
                        <TextInput
                            style={styles.input}
                            value={answer.value}
                            onChangeText={(text) => handleAnswerChange(item.id, text.slice(0, 300))}
                            maxLength={300}
                            multiline
                        />
                    </View>
                );
            default:
                return null;
        }
    };

    if (loading) return <ActivityIndicator size="large" color="#007BFF" style={styles.center} />;
    if (!data) return <Text style={styles.errorText}>Assistência técnica não encontrada.</Text>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Informações do Equipamento</Text>
                <Text style={styles.headerText}>Cliente: {data.equipment.client?.name || "N/A"}</Text>
                <Text style={styles.headerText}>Setor: {data.equipment.sector?.name || "N/A"}</Text>
                <Text style={styles.headerText}>Tag: {data.equipment.tag}</Text>
                <Text style={styles.headerText}>Patrimônio: {data.equipment.patrimony}</Text>
                <Text style={styles.headerText}>Número de Série: {data.equipment.serial_number || "N/A"}</Text>
                <Text style={styles.headerText}>Fabricante: {data.equipment.brand?.name || "N/A"}</Text>
                <Text style={styles.headerText}>
                    Tecnologia: {data.equipment.technology ? data.equipment.technology.name : "N/A"}
                </Text>
                <Text style={styles.headerText}>Tipo de Equipamento: {data.equipment.equipment_type?.name || "N/A"}</Text>
                <Text style={styles.headerText}>Tipo de Evaporadora: {data.equipment.evaporator_type?.name || "N/A"}</Text>
                <Text style={styles.headerText}>Tipo de Serpentina: {data.equipment.coil_type?.name || "N/A"}</Text>
                <Text style={styles.headerText}>Tipo de Coifa: {data.equipment.condenser_type?.name || "N/A"}</Text>
                <Text style={styles.headerText}>Capacidade: {data.equipment.capacity || "N/A"}</Text>
                <Text style={styles.headerText}>Voltagem: {data.equipment.voltage || "N/A"}</Text>
                <Text style={styles.headerText}>Corrente Elétrica: {data.equipment.electric_current || "N/A"}</Text>
                <Text style={styles.headerText}>
                    Status: {data.status === "open" ? "Aberto" : data.status === "closed" ? "Fechado" : "Pendente"}
                </Text>
                <Text style={styles.noteText}>
                    Esses dados do equipamento são de quando a assistência técnica foi criada e não refletem mudanças posteriores.
                </Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Plano de Atividade</Text>
                <FlatList
                    data={data.questions.sort((a, b) => a.order - b.order)}
                    renderItem={renderQuestion}
                    keyExtractor={(item) => item.id.toString()}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seção de Uploads</Text>
                <Text style={styles.placeholderText}>
                    Em desenvolvimento. Esses dados do equipamento são de quando a assistência técnica foi criada e não refletem mudanças posteriores.
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => console.log("Salvar como Rascunho")}>
                    <Text style={styles.buttonText}>Salvar como Rascunho</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => console.log("Salvar")}>
                    <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8, marginBottom: 16 },
    headerTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8, color: "#333" },
    headerText: { fontSize: 16, color: "#555" },
    noteText: { fontSize: 14, color: "#888", fontStyle: "italic", marginTop: 8 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#333" },
    questionContainer: { padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 12 },
    questionTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
    questionDescription: { fontSize: 14, color: "#666", marginBottom: 8 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8, marginTop: 8 },
    radioOption: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
    measureContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
    unit: { marginLeft: 8, fontSize: 16, color: "#555" },
    placeholderText: { fontSize: 14, color: "#888", fontStyle: "italic" },
    buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
    button: { backgroundColor: "#007BFF", padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: "center" },
    cancelButton: { backgroundColor: "#dc3545", padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: "center" },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    emptyText: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 20 },
    errorText: { fontSize: 18, color: "red", textAlign: "center", marginTop: 20 },
});

export default TechnicalAssistanceDetailsScreen;