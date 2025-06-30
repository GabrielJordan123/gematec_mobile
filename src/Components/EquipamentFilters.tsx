import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

interface EquipmentFiltersProps {
  onFilter: (filters: any) => void;
  sectorId?: number; // Opcional, pois pode não ser sempre fornecido
  clientId?: number;
}

const EquipmentFilters: React.FC<EquipmentFiltersProps> = ({ onFilter, sectorId, clientId }) => {
  const [filters, setFilters] = useState({
    brand: "",
    equipmentType: "",
    search: "",
    status: "",
    sector_id: sectorId || null,
    client_id: clientId || null,

  });
  const [brands, setBrands] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [brandQuery, setBrandQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");

  const fetchBrands = async (query: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/brands?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBrands(res.data.results || []);
    } catch (error) {
      console.error("[EquipmentFilters] Erro ao buscar marcas:", error);
    }
  };

  const fetchEquipmentTypes = async (query: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/equipment_types?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipmentTypes(res.data.results || []);
    } catch (error) {
      console.error("[EquipmentFilters] Erro ao buscar tipos de equipamento:", error);
    }
  };

  const handleBrandQueryChange = (text: string) => {
    setBrandQuery(text);
    if (text.length >= 3) {
      fetchBrands(text);
    }
  };

  const handleTypeQueryChange = (text: string) => {
    setTypeQuery(text);
    if (text.length >= 3) {
      fetchEquipmentTypes(text);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filtros</Text>
      <TextInput
        style={styles.input}
        placeholder="Busca por Tag ou Patrimônio"
        onChangeText={(text) => setFilters({ ...filters, search: text })}
        value={filters.search}
      />
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Fabricante..."
        value={brandQuery}
        onChangeText={handleBrandQueryChange}
      />
      <Picker
        selectedValue={filters.brand}
        onValueChange={(value) => setFilters({ ...filters, brand: value })}
        style={styles.picker}
      >
        <Picker.Item label="Fabricante" value="" />
        {brands.map((b: any) => (
          <Picker.Item key={b.id} label={b.name} value={b.id} />
        ))}
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Tipo de Equipamento..."
        value={typeQuery}
        onChangeText={handleTypeQueryChange}
      />
      <Picker
        selectedValue={filters.equipmentType}
        onValueChange={(value) => setFilters({ ...filters, equipmentType: value })}
        style={styles.picker}
      >
        <Picker.Item label="Tipo de Equipamento" value="" />
        {equipmentTypes.map((t: any) => (
          <Picker.Item key={t.id} label={t.name} value={t.id} />
        ))}
      </Picker>
      <Picker
        selectedValue={filters.status}
        onValueChange={(value) => setFilters({ ...filters, status: value })}
        style={styles.picker}
      >
        <Picker.Item label="Status" value="" />
        <Picker.Item label="Ativo" value="active" />
        <Picker.Item label="Inativo" value="inactive" />
      </Picker>
      <Button title="Filtrar" onPress={() => onFilter(filters)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
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
});

export default EquipmentFilters;