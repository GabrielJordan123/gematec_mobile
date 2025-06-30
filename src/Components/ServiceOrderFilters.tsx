import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const ServiceOrderFilters = ({ onFilter }: { onFilter: (filters: any) => void }) => {
    const [filters, setFilters] = useState({
        status: 'open',  // Padrão "open"
        client__name: '',
        client__email: '',
        equipmentType: '',  // Ajustado para equipmentType
        brand: '',
        search: '',
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Filtros</Text>
            <TextInput
                style={styles.input}
                placeholder="Status (open, pending, closed)"
                onChangeText={(text) => setFilters({ ...filters, status: text })}
                value={filters.status}
            />
            <TextInput
                style={styles.input}
                placeholder="Nome do Cliente"
                onChangeText={(text) => setFilters({ ...filters, client__name: text })}
                value={filters.client__name}
            />
            <TextInput
                style={styles.input}
                placeholder="Email do Cliente"
                onChangeText={(text) => setFilters({ ...filters, client__email: text })}
                value={filters.client__email}
            />
            <TextInput
                style={styles.input}
                placeholder="Tipo de Equipamento"
                onChangeText={(text) => setFilters({ ...filters, equipmentType: text })}
                value={filters.equipmentType}
            />
            <TextInput
                style={styles.input}
                placeholder="Marca"
                onChangeText={(text) => setFilters({ ...filters, brand: text })}
                value={filters.brand}
            />
            <TextInput
                style={styles.input}
                placeholder="Busca (nome, email ou tag)"
                onChangeText={(text) => setFilters({ ...filters, search: text })}
                value={filters.search}
            />
            <Button title="Filtrar" onPress={() => onFilter(filters)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 10, borderRadius: 5 },
});

export default ServiceOrderFilters;