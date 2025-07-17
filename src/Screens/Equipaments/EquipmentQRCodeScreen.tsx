import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import QRScanner from "../../Components/QRScanner";
import EquipmentService from "../../Services/EquipamentService";
import { RouteProp } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../../Routers/AppRouter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePermissions } from "../../Context/PermissionsContext";
interface EquipmentQRCodeScreenProps {
  route: RouteProp<RootStackParamList, "EquipmentQRCodeScreen">;
  navigation: DrawerNavigationProp<RootStackParamList, "EquipmentQRCodeScreen">;
}

const EquipmentQRCodeScreen: React.FC<EquipmentQRCodeScreenProps> = ({
  navigation,
  route,
}) => {

  const { hasPermission, permissions } = usePermissions();
  const [loading, setLoading] = useState(false);

  const handleScannedData = async (data: string) => {
    try {
      console.log("Dados escaneados:", data);

      // Validar formato UUID (simples validação)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data)) {
        throw new Error("QR Code inválido. O dado escaneado não é um UUID válido.");
      }

      // Obter o token de acesso
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("Token de acesso não encontrado.");

      // Buscar detalhes do equipamento usando UUID
      const equipmentDetails = await EquipmentService.fetchEquipmentDetails(data, token);
      if (!equipmentDetails) {
        throw new Error("Equipamento não encontrado.");
      }

      // Redirecionar para a tela de detalhes do equipamento
      navigation.navigate("EquipmentDetailsScreen", {
        equipmentId: data, // Usar UUID como string

      });
    } catch (error: any) {
      Alert.alert("Erro ao processar QR Code", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escaneie o QR Code do equipamento:</Text>
      <View style={styles.scannerContainer}>
        <QRScanner onScanned={handleScannedData} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  scannerContainer: {
    width: "80%",
    height: "60%",
    borderRadius: 10,
    overflow: "hidden",
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

export default EquipmentQRCodeScreen;