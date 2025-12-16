"use client"


import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from "react-native"
// import { Video, ResizeMode } from "expo-av" // Removed to fix deprecation warning
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"

const ChapterScreen = ({ route, navigation }: any) => {
  const { coursePackId, chapterId } = route.params
  const [coursePack, setCoursePack] = useState<any>(null)
  const [currentChapter, setCurrentChapter] = useState<any>(null)
  const [progress, setProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [coursePackId])

  useEffect(() => {
    if (chapterId && coursePack) {
      const chapter = coursePack.chapters.find((ch: any) => ch.id === chapterId)
      setCurrentChapter(chapter)
    } else if (coursePack?.chapters?.length > 0) {
      setCurrentChapter(coursePack.chapters[0])
    }
  }, [chapterId, coursePack])

  const fetchCourseData = async () => {
    try {

      const packResponse = await apiClient.get(`/api/courses/${coursePackId}/`)
      setCoursePack(packResponse.data)


      // Get chapter progress
      const chapters = packResponse.data.chapters || []
      const progressData = []


      // Récupérer les progrès pour chaque chapitre
      for (const chapter of chapters) {
        try {
          const progressResponse = await apiClient.get(`/api/chapters/${chapter.id}/progress/`)
          progressData.push(progressResponse.data)
        } catch (error: any) {
          // Chapter not started yet ou erreur d'autorisation (403)
          if (error.response?.status === 403) {
            // Chapitre non accessible - comportement normal
            progressData.push({
              chapter: chapter.id,
              status: "NOT_STARTED",
              score: 0,
              completed: false
            })
          } else {
            // Autre erreur - logger seulement si nécessaire
            console.warn(`Unexpected error fetching progress for chapter ${chapter.id}:`, error.response?.status || error.message)
            progressData.push({
              chapter: chapter.id,
              status: "NOT_STARTED",
              score: 0,
              completed: false
            })
          }
        }
      }

      setProgress(progressData)
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger le cours")
    } finally {
      setIsLoading(false)
    }
  }

  const getChapterStatus = (chapter: any) => {
    const chapterProgress = progress.find((p: any) => p.chapter === chapter.id)
    return chapterProgress?.status || "LOCKED"
  }

  const handleChapterSelect = (chapter: any) => {
    const status = getChapterStatus(chapter)
    if (status === "LOCKED") {
      Alert.alert("Chapitre verrouillé", "Vous devez d'abord terminer le chapitre précédent")
      return
    }
    setCurrentChapter(chapter)
  }

  const handleStartQuiz = () => {
    navigation.navigate("Quiz", {
      chapterId: currentChapter.id,
      coursePackId,
    })
  }

  const renderChapterItem = ({ item }: any) => {
    const status = getChapterStatus(item)
    const isLocked = status === "LOCKED"
    const isCompleted = status === "COMPLETED"
    const isCurrent = currentChapter?.id === item.id

    return (
      <TouchableOpacity
        style={[styles.chapterItem, isCurrent && styles.chapterItemActive, isLocked && styles.chapterItemLocked]}
        onPress={() => handleChapterSelect(item)}
        disabled={isLocked}
      >
        <View style={styles.chapterNumber}>
          <Text style={styles.chapterNumberText}>{item.order}</Text>
        </View>
        <View style={styles.chapterInfo}>
          <Text style={[styles.chapterItemTitle, isCurrent && styles.chapterItemTitleActive]}>{item.title}</Text>
          {isCompleted && <Ionicons name="checkmark-circle" size={20} color="#10b981" />}
          {isLocked && <Ionicons name="lock-closed" size={20} color="#9ca3af" />}
        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  if (!currentChapter) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Aucun chapitre disponible</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Chapitres</Text>
        <FlatList
          data={coursePack?.chapters || []}
          renderItem={renderChapterItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.chapterTitle}>{currentChapter.title}</Text>


        {currentChapter.video_url && (
          <View style={styles.videoContainer}>
            {/* Video component temporarily disabled to fix expo-av deprecation */}
            {/* <Video
              source={{ uri: currentChapter.video_url }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            /> */}
            <Text style={styles.videoPlaceholder}>Vidéo: {currentChapter.video_url}</Text>
          </View>
        )}

        {currentChapter.content_text && (
          <View style={styles.textContent}>
            <Text style={styles.contentText}>{currentChapter.content_text}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.quizButton} onPress={handleStartQuiz}>
          <Ionicons name="document-text-outline" size={24} color="#fff" />
          <Text style={styles.quizButtonText}>Passer le quiz</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
  },
  sidebar: {
    width: 120,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    padding: 8,
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  chapterItem: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  chapterItemActive: {
    backgroundColor: "#eef2ff",
    borderWidth: 2,
    borderColor: "#6366f1",
  },
  chapterItemLocked: {
    opacity: 0.5,
  },
  chapterNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  chapterNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  chapterInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chapterItemTitle: {
    fontSize: 11,
    color: "#6b7280",
    flex: 1,
  },
  chapterItemTitleActive: {
    color: "#6366f1",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  videoContainer: {
    marginBottom: 24,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },

  video: {
    width: "100%",
    height: 200,
  },
  videoPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    color: "#6b7280",
    fontSize: 16,
    textAlign: "center",
  },
  textContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1f2937",
  },
  quizButton: {
    backgroundColor: "#6366f1",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  quizButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default ChapterScreen
