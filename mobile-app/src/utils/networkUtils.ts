// Utilitaires pour gérer les problèmes de réseau
import { Platform } from "react-native";
import { API_BASE_URL } from "../config/environment";

// Fonction pour obtenir l'IP locale de l'ordinateur
export const getLocalIP = () => {
  // IPs possibles selon l'environnement
  const possibleIPs = [
    "172.20.10.4", // IP détectée
    "192.168.1.100", // IP commune
    "10.0.2.2", // Émulateur Android
    "127.0.0.1", // Localhost (ne fonctionne pas sur mobile)
  ];
  
  return possibleIPs;
};

// Test de connectivité avec timeout
export const testServerConnection = async (timeout = 5000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/test/`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn("❌ Server connection test failed:", error);
    return false;
  }
};

// Fonction pour obtenir des instructions de débogage
export const getNetworkDebugInfo = () => {
  const platform = Platform.OS;
  const baseUrl = API_BASE_URL;
  
  return {
    platform,
    baseUrl,
    isExpoGo: __DEV__,
    instructions: [
      "1. Assurez-vous que votre backend Django est démarré sur le port 8000",
      `2. Vérifiez que votre backend écoute sur ${baseUrl}`,
      "3. Sur votre téléphone, allez dans les paramètres WiFi et notez l'IP de votre ordinateur",
      "4. Remplacez l'IP dans environment.ts si nécessaire",
      "5. Redémarrez l'application Expo Go",
    ],
    commonIssues: [
      "Backend non démarré",
      "IP incorrecte dans la configuration",
      "Problème de CORS sur le backend",
      "Firewall bloquant les connexions",
    ]
  };
};

// Fonction pour créer une URL alternative
export const createAlternativeUrl = (ip: string, port = "8000") => {
  return `http://${ip}:${port}`;
};
