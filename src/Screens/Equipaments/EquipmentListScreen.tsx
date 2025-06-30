import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import EquipmentService from "../../Services/EquipamentService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../../Routers/AppRouter";
import { Equipment } from "../../Models/Equipament";
import { usePermissions } from "../../Context/PermissionsContext";
interface EquipmentListScreenProps {
  route: RouteProp<RootStackParamList, "EquipmentListScreen">;
  navigation: DrawerNavigationProp<RootStackParamList, "EquipmentListScreen">;
}

const EquipmentListScreen: React.FC<EquipmentListScreenProps> = ({
  route,
  navigation,
}) => {

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const { hasPermission, permissions } = usePermissions();
  if (permissions.length === 0 && loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Carregando permissões...</Text>
      </View>
    );
  }

  if (!hasPermission("equipments.view_equipment")) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Você não tem permissão para visualizar equipamentos.</Text>
      </View>
    );
  }
  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("Token de acesso não encontrado.");

      const response = await EquipmentService.fetchEquipments(token, {});
      setEquipmentList(response.results || []);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao carregar os equipamentos.");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchEquipments();
  }, []);

  const renderEquipmentItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>ID: {item.id}</Text>
      <Text style={styles.itemText}>Nome: {item.patrimony}</Text>

      <TouchableOpacity
        style={styles.editButton}
        // Ajuste no renderEquipmentItem
        onPress={() =>
          navigation.navigate("EditEquipmentScreen", {
            equipmentId: String(item.id), // Convertido para string
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
        <FlatList
          data={equipmentList}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderEquipmentItem}
        />
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
});

export default EquipmentListScreen;