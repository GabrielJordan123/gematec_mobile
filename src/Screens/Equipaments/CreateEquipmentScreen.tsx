import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { RouteProp } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../../Routers/AppRouter";
import EquipmentService from "../../Services/EquipamentService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { usePermissions } from "../../Context/PermissionsContext";
import { Equipment } from "../../Models/Equipament";
import { API_BASE_URL } from "../../config/apiConfig";
interface CreateEquipmentScreenProps {
  route: RouteProp<RootStackParamList, "CreateEquipmentScreen">;
  navigation: DrawerNavigationProp<RootStackParamList, "CreateEquipmentScreen">;
}

const CreateEquipmentScreen: React.FC<CreateEquipmentScreenProps> = ({ route, navigation }) => {


  // Estados para busca e seleção
  const [client, setClient] = useState("");
  const [sector, setSector] = useState("");
  const [brand, setBrand] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [condenserType, setCondenserType] = useState("");
  const [coilType, setCoilType] = useState("");
  const [evaporatorType, setEvaporatorType] = useState("");
  const [tag, setTag] = useState("");
  const [patrimony, setPatrimony] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [voltage, setVoltage] = useState("");
  const [electricCurrent, setElectricCurrent] = useState("");
  const [capacity, setCapacity] = useState("");
  const [technology, setTechnology] = useState<string | "new_technology" | null>(null);
  const [loading, setLoading] = useState(false);

  // Novos estados para os novos campos
  const [description, setDescription] = useState("");
  const [capacityUnit, setCapacityUnit] = useState("");
  const [compressorType, setCompressorType] = useState("");
  const [coolingFluidType, setCoolingFluidType] = useState("");
  const [condenserModel, setCondenserModel] = useState("");
  const [condenserSerialNumber, setCondenserSerialNumber] = useState("");
  const [evaporatorModel, setEvaporatorModel] = useState("");
  const [evaporatorSerialNumber, setEvaporatorSerialNumber] = useState("");
  const [electricPower, setElectricPower] = useState("");
  const [phase, setPhase] = useState("");
  const [isLeased, setIsLeased] = useState(false);
  const [hasWarranty, setHasWarranty] = useState(false);
  const [hasAutomation, setHasAutomation] = useState(false);

  // Estados para resultados das buscas
  const [clients, setClients] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
  const [condenserTypes, setCondenserTypes] = useState<any[]>([]);
  const [coilTypes, setCoilTypes] = useState<any[]>([]);
  const [evaporatorTypes, setEvaporatorTypes] = useState<any[]>([]);

  // Novos estados para resultados das buscas dos selects
  const [capacityUnits, setCapacityUnits] = useState<any[]>([]);
  const [compressorTypes, setCompressorTypes] = useState<any[]>([]);
  const [coolingFluidTypes, setCoolingFluidTypes] = useState<any[]>([]);
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);

  // Estados para queries de busca
  const [clientQuery, setClientQuery] = useState("");
  const [sectorQuery, setSectorQuery] = useState("");
  const [brandQuery, setBrandQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");
  const [condenserQuery, setCondenserQuery] = useState("");
  const [coilQuery, setCoilQuery] = useState("");
  const [evaporatorQuery, setEvaporatorQuery] = useState("");

  // Novos estados para queries de busca
  const [capacityUnitQuery, setCapacityUnitQuery] = useState("");
  const [compressorTypeQuery, setCompressorTypeQuery] = useState("");
  const [coolingFluidTypeQuery, setCoolingFluidTypeQuery] = useState("");
  const [technologyQuery, setTechnologyQuery] = useState("");
  const [phaseQuery, setPhaseQuery] = useState("");

  const { hasPermission, permissions } = usePermissions();


  const fetchCapacityUnits = async (query: string) => {
    if (query.length < 3) {
      setCapacityUnits([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/capacity_units?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCapacityUnits(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar unidades de capacidade:", error);
      Alert.alert("Erro", "Não foi possível carregar as unidades de capacidade.");
    }
  };

  const fetchCompressorTypes = async (query: string) => {
    if (query.length < 3) {
      setCompressorTypes([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/compressor_types?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompressorTypes(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar tipos de compressor:", error);
      Alert.alert("Erro", "Não foi possível carregar os tipos de compressor.");
    }
  };

  const fetchCoolingFluidTypes = async (query: string) => {
    if (query.length < 3) {
      setCoolingFluidTypes([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/cooling_fluid_types?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoolingFluidTypes(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar tipos de fluído refrigerante:", error);
      Alert.alert("Erro", "Não foi possível carregar os tipos de fluído refrigerante.");
    }
  };

  const fetchTechnologies = async (query: string) => {
    if (query.length < 3) {
      setTechnologies([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/tecnologies?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTechnologies(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar tecnologias:", error);
      Alert.alert("Erro", "Não foi possível carregar as tecnologias.");
    }
  };

  const fetchPhases = async (query: string) => {
    if (query.length < 3) {
      setPhases([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/phases?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhases(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar fases:", error);
      Alert.alert("Erro", "Não foi possível carregar as fases.");
    }
  };

  // Funções de busca com suporte a paginação
  const fetchClients = async (query: string) => {
    if (query.length < 3) {
      setClients([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/clients?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar clientes:", error);
      Alert.alert("Erro", "Não foi possível carregar os clientes.");
    }
  };

  const fetchSectors = async (clientId: string, query: string) => {
    if (!clientId || query.length < 3) {
      setSectors([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/clients/${clientId}/sectors?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSectors(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar setores:", error);
      Alert.alert("Erro", "Não foi possível carregar os setores.");
    }
  };

  const fetchBrands = async (query: string) => {
    if (query.length < 3) {
      setBrands([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/brands?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBrands(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar marcas:", error);
      Alert.alert("Erro", "Não foi possível carregar os fabricantes.");
    }
  };

  const fetchEquipmentTypes = async (query: string) => {
    if (query.length < 3) {
      setEquipmentTypes([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/equipment_type?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipmentTypes(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar tipos de equipamento:", error);
      Alert.alert("Erro", "Não foi possível carregar os tipos de equipamento.");
    }
  };

  const fetchCondenserTypes = async (query: string) => {
    if (query.length < 3) {
      setCondenserTypes([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/condenser_type?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCondenserTypes(res.data.results || []);
    } catch (error: any) {
      console.error("[CreateEquipmentScreen] Erro ao buscar tipos de condensadora:", error.message);
      if (error.response?.status === 404) {
        Alert.alert("Erro", "Endpoint /api/condenser_type não encontrado no servidor.");
      } else {
        Alert.alert("Erro", "Não foi possível carregar os tipos de condensadora.");
      }
      setCondenserTypes([]);
    }
  };

  const fetchCoilTypes = async (query: string) => {
    if (query.length < 3) {
      setCoilTypes([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/coil_type?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoilTypes(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar tipos de serpentina:", error);
      Alert.alert("Erro", "Não foi possível carregar os tipos de serpentina.");
    }
  };

  const fetchEvaporatorTypes = async (query: string) => {
    if (query.length < 3) {
      setEvaporatorTypes([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/evaporator_type?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvaporatorTypes(res.data.results || []);
    } catch (error) {
      console.error("[CreateEquipmentScreen] Erro ao buscar tipos de evaporadora:", error);
      Alert.alert("Erro", "Não foi possível carregar os tipos de evaporadora.");
    }
  };

  // Funções de mudança de query
  const handleClientQueryChange = (text: string) => {
    setClientQuery(text);
    setClient(""); // Reseta a seleção ao mudar a busca
    fetchClients(text);
  };

  const handleSectorQueryChange = (text: string) => {
    setSectorQuery(text);
    setSector(""); // Reseta a seleção ao mudar a busca
    if (client) fetchSectors(client, text);
  };

  const handleCapacityUnitQueryChange = (text: string) => {
    setCapacityUnitQuery(text);
    setCapacityUnit("");
    fetchCapacityUnits(text);
  };

  const handleCompressorTypeQueryChange = (text: string) => {
    setCompressorTypeQuery(text);
    setCompressorType("");
    fetchCompressorTypes(text);
  };

  const handleCoolingFluidTypeQueryChange = (text: string) => {
    setCoolingFluidTypeQuery(text);
    setCoolingFluidType("");
    fetchCoolingFluidTypes(text);
  };

  const handleTechnologyQueryChange = (text: string) => {
    setTechnologyQuery(text);
    setTechnology(null);
    fetchTechnologies(text);
  };

  const handlePhaseQueryChange = (text: string) => {
    setPhaseQuery(text);
    setPhase("");
    fetchPhases(text);
  };

  const handleBrandQueryChange = (text: string) => {
    setBrandQuery(text);
    setBrand(""); // Reseta a seleção ao mudar a busca
    fetchBrands(text);
  };

  const handleTypeQueryChange = (text: string) => {
    setTypeQuery(text);
    setEquipmentType(""); // Reseta a seleção ao mudar a busca
    fetchEquipmentTypes(text);
  };

  const handleCondenserQueryChange = (text: string) => {
    setCondenserQuery(text);
    setCondenserType(""); // Reseta a seleção ao mudar a busca
    fetchCondenserTypes(text);
  };

  const handleCoilQueryChange = (text: string) => {
    setCoilQuery(text);
    setCoilType(""); // Reseta a seleção ao mudar a busca
    fetchCoilTypes(text);
  };

  const handleEvaporatorQueryChange = (text: string) => {
    setEvaporatorQuery(text);
    setEvaporatorType(""); // Reseta a seleção ao mudar a busca
    fetchEvaporatorTypes(text);
  };

  const createNewItem = async (endpoint: string, name: string, setValue: (value: string) => void) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setValue(res.data.id.toString());
      Alert.alert("Sucesso", `Novo item "${name}" criado com sucesso!`);
    } catch (error) {
      console.error(`[CreateEquipmentScreen] Erro ao criar item em ${endpoint}:`, error);
      Alert.alert("Erro", `Falha ao criar novo item.`);
    }
  };

  // Função de criação do equipamento
  const handleCreateEquipment = async () => {
    if (!client || !sector || !brand || !equipmentType) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios (*).");
      return;
    }
    if (capacity && !capacityUnit) {
      Alert.alert("Erro", "Unidade de capacidade é obrigatória quando capacidade é preenchida.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("Token de acesso não encontrado.");
      const payload: Partial<Equipment> = {
        client_id: parseInt(client),
        sector_id: parseInt(sector),
        brand_id: parseInt(brand),
        equipment_type_id: parseInt(equipmentType),
        condenser_type_id: condenserType ? parseInt(condenserType) : undefined,
        coil_type_id: coilType ? parseInt(coilType) : undefined,
        evaporator_type_id: evaporatorType ? parseInt(evaporatorType) : undefined,
        tag: tag || undefined,
        patrimony: patrimony || undefined,
        serial_number: serialNumber || undefined,
        description: description || undefined,
        capacity: capacity ? parseFloat(capacity) : undefined,
        capacity_unit_id: capacityUnit ? parseInt(capacityUnit) : undefined,
        compressor_type_id: compressorType ? parseInt(compressorType) : undefined,
        cooling_fluid_type_id: coolingFluidType ? parseInt(coolingFluidType) : undefined,
        condenser_model: condenserModel || undefined,
        condenser_serial_number: condenserSerialNumber || undefined,
        evaporator_model: evaporatorModel || undefined,
        evaporator_serial_number: evaporatorSerialNumber || undefined,
        voltage: voltage ? parseFloat(voltage) : undefined,
        electric_current: electricCurrent ? parseFloat(electricCurrent) : undefined,
        electric_power: electricPower ? parseFloat(electricPower) : undefined,
        phase_id: phase ? parseInt(phase) : undefined,
        is_leased: isLeased,
        has_warranty: hasWarranty,
        has_automation: hasAutomation,
        technology_id: technology && technology !== "new_technology" ? parseInt(technology) : undefined, // Ajustado para technolog
      };

      await EquipmentService.createEquipment(token, payload);
      Alert.alert("Sucesso", "Equipamento criado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("[CreateEquipmentScreen] Erro ao criar equipamento:", error);
      Alert.alert("Erro", error.message || "Falha ao criar equipamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Cliente*</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar cliente (min 3 caracteres)"
        value={clientQuery}
        onChangeText={handleClientQueryChange}
      />
      <Picker
        selectedValue={client}
        onValueChange={(value) => {
          setClient(value);
          setSector("");
          setSectorQuery("");
          if (value) fetchSectors(value, "");
        }}
        style={styles.picker}
      >
        <Picker.Item label="Selecione um cliente" value="" />
        {clients.map((c) => (
          <Picker.Item key={c.id} label={c.name} value={c.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Setor*</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar setor (min 3 caracteres)"
        value={sectorQuery}
        onChangeText={handleSectorQueryChange}
        editable={!!client}
      />
      <Picker
        selectedValue={sector}
        onValueChange={setSector}
        style={styles.picker}
      >
        <Picker.Item label="Selecione um setor" value="" />
        {sectors.map((s) => (
          <Picker.Item key={s.id} label={s.name} value={s.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Fabricante*</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar fabricante (min 3 caracteres)"
        value={brandQuery}
        onChangeText={handleBrandQueryChange}
      />
      <Picker
        selectedValue={brand}
        onValueChange={setBrand}
        style={styles.picker}
      >
        <Picker.Item label="Selecione um fabricante" value="" />
        {brands.map((b) => (
          <Picker.Item key={b.id} label={b.name} value={b.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Tipo de Equipamento*</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar tipo (min 3 caracteres)"
        value={typeQuery}
        onChangeText={handleTypeQueryChange}
      />
      <Picker
        selectedValue={equipmentType}
        onValueChange={setEquipmentType}
        style={styles.picker}
      >
        <Picker.Item label="Selecione tipo de equipamento" value="" />
        {equipmentTypes.map((t) => (
          <Picker.Item key={t.id} label={t.name} value={t.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Tipo de Coifa</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar coifa (min 3 caracteres)"
        value={condenserQuery}
        onChangeText={handleCondenserQueryChange}
      />
      <Picker
        selectedValue={condenserType}
        onValueChange={setCondenserType}
        style={styles.picker}
      >
        <Picker.Item label="Selecione tipo de coifa" value="" />
        {condenserTypes.map((t) => (
          <Picker.Item key={t.id} label={t.name} value={t.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Tipo de Serpentina</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar serpentina (min 3 caracteres)"
        value={coilQuery}
        onChangeText={handleCoilQueryChange}
      />
      <Picker
        selectedValue={coilType}
        onValueChange={setCoilType}
        style={styles.picker}
      >
        <Picker.Item label="Selecione tipo de serpentina" value="" />
        {coilTypes.map((t) => (
          <Picker.Item key={t.id} label={t.name} value={t.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Tipo de Evaporadora</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar evaporadora (min 3 caracteres)"
        value={evaporatorQuery}
        onChangeText={handleEvaporatorQueryChange}
      />
      <Picker
        selectedValue={evaporatorType}
        onValueChange={setEvaporatorType}
        style={styles.picker}
      >
        <Picker.Item label="Selecione tipo de evaporadora" value="" />
        {evaporatorTypes.map((t) => (
          <Picker.Item key={t.id} label={t.name} value={t.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Tag</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a tag"
        value={tag}
        onChangeText={setTag}
      />

      <Text style={styles.label}>Patrimônio</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o patrimônio"
        value={patrimony}
        onChangeText={setPatrimony}
      />

      <Text style={styles.label}>Número de Série</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o número de série"
        value={serialNumber}
        onChangeText={setSerialNumber}
      />

      <Text style={styles.label}>Tecnologia</Text>
      <Picker
        selectedValue={technology}
        onValueChange={setTechnology}
        style={styles.picker}
      >
        <Picker.Item label="Selecione a tecnologia" value="" />
        <Picker.Item label="Inverter" value="inverter" />
        <Picker.Item label="Convencional" value="convencional" />
      </Picker>

      <Text style={styles.label}>Voltagem</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a voltagem"
        value={voltage}
        onChangeText={setVoltage}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Corrente Elétrica</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a corrente elétrica"
        value={electricCurrent}
        onChangeText={setElectricCurrent}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Capacidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a capacidade"
        value={capacity}
        onChangeText={setCapacity}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <Button title="Criar Equipamento" onPress={handleCreateEquipment} />
      )}
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a descrição"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Capacidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a capacidade"
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Unidade de Capacidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar unidade (min 3 caracteres)"
        value={capacityUnitQuery}
        onChangeText={handleCapacityUnitQueryChange}
      />
      <Picker
        selectedValue={capacityUnit}
        onValueChange={(value) => setCapacityUnit(value)}
        style={styles.picker}
      >
        <Picker.Item label="Selecione unidade de capacidade" value="" />
        {capacityUnits.map((u) => (
          <Picker.Item key={u.id} label={u.name} value={u.id.toString()} />
        ))}
        <Picker.Item label="Criar nova unidade" value="new_capacity_unit" />
      </Picker>
      {capacityUnit === "new_capacity_unit" && (
        <TextInput
          style={styles.input}
          placeholder="Digite o nome da nova unidade"
          onSubmitEditing={(e) => createNewItem("/capacity_units", e.nativeEvent.text, setCapacityUnit)}
        />
      )}

      <Text style={styles.label}>Tipo de Compressor</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar tipo (min 3 caracteres)"
        value={compressorTypeQuery}
        onChangeText={handleCompressorTypeQueryChange}
      />
      <Picker
        selectedValue={compressorType}
        onValueChange={(value) => setCompressorType(value)}
        style={styles.picker}
      >
        <Picker.Item label="Selecione tipo de compressor" value="" />
        {compressorTypes.map((c) => (
          <Picker.Item key={c.id} label={c.name} value={c.id} />
        ))}
        <Picker.Item label="Criar novo tipo" value="new_compressor_type" />
      </Picker>
      {compressorType === "new_compressor_type" && (
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do novo tipo"
          onSubmitEditing={(e) => createNewItem("/compressor_types", e.nativeEvent.text, setCompressorType)}
        />
      )}

      <Text style={styles.label}>Tipo de Fluído Refrigerante</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar tipo (min 3 caracteres)"
        value={coolingFluidTypeQuery}
        onChangeText={handleCoolingFluidTypeQueryChange}
      />
      <Picker
        selectedValue={coolingFluidType}
        onValueChange={(value) => setCoolingFluidType(value)}
        style={styles.picker}
      >
        <Picker.Item label="Selecione tipo de fluído" value="" />
        {coolingFluidTypes.map((f) => (
          <Picker.Item key={f.id} label={f.name} value={f.id} />
        ))}
        <Picker.Item label="Criar novo tipo" value="new_cooling_fluid_type" />
      </Picker>
      {coolingFluidType === "new_cooling_fluid_type" && (
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do novo fluído"
          onSubmitEditing={(e) => createNewItem("/cooling_fluid_types", e.nativeEvent.text, setCoolingFluidType)}
        />
      )}

      <Text style={styles.label}>Modelo da Condensadora</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o modelo"
        value={condenserModel}
        onChangeText={setCondenserModel}
      />
      <Text style={styles.label}>Número de Série da Condensadora</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o número de série"
        value={condenserSerialNumber}
        onChangeText={setCondenserSerialNumber}
      />

      <Text style={styles.label}>Modelo da Evaporadora</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o modelo"
        value={evaporatorModel}
        onChangeText={setEvaporatorModel}
      />
      <Text style={styles.label}>Número de Série da Evaporadora</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o número de série"
        value={evaporatorSerialNumber}
        onChangeText={setEvaporatorSerialNumber}
      />

      <Text style={styles.label}>Tensão Elétrica</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a tensão"
        value={voltage}
        onChangeText={setVoltage}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Potência Elétrica</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a potência"
        value={electricPower}
        onChangeText={setElectricPower}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Fase</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar fase (min 3 caracteres)"
        value={phaseQuery}
        onChangeText={handlePhaseQueryChange}
      />
      <Picker
        selectedValue={phase}
        onValueChange={(value) => setPhase(value)}
        style={styles.picker}
      >
        <Picker.Item label="Selecione a fase" value="" />
        {phases.map((p) => (
          <Picker.Item key={p.id} label={p.name} value={p.id} />
        ))}
        <Picker.Item label="Criar nova fase" value="new_phase" />
      </Picker>
      {phase === "new_phase" && (
        <TextInput
          style={styles.input}
          placeholder="Digite o nome da nova fase"
          onSubmitEditing={(e) => createNewItem("/phases", e.nativeEvent.text, setPhase)}
        />
      )}

      <Text style={styles.label}>Equipamento Locado?</Text>
      <Picker
        selectedValue={isLeased}
        onValueChange={(value) => setIsLeased(value)}
        style={styles.picker}
      >
        <Picker.Item label="Não" value={false} />
        <Picker.Item label="Sim" value={true} />
      </Picker>
      <Text style={styles.label}>Tem Garantia?</Text>
      <Picker
        selectedValue={hasWarranty}
        onValueChange={(value) => setHasWarranty(value)}
        style={styles.picker}
      >
        <Picker.Item label="Não" value={false} />
        <Picker.Item label="Sim" value={true} />
      </Picker>
      <Text style={styles.label}>Possui Automação?</Text>
      <Picker
        selectedValue={hasAutomation}
        onValueChange={(value) => setHasAutomation(value)}
        style={styles.picker}
      >
        <Picker.Item label="Não" value={false} />
        <Picker.Item label="Sim" value={true} />
      </Picker>

      <Text style={styles.label}>Tecnologia</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite para buscar tecnologia (min 3 caracteres)"
        value={technologyQuery}
        onChangeText={handleTechnologyQueryChange}
      />
      <Picker
        selectedValue={technology}
        onValueChange={(value) => setTechnology(value)}
        style={styles.picker}
      >
        <Picker.Item label="Selecione a tecnologia" value={null} />
        {technologies.map((t) => (
          <Picker.Item key={t.id} label={t.name} value={t.id.toString()} />
        ))}
        <Picker.Item label="Criar nova tecnologia" value="new_technology" />
      </Picker>
      {technology === "new_technology" && (
        <TextInput
          style={styles.input}
          placeholder="Digite o nome da nova tecnologia"
          onSubmitEditing={(e) => createNewItem("/tecnologies", e.nativeEvent.text, setTechnology as any)}
        />
      )}
    </ScrollView>
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
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
    marginTop: 20,
  },
});

export default CreateEquipmentScreen;