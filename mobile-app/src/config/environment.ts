// Configuration de l'environnement pour Expo Go
import { Platform } from "react-native";

// URLs possibles pour l'API backend



const API_ENDPOINTS = {
  // IP locale détectée
  LOCAL: "http://172.20.10.2:8000",
  // Alternative avec IP différente
  ALT_LOCAL: "http://192.168.1.100:8000",
  // Pour les tests locaux (émulateur Android)
  ANDROID_EMULATOR: "http://10.0.2.2:8000",
  // Production (à modifier selon votre backend)
  PRODUCTION: "https://your-production-api.com"
};



// Fonction pour obtenir l'URL de base appropriée
export const getApiBaseUrl = () => {
  if (__DEV__) {
    // Utiliser l'IP qui fonctionne (backend confirmé sur 172.20.10.2:8000)
    return API_ENDPOINTS.LOCAL;
  }
  
  // En production
  return API_ENDPOINTS.PRODUCTION;
};

// URL de base exportée
export const API_BASE_URL = getApiBaseUrl();


// Fonction pour les tests de connectivité
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('Connection test failed:', error);
    return false;
  }
};

// Fonction pour obtenir l'URL avec fallback
export const getApiUrlWithFallback = (endpoint: string) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};
