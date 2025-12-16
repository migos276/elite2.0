"use client"


import { useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import { Ionicons } from "@expo/vector-icons"
import NetworkDebug from "../../components/NetworkDebug"

const HomeScreen = ({ navigation }: any) => {
  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    if (user && !user.has_completed_matching) {
      navigation.navigate("MatchingForm")
    }
  }, [user])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenue, {user?.first_name || user?.username}!</Text>
        <Text style={styles.subtitle}>Continuez votre parcours d'apprentissage</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#6366f1" }]}
          onPress={() => navigation.navigate("Courses", { screen: "CourseList" })}
        >
          <Ionicons name="book-outline" size={32} color="#fff" />
          <Text style={styles.cardTitle}>Mes cours</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#8b5cf6" }]}
          onPress={() => navigation.navigate("Courses", { screen: "CoursePacks" })}
        >
          <Ionicons name="cart-outline" size={32} color="#fff" />
          <Text style={styles.cardTitle}>Acheter un pack</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#ec4899" }]}
          onPress={() => navigation.navigate("Profile", { screen: "ProfileMain" })}
        >
          <Ionicons name="people-outline" size={32} color="#fff" />
          <Text style={styles.cardTitle}>Parrainage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#10b981" }]}
          onPress={() => navigation.navigate("Jobs", { screen: "JobOffers" })}
        >
          <Ionicons name="briefcase-outline" size={32} color="#fff" />
          <Text style={styles.cardTitle}>Emplois</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#f59e0b" }]}
          onPress={() => navigation.navigate("Jobs", { screen: "Competitions" })}
        >
          <Ionicons name="trophy-outline" size={32} color="#fff" />
          <Text style={styles.cardTitle}>Concours</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#3b82f6" }]}
          onPress={() => navigation.navigate("FAQ")}
        >
          <Ionicons name="help-circle-outline" size={32} color="#fff" />
          <Text style={styles.cardTitle}>FAQ & Aide</Text>
        </TouchableOpacity>
      </View>


      {user?.selected_profile && (
        <TouchableOpacity style={styles.pathCard} onPress={() => navigation.navigate("AdaptivePath")}>
          <Ionicons name="map-outline" size={24} color="#6366f1" />
          <Text style={styles.pathCardText}>Voir mon parcours adaptatif</Text>
        </TouchableOpacity>
      )}

      {/* Section débogage pour les développeurs */}
      {__DEV__ && (
        <TouchableOpacity 
          style={[styles.pathCard, { backgroundColor: "#fee2e2", borderColor: "#ef4444" }]} 
          onPress={() => navigation.navigate("NetworkDebug")}
        >
          <Ionicons name="bug-outline" size={24} color="#ef4444" />
          <Text style={[styles.pathCardText, { color: "#ef4444" }]}>Débogage Réseau</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
  },
  card: {
    width: "47%",
    margin: "1.5%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  pathCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6366f1",
  },
  pathCardText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#6366f1",
  },
})

export default HomeScreen
