// file: src/Routers/DrawerNavigation.tsx
import React, { useState, useEffect } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../Screens/HomeScreen";
import PersonalDataScreen from "../Screens/PersonalDataScreen";
import ManualsScreen from "../Screens/ManualsScreen";
import { ClientsAvulsosScreen, ClientsComContratoScreen } from "../Screens/Clients/Client";
import EquipamentScreen from "../Screens/Equipaments/EquipamentScreen";
import EquipmentQRCodeScreen from "../Screens/Equipaments/EquipmentQRCodeScreen";
import EquipmentListScreen from "../Screens/Equipaments/EquipmentListScreen";
import PmocListScreen from "../Screens/Pmoc/PmocListScreen";
import ListOrderServiceScreen from "../Screens/Orders/ListOrderServiceScreen";
import TechnicalAssistanceScreen from "../Screens/TechnicalAssistance/TechnicalAssistanceScreen";
import ActivityHistoryScreen from "../Screens/Activity/ActivityHistoryScreen";
import CreateEquipmentScreen from "../Screens/Equipaments/CreateEquipmentScreen";
import { RootStackParamList } from "./AppRouter";
import { useUser } from "../Context/UserContext";
import { usePermissions } from "../Context/PermissionsContext"; // Certifique-se de que esta importação está correta
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthService from "../Services/AuthService";
import MenuService from "../Services/MenuService";
import { MenuItem } from "../Models/MenuItem";
import PreferencesScreen from "../Screens/PreferencesScreen";

const Drawer = createDrawerNavigator<RootStackParamList>();

// Mapeamento de slugs para dados do aplicativo
const SLUG_TO_APP_DATA: { [key: string]: { title: string; route?: keyof RootStackParamList; icon?: string; action?: 'logout' } } = {
  "operational": { title: "Operacional", icon: "briefcase" },
  "clients_with_contract": { title: "Clientes com Contrato", route: "ClientsComContratoScreen" },
  "clients_without_contract": { title: "Clientes Avulsos", route: "ClientsAvulsosScreen" },
  "equipments": { title: "Equipamentos", route: "EquipmentListScreen" },
  "activities": { title: "Atividades", route: "ActivityHistoryScreen" },
  "home": { title: "Início", route: "HomeScreen", icon: "home" },
  "manuals": { title: "Manuais", route: "ManualsScreen", icon: "book" },
  "personal_data": { title: "Meus Dados", route: "PersonalDataScreen", icon: "person" },
  "basic_registrations": { title: "Cadastros Básicos", icon: "folder-open" },
  "functions": { title: "Funções", route: "FunctionsScreen" },
  "manufacturers": { title: "Fabricantes", route: "ManufacturersScreen" },
  "coil_types": { title: "Tipos de Serpentina", route: "CoilTypesScreen" },
  "equipment_types": { title: "Tipos de Equipamento", route: "EquipmentTypesScreen" },
  "compressor_types": { title: "Tipo de Compressor", route: "CompressorTypesScreen" },
  "cooling_fluid_types": { title: "Tipo de Fluido Refrigerante", route: "CoolingFluidTypesScreen" },
  "condenser_types": { title: "Tipo de Condensadora", route: "CondenserTypesScreen" },
  "evaporator_types": { title: "Tipo de Evaporadora", route: "EvaporatorTypesScreen" },
  "phases": { title: "Fases", route: "PhasesScreen" },
  "technologies": { title: "Tecnologias", route: "TechnologiesScreen" },
  "capacity_units": { title: "Unidades de Capacidade", route: "CapacityUnitsScreen" },
  "administrative": { title: "Administrativo", icon: "shield" },
  "support": { title: "Suporte", icon: "help-circle" },
  "pmocs": { title: "PMOCs", route: "PmocListScreen" },
  "service_orders": { title: "Ordens de Serviço", route: "ListOrderServiceScreen" },
  "technical_assistance": { title: "Assistência Técnica", route: "TechnicalAssistanceScreen" },
  "equipment_qr_code": { title: "Leitura QR Code", route: "EquipmentQRCodeScreen" },
  "create_equipment": { title: "Criação de Equipamento", route: "CreateEquipmentScreen" },
  "filter_equipment": { title: "Filtragem de Equipamentos", route: "EquipamentScreen" },
  "view_activities": { title: "Visualizar Atividades", route: "ActivityHistoryScreen" },
  "roadmaps": { title: "Roteiros", icon: "map" },
  "documentation": { title: "Documentação", icon: "document" },
};

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
  const { hasPermission, setPermissions } = usePermissions(); // <--- OBTENHA setPermissions AQUI
  const { clientId, sectorId, equipmentId, logout } = useUser();
  const [dynamicMenu, setDynamicMenu] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [submenuStates, setSubmenuStates] = useState<{ [key: string]: boolean }>({});

  // Função auxiliar para coletar permissões recursivamente


  // Função para processar e mapear os itens do menu do backend
  const processMenuItems = (items: MenuItem[]): MenuItem[] => {


    return items
      .filter(item => item.required_apps ? item.required_apps.includes("mobile") : true)
      .map(item => {
        const appData = SLUG_TO_APP_DATA[item.slug];
        if (!appData) {
          console.warn(`Mapeamento não encontrado para o slug: ${item.slug}`);
          return null;
        }

        const processedItem: MenuItem = {
          ...item,
          title: appData.title,
          route: appData.route,
          icon: appData.icon,
          action: appData.action,
        };

        if (item.items && item.items.length > 0) {
          processedItem.items = processMenuItems(item.items); // Processa recursivamente os sub-itens
        }
        return processedItem;
      })
      .filter(item => item !== null) as MenuItem[];
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoadingMenu(true);
        const menuData = await MenuService.fetchDynamicMenu();
        const processedData = processMenuItems(menuData); // Esta chamada agora também atualiza as permissões
        setDynamicMenu(processedData);
      } catch (error: any) {
        Alert.alert("Erro", error.message || "Não foi possível carregar o menu.");
        console.error("Erro ao carregar menu:", error);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  const toggleSubmenu = (id: string) => {
    setSubmenuStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      props.navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Erro durante o logout:", error);
      props.navigation.navigate("LoginScreen");
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    // Verifica se o usuário tem ALGUMA das permissões necessárias para este item
    // Se item.required_permissions for vazio, significa que nenhuma permissão específica é necessária, então é permitido.
    const hasRequiredPermissions = item.required_permissions
      ? item.required_permissions.some((perm) => hasPermission(perm))
      : true;

    if (!hasRequiredPermissions) {
      return null; // Não renderiza o item se as permissões não forem atendidas
    }

    const isSubmenuExpanded = submenuStates[item.slug];
    const paddingLeft = 16 + level * 16;

    if (item.items && item.items.length > 0) {
      return (
        <View key={item.slug}>
          <TouchableOpacity
            style={[styles.menuItem, { paddingLeft }]}
            onPress={() => toggleSubmenu(item.slug)}
          >
            <View style={styles.menuMainText}>
              {item.icon && <Ionicons name={item.icon as any} size={20} color="#333" style={styles.icon} />}
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Text style={styles.expandText}>{isSubmenuExpanded ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {isSubmenuExpanded && (
            <View style={styles.submenu}>
              {item.items.map((childItem) => renderMenuItem(childItem, level + 1))}
            </View>
          )}
        </View>
      );
    } else {
      let onPressAction = () => {
        if (item.route) {
          if (item.route === "EquipamentScreen") {
            if (!clientId || !sectorId) {
              Alert.alert("Erro", "Por favor, selecione um cliente e setor primeiro.");
              props.navigation.navigate("ClientsAvulsosScreen" as any, {});
            } else {
              props.navigation.navigate(item.route as any, { clientId, sectorId });
            }
          } else if (item.route === "ActivityHistoryScreen") {
            if (!equipmentId) {
              Alert.alert("Erro", "Por favor, selecione um equipamento primeiro.");
            } else {
              props.navigation.navigate(item.route as any, { equipmentId });
            }
          } else if (item.route === "ListOrderServiceScreen") {
            props.navigation.navigate(item.route as any, { equipmentId: equipmentId || 0 });
          }
          else {
            props.navigation.navigate(item.route as any, {});
          }
        } else if (item.action === "logout") {
          handleLogout();
        }
      };

      return (
        <TouchableOpacity
          key={item.slug}
          style={[styles.menuItem, { paddingLeft }]}
          onPress={onPressAction}
        >
          {item.icon && <Ionicons name={item.icon as any} size={20} color="#333" style={styles.icon} />}
          <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
      );
    }
  };

  if (loadingMenu) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Carregando menu...</Text>
      </View>
    );
  }

  return (
    <DrawerContentScrollView {...props}>
      <CustomDrawerHeader />
      {/* Item Fixo: Meus Dados */}
      {hasPermission("view_user") && (
        <TouchableOpacity
          style={[styles.menuItem, { paddingLeft: 16 }]}
          onPress={() => props.navigation.navigate("PersonalDataScreen" as any, {})}
        >
          <Ionicons name="person" size={20} color="#333" style={styles.icon} />
          <Text style={styles.menuText}>Meus Dados</Text>
        </TouchableOpacity>
      )}
      {dynamicMenu.map((item) => renderMenuItem(item))}

      {/* Item Fixo: Preferências */}
      <TouchableOpacity
        style={[styles.menuItem, { paddingLeft: 16 }]}
        onPress={() => props.navigation.navigate("PreferencesScreen" as any, {})}
      >
        <Ionicons name="settings" size={20} color="#333" style={styles.icon} />
        <Text style={styles.menuText}>Preferências</Text>
      </TouchableOpacity>

      {dynamicMenu.map((item) => renderMenuItem(item))}

      {/* Item Fixo: Sair (sempre por último) */}
      <TouchableOpacity
        style={[styles.menuItem, styles.logoutButton, { paddingLeft: 16 }]}
        onPress={handleLogout}
      >
        <Ionicons name="arrow-forward" size={20} color="#333" style={styles.icon} />
        <Text style={styles.menuText}>Sair</Text>
      </TouchableOpacity>

    </DrawerContentScrollView>
  );
};

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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

      <Drawer.Screen
        name="PreferencesScreen" // Adicione a PreferencesScreen aqui também
        component={PreferencesScreen}
        options={{ title: "Preferências" }}
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  logoutButton: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  icon: {
    marginRight: 10,
  },
  expandIcon: {
    marginLeft: 8,
  },
  expandText: {
    fontSize: 16,
    color: "#007BFF",
  },
  menuMainText: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
