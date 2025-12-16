"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import apiClient from "../../config/api"

const QuizScreen = ({ route, navigation }: any) => {
  const { chapterId, coursePackId } = route.params
  const [quiz, setQuiz] = useState<any>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [])


  const fetchQuiz = async () => {
    try {
      const response = await apiClient.get(`/api/chapters/${chapterId}/quiz/`)
      setQuiz(response.data)
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger le quiz")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectChoice = (questionId: number, choiceId: number) => {
    setAnswers({ ...answers, [questionId]: choiceId })
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    const unansweredCount = quiz.questions.filter((q: any) => !answers[q.id]).length
    if (unansweredCount > 0) {
      Alert.alert("Attention", `Il vous reste ${unansweredCount} question(s) sans réponse. Voulez-vous continuer ?`, [
        { text: "Non", style: "cancel" },
        { text: "Oui", onPress: submitQuiz },
      ])
    } else {
      submitQuiz()
    }
  }


  const submitQuiz = async () => {
    setIsSubmitting(true)
    try {
      const response = await apiClient.post(`/api/chapters/${chapterId}/quiz/submit/`, { answers })
      navigation.replace("QuizResult", {
        ...response.data,
        chapterId,
        coursePackId,
      })
    } catch (error) {
      Alert.alert("Erreur", "Impossible de soumettre le quiz")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  if (!quiz) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Quiz non disponible</Text>
      </View>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const selectedChoice = answers[currentQuestion?.id]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          Question {currentQuestionIndex + 1} sur {quiz.questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          <Text style={styles.points}>{currentQuestion.points} point(s)</Text>
        </View>

        <View style={styles.choicesContainer}>
          {currentQuestion.choices.map((choice: any) => (
            <TouchableOpacity
              key={choice.id}
              style={[styles.choiceButton, selectedChoice === choice.id && styles.choiceButtonSelected]}
              onPress={() => handleSelectChoice(currentQuestion.id, choice.id)}
            >
              <View style={[styles.radio, selectedChoice === choice.id && styles.radioSelected]}>
                {selectedChoice === choice.id && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.choiceText, selectedChoice === choice.id && styles.choiceTextSelected]}>
                {choice.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.answeredQuestions}>
          <Text style={styles.answeredText}>
            Questions répondues: {Object.keys(answers).length} / {quiz.questions.length}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Ionicons name="chevron-back" size={20} color="#1f2937" />
            <Text style={styles.navButtonText}>Précédent</Text>
          </TouchableOpacity>
        )}

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary]} onPress={handleNext}>
            <Text style={styles.navButtonTextPrimary}>Suivant</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.navButtonTextPrimary}>Terminer</Text>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  progress: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 26,
  },
  points: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  choiceButtonSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#eef2ff",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#6366f1",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6366f1",
  },
  choiceText: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  choiceTextSelected: {
    color: "#6366f1",
    fontWeight: "600",
  },
  answeredQuestions: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
  },
  answeredText: {
    fontSize: 14,
    color: "#6b7280",
  },
  navigationButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e5e7eb",
  },
  navButtonPrimary: {
    backgroundColor: "#6366f1",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})

export default QuizScreen
