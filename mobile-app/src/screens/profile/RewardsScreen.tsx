"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"

interface Reward {
  id: number
  name: string
  reward_type: "COURSE_PACK" | "SCHOLARSHIP"
  points_required: number
  course_pack: number | null
  scholarship_amount: string | null
}

const RewardsScreen = () => {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    try {



      const response = await apiClient.get("/api/rewards/")
      setRewards(response.data)
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les récompenses")
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (reward: Reward) => {
    if (!user || user.referral_points < reward.points_required) {
      Alert.alert("Points insuffisants", `Vous avez besoin de ${reward.points_required} points pour cette récompense.`)
      return
    }

    Alert.alert("Confirmation", `Échanger ${reward.points_required} points contre ${reward.name}?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Confirmer",
        onPress: async () => {
          try {


            await apiClient.post(`/api/rewards/${reward.id}/redeem/`)
            Alert.alert("Succès", "Récompense obtenue!")
            fetchRewards()
          } catch (error) {
            Alert.alert("Erreur", "Échec de l'échange")
          }
        },
      },
    ])
  }

  const renderReward = ({ item }: { item: Reward }) => (
    <View style={styles.rewardCard}>
      <View style={styles.rewardIcon}>
        <Ionicons name={item.reward_type === "COURSE_PACK" ? "book" : "school"} size={32} color="#6366f1" />
      </View>
      <View style={styles.rewardContent}>
        <Text style={styles.rewardName}>{item.name}</Text>
        <Text style={styles.rewardType}>{item.reward_type === "COURSE_PACK" ? "Pack de cours" : "Bourse"}</Text>
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={16} color="#fbbf24" />
          <Text style={styles.pointsText}>{item.points_required} points</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.redeemButton,
          user && user.referral_points >= item.points_required
            ? styles.redeemButtonActive
            : styles.redeemButtonDisabled,
        ]}
        onPress={() => handleRedeem(item)}
        disabled={!user || user.referral_points < item.points_required}
      >
        <Text
          style={[
            styles.redeemButtonText,
            user && user.referral_points >= item.points_required
              ? styles.redeemButtonTextActive
              : styles.redeemButtonTextDisabled,
          ]}
        >
          Échanger
        </Text>
      </TouchableOpacity>
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
        <Text style={styles.pointsLabel}>Vos points</Text>
        <View style={styles.pointsBadge}>
          <Ionicons name="star" size={24} color="#fbbf24" />
          <Text style={styles.pointsValue}>{user?.referral_points || 0}</Text>
        </View>
      </View>

      <FlatList
        data={rewards}
        renderItem={renderReward}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune récompense disponible</Text>}
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
    backgroundColor: "#6366f1",
    padding: 24,
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: 14,
    color: "#c7d2fe",
    marginBottom: 8,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  list: {
    padding: 16,
  },
  rewardCard: {
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
  rewardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  rewardContent: {
    flex: 1,
    marginLeft: 16,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  rewardType: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
  },
  redeemButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  redeemButtonActive: {
    backgroundColor: "#6366f1",
  },
  redeemButtonDisabled: {
    backgroundColor: "#f3f4f6",
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  redeemButtonTextActive: {
    color: "#fff",
  },
  redeemButtonTextDisabled: {
    color: "#9ca3af",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
    marginTop: 32,
  },
})

export default RewardsScreen
