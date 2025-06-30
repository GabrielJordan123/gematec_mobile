import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../../Routers/AppRouter";
import EquipmentService from "../../Services/EquipamentService";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface EditEquipmentScreenProps {
  route: RouteProp<RootStackParamList, "EditEquipmentScreen">;
  navigation: DrawerNavigationProp<RootStackParamList, "EditEquipmentScreen">;
}

const EditEquipmentScreen: React.FC<EditEquipmentScreenProps> = ({
  route,
  navigation,
}) => {
  const { equipmentId } = route.params;

  const [client, setClient] = useState("");
  const [sector, setSector] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [tipoEquipamento, setTipoEquipamento] = useState("");
  const [loading, setLoading] = useState(false);
  // Novos estados para os novos campos
  const [description, setDescription] = useState<string>("");
  const [capacityUnit, setCapacityUnit] = useState<string | "new_capacity_unit" | null>(null);
  const [compressorType, setCompressorType] = useState<string | "new_compressor_type" | null>(null);
  const [coolingFluidType, setCoolingFluidType] = useState<string | "new_cooling_fluid_type" | null>(null);
  const [condenserModel, setCondenserModel] = useState<string>("");
  const [condenserSerialNumber, setCondenserSerialNumber] = useState<string>("");
  const [evaporatorModel, setEvaporatorModel] = useState<string>("");
  const [evaporatorSerialNumber, setEvaporatorSerialNumber] = useState<string>("");
  const [electricPower, setElectricPower] = useState<string>("");
  const [phase, setPhase] = useState<string | "new_phase" | null>(null);
  const [isLeased, setIsLeased] = useState<boolean>(false);
  const [hasWarranty, setHasWarranty] = useState<boolean>(false);
  const [hasAutomation, setHasAutomation] = useState<boolean>(false);

  // Novos estados para resultados das buscas dos selects
  const [capacityUnits, setCapacityUnits] = useState<any[]>([]);
  const [compressorTypes, setCompressorTypes] = useState<any[]>([]);
  const [coolingFluidTypes, setCoolingFluidTypes] = useState<any[]>([]);
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);

  const equipmentService = new EquipmentService();
  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      try {
        setLoading(true);
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) throw new Error("Token de acesso não encontrado.");

        const equipmentDetails = await EquipmentService.fetchEquipmentDetails(
          equipmentId,
          accessToken
        );

        setClient(equipmentDetails.client_id);
        setSector(equipmentDetails.sector_id);
        setFabricante(equipmentDetails.brand_id);
        setTipoEquipamento(equipmentDetails.equipment_type_id);
      } catch (error: any) {
        console.error("[EditEquipmentScreen] Erro ao buscar detalhes:", error);
        Alert.alert("Erro", error.message || "Falha ao buscar detalhes.");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentDetails();
  }, [equipmentId]);

  const handleUpdateEquipment = async () => {
    if (!client || !sector || !fabricante || !tipoEquipamento) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) throw new Error("Token de acesso não encontrado.");

      const payload = {
        client_id: client,
        sector_id: sector,
        brand_id: fabricante,
        equipment_type_id: tipoEquipamento,
      };

      await EquipmentService.updateEquipment(
        accessToken,
        equipmentId,
        payload
      );

      Alert.alert("Sucesso", "Equipamento atualizado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("[EditEquipmentScreen] Erro ao atualizar equipamento:", error);
      Alert.alert("Erro", error.message || "Falha ao atualizar equipamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cliente*</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o ID do cliente"
        value={client}
        onChangeText={setClient}
      />

      <Text style={styles.label}>Setor*</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o ID do setor"
        value={sector}
        onChangeText={setSector}
      />

      <Text style={styles.label}>Fabricante*</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o ID do fabricante"
        value={fabricante}
        onChangeText={setFabricante}
      />

      <Text style={styles.label}>Tipo de Equipamento*</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o ID do tipo de equipamento"
        value={tipoEquipamento}
        onChangeText={setTipoEquipamento}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <Button title="Atualizar Equipamento" onPress={handleUpdateEquipment} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default EditEquipmentScreen;
