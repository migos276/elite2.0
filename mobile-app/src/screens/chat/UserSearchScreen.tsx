"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"

interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
}

const UserSearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await apiClient.get(`/users/search/?q=${searchQuery}`)
      setUsers(response.data)
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectUser = (user: User) => {
    navigation.navigate("Chat", {
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
    })
  }

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleSelectUser(item)}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color="#6366f1" />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Rechercher</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          searchQuery ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Recherchez un utilisateur pour commencer une conversation</Text>
            </View>
          )
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
  searchButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  userCard: {
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
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  username: {
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
    textAlign: "center",
  },
})

export default UserSearchScreen
