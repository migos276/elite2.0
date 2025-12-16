"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Linking, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"

interface PhysicalCenter {
  id: number
  name: string
  city: string
  address: string
  phone: string
  email: string
}

const PhysicalCentersScreen = () => {
  const [centers, setCenters] = useState<PhysicalCenter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCenters()
  }, [])

  const fetchCenters = async () => {
    try {

      const response = await apiClient.get("/api/centers/")
      setCenters(response.data)
    } catch (error) {
      console.error("Error fetching centers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`)
  }

  const renderCenter = ({ item }: { item: PhysicalCenter }) => (
    <View style={styles.centerCard}>
      <View style={styles.centerIcon}>
        <Ionicons name="business" size={28} color="#6366f1" />
      </View>
      <View style={styles.centerContent}>
        <Text style={styles.centerName}>{item.name}</Text>
        <View style={styles.centerDetail}>
          <Ionicons name="location" size={16} color="#6b7280" />
          <Text style={styles.centerDetailText}>
            {item.address}, {item.city}
          </Text>
        </View>
        <View style={styles.centerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(item.phone)}>
            <Ionicons name="call" size={18} color="#6366f1" />
            <Text style={styles.actionButtonText}>{item.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEmail(item.email)}>
            <Ionicons name="mail" size={18} color="#6366f1" />
            <Text style={styles.actionButtonText}>{item.email}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={48} color="#10b981" />
        <Text style={styles.headerTitle}>Félicitations!</Text>
        <Text style={styles.headerSubtitle}>
          Vous avez terminé votre formation. Rendez-vous dans un centre pour obtenir votre diplôme.
        </Text>
      </View>

      <FlatList
        data={centers}
        renderItem={renderCenter}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun centre disponible</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  list: {
    padding: 16,
  },
  centerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  centerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    flex: 1,
    marginLeft: 16,
  },
  centerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  centerDetail: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 12,
  },
  centerDetailText: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
  },
  centerActions: {
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
  },
})

export default PhysicalCentersScreen
