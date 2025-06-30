import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TextInput,
    Button,
    TouchableOpacity,
    FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { RouteProp } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../../Routers/AppRouter";
import { Picker } from "@react-native-picker/picker";
import TechnicalAssistanceService from "../../Services/TechnicalAssistanceService";
import ServiceOrderService from "../../Services/ServiceOrderService";
import { usePermissions } from "../../Context/PermissionsContext";
import { API_BASE_URL } from "../../config/apiConfig";
interface ViewOrderActivityScreenProps {
    route: RouteProp<RootStackParamList, "ViewOrderActivityScreen">;
    navigation: DrawerNavigationProp<RootStackParamList, "ViewOrderActivityScreen">;
}

const ViewOrderActivityScreen: React.FC<ViewOrderActivityScreenProps> = ({
    route,
    navigation,
}) => {
    const { serviceOrderId, equipmentId, pmocId, equipmentVersionId } = route.params;  // Adicionados pmocId e equipmentVersionId
    const [loading, setLoading] = useState(true);
    const { hasPermission, permissions } = usePermissions();
    const [serviceOrder, setServiceOrder] = useState<any>(null);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});
    const [uploadedImages, setUploadedImages] = useState<any[]>([]);

    if (permissions.length === 0 && loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>Carregando permissões...</Text>
            </View>
        );
    }

    if (!hasPermission("service_orders.view_serviceorder")) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Você não tem permissão para visualizar ordens de serviço.</Text>
            </View>
        );
    }
    const fetchServiceOrderDetails = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access_token");
            if (!token) throw new Error("Token de acesso não encontrado.");

            // Ajuste para passar pelo backend do frontend
            const response = await fetch(`${API_BASE_URL}/service_orders/${serviceOrderId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Erro ao buscar dados da O.S.");

            const data = await response.json();
            setServiceOrder(data);
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceOrderDetails();
        fetchAnswers();
        fetchImages();
    }, []);

    const fetchAnswers = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) throw new Error("Token de acesso não encontrado.");
            const data = await ServiceOrderService.fetchAnswers(token, serviceOrderId);
            const loadedAnswers = Array.isArray(data)
                ? data.reduce((acc: any, answer: any) => {
                    acc[answer.question_id] = answer.value;
                    if (answer.meta?.justification) acc[`${answer.question_id}_justification`] = answer.meta.justification;
                    return acc;
                }, {})
                : {}; // Retorna objeto vazio se data não for array
            setAnswers(loadedAnswers);
        } catch (error) {
            console.error('Erro ao buscar respostas:', error);
        }
    };

    const fetchImages = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) throw new Error("Token de acesso não encontrado.");
            const data = await ServiceOrderService.fetchImages(token, serviceOrderId);
            setUploadedImages(data || []);  // Removido .results
        } catch (error) {
            console.error('Erro ao buscar imagens:', error);
        }
    };
    const handleImageUpload = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) throw new Error("Token de acesso não encontrado.");
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') throw new Error("Permissão para acessar a galeria negada.");

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 1,
                allowsMultipleSelection: true,
                selectionLimit: 5,
            });

            if (result.canceled) return;

            const formData = new FormData();
            result.assets.forEach((asset, index) => {
                formData.append(`images[${index}]`, {
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    name: asset.fileName || `image_${index}.jpg`,
                } as any);
            });

            // Obter pmocId e equipmentVersionId do serviceOrder ou route.params
            const effectivePmocId = pmocId || serviceOrder?.pmocId;  // Ajuste conforme estrutura real
            const effectiveEquipmentVersionId = equipmentVersionId || serviceOrder?.equipment?.id || equipmentId;

            if (!effectivePmocId || !effectiveEquipmentVersionId) {
                throw new Error("PMOC ID ou Equipment Version ID não disponível.");
            }

            const data = await ServiceOrderService.uploadImages(token, effectivePmocId, effectiveEquipmentVersionId, formData);
            setUploadedImages((prevImages) => [...prevImages, ...data]);
            Alert.alert("Sucesso", "Imagens enviadas com sucesso!");
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Ocorreu um erro ao fazer upload.");
        }
    };
    // Função para transformar respostas em formato desejado
    // Função para transformar respostas em formato desejado (já existente, mas confirmando)
    const transformAnswers = () => {
        const transformedAnswers = Object.keys(answers).map((key) => {
            const question = serviceOrder?.questions?.find((q: any) => q.id === key);
            const meta =
                question?.answer_type === "radio_with_justification" &&
                    answers[key] === question?.meta?.justification_target
                    ? { justification: answers[`${key}_justification`] || "" }
                    : {};

            return {
                question_id: key,
                value: answers[key],
                meta,
            };
        });

        return transformedAnswers;
    };

    // Função para salvar as respostas
    const saveAnswers = async (status: string) => {
        const transformedAnswers = transformAnswers();
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) throw new Error("Token de acesso não encontrado.");

            const response = await fetch(`${API_BASE_URL}/service_orders/${serviceOrderId}/answers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status,
                    answers: transformedAnswers,
                }),
            });

            if (!response.ok) throw new Error("Erro ao salvar as respostas.");

            const data = await response.json();
            Alert.alert("Sucesso", "Respostas salvas com sucesso!");
            navigation.goBack(); // Volta para a tela anterior
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Ocorreu um erro ao salvar.");
        }
    };

    // Função para enviar as respostas ao backend
    const sendAnswersToBackend = async (status: string) => {
        const transformedAnswers = transformAnswers();
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) throw new Error("Token de acesso não encontrado.");

            const response = await fetch(`${API_BASE_URL}/service_orders/${serviceOrderId}/answers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status,
                    answers: transformedAnswers,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao salvar as respostas: ${errorText}`);
            }

            const data = await response.json();
            return data; // Retorna os dados da resposta para uso futuro, se necessário
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Ocorreu um erro ao salvar as respostas.");
            throw error; // Repropaga o erro para ser tratado, se necessário
        }
    };

    // Função para salvar como Rascunho
    const handleSaveAsDraft = async () => {
        try {
            await sendAnswersToBackend("pending");
            Alert.alert("Sucesso", "Respostas salvas como rascunho com sucesso!");
            navigation.goBack(); // Volta para a tela anterior
        } catch (error) {
            // O erro já é tratado em sendAnswersToBackend
        }
    };

    // Função para salvar
    const handleSave = async () => {
        if (validateAnswers()) {
            try {
                await sendAnswersToBackend("open");
                Alert.alert("Sucesso", "Respostas salvas com sucesso!");
                navigation.goBack(); // Volta para a tela anterior
            } catch (error) {
                // O erro já é tratado em sendAnswersToBackend
            }
        }
    };

    // Função de validação antes de enviar
    const validateAnswers = () => {
        if (!serviceOrder || !serviceOrder.questions) return true;

        for (const question of serviceOrder.questions) {
            if (question.required && !answers[question.id]) {
                Alert.alert("Erro", `A pergunta "${question.title}" precisa ser respondida.`);
                return false;
            }
            if (
                question.answer_type === "radio_with_justification" &&
                answers[question.id] === question.meta?.justification_target &&
                !answers[`${question.id}_justification`]
            ) {
                Alert.alert("Erro", `A justificativa para "${question.title}" é obrigatória.`);
                return false;
            }
        }
        return true;
    };

    if (loading) return <ActivityIndicator size="large" color="#007BFF" />;

    return (
        <ScrollView style={styles.container}>
            {/* Informações do Equipamento */}
            {serviceOrder && serviceOrder.equipment ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações do Equipamento</Text>
                    <Text>Cliente: {serviceOrder.equipment.client?.name || "N/A"}</Text>
                    <Text>Setor: {serviceOrder.equipment.sector?.name || "N/A"}</Text>
                    <Text>Tag: {serviceOrder.equipment.tag || "N/A"}</Text>
                    <Text>Patrimônio: {serviceOrder.equipment.patrimony || "N/A"}</Text>
                    <Text>Número de Série: {serviceOrder.equipment.serial_number || "N/A"}</Text>
                    <Text>Fabricante: {serviceOrder.equipment.brand?.name || "N/A"}</Text>
                    <Text>Tecnologia: {serviceOrder.equipment.technology || "N/A"}</Text>
                    <Text>Tipo de Equipamento: {serviceOrder.equipment.equipment_type?.name || "N/A"}</Text>
                    <Text>Tipo de Evaporadora: {serviceOrder.equipment.evaporator_type?.name || "N/A"}</Text>
                    <Text>Tipo de Serpentina: {serviceOrder.equipment.coil_type?.name || "N/A"}</Text>
                    <Text>Tipo de Coifa: {serviceOrder.equipment.condenser_type?.name || "N/A"}</Text>
                    <Text>Capacidade: {serviceOrder.equipment.capacity || "N/A"}</Text>
                    <Text>Voltagem: {serviceOrder.equipment.voltage || "N/A"}</Text>
                    <Text>Corrente Elétrica: {serviceOrder.equipment.electric_current || "N/A"}</Text>
                    <Text>Status da O.S: {serviceOrder.status || "N/A"}</Text> {/* Verifique se 'status' está no payload */}
                    <Text style={styles.warning}>
                        Os dados do equipamento são de quando a O.S foi criada, não reflete mudanças posteriores.
                    </Text>

                </View>
            ) : (
                <Text>Carregando informações do equipamento...</Text>

            )}

            {/* Plano de Atividade */}
            {serviceOrder && serviceOrder.questions && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Plano de Atividade</Text>
                    {serviceOrder.questions.map((question: any) => (
                        <View key={question.id} style={styles.questionContainer}>
                            <Text style={styles.questionTitle}>{question.title}</Text>
                            {question.description && <Text>{question.description}</Text>}
                            {question.answer_type === "text" && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Digite sua resposta"
                                    value={answers[question.id] || ""}
                                    onChangeText={(text) =>
                                        setAnswers({ ...answers, [question.id]: text.slice(0, 300) })
                                    }
                                    maxLength={300}
                                />
                            )}
                            {question.answer_type === "measure" && (
                                <View style={styles.row}>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="Digite o valor"
                                        value={answers[question.id] || ""}
                                        onChangeText={(text) => setAnswers({ ...answers, [question.id]: text })}
                                    />
                                    <Text style={styles.unit}>{question.meta.unit || "N/A"}</Text>
                                </View>
                            )}
                            {question.answer_type === "select" && (
                                <Picker
                                    selectedValue={answers[question.id] || ""}
                                    onValueChange={(itemValue) =>
                                        setAnswers({ ...answers, [question.id]: itemValue })
                                    }
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Selecione uma opção" value="" />
                                    {question.meta.options.map((option: string, index: number) => (
                                        <Picker.Item key={index} label={option} value={option} />
                                    ))}
                                </Picker>
                            )}
                            {question.answer_type === "radio" && (
                                <View>
                                    {question.meta.options.map((option: string, index: number) => (
                                        <View key={index} style={styles.radioOption}>
                                            <Button
                                                title={option}
                                                onPress={() => setAnswers({ ...answers, [question.id]: option })}
                                                color={answers[question.id] === option ? "#007BFF" : "#ccc"}
                                            />
                                        </View>
                                    ))}
                                </View>
                            )}
                            {question.answer_type === "radio_with_justification" && (
                                <View>
                                    {question.meta.options.map((option: string, index: number) => (
                                        <View key={index} style={styles.radioOption}>
                                            <Button
                                                title={option}
                                                onPress={() => {
                                                    setAnswers({ ...answers, [question.id]: option });
                                                    if (option === question.meta.justification_target) {
                                                        setAnswers({
                                                            ...answers,
                                                            [question.id]: option,
                                                            [`${question.id}_justification`]:
                                                                answers[`${question.id}_justification`] || "",
                                                        });
                                                    } else {
                                                        setAnswers({
                                                            ...answers,
                                                            [question.id]: option,
                                                            [`${question.id}_justification`]: undefined,
                                                        });
                                                    }
                                                }}
                                                color={answers[question.id] === option ? "#007BFF" : "#ccc"}
                                            />
                                        </View>
                                    ))}
                                    {answers[question.id] === question.meta.justification_target && (
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Justifique"
                                            value={answers[`${question.id}_justification`] || ""}
                                            onChangeText={(text) =>
                                                setAnswers({
                                                    ...answers,
                                                    [`${question.id}_justification`]: text.slice(0, 300),
                                                })
                                            }
                                            maxLength={300}
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Seção de Uploads */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seção de Uploads</Text>
                <TouchableOpacity style={styles.uploadIconButton} onPress={handleImageUpload}>
                    <Text style={styles.uploadIcon}>⬆️</Text>
                </TouchableOpacity>
                {uploadedImages.length > 0 ? (
                    uploadedImages.map((image, index) => (
                        <View key={index} style={styles.uploadedImage}>
                            <Text>{image.name}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyUploadText}>Nenhuma imagem enviada.</Text>

                )}
            </View>

            {/* Botões de Ação */}
            <View style={[styles.buttonContainer, styles.buttonRow]}>
                <TouchableOpacity
                    style={[styles.smallButton, { backgroundColor: "#007BFF" }]}
                    onPress={handleSaveAsDraft}
                    disabled={serviceOrder?.status === "open"}
                >
                    <Text style={styles.buttonText}>Rascunho</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.smallButton, { backgroundColor: "#007BFF" }]}
                    onPress={() => {
                        if (validateAnswers()) {
                            handleSave();
                        }
                    }}
                    disabled={serviceOrder?.status === "open"}
                >
                    <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.smallButton, { backgroundColor: "#f44336" }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({



    uploadIconButton: {
        marginTop: 5,
        padding: 5,
        alignSelf: "flex-start", // Alinha o ícone à esquerda para economizar espaço
    },
    uploadIcon: {
        fontSize: 20, // Ajuste o tamanho do ícone para ser pequeno e discreto
        color: "#007BFF",
    },
    uploadedImage: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 5,
        backgroundColor: "#f0f0f0",
    },
    buttonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    emptyUploadText: {
        color: "#666",
        textAlign: "center",
        marginTop: 10,
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    smallButton: {
        paddingVertical: 15,
        paddingHorizontal: 12,
        fontSize: 12,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    questionContainer: {
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
    },
    questionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
        borderRadius: 5,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    unit: {
        marginLeft: 10,
        fontSize: 16,
    },
    radioOption: {
        marginBottom: 10,
    },
    picker: {
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
    warning: {
        fontSize: 12,
        color: "red",
        marginTop: 10,
    },
    emptyText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginVertical: 10,
    },
    errorText: {
        fontSize: 16,
        color: "#FF0000",
        textAlign: "center",
        marginTop: 20,
    },
});

export default ViewOrderActivityScreen;
