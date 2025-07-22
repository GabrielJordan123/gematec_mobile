import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Button,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import EquipmentService from "../../Services/EquipamentService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../../Routers/AppRouter";
import { Equipment } from "../../Models/Equipament";
import { usePermissions } from "../../Context/PermissionsContext";
import ClientService from "../../Services/ClientService";

interface EquipmentListScreenProps {
  route: RouteProp<RootStackParamList, "EquipmentListScreen">;
  navigation: DrawerNavigationProp<RootStackParamList, "EquipmentListScreen">;
}

const EquipmentListScreen: React.FC<EquipmentListScreenProps> = ({
  route,
  navigation,
}) => {
  const { clientId, sectorId } = route.params;

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const { hasPermission, permissions } = usePermissions();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [clientName, setClientName] = useState("");
  const [sectorName, setSectorName] = useState("");

  if (!hasPermission("list_equipments")) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Você não tem permissão para visualizar equipamentos.</Text>
      </View>
    );
  }

  const fetchClientAndSectorNames = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      if (clientId) {
        const clientDetails = await ClientService.getClientDetails(clientId, token);
        setClientName(clientDetails.name || "N/A");
      }

      if (clientId && sectorId) {
        const sectorsResponse = await ClientService.getClientSectors(clientId.toString(), token);
        const sector = sectorsResponse.results?.find((s: any) => s.id === sectorId);
        setSectorName(sector?.name || "N/A");
      }
    } catch (error) {
      console.error("Erro ao buscar nomes de cliente/setor:", error);
    }
  };

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("Token de acesso não encontrado.");

      const filters: { client_id?: number; sector_id?: number; page: number; per_page: number } = {
        page: page,
        per_page: 10,
      };

      if (clientId) {
        filters.client_id = clientId;
      }
      if (sectorId) {
        filters.sector_id = sectorId;
      }

      const response = await EquipmentService.fetchEquipments(token, filters);
      setEquipmentList(response.results || []);
      setTotalPages(Math.ceil(response.count / 10) || 1);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao carregar os equipamentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientAndSectorNames();
    fetchEquipments();
  }, [clientId, sectorId, page]);

  const handleRemoveEquipment = async (equipmentId: number) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("Token de acesso não encontrado.");

      await EquipmentService.removeEquipment(token, equipmentId);
      Alert.alert("Sucesso", "Equipamento removido com sucesso!");
      fetchEquipments();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao remover o equipamento.");
    }
  };

  const renderEquipmentItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>ID: {item.id}</Text>
      <Text style={styles.itemText}>Nome: {item.patrimony}</Text>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate("EditEquipmentScreen", {
            equipmentId: String(item.id),
          })
        }
      >
        <FontAwesome name="pencil" size={20} color="#007BFF" />
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() =>
          Alert.alert(
            "Confirmação",
            "Tem certeza de que deseja remover este equipamento?",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Confirmar",
                onPress: () => handleRemoveEquipment(item.id),
              },
            ]
          )
        }
      >
        <FontAwesome name="times" size={20} color="red" />
        <Text style={styles.removeButtonText}>Remover</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {clientId && sectorId && (
        <Text style={styles.headerText}>
          Equipamentos para: {clientName} {'>'} {sectorName}
        </Text>
      )}
      <View style={styles.opContainer}>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate("EquipmentQRCodeScreen", {})}
        >
          <FontAwesome name="qrcode" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <>
          <FlatList
            data={equipmentList}
            keyExtractor={(item) => `${item.id}`}
            renderItem={renderEquipmentItem}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum equipamento encontrado.</Text>}
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
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
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
  opContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  qrButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  editButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#007BFF",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  removeButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: "red",
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
});

export default EquipmentListScreen;
