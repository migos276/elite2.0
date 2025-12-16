"use client"


import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"
import { useDispatch, useSelector } from "react-redux"
import { updateUser } from "../../store/slices/authSlice"
import type { RootState } from "../../store"

const MatchingResultsScreen = ({ route, navigation }: any) => {
  const { profiles } = route.params
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)


  const handleSelectProfile = async () => {
    if (!selectedProfile) {
      Alert.alert("Erreur", "Veuillez sélectionner un profil")
      return
    }



    setIsSubmitting(true)
    try {

      const response = await apiClient.post("/api/matching/select-profile/", {
        profile_id: selectedProfile,
      })


      const userResponse = await apiClient.get("/api/auth/profile/")
      dispatch(updateUser(userResponse.data))

      Alert.alert("Succès", "Profil sélectionné avec succès", [
        {
          text: "OK",
          onPress: () => navigation.navigate("AdaptivePath"),
        },
      ])
    } catch (error) {
      console.warn("API non disponible, simulation complète du processus de sélection")
      
      // Simulation d'une sélection réussie
      const selectedProfileData = profiles.find((p: any) => p.id === selectedProfile)
      
      // Mettre à jour l'utilisateur localement pour simulation
      if (user) {
        dispatch(updateUser({
          ...user,
          has_completed_matching: true,
          selected_profile: selectedProfile
        }))
      }

      Alert.alert("Succès", `Profil "${selectedProfileData?.name}" sélectionné avec succès (mode test)`, [
        {
          text: "OK",
          onPress: () => navigation.navigate("AdaptivePath"),
        },
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManualSearch = () => {
    navigation.navigate("ManualProfileSearch")
  }

  const profileLabels = ["Idéal", "Secondaire", "Tertiaire"]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={64} color="#10b981" />
        <Text style={styles.title}>Profils recommandés</Text>
        <Text style={styles.subtitle}>Sélectionnez le profil qui vous correspond le mieux</Text>
      </View>

      {profiles.map((profile: any, index: number) => (
        <TouchableOpacity
          key={profile.id}
          style={[styles.profileCard, selectedProfile === profile.id && styles.profileCardSelected]}
          onPress={() => setSelectedProfile(profile.id)}
        >
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>{profileLabels[index]}</Text>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileCategory}>{profile.category}</Text>
          <Text style={styles.profileDescription}>{profile.description}</Text>
          {selectedProfile === profile.id && (
            <Ionicons name="checkmark-circle" size={24} color="#6366f1" style={styles.checkIcon} />
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSelectProfile} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirmer la sélection</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={handleManualSearch}>
        <Text style={styles.linkButtonText}>Aucun profil ne correspond ? Recherche manuelle</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 32,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  profileCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  profileCardSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#eef2ff",
  },
  profileBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#6366f1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  profileBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  profileCategory: {
    fontSize: 14,
    color: "#6366f1",
    marginBottom: 12,
  },
  profileDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  checkIcon: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  button: {
    margin: 16,
    padding: 16,
    backgroundColor: "#6366f1",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    padding: 16,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#6366f1",
    fontSize: 14,
  },
})

export default MatchingResultsScreen