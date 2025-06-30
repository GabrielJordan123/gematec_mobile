import React, { useState } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import HomeScreen from "../Screens/HomeScreen";
import EquipmentQRCodeScreen from "../Screens/Equipaments/EquipmentQRCodeScreen";
import CreateEquipmentScreen from "../Screens/Equipaments/CreateEquipmentScreen";
import EquipamentScreen from "../Screens/Equipaments/EquipamentScreen";
import EquipmentListScreen from "../Screens/Equipaments/EquipmentListScreen";
import PersonalDataScreen from "../Screens/PersonalDataScreen";
import {
  ClientsAvulsosScreen,
  ClientsComContratoScreen,
} from "../Screens/Clients/Client";
import { RootStackParamList } from "./AppRouter";
import { useUser } from "../Context/UserContext";
import { usePermissions } from "../Context/PermissionsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ManualsScreen from "../Screens/ManualsScreen";
import AuthService from "../Services/AuthService";

const Drawer = createDrawerNavigator<RootStackParamList>();

const CustomDrawerHeader: React.FC = () => {
  const { username } = useUser();

  return (
    <View>
      <Text style={styles.userName}>
        {username ? `Bem-vindo, ${username}` : "Bem-vindo"}
      </Text>
    </View>
  );
};

const CustomDrawerContent = (props: any & { extraData: {} }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isClientSubmenuOpen, setIsClientSubmenuOpen] = useState(false);
  const [isActivitySubmenuOpen, setIsActivitySubmenuOpen] = useState(false);
  const { clientId, sectorId, equipmentId } = useUser();
  const { hasPermission } = usePermissions()
  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };
  const handleLogout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      if (refreshToken) {
        await AuthService.revoke(refreshToken);
      }
    } catch (error) {
      console.error("Erro ao revogar o token durante o logout:", error);
    } finally {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");
      await AsyncStorage.removeItem("permissions");
      await AsyncStorage.removeItem("sliding_token");
      await AsyncStorage.removeItem("selectedAccountId");
      props.navigation.navigate("LoginScreen");
    }
  };
  const toggleClientSubmenu = () => {
    setIsClientSubmenuOpen(!isClientSubmenuOpen);
  };

  const toggleActivitySubmenu = () => {
    setIsActivitySubmenuOpen(!isActivitySubmenuOpen);
  };

  return (
    <DrawerContentScrollView {...props}>
      <CustomDrawerHeader />
      <DrawerItemList {...props} />

      {/* Submenu Clientes */}
      {hasPermission("clients.list_clients") && (
        <View>
          <View style={styles.menuItem}>
            <TouchableOpacity
              style={styles.menuMainText}
              onPress={toggleClientSubmenu}
            >
              <Text style={styles.menuText}>Clientes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleClientSubmenu} style={styles.expandIcon}>
              <Text style={styles.expandText}>{isClientSubmenuOpen ? "▲" : "▼"}</Text>
            </TouchableOpacity>
          </View>
          {isClientSubmenuOpen && (
            <View style={styles.submenu}>
              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() =>
                  props.navigation.navigate("ClientsAvulsosScreen", {

                  })
                }
              >
                <Text style={styles.submenuText}>Clientes Avulsos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() =>
                  props.navigation.navigate("ClientsComContratoScreen", {

                  })
                }
              >
                <Text style={styles.submenuText}>Clientes com Contrato</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Submenu Equipamentos */}
      {hasPermission("equipments.list_equipments") && (
        <View>
          <View style={styles.menuItem}>
            <TouchableOpacity
              style={styles.menuMainText}
              onPress={toggleSubmenu}
            >
              <Text style={styles.menuText}>Equipamentos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSubmenu} style={styles.expandIcon}>
              <Text style={styles.expandText}>{isSubmenuOpen ? "▲" : "▼"}</Text>
            </TouchableOpacity>
          </View>
          {isSubmenuOpen && (
            <View style={styles.submenu}>
              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() =>
                  props.navigation.navigate("EquipmentQRCodeScreen", {

                  })
                }
              >
                <Text style={styles.submenuText}>Leitura QR Code</Text>
              </TouchableOpacity>
              {hasPermission("equipments.add_equipment") && (
                <TouchableOpacity
                  style={styles.submenuItem}
                  onPress={() =>
                    props.navigation.navigate("CreateEquipmentScreen", {

                    })
                  }
                >
                  <Text style={styles.submenuText}>Criação de Equipamento</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => {
                  if (!clientId || !sectorId) {
                    Alert.alert("Erro", "Por favor, selecione um cliente e setor primeiro.");
                    props.navigation.navigate("ClientsAvulsosScreen", {

                    });
                  } else {
                    props.navigation.navigate("EquipamentScreen", {
                      clientId,
                      sectorId,
                    });
                  }
                }}
              >
                <Text style={styles.submenuText}>Filtragem de Equipamentos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() =>
                  props.navigation.navigate("EquipmentListScreen", {
                  })
                }
              >
                <Text style={styles.submenuText}>Listagem de Equipamentos</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Submenu Atividades */}
      {(hasPermission("pmocs.view_pmoc") || hasPermission("technical_assistances.view_technicalassistance") || hasPermission("service_orders.view_serviceorder")) && (
        <View>
          <View style={styles.menuItem}>
            <TouchableOpacity
              style={styles.menuMainText}
              onPress={toggleActivitySubmenu}
            >
              <Text style={styles.menuText}>Atividades</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleActivitySubmenu} style={styles.expandIcon}>
              <Text style={styles.expandText}>{isActivitySubmenuOpen ? "▲" : "▼"}</Text>
            </TouchableOpacity>
          </View>
          {isActivitySubmenuOpen && (
            <View style={styles.submenu}>
              {hasPermission("pmocs.view_pmoc") && (
                <TouchableOpacity
                  style={styles.submenuItem}
                  onPress={() =>
                    props.navigation.navigate("PmocListScreen", {

                    })
                  }
                >
                  <Text style={styles.submenuText}>PMOCs</Text>
                </TouchableOpacity>
              )}
              {hasPermission("service_orders.view_serviceorder") && (
                <TouchableOpacity
                  style={styles.submenuItem}
                  onPress={() =>
                    props.navigation.navigate("ListOrderServiceScreen", {
                      equipmentId
                    })
                  }
                >
                  <Text style={styles.submenuText}>Listagem Ordens de Serviço</Text>
                </TouchableOpacity>
              )}
              {hasPermission("technical_assistances.view_technicalassistance") && (
                <TouchableOpacity
                  style={styles.submenuItem}
                  onPress={() =>
                    props.navigation.navigate("TechnicalAssistanceScreen", {

                    })
                  }
                >
                  <Text style={styles.submenuText}>Assistência Técnica</Text>
                </TouchableOpacity>
              )}
              {(hasPermission("pmocs.view_pmoc") || hasPermission("technical_assistances.view_technicalassistance") || hasPermission("service_orders.view_serviceorder")) && (
                <TouchableOpacity
                  style={styles.submenuItem}
                  onPress={() =>
                    props.navigation.navigate("ActivityHistoryScreen", {
                      equipmentId,
                    })
                  }
                >
                  <Text style={styles.submenuText}>Visualizar Atividades</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Text style={styles.menuText}>Sair</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent {...props} />
      )}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#007BFF" },
        headerTintColor: "#fff",
        drawerActiveTintColor: "#007BFF",
        drawerInactiveTintColor: "#333",
      }}
    >
      <Drawer.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "Início", headerTitle: () => <CustomDrawerHeader /> }}
      />
      <Drawer.Screen
        name="ManualsScreen"
        component={ManualsScreen}
        options={{ title: "Manuais" }}
      />

      <Drawer.Screen
        name="PersonalDataScreen"
        component={PersonalDataScreen}
        options={{ title: "Meus Dados" }}

      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  expandIcon: {
    marginLeft: 8,
  },
  expandText: {
    fontSize: 16,
    color: "#007BFF",
  },
  menuMainText: {
    flex: 1, // Garante que o texto ocupe o espaço correto
  },
  userName: {
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
    margin: 10,
    textAlign: "center",
  },
  submenu: {
    paddingLeft: 32,
  },
  submenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  submenuText: {
    fontSize: 14,
    color: "#555",
  },
});

export default DrawerNavigator;