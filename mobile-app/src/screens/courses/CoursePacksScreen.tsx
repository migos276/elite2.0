"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"

const CoursePacksScreen = ({ navigation }: any) => {
  const [packs, setPacks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPack, setSelectedPack] = useState<any>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    fetchCoursePacks()
  }, [])


  const fetchCoursePacks = async () => {
    try {
      const response = await apiClient.get("/api/courses/")
      setPacks(response.data.results || response.data)
    } catch (error: any) {
      console.error("Erreur lors du chargement des packs:", error.response?.data || error.message)
      Alert.alert("Erreur", "Impossible de charger les packs de cours")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = (pack: any) => {
    if (pack.is_purchased) {
      navigation.navigate("Chapter", { coursePackId: pack.id })
      return
    }
    setSelectedPack(pack)
    setShowPaymentModal(true)
  }


  const processPurchase = async (paymentMethod: string) => {
    setIsPurchasing(true)
    try {
      await apiClient.post(`/api/courses/${selectedPack.id}/purchase/`, {
        payment_method: paymentMethod,
      })
      Alert.alert("Succès", "Achat effectué avec succès !", [
        {
          text: "OK",
          onPress: () => {
            setShowPaymentModal(false)
            navigation.navigate("Chapter", { coursePackId: selectedPack.id })
          },
        },
      ])
    } catch (error: any) {
      console.error("Erreur lors de l'achat:", error.response?.data || error.message)
      Alert.alert("Erreur", "Échec du paiement. Veuillez réessayer.")
    } finally {
      setIsPurchasing(false)
    }
  }

  const renderPackItem = ({ item }: any) => (
    <TouchableOpacity style={styles.packCard} onPress={() => handlePurchase(item)}>
      {item.thumbnail && <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />}
      <View style={styles.packContent}>
        <View style={styles.packHeader}>
          <Text style={styles.packTitle}>{item.title}</Text>
          {item.is_purchased && (
            <View style={styles.purchasedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
          )}
        </View>
        <Text style={styles.packDomain}>{item.domain}</Text>
        <Text style={styles.packDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.packFooter}>
          <Text style={styles.price}>{item.price} FCFA</Text>
          <Text style={styles.chapterCount}>{item.chapters?.length || 0} chapitres</Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, item.is_purchased && styles.actionButtonPurchased]}
          onPress={() => handlePurchase(item)}
        >
          <Text style={styles.actionButtonText}>{item.is_purchased ? "Accéder au cours" : "Acheter maintenant"}</Text>
          <Ionicons name={item.is_purchased ? "arrow-forward" : "cart"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={packs}
        renderItem={renderPackItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir le mode de paiement</Text>
            <Text style={styles.modalSubtitle}>{selectedPack?.title}</Text>
            <Text style={styles.modalPrice}>{selectedPack?.price} FCFA</Text>

            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => processPurchase("Mobile Money")}
              disabled={isPurchasing}
            >
              <Ionicons name="phone-portrait-outline" size={24} color="#6366f1" />
              <Text style={styles.paymentOptionText}>Mobile Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => processPurchase("Stripe")}
              disabled={isPurchasing}
            >
              <Ionicons name="card-outline" size={24} color="#6366f1" />
              <Text style={styles.paymentOptionText}>Carte bancaire</Text>
            </TouchableOpacity>

            {isPurchasing && <ActivityIndicator size="large" color="#6366f1" style={styles.purchasingIndicator} />}

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  packCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  thumbnail: {
    width: "100%",
    height: 160,
    backgroundColor: "#e5e7eb",
  },
  packContent: {
    padding: 16,
  },
  packHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  packTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  purchasedBadge: {
    marginLeft: 8,
  },
  packDomain: {
    fontSize: 14,
    color: "#6366f1",
    marginBottom: 8,
  },
  packDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  packFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10b981",
  },
  chapterCount: {
    fontSize: 12,
    color: "#9ca3af",
  },
  actionButton: {
    backgroundColor: "#6366f1",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionButtonPurchased: {
    backgroundColor: "#10b981",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 4,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 12,
    gap: 16,
  },
  paymentOptionText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
  },
  purchasingIndicator: {
    marginVertical: 16,
  },
  cancelButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6b7280",
  },
})

export default CoursePacksScreen
