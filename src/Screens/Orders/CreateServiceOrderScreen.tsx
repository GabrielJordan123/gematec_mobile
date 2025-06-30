import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';

const CreateServiceOrderScreen = ({ navigation }: { navigation: any }) => {
    const [clients, setClients] = useState<any[]>([]);
    const [sectors, setSectors] = useState<any[]>([]);
    const [equipments, setEquipments] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [selectedSector, setSelectedSector] = useState<any>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            fetchSectors(selectedClient.id);
        }
    }, [selectedClient]);

    useEffect(() => {
        if (selectedSector) {
            fetchEquipments(selectedSector.id);
        }
    }, [selectedSector]);

    const fetchClients = async () => {
        try {
            const response = await axios.post('/clients', { search: '' });
            setClients(response.data);
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
        }
    };

    const fetchSectors = async (clientId: string) => {
        try {
            const response = await axios.post(`/clients/${clientId}/sectors`, { search: '' });
            setSectors(response.data);
        } catch (error) {
            console.error("Erro ao buscar setores:", error);
        }
    };

    const fetchEquipments = async (sectorId: string) => {
        try {
            const response = await axios.post('/equipments', { sector_id: sectorId, search: '' });
            setEquipments(response.data);
        } catch (error) {
            console.error("Erro ao buscar equipamentos:", error);
        }
    };

    const handleCreateServiceOrder = async () => {
        if (selectedEquipment) {
            setLoading(true);
            try {
                const response = await axios.post('/service_orders', {
                    equipment_id: selectedEquipment.id,
                });
                // Redireciona para a tela de visualização da O.S criada
                navigation.navigate('ServiceOrderDetailsScreen', {
                    serviceOrderId: response.data.id,
                });
            } catch (error) {
                console.error('Erro ao criar Ordem de Serviço:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const renderItem = (item: any, type: string) => {
        const handleSelect = () => {
            if (type === 'client') {
                setSelectedClient(item);
                setSelectedSector(null);
                setSelectedEquipment(null);
            } else if (type === 'sector') {
                setSelectedSector(item);
                setSelectedEquipment(null);
            } else if (type === 'equipment') {
                setSelectedEquipment(item);
            }
        };

        return (
            <TouchableOpacity style={styles.item} onPress={handleSelect}>
                <Text style={styles.itemText}>
                    {type === 'client' ? item.name : type === 'sector' ? item.name : `${item.brand} - ${item.equipment_type} - ${item.tag}`}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nova Ordem de Serviço</Text>

            {/* Filtro de Cliente */}
            <Text style={styles.filterTitle}>Selecione um Cliente:</Text>
            <FlatList
                data={clients}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => renderItem(item, 'client')}
            />

            {/* Filtro de Setor */}
            {selectedClient && (
                <>
                    <Text style={styles.filterTitle}>Selecione um Setor:</Text>
                    <FlatList
                        data={sectors}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => renderItem(item, 'sector')}
                    />
                </>
            )}

            {/* Filtro de Equipamento */}
            {selectedSector && (
                <>
                    <Text style={styles.filterTitle}>Selecione um Equipamento:</Text>
                    <FlatList
                        data={equipments}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => renderItem(item, 'equipment')}
                    />
                </>
            )}

            {/* Resumo do Equipamento Selecionado */}
            {selectedEquipment && (
                <View style={styles.summaryContainer}>
                    <Text>Tag: {selectedEquipment.tag}</Text>
                    <Text>Patrimônio: {selectedEquipment.patrimony}</Text>
                    <Text>Série: {selectedEquipment.serial_number}</Text>
                    <Text>Fabricante: {selectedEquipment.brand}</Text>
                    <Text>Tipo: {selectedEquipment.equipment_type}</Text>
                    <Text>Tecnologia: {selectedEquipment.technology}</Text>
                </View>
            )}

            {/* Botão Criar Ordem de Serviço */}
            <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateServiceOrder}
                disabled={loading || !selectedEquipment}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.createButtonText}>Criar Ordem de Serviço</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.closeButton}>Fechar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    itemText: {
        fontSize: 16,
    },
    summaryContainer: {
        marginTop: 20,
    },
    createButton: {
        backgroundColor: '#007BFF',
        padding: 12,
        marginTop: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    closeButton: {
        color: '#007BFF',
        marginTop: 12,
        textAlign: 'center',
    },
});

export default CreateServiceOrderScreen;
