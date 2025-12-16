"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"
import { useDispatch } from "react-redux"
import { updateUser } from "../../store/slices/authSlice"

interface Profile {
  id: number
  name: string
  description: string
  category: string
  icon: string
}

const ManualProfileSearchScreen = ({ navigation }: any) => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {

      const response = await apiClient.get("/api/profiles/")
      setProfiles(response.data)
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les profils")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectProfile = async () => {
    if (!selectedProfile) {
      Alert.alert("Erreur", "Veuillez sélectionner un profil")
      return
    }

    setIsSubmitting(true)
    try {

      await apiClient.post("/api/matching/select-profile/", { profile_id: selectedProfile })


      const userResponse = await apiClient.get("/api/auth/profile/")
      dispatch(updateUser(userResponse.data))

      Alert.alert("Succès", "Profil sélectionné avec succès", [
        {
          text: "OK",
          onPress: () => navigation.navigate("AdaptivePath"),
        },
      ])
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sélectionner le profil")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderProfile = ({ item }: { item: Profile }) => {
    const isSelected = selectedProfile === item.id

    return (
      <TouchableOpacity
        style={[styles.profileCard, isSelected && styles.profileCardSelected]}
        onPress={() => setSelectedProfile(item.id)}
      >
        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>{item.name}</Text>
          {isSelected && <Ionicons name="checkmark-circle" size={24} color="#6366f1" />}
        </View>
        <Text style={styles.profileCategory}>{item.category}</Text>
        <Text style={styles.profileDescription}>{item.description}</Text>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tous les profils disponibles</Text>
        <Text style={styles.headerSubtitle}>Sélectionnez le profil qui correspond à vos objectifs</Text>
      </View>

      <FlatList
        data={profiles}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, !selectedProfile && styles.confirmButtonDisabled]}
          onPress={handleSelectProfile}
          disabled={!selectedProfile || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirmer la sélection</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  list: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  profileCardSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#eef2ff",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  profileCategory: {
    fontSize: 14,
    color: "#6366f1",
    marginBottom: 8,
  },
  profileDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  confirmButton: {
    backgroundColor: "#6366f1",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default ManualProfileSearchScreen
