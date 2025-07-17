import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { RouteProp, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../Routers/AppRouter";
import ClientService from "../../Services/ClientService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePermissions } from "../../Context/PermissionsContext";
import { IClient, Sector, Address } from "../../Models/Clientes";
import { Ionicons } from '@expo/vector-icons';

interface ClientDetailsScreenProps {
  route: RouteProp<RootStackParamList, "ClientDetailScreen">;
  navigation: NavigationProp<RootStackParamList>;
}

const ClientDetailsScreen: React.FC<ClientDetailsScreenProps> = ({ route, navigation }) => {
  const { clientId } = route.params;
  const { hasPermission } = usePermissions(); // Hook movido para o topo
  const [clientData, setClientData] = useState<any>(null); // Hook movido para o topo
  const [contacts, setContacts] = useState<any[]>([]); // Hook movido para o topo
  const [contracts, setContracts] = useState<any[]>([]); // Hook movido para o topo
  const [addresses, setAddresses] = useState<Address[]>([]); // Hook movido para o topo
  const [sectors, setSectors] = useState<Sector[]>([]); // Hook movido para o topo
  const [loading, setLoading] = useState(false); // Hook movido para o topo

  useEffect(() => {
    const fetchClientDetails = async () => {
      setLoading(true);
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) throw new Error("Token de acesso não encontrado.");

        const clientDetails = await ClientService.getClientDetails(clientId, accessToken);

        setClientData(clientDetails);
        setContacts(await ClientService.getClientContacts(clientId.toString(), accessToken) || []);
        setContracts(await ClientService.getClientContracts(clientId.toString(), accessToken) || []);
        setAddresses(clientDetails.addresses || []);
        setSectors(clientDetails.sectors || []);
      } catch (error: any) {
        console.error("Erro ao buscar detalhes do cliente:", error);
        Alert.alert("Erro", "Não foi possível carregar os detalhes do cliente.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  // Condicionais de renderização após todos os hooks
  if (loading && !clientData) {
    return <ActivityIndicator size="large" color="#007BFF" />;
  }



  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" />;
  }

  if (!clientData) {
    return <Text style={styles.emptyText}>Detalhes do cliente não disponíveis.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Detalhes do Cliente</Text>
      <Text style={styles.label}>Nome:</Text>
      <Text style={styles.text}>{clientData.name}</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.text}>{clientData.email}</Text>
      <Text style={styles.label}>Documento:</Text>
      <Text style={styles.text}>{clientData.document || "N/A"}</Text>
      <Text style={styles.label}>Telefone:</Text>
      <Text style={styles.text}>{clientData.phone || "N/A"}</Text>

      <Text style={styles.sectionTitle}>Contatos</Text>
      {contacts.length > 0 ? (
        contacts.map((contact, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.text}>Nome: {contact.name}</Text>
            <Text style={styles.text}>Telefone: {contact.phone || "N/A"}</Text>
            <Text style={styles.text}>Email: {contact.email || "N/A"}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Nenhum contato encontrado.</Text>
      )}

      <Text style={styles.sectionTitle}>Contratos</Text>
      {contracts.length > 0 ? (
        contracts.map((contract, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.text}>Data de Abertura: {contract.start_date || "N/A"}</Text>
            <Text style={styles.text}>Data de Término: {contract.end_date || "N/A"}</Text>
            <Text style={styles.text}>Frequência do PMOC: {contract.pmoc_frequency || "N/A"} dias</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Nenhum contrato encontrado.</Text>
      )}

      <Text style={styles.sectionTitle}>Endereços</Text>
      {addresses.length > 0 ? (
        addresses.map((address, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.text}>Estado: {address.state || "N/A"}</Text>
            <Text style={styles.text}>Cidade: {address.city || "N/A"}</Text>
            <Text style={styles.text}>Bairro: {address.neighborhood || "N/A"}</Text>
            <Text style={styles.text}>Endereço: {address.street || "N/A"}</Text>
            <Text style={styles.text}>Número: {address.number || "N/A"}</Text>
            <Text style={styles.text}>Complemento: {address.complement || "N/A"}</Text>
            <Text style={styles.text}>Ponto de Referência: {address.reference_point || "N/A"}</Text>
            <Text style={styles.text}>CEP: {address.zip_code || "N/A"}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Nenhum endereço encontrado.</Text>
      )}

      <Text style={styles.sectionTitle}>Setores</Text>
      {sectors.length > 0 ? (
        sectors.map((sector, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() =>
              navigation.navigate("EquipamentScreen", {
                clientId,
                sectorId: sector.id,
              })
            }
          >
            <Text style={styles.text}>Nome do Setor: {sector.name}</Text>
            <Text style={styles.linkText}>Ver Equipamentos</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyText}>Nenhum setor encontrado.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "blue",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#007BFF",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  text: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  linkText: {
    color: "#007BFF",
    fontSize: 14,
    marginTop: 5,
    textDecorationLine: "underline",
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

export default ClientDetailsScreen;