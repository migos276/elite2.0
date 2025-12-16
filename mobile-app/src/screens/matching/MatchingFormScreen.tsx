"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import apiClient from "../../config/api"

const MatchingFormScreen = ({ navigation }: any) => {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])



  const fetchQuestions = async () => {
    try {
      console.log("Chargement des questions de matching...")

      console.log("Questions chargées:", response.data)
      setQuestions(response.data)
    } catch (error: any) {
      console.warn("Impossible de charger les questions depuis l'API:", error.message)
      Alert.alert("Erreur", "Impossible de charger les questions. Utilisation de données de démonstration.")
      
      // Données de fallback pour les tests
      const fallbackQuestions = [
        {
          id: 1,
          text: "Quel est votre niveau d'études actuel ?",
          order: 1,
          answers: [
            { id: 1, text: "Lycée", question: 1 },
            { id: 2, text: "Baccalauréat", question: 1 },
            { id: 3, text: "Bac+1", question: 1 },
            { id: 4, text: "Bac+2", question: 1 },
            { id: 5, text: "Bac+3", question: 1 },
            { id: 6, text: "Bac+4", question: 1 },
            { id: 7, text: "Bac+5 et plus", question: 1 }
          ]
        },
        {
          id: 2,
          text: "Quel domaine vous intéresse le plus ?",
          order: 2,
          answers: [
            { id: 8, text: "Informatique", question: 2 },
            { id: 9, text: "Commerce", question: 2 },
            { id: 10, text: "Marketing", question: 2 },
            { id: 11, text: "Ingénierie", question: 2 },
            { id: 12, text: "Santé", question: 2 },
            { id: 13, text: "Droit", question: 2 }
          ]
        },
        {
          id: 3,
          text: "Combien d'heures par semaine pouvez-vous consacrer à votre formation ?",
          order: 3,
          answers: [
            { id: 14, text: "Moins de 5 heures", question: 3 },
            { id: 15, text: "5-10 heures", question: 3 },
            { id: 16, text: "10-15 heures", question: 3 },
            { id: 17, text: "Plus de 15 heures", question: 3 }
          ]
        }
      ]
      setQuestions(fallbackQuestions)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAnswer = (answerId: number) => {
    const newResponses = [...responses]
    newResponses[currentIndex] = {
      question_id: questions[currentIndex].id,
      answer_id: answerId,
    }
    setResponses(newResponses)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }



  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      console.log("Soumission des réponses:", responses)
      const response = await apiClient.post("/matching/submit/", { responses })
      console.log("Réponse de l'API:", response.data)
      navigation.navigate("MatchingResults", {
        profiles: response.data.recommended_profiles,
      })
    } catch (error: any) {
      console.warn("Impossible de soumettre le formulaire à l'API:", error.message)
      Alert.alert("Erreur", "Impossible de soumettre le formulaire. Utilisation de données de démonstration.")
      
      // Données de fallback pour simuler une réponse réussie
      const fallbackProfiles = [
        {
          id: 1,
          name: "Développeur Web Full-Stack",
          description: "Formation complète en développement web avec les technologies modernes",
          category: "Technologie"
        },
        {
          id: 2,
          name: "Data Scientist", 
          description: "Spécialisation en analyse de données et intelligence artificielle",
          category: "Technologie"
        },
        {
          id: 3,
          name: "Marketing Digital",
          description: "Stratégies digitales, réseaux sociaux et e-commerce",
          category: "Marketing"
        }
      ]
      
      navigation.navigate("MatchingResults", {
        profiles: fallbackProfiles,
      })
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

  const currentQuestion = questions[currentIndex]
  const selectedAnswer = responses[currentIndex]?.answer_id

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          Question {currentIndex + 1} sur {questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.questionText}>{currentQuestion?.text}</Text>

        <View style={styles.answersContainer}>
          {currentQuestion?.answers.map((answer: any) => (
            <TouchableOpacity
              key={answer.id}
              style={[styles.answerButton, selectedAnswer === answer.id && styles.answerButtonSelected]}
              onPress={() => handleSelectAnswer(answer.id)}
            >
              <Text style={[styles.answerText, selectedAnswer === answer.id && styles.answerTextSelected]}>
                {answer.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentIndex > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Text style={styles.navButtonText}>Précédent</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary, !selectedAnswer && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedAnswer || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.navButtonTextPrimary}>
              {currentIndex < questions.length - 1 ? "Suivant" : "Terminer"}
            </Text>
          )}
        </TouchableOpacity>
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
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 24,
  },
  answersContainer: {
    gap: 12,
  },
  answerButton: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  answerButtonSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#eef2ff",
  },
  answerText: {
    fontSize: 16,
    color: "#1f2937",
  },
  answerTextSelected: {
    color: "#6366f1",
    fontWeight: "600",
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
    alignItems: "center",
    backgroundColor: "#e5e7eb",
  },
  navButtonPrimary: {
    backgroundColor: "#6366f1",
  },
  navButtonDisabled: {
    opacity: 0.5,
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

export default MatchingFormScreen
