"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"

interface FAQ {
  id: number
  category: number
  category_name: string
  question: string
  answer: string
}

interface AIResponse {
  question: string
  answer: string
}

const FAQScreen = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [aiMode, setAiMode] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)

  useEffect(() => {
    fetchFAQs()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredFaqs(filtered)
    } else {
      setFilteredFaqs(faqs)
    }
  }, [searchQuery, faqs])


  const fetchFAQs = async () => {
    try {
      const response = await apiClient.get("/api/faqs/")
      console.log("FAQ data loaded:", response.data.length, "items")
      setFaqs(response.data)
      setFilteredFaqs(response.data)
    } catch (error) {
      console.error("Error fetching FAQs:", error)
      Alert.alert("Erreur", "Impossible de charger les FAQ. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const askAI = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Erreur", "Veuillez poser une question")
      return
    }

    setAiLoading(true)
    setAiMode(true)

    try {

      const response = await apiClient.post("/api/faq/ask/", {
        question: searchQuery,
      })
      setAiResponse(response.data)
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'obtenir une réponse de l'IA")
      setAiMode(false)
    } finally {
      setAiLoading(false)
    }
  }

  const renderFAQ = ({ item }: { item: FAQ }) => {
    const isExpanded = expandedId === item.id

    return (
      <TouchableOpacity style={styles.faqCard} onPress={() => setExpandedId(isExpanded ? null : item.id)}>
        <View style={styles.faqHeader}>
          <Text style={styles.category}>{item.category_name}</Text>
          <Text style={styles.question}>{item.question}</Text>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
        </View>
        {isExpanded && <Text style={styles.answer}>{item.answer}</Text>}
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher ou poser une question..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text)
              setAiMode(false)
              setAiResponse(null)
            }}
          />
        </View>
        <TouchableOpacity style={styles.aiButton} onPress={askAI} disabled={aiLoading}>
          {aiLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.aiButtonText}>IA</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {aiMode && aiResponse ? (
        <View style={styles.aiResponseContainer}>
          <View style={styles.aiResponseHeader}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={24} color="#6366f1" />
            </View>
            <Text style={styles.aiResponseTitle}>Réponse de l'IA</Text>
            <TouchableOpacity
              onPress={() => {
                setAiMode(false)
                setAiResponse(null)
              }}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.aiResponseContent}>
            <Text style={styles.aiQuestion}>{aiResponse.question}</Text>
            <Text style={styles.aiAnswer}>{aiResponse.answer}</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredFaqs}
          renderItem={renderFAQ}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="help-circle-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Aucune question trouvée</Text>
              <Text style={styles.emptySubtext}>Essayez de poser votre question à l'IA</Text>
            </View>
          }
        />
      )}
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
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1",
    borderRadius: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  aiButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  faqCard: {
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
  faqHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  category: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "600",
    marginBottom: 4,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  answer: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  aiResponseContainer: {
    flex: 1,
    padding: 16,
  },
  aiResponseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  aiResponseTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  aiResponseContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  aiQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  aiAnswer: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
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
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
})

export default FAQScreen
