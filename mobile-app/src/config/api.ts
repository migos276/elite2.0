

import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_BASE_URL, testConnection } from "./environment"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Augmenté pour Expo Go
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour les requêtes
apiClient.interceptors.request.use(
  async (config) => {
    // Ajouter le token d'authentification
    const token = await AsyncStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Logging pour le debug
    if (__DEV__) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Intercepteur pour les réponses
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  async (error) => {
    console.error("API Error:", error.message)
    
    // Gestion spécifique des erreurs réseau
    if (error.code === "NETWORK_ERROR" || error.message.includes("Network Error")) {
      console.warn("🌐 Network Error detected")
      
      // Test de connectivité
      const isConnected = await testConnection()
      if (!isConnected) {
        throw new Error("Impossible de se connecter au serveur. Vérifiez que votre backend est démarré sur " + API_BASE_URL)
      }
    }
    
    // Gestion des erreurs 401 (non autorisé)
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("auth_token")
      await AsyncStorage.removeItem("user_data")
      throw new Error("Session expirée. Veuillez vous reconnecter.")
    }
    
    // Gestion des erreurs serveur
    if (error.response?.status >= 500) {
      throw new Error("Erreur du serveur. Veuillez réessayer plus tard.")
    }

    // Pour les erreurs 403 (Forbidden), retourner la réponse au lieu de lancer une erreur
    // Cela permet au code appelant de gérer ces cas (ex: chapitres non accessibles)
    if (error.response?.status === 403) {
      return Promise.reject(error)
    }

    // Renvoyer l'erreur avec un message plus clair
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue"
    throw new Error(errorMessage)
  },
)

export default apiClient
