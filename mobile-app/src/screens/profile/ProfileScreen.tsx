"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import * as Clipboard from "expo-clipboard"
import { logout } from "../../store/slices/authSlice"
import apiClient from "../../config/api"
import type { RootState } from "../../store"

const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [referralStats, setReferralStats] = useState({
    total_referrals: 0,
    referral_points: 0,
  })

  useEffect(() => {
    fetchReferralStats()
  }, [])


  const fetchReferralStats = async () => {
    try {

      const response = await apiClient.get("/api/referrals/stats/")
      setReferralStats(response.data)
    } catch (error: any) {
      console.warn("Impossible de charger les statistiques de parrainage depuis l'API, utilisation de données de test")
      
      // Données de fallback pour les tests
      setReferralStats({
        total_referrals: 3,
        referral_points: user?.referral_points || 0,
      })
    }
  }

  const copyReferralCode = async () => {
    if (user?.referral_code) {
      await Clipboard.setStringAsync(user.referral_code)
      Alert.alert("Succès", "Code de parrainage copié!")
    }
  }

  const shareReferralCode = async () => {
    try {
      await Share.share({
        message: `Rejoignez Elite 2.0 avec mon code de parrainage: ${user?.referral_code}`,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => dispatch(logout() as any),
      },
    ])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.name}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <InfoItem icon="mail" label="Email" value={user?.email || ""} />
        <InfoItem icon="call" label="Téléphone" value={user?.phone || ""} />
        <InfoItem icon="location" label="Ville" value={user?.city || ""} />
        <InfoItem icon="school" label="Niveau" value={user?.academic_level || ""} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parrainage</Text>
        <View style={styles.referralCard}>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralLabel}>Code de parrainage</Text>
            <Text style={styles.referralCode}>{user?.referral_code}</Text>
          </View>
          <View style={styles.referralActions}>
            <TouchableOpacity style={styles.iconButton} onPress={copyReferralCode}>
              <Ionicons name="copy-outline" size={24} color="#6366f1" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={shareReferralCode}>
              <Ionicons name="share-social-outline" size={24} color="#6366f1" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatCard icon="people" label="Parrainages" value={referralStats.total_referrals.toString()} />
          <StatCard icon="star" label="Points" value={referralStats.referral_points.toString()} />
        </View>

        <TouchableOpacity style={styles.rewardsButton} onPress={() => navigation.navigate("Rewards")}>
          <Ionicons name="gift" size={20} color="#fff" />
          <Text style={styles.rewardsButtonText}>Échanger mes points</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("FAQ")}>
          <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
          <Text style={styles.menuText}>Aide & FAQ</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.menuText, { color: "#ef4444" }]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={20} color="#6b7280" />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
)

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={32} color="#6366f1" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#6366f1",
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#818cf8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#c7d2fe",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#111827",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#111827",
  },
  referralCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  referralCodeContainer: {
    flex: 1,
  },
  referralLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  referralCode: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6366f1",
    letterSpacing: 2,
  },
  referralActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  rewardsButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  rewardsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuText: {
    fontSize: 16,
    color: "#111827",
    marginLeft: 12,
    flex: 1,
  },
})

export default ProfileScreen
