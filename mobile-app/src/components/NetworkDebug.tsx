import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, testConnection } from "../config/environment";
import apiClient from "../config/api";

interface DebugInfo {
  timestamp: string;
  apiUrl: string;
  connectionStatus: string;
  authToken: string | null;
  testResult: any;
  coursesResult: any;
  profileResult: any;
}

const NetworkDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    timestamp: new Date().toISOString(),
    apiUrl: API_BASE_URL,
    connectionStatus: "Non testé",
    authToken: null,
    testResult: null,
    coursesResult: null,
    profileResult: null,
  });

  const runDiagnostics = async () => {
    const timestamp = new Date().toISOString();
    let updatedInfo: Partial<DebugInfo> = { timestamp };

    try {
      // Test 1: Test de connectivité générale
      updatedInfo.connectionStatus = "En cours...";
      setDebugInfo(prev => ({ ...prev, ...updatedInfo }));

      const isConnected = await testConnection();
      updatedInfo.connectionStatus = isConnected ? "✅ Connecté" : "❌ Déconnecté";

      // Test 2: Récupérer le token stocké
      const authToken = await AsyncStorage.getItem("auth_token");
      updatedInfo.authToken = authToken;

      // Test 3: Test endpoint sans authentification
      if (isConnected) {
        try {
          const testResponse = await fetch(`${API_BASE_URL}/api/test/`);
          updatedInfo.testResult = await testResponse.json();
        } catch (error: any) {
          updatedInfo.testResult = { error: error.message };
        }

        // Test 4: Si token disponible, tester les endpoints authentifiés
        if (authToken) {
          try {
            // Test profil utilisateur
            const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });
            updatedInfo.profileResult = await profileResponse.json();

            // Test cours utilisateur
            const coursesResponse = await fetch(`${API_BASE_URL}/api/courses/my-courses/`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });
            updatedInfo.coursesResult = await coursesResponse.json();
          } catch (error: any) {
            updatedInfo.coursesResult = { error: error.message };
          }
        }
      }

      setDebugInfo(prev => ({ ...prev, ...updatedInfo }));
    } catch (error: any) {
      updatedInfo.connectionStatus = `❌ Erreur: ${error.message}`;
      setDebugInfo(prev => ({ ...prev, ...updatedInfo }));
    }
  };

  const loginWithTestUser = async () => {
    try {
      Alert.alert("Test", "Connexion avec l'utilisateur test...");
      

      const response = await apiClient.post("/api/auth/login/", {
        username: "testuser",
        password: "password123",
      });

      const { access, refresh } = response.data;
      await AsyncStorage.setItem("auth_token", access);
      await AsyncStorage.setItem("refresh_token", refresh);

      Alert.alert("Succès", "Connexion réussie!");
      
      // Relancer les diagnostics
      setTimeout(runDiagnostics, 1000);
    } catch (error: any) {
      Alert.alert("Erreur", `Échec de la connexion: ${error.message}`);
    }
  };

  const clearAuth = async () => {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("user_data");
    
    Alert.alert("Succès", "Authentification effacée!");
    setDebugInfo(prev => ({ ...prev, authToken: null }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Diagnostic Réseau Elite 2.0</Text>
        <Text style={styles.subtitle}>{debugInfo.timestamp}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <Text style={styles.info}>URL API: {debugInfo.apiUrl}</Text>
        <Text style={styles.info}>Statut: {debugInfo.connectionStatus}</Text>
        <Text style={styles.info}>
          Token: {debugInfo.authToken ? `${debugInfo.authToken.substring(0, 20)}...` : "Aucun"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.button} onPress={runDiagnostics}>
          <Text style={styles.buttonText}>🔄 Relancer les Tests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={loginWithTestUser}>
          <Text style={styles.buttonText}>🔐 Connexion Test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearAuth}>
          <Text style={styles.buttonText}>🗑️ Effacer Auth</Text>
        </TouchableOpacity>
      </View>

      {debugInfo.testResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Endpoint</Text>
          <Text style={styles.code}>{JSON.stringify(debugInfo.testResult, null, 2)}</Text>
        </View>
      )}

      {debugInfo.profileResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Utilisateur</Text>
          <Text style={styles.code}>{JSON.stringify(debugInfo.profileResult, null, 2)}</Text>
        </View>
      )}

      {debugInfo.coursesResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cours Utilisateur</Text>
          <Text style={styles.code}>{JSON.stringify(debugInfo.coursesResult, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  code: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f8f8f8",
    padding: 8,
    borderRadius: 4,
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default NetworkDebug;
