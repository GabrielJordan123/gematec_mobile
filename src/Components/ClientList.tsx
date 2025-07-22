import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../Routers/AppRouter";
import ClientService from "../Services/ClientService";
import { usePermissions } from "../Context/PermissionsContext";
import Client from "../Models/Clientes";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ClientListProps {
  hasContract: boolean;
  navigation: DrawerNavigationProp<RootStackParamList>;
}

const ClientList: React.FC<ClientListProps> = ({ hasContract, navigation }) => {
  const { hasPermission } = usePermissions();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!hasPermission("list_clients")) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Você não tem permissão para visualizar clientes.</Text>
      </View>
    );
  }

  const fetchClients = async (query: string = "") => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("Token de acesso não encontrado.");

      const response = await ClientService.getClients(
        hasContract,
        page,
        token,
        query.length >= 3 ? query : ""
      );

      const clientList = response.results.map((data: any) => new Client(data));
      setClients(clientList);
      setTotalPages(Math.ceil(response.count / 10) || 1);
    } catch (error: any) {
      console.error("[ClientList] Erro ao buscar clientes:", error);
      Alert.alert("Erro", "Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(searchQuery);
  }, [page, hasContract]);

  const handleSearch = () => {
    setPage(1);
    fetchClients(searchQuery);
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate("ClientDetailScreen", { clientId: item.id })}
    >
      <Text style={styles.itemText}>Nome: {item.name}</Text>
      <Text style={styles.itemText}>Email: {item.email}</Text>
      {hasContract ? (
        <Text style={styles.itemText}>Telefone: {item.phone || "N/A"}</Text>
      ) : (
        <>
          <Text style={styles.itemText}>Documento: {item.document || "N/A"}</Text>
          <Text style={styles.itemText}>Telefone: {item.phone || "N/A"}</Text>
          <Text style={styles.itemText}>Contrato Ativo: {item.hasContract ? "Sim" : "Não"}</Text>
        </>
      )}
      {/* Adicionando sectors e addresses */}
      <Text style={styles.itemText}>
        Setores: {item.sectors?.map(s => s.name).join(", ") || "Nenhum"}
      </Text>
      <Text style={styles.itemText}>
        Endereços: {item.addresses?.length || 0} cadastrado(s)
      </Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {hasContract ? "Clientes com Contrato" : "Clientes Avulsos"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Pesquisar cliente (min 3 caracteres)"
        placeholderTextColor="#666"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderClientItem}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>}
        />
      )}

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          disabled={page === 1}
          onPress={() => setPage(page - 1)}
          style={[styles.pageButton, page === 1 && styles.disabledButton]}
        >
          <Text style={styles.pageButtonText}>Anterior</Text>
        </TouchableOpacity>
        <Text style={styles.pageText}>Página {page} de {totalPages}</Text>
        <TouchableOpacity
          disabled={page === totalPages}
          onPress={() => setPage(page + 1)}
          style={[styles.pageButton, page === totalPages && styles.disabledButton]}
        >
          <Text style={styles.pageButtonText}>Próxima</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  itemText: {
    fontSize: 14,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  pageButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  pageButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  pageText: {
    fontSize: 14,
    color: "#333",
  },
  errorText: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
    marginTop: 20,
  },
});

export default ClientList;