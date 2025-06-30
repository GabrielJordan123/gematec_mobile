import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Adicionado Picker
import { FontAwesome } from "@expo/vector-icons";
import PmocService from "../../Services/PmocService";
import { PmocEquipment } from "../../Models/Pmoc_Model/PmocEqupment";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../Routers/AppRouter";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../../config/apiConfig";

interface PmocDetailsScreenProps {
  route: RouteProp<RootStackParamList, "PmocDetailsScreen">;
  navigation: DrawerNavigationProp<RootStackParamList, "PmocDetailsScreen">;
}

const PmocDetailsScreen: React.FC<PmocDetailsScreenProps> = ({ route, navigation }) => {
  const { pmocId } = route.params;
  const [equipments, setEquipments] = useState<PmocEquipment[]>([]);
  const [pmocInfo, setPmocInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  const fetchPmocInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("Token de acesso não encontrado.");
      const response = await axios.get(`${API_BASE_URL}/pmocs/${pmocId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPmocInfo(response.data);
    } catch (error) {
      console.error("[PmocDetailsScreen] Erro ao buscar informações do PMOC:", error);
    }
  };

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("Token de acesso não encontrado.");

      const data = await PmocService.fetchPmocEquipments(
        token,
        pmocId,
        page,
        10,
        search,
        statusFilter,
        equipmentTypeFilter,
        brandFilter
      );
      setEquipments(data.results || []);
      setTotalPages(Math.ceil(data.count / 10) || 1);
    } catch (error: any) {
      console.error("[PmocDetailsScreen] Erro ao buscar equipamentos:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPmocInfo();
    fetchEquipments();
  }, [page, search, statusFilter, equipmentTypeFilter, brandFilter]);

  const renderEquipmentItem = ({ item }: { item: PmocEquipment }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate("PmocEquipmentScreen", {
          pmocId: pmocId,
          equipmentId: item.id,
        })
      }
    >
      <Text style={styles.itemText}>Tag: {item.tag || "N/A"}</Text>
      <Text style={styles.itemText}>Patrimônio: {item.patrimony || "N/A"}</Text>
      <Text style={styles.itemText}>Tipo: {item.equipment_type?.name || "N/A"}</Text>
      <Text style={styles.itemText}>Fabricante: {item.brand?.name || "N/A"}</Text>
      <Text style={styles.itemText}>Tecnologia: {item.technology || "N/A"}</Text>
      <Text style={styles.itemText}>Status: {item.status || "N/A"}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho com Informações do PMOC */}
      {pmocInfo && (
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Informações do PMOC</Text>
          <Text>Empresa: {pmocInfo.company?.name || "N/A"}</Text>
          <Text>Engenheiro: {pmocInfo.company?.chief_engineer_name || "N/A"}</Text>
          <Text>CRM: {pmocInfo.company?.chief_engineer_crm || "N/A"}</Text>
          <Text>Documento: {pmocInfo.company?.chief_engineer_document || "N/A"}</Text>
          <Text>Cliente: {pmocInfo.client?.name || "N/A"}</Text>
          <Text>Email: {pmocInfo.client?.email || "N/A"}</Text>
          <Text>Documento: {pmocInfo.client?.document || "N/A"}</Text>
          <Text>Vencimento: {pmocInfo.deadline || "N/A"}</Text>
          <Text>Equipamentos Fechados: {pmocInfo.equipment_closed_count || 0}</Text>
          <Text>Última Atualização: {pmocInfo.updated_at || "N/A"}</Text>
          <Text style={styles.warning}>Os dados mostrados podem ser alterados até o fechamento do PMOC.</Text>
        </View>
      )}

      {/* Filtros */}
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar por tag ou patrimônio..."
        value={search}
        onChangeText={setSearch}
      />
      <Picker
        selectedValue={statusFilter}
        onValueChange={(value) => setStatusFilter(value)}
        style={styles.picker}
      >
        <Picker.Item label="Status" value="" />
        <Picker.Item label="Aberto" value="open" />
        <Picker.Item label="Pendente" value="pending" />
        <Picker.Item label="Fechado" value="closed" />
      </Picker>
      <Picker
        selectedValue={equipmentTypeFilter}
        onValueChange={(value) => setEquipmentTypeFilter(value)}
        style={styles.picker}
      >
        <Picker.Item label="Tipo de Equipamento" value="" />
        {/* Adicionar opções dinâmicas via API ou lista fixa */}
        <Picker.Item label="Split" value="1" />
      </Picker>
      <Picker
        selectedValue={brandFilter}
        onValueChange={(value) => setBrandFilter(value)}
        style={styles.picker}
      >
        <Picker.Item label="Fabricante" value="" />
        {/* Adicionar opções dinâmicas via API ou lista fixa */}
        <Picker.Item label="LG" value="1" />
      </Picker>

      {/* Lista de Equipamentos */}
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <>
          <FlatList
            data={equipments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEquipmentItem}
            ListEmptyComponent={<Text>Nenhum equipamento encontrado.</Text>}
          />
          <View style={styles.pagination}>
            <Button
              title="Anterior"
              onPress={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            />
            <Text style={styles.pageText}>Página {page} de {totalPages}</Text>
            <Button
              title="Próximo"
              onPress={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page === totalPages}
            />
          </View>
        </>
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
  header: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  itemContainer: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
  },
  itemText: {
    fontSize: 14,
    color: "#333",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  pageText: {
    fontSize: 14,
    color: "#333",
  },
  warning: {
    fontSize: 12,
    color: "red",
    marginTop: 10,
  },
});

export default PmocDetailsScreen;