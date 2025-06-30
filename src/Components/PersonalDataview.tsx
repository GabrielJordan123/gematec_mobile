import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PersonalDataProps {
  name: string;
  email: string;
  document: string | null;
  rg: string | null;
  phone: string | null;
  ctps: string | null;
  rh_factor: string | null;
  birthdate: string | null;
  admission_date: string | null;
}

const PersonalDataView: React.FC<PersonalDataProps> = ({
  name,
  email,
  document,
  rg,
  phone,
  ctps,
  rh_factor,
  birthdate,
  admission_date,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dados Pessoais</Text>
      <Text style={styles.item}>Nome: {name}</Text>
      <Text style={styles.item}>Email: {email}</Text>
      <Text style={styles.item}>Documento: {document || '-'}</Text>
      <Text style={styles.item}>RG: {rg || '-'}</Text>
      <Text style={styles.item}>Telefone: {phone || '-'}</Text>
      <Text style={styles.item}>CTPS: {ctps || '-'}</Text>
      <Text style={styles.item}>Fator RH: {rh_factor || '-'}</Text>
      <Text style={styles.item}>Data de Admissão: {admission_date || '-'}</Text>
      <Text style={styles.item}>Data de Nascimento: {birthdate || '-'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default PersonalDataView;
