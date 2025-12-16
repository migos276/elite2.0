"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"

interface JobOffer {
  id: number
  title: string
  company: string
  location: string
  description: string
  requirements: string
  salary_range: string
  application_url: string
  posted_date: string
  expiry_date: string
}

const JobOffersScreen = () => {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null)

  useEffect(() => {
    fetchJobOffers()
  }, [])


  const fetchJobOffers = async () => {
    try {
      console.log("📄 Tentative de chargement des offres d'emploi...")
      const response = await apiClient.get("/api/jobs/")
      console.log("✅ Réponse API jobs:", response.data.count, "offres trouvées")
      
      // L'API retourne une structure paginée avec 'results'
      const jobData = response.data.results || response.data || []
      setJobOffers(jobData)
      
      console.log("✅ Offres d'emploi chargées:", jobData.length)

    } catch (error: any) {
      console.error("❌ Erreur lors du chargement des offres:", error.response?.data || error.message)
      setJobOffers([])
    } finally {
      setLoading(false)
    }
  }

  const handleApply = (url: string) => {
    Linking.openURL(url)
  }

  const renderJobCard = ({ item }: { item: JobOffer }) => (
    <TouchableOpacity style={styles.jobCard} onPress={() => setSelectedJob(selectedJob?.id === item.id ? null : item)}>
      <View style={styles.jobHeader}>
        <View style={styles.jobIcon}>
          <Ionicons name="briefcase" size={24} color="#6366f1" />
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobCompany}>{item.company}</Text>
          <View style={styles.jobMeta}>
            <Ionicons name="location" size={14} color="#6b7280" />
            <Text style={styles.jobMetaText}>{item.location}</Text>
          </View>
        </View>
      </View>

      {selectedJob?.id === item.id && (
        <View style={styles.jobDetails}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.jobDescription}>{item.description}</Text>

          <Text style={styles.sectionTitle}>Exigences</Text>
          <Text style={styles.jobDescription}>{item.requirements}</Text>

          {item.salary_range && (
            <>
              <Text style={styles.sectionTitle}>Salaire</Text>
              <Text style={styles.jobDescription}>{item.salary_range}</Text>
            </>
          )}

          <TouchableOpacity style={styles.applyButton} onPress={() => handleApply(item.application_url)}>
            <Text style={styles.applyButtonText}>Postuler</Text>
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
        data={jobOffers}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune offre d'emploi disponible</Text>
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
  jobCard: {
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
  jobHeader: {
    flexDirection: "row",
  },
  jobIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  jobInfo: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  jobMetaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  jobDetails: {
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
  jobDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  applyButtonText: {
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

export default JobOffersScreen
