import React, { useContext, useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Checkbox from "expo-checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import AuthService from '../src/Services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginRequest from '../src/Models/LoginRequest';
import { decodeToken } from "../src/Services/PermissionsService";
import { usePermissions } from "../src/Context/PermissionsContext";
import { useUser } from "../src/Context/UserContext";
import { API_BASE_URL } from "../src/config/apiConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const { setPermissions } = usePermissions();
  const { setUsername } = useUser();

  const handleLogin = async () => {
    console.log('Iniciando login...');
    try {
      const loginRequest = new LoginRequest(email, password);
      console.log('LoginRequest:', loginRequest);

      const response = await AuthService.login(loginRequest.email, loginRequest.password);
      console.log('Resposta do login:', response);

      if (!response.sliding_token) {
        console.error('Token não encontrado na resposta:', response);
        throw new Error('Resposta inválida da API: token não encontrado.');
      }

      await AsyncStorage.setItem('sliding_token', response.sliding_token);
      console.log('Token salvo - sliding_token:', response.sliding_token);

      router.push('/account-selection');
    } catch (error: any) {
      console.error("Erro de login:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${API_BASE_URL}/token`,
      });
      Alert.alert(
        "Erro de Login",
        `Ocorreu um erro: ${error.message}\nStatus: ${error.response?.status || "N/A"}`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <LinearGradient
      colors={["#E0ECFF", "#A7C7E7", "#6A9CE6"]}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.subtitle}>Por favor, insira suas credenciais</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Senha"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={20}
              color="#333"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? "#4630EB" : undefined}
            style={styles.checkbox}
          />
          <Text style={styles.label}>Manter-me logado</Text>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#007BFF",
    textDecorationLine: "underline",
  },
});