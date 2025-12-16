"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"

const AdaptivePathScreen = ({ navigation }: any) => {
  const [adaptivePath, setAdaptivePath] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    fetchAdaptivePath()
  }, [])


  const fetchAdaptivePath = async () => {
    try {

      const response = await apiClient.get("/api/path/get/")
      setAdaptivePath(response.data)
    } catch (error: any) {
      console.warn("Impossible de charger le parcours depuis l'API, utilisation de données de test")
      
      // Données de fallback pour les tests
      const fallbackPath = {
        id: 1,
        profile: {
          name: "Profil Informatiques",
          category: "Technologie"
        },
        academic_level: "Bac+2",
        duration_months: 18,
        steps: [
          "Fondamentaux de la programmation",
          "Développement Web Frontend",
          "Développement Web Backend",
          "Base de données et SQL",
          "Frameworks et Technologies avancées",
          "Projet professionnel"
        ]
      }
      setAdaptivePath(fallbackPath)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidatePath = async () => {
    setIsValidating(true)
    try {

      await apiClient.post("/api/path/validate/", {
        path_id: adaptivePath.id,
      })
      Alert.alert("Succès", "Parcours validé ! Vous pouvez maintenant accéder aux cours.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Courses", { screen: "CoursePacks" }),
        },
      ])
    } catch (error) {
      Alert.alert("Erreur", "Impossible de valider le parcours")
    } finally {
      setIsValidating(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  if (!adaptivePath) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Aucun parcours disponible</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.profileName}>{adaptivePath.profile.name}</Text>
        <Text style={styles.academicLevel}>Niveau: {adaptivePath.academic_level}</Text>
        <Text style={styles.duration}>Durée estimée: {adaptivePath.duration_months} mois</Text>
      </View>

      <View style={styles.stepsContainer}>
        <Text style={styles.stepsTitle}>Étapes de votre parcours</Text>
        {adaptivePath.steps.map((step: any, index: number) => (
          <View key={index} style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title || step}</Text>
              {step.description && <Text style={styles.stepDescription}>{step.description}</Text>}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.validateButton} onPress={handleValidatePath} disabled={isValidating}>
        {isValidating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
            <Text style={styles.validateButtonText}>Valider mon parcours</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    padding: 24,
    backgroundColor: "#6366f1",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  academicLevel: {
    fontSize: 16,
    color: "#e0e7ff",
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: "#e0e7ff",
  },
  stepsContainer: {
    padding: 16,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  validateButton: {
    margin: 16,
    padding: 16,
    backgroundColor: "#10b981",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  validateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default AdaptivePathScreen
