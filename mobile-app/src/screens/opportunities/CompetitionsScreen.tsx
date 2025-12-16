"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"

interface Competition {
  id: number
  title: string
  organizer: string
  description: string
  eligibility: string
  registration_url: string
  registration_deadline: string
  exam_date: string
}

const CompetitionsScreen = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)

  useEffect(() => {
    fetchCompetitions()
  }, [])



  const fetchCompetitions = async () => {
    try {
      const response = await apiClient.get("/api/competitions/")
      // L'API Django retourne les données dans response.data.results (format paginé)
      console.log('API Response structure:', response.data) // Debug log
      const competitionsData = response.data.results || response.data
      setCompetitions(competitionsData)
      console.log('Competitions loaded:', competitionsData.length) // Debug log
    } catch (error) {
      console.error("Error fetching competitions:", error)
      setCompetitions([]) // S'assurer que la liste est vide en cas d'erreur
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = (url: string) => {
    Linking.openURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const renderCompetitionCard = ({ item }: { item: Competition }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedCompetition(selectedCompetition?.id === item.id ? null : item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.icon}>
          <Ionicons name="trophy" size={24} color="#fbbf24" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.organizer}>{item.organizer}</Text>
        </View>
      </View>

      {selectedCompetition?.id === item.id && (
        <View style={styles.details}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>

          <Text style={styles.sectionTitle}>Éligibilité</Text>
          <Text style={styles.description}>{item.eligibility}</Text>

          <View style={styles.dates}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar" size={16} color="#6b7280" />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Inscription avant</Text>
                <Text style={styles.dateValue}>{formatDate(item.registration_deadline)}</Text>
              </View>
            </View>

            <View style={styles.dateItem}>
              <Ionicons name="calendar" size={16} color="#6b7280" />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Date examen</Text>
                <Text style={styles.dateValue}>{formatDate(item.exam_date)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={() => handleRegister(item.registration_url)}>
            <Text style={styles.registerButtonText}>S'inscrire</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
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
      <FlatList
        data={competitions}
        renderItem={renderCompetitionCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun concours disponible</Text>
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  organizer: {
    fontSize: 14,
    color: "#6b7280",
  },
  details: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  dates: {
    marginTop: 16,
    gap: 12,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  registerButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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

export default CompetitionsScreen
