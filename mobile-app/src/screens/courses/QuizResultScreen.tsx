"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import apiClient from "../../config/api"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"

const QuizResultScreen = ({ route, navigation }: any) => {
  const {
    score,
    passed,
    can_use_referral_option,
    next_chapter_id,
    chapterId,
    coursePackId,
    referrals_needed,
    current_referrals,
  } = route.params
  const [isProcessing, setIsProcessing] = useState(false)
  const user = useSelector((state: RootState) => state.auth.user)

  const getScoreColor = () => {
    if (score >= 14) return "#10b981"
    if (score >= 10) return "#f59e0b"
    return "#ef4444"
  }

  const getScoreIcon = () => {
    if (score >= 14) return "checkmark-circle"
    if (score >= 10) return "warning"
    return "close-circle"
  }

  const getScoreMessage = () => {
    if (score >= 14) return "Félicitations ! Vous avez réussi le quiz."
    if (score >= 10) return "Score insuffisant mais vous avez des options."
    return "Vous devez recommencer le chapitre."
  }

  const handleNextChapter = () => {
    if (next_chapter_id) {
      navigation.replace("Chapter", {
        coursePackId,
        chapterId: next_chapter_id,
      })
    } else {
      Alert.alert("Formation terminée !", "Consultez les centres physiques pour obtenir votre diplôme.", [
        {
          text: "Voir les centres",
          onPress: () => navigation.navigate("PhysicalCenters"),
        },
      ])
    }
  }

  const handleRetry = () => {
    navigation.replace("Chapter", { coursePackId, chapterId })
  }

  const handleReferralBypass = async () => {
    if (!user || user.referrals < (referrals_needed || 4)) {
      Alert.alert(
        "Parrainages insuffisants",
        `Vous devez parrainer ${referrals_needed || 4} membres pour débloquer cette option. Vous avez actuellement ${current_referrals || 0} parrainages.`,
        [
          {
            text: "Partager mon code",
            onPress: () => navigation.navigate("Profile", { screen: "ProfileMain" }),
          },
          { text: "Annuler" },
        ],
      )
      return
    }

    setIsProcessing(true)
    try {
      const response = await apiClient.post(`/api/use-referral-bypass/${chapterId}/`)
      Alert.alert("Succès", "Chapitre débloqué grâce à vos parrainages !", [
        {
          text: "OK",
          onPress: () => {
            if (response.data.next_chapter_id) {
              navigation.replace("Chapter", {
                coursePackId,
                chapterId: response.data.next_chapter_id,
              })
            }
          },
        },
      ])
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'utiliser l'option parrainage")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShareReferral = () => {
    navigation.navigate("Profile", { screen: "ProfileMain" })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={getScoreIcon()} size={80} color={getScoreColor()} />
        <Text style={styles.scoreTitle}>Votre score</Text>
        <Text style={[styles.scoreValue, { color: getScoreColor() }]}>{score.toFixed(1)} / 20</Text>
        <Text style={styles.message}>{getScoreMessage()}</Text>
      </View>

      <View style={styles.content}>
        {passed && (
          <View style={styles.successCard}>
            <Ionicons name="trophy" size={48} color="#10b981" />
            <Text style={styles.successTitle}>Chapitre réussi !</Text>
            <Text style={styles.successText}>Vous pouvez passer au chapitre suivant.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleNextChapter}>
              <Text style={styles.primaryButtonText}>
                {next_chapter_id ? "Chapitre suivant" : "Voir les centres physiques"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {can_use_referral_option && (
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>Choisissez une option</Text>
            <Text style={styles.optionsSubtitle}>
              Votre score est entre 10 et 14. Vous pouvez soit parrainer 4 membres pour débloquer le chapitre suivant,
              soit recommencer.
            </Text>

            <TouchableOpacity style={styles.referralButton} onPress={handleReferralBypass} disabled={isProcessing}>
              <Ionicons name="people" size={24} color="#fff" />
              <View style={styles.referralButtonContent}>
                <Text style={styles.referralButtonText}>Parrainer 4 membres</Text>
                <Text style={styles.referralButtonSubtext}>
                  {current_referrals || 0} / {referrals_needed || 4} parrainages
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={handleShareReferral}>
              <Ionicons name="share-social-outline" size={20} color="#6366f1" />
              <Text style={styles.shareButtonText}>Partager mon code de parrainage</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="refresh" size={20} color="#1f2937" />
              <Text style={styles.retryButtonText}>Recommencer le chapitre</Text>
            </TouchableOpacity>
          </View>
        )}

        {!passed && !can_use_referral_option && (
          <View style={styles.failCard}>
            <Ionicons name="refresh-circle" size={48} color="#ef4444" />
            <Text style={styles.failTitle}>Score insuffisant</Text>
            <Text style={styles.failText}>
              Votre score est inférieur à 10/20. Vous devez recommencer le chapitre pour mieux comprendre le contenu.
            </Text>
            <TouchableOpacity style={styles.retryButtonPrimary} onPress={handleRetry}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Recommencer le chapitre</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scoreTitle: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 8,
  },
  message: {
    fontSize: 16,
    color: "#1f2937",
    textAlign: "center",
    marginTop: 12,
  },
  content: {
    padding: 16,
  },
  successCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b981",
    marginTop: 16,
  },
  successText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  optionsCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  optionsSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 24,
  },
  referralButton: {
    backgroundColor: "#ec4899",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  referralButtonContent: {
    flex: 1,
  },
  referralButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  referralButtonSubtext: {
    color: "#fce7f3",
    fontSize: 12,
    marginTop: 2,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 8,
  },
  shareButtonText: {
    color: "#6366f1",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    gap: 8,
  },
  retryButtonText: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "600",
  },
  failCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  failTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ef4444",
    marginTop: 16,
  },
  failText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButtonPrimary: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default QuizResultScreen
