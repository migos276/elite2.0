import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../config/api';
import { API_BASE_URL } from '../config/environment';

const CompetitionDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [expanded, setExpanded] = useState(false);

  const runDiagnostics = async () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      apiBaseUrl: API_BASE_URL,
      storage: {},
      auth: {},
      api: {}
    };

    try {
      // 1. Vérifier le stockage local
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      diagnostics.storage = {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        hasUserData: !!userData,
        userData: userData ? JSON.parse(userData) : null
      };

      // 2. Tester la connexion au backend
      try {
        const testResponse = await fetch(`${API_BASE_URL}/api/test/`);
        diagnostics.api.connection = {
          status: testResponse.status,
          ok: testResponse.ok,
          text: await testResponse.text()
        };
      } catch (error) {
        diagnostics.api.connection = {
          error: error.message
        };
      }

      // 3. Tester l'endpoint competitions sans auth
      try {
        const compResponse = await fetch(`${API_BASE_URL}/api/competitions/`);
        diagnostics.api.competitionsNoAuth = {
          status: compResponse.status,
          ok: compResponse.ok,
          text: await compResponse.text()
        };
      } catch (error) {
        diagnostics.api.competitionsNoAuth = {
          error: error.message
        };
      }

      // 4. Tester l'endpoint competitions avec auth
      if (token) {
        try {
          const authResponse = await apiClient.get('/api/competitions/');
          diagnostics.api.competitionsWithAuth = {
            status: authResponse.status,
            dataStructure: {
              hasResults: !!authResponse.data.results,
              resultsLength: authResponse.data.results ? authResponse.data.results.length : 'N/A',
              dataType: typeof authResponse.data,
              keys: Object.keys(authResponse.data || {})
            },
            sampleData: authResponse.data.results ? authResponse.data.results.slice(0, 1) : authResponse.data
          };
        } catch (error) {
          diagnostics.api.competitionsWithAuth = {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status
          };
        }
      }

      // 5. Tester le login
      try {
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            password: 'testpass123'
          })
        });
        diagnostics.auth.login = {
          status: loginResponse.status,
          ok: loginResponse.ok,
          data: await loginResponse.json()
        };
      } catch (error) {
        diagnostics.auth.login = {
          error: error.message
        };
      }

    } catch (error) {
      diagnostics.error = error.message;
    }

    setDebugInfo(diagnostics);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const renderDebugInfo = () => {
    return (
      <ScrollView style={styles.debugContent}>
        <Text style={styles.sectionTitle}>🔍 Diagnostics API et Authentification</Text>
        
        <Text style={styles.subsectionTitle}>📍 Configuration</Text>
        <Text style={styles.text}>URL API: {debugInfo.apiBaseUrl}</Text>
        <Text style={styles.text}>Timestamp: {debugInfo.timestamp}</Text>

        <Text style={styles.subsectionTitle}>💾 Stockage Local</Text>
        <Text style={styles.text}>Token présent: {debugInfo.storage?.hasToken ? '✅' : '❌'}</Text>
        <Text style={styles.text}>Longueur token: {debugInfo.storage?.tokenLength || 0}</Text>
        <Text style={styles.text}>Données utilisateur: {debugInfo.storage?.hasUserData ? '✅' : '❌'}</Text>

        <Text style={styles.subsectionTitle}>🔗 Test Connexion</Text>
        {debugInfo.api?.connection ? (
          <Text style={styles.text}>
            Status: {debugInfo.api.connection.status} | 
            OK: {debugInfo.api.connection.ok ? '✅' : '❌'}
          </Text>
        ) : (
          <Text style={styles.text}>Erreur: {debugInfo.api?.connection?.error}</Text>
        )}

        <Text style={styles.subsectionTitle}>🏆 Test Concours (Sans Auth)</Text>
        {debugInfo.api?.competitionsNoAuth ? (
          <Text style={styles.text}>
            Status: {debugInfo.api.competitionsNoAuth.status}
          </Text>
        ) : (
          <Text style={styles.text}>Erreur: {debugInfo.api?.competitionsNoAuth?.error}</Text>
        )}

        <Text style={styles.subsectionTitle}>🏆 Test Concours (Avec Auth)</Text>
        {debugInfo.api?.competitionsWithAuth ? (
          debugInfo.api.competitionsWithAuth.error ? (
            <Text style={styles.text}>Erreur: {debugInfo.api.competitionsWithAuth.error}</Text>
          ) : (
            <View>
              <Text style={styles.text}>Status: {debugInfo.api.competitionsWithAuth.status}</Text>
              <Text style={styles.text}>
                Résultats: {debugInfo.api.competitionsWithAuth.dataStructure?.resultsLength || 0}
              </Text>
              <Text style={styles.text}>
                Structure: {debugInfo.api.competitionsWithAuth.dataStructure?.keys?.join(', ')}
              </Text>
            </View>
          )
        ) : (
          <Text style={styles.text}>En cours...</Text>
        )}

        <Text style={styles.subsectionTitle}>🔑 Test Login</Text>
        {debugInfo.auth?.login ? (
          debugInfo.auth.login.error ? (
            <Text style={styles.text}>Erreur: {debugInfo.auth.login.error}</Text>
          ) : (
            <Text style={styles.text}>
              Status: {debugInfo.auth.login.status} | 
              Succès: {debugInfo.auth.login.ok ? '✅' : '❌'}
            </Text>
          )
        ) : (
          <Text style={styles.text}>En cours...</Text>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.toggleText}>
          {expanded ? '🔼 Masquer les diagnostics' : '🔽 Afficher les diagnostics'}
        </Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.debugPanel}>
          {renderDebugInfo()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  toggleButton: {
    backgroundColor: '#6366f1',
    padding: 8,
    borderRadius: 6,
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  debugPanel: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 400,
    width: 320,
  },
  debugContent: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
});

export default CompetitionDebug;
