"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"

interface Conversation {
  id: number
  username: string
  first_name: string
  last_name: string
}

const ChatListScreen = ({ navigation }: any) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])


  const fetchConversations = async () => {
    try {

      const response = await apiClient.get("/api/messages/conversations/")
      setConversations(response.data)
    } catch (error: any) {
      console.warn("Impossible de charger les conversations depuis l'API, utilisation de données de test")
      
      // Données de fallback pour les tests
      const fallbackConversations = [
        {
          id: 1,
          username: "testuser1",
          first_name: "Jean",
          last_name: "Dupont"
        },
        {
          id: 2,
          username: "testuser2",
          first_name: "Marie",
          last_name: "Martin"
        }
      ]
      setConversations(fallbackConversations)
    } finally {
      setLoading(false)
    }
  }

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}

      onPress={() => navigation.navigate("ChatDetail", { userId: item.id, userName: item.username })}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color="#6366f1" />
      </View>
      <View style={styles.conversationContent}>
        <Text style={styles.conversationName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.conversationUsername}>@{item.username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
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
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune conversation</Text>
            <TouchableOpacity style={styles.newChatButton} onPress={() => navigation.navigate("UserSearch")}>
              <Text style={styles.newChatButtonText}>Nouvelle conversation</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("UserSearch")}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
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
  conversationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  conversationContent: {
    flex: 1,
    marginLeft: 16,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  conversationUsername: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 24,
  },
  newChatButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newChatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})

export default ChatListScreen
