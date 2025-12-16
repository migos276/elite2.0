
"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useDispatch, useSelector } from "react-redux"
import { register } from "../../store/slices/authSlice"
import type { RootState } from "../../store"


const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    city: "",
    academic_level: "BEPC",
    referral_code_used: "",
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isValidating, setIsValidating] = useState(false)

  const dispatch = useDispatch()
  const { isLoading } = useSelector((state: RootState) => state.auth)

  // Fonctions de validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const validatePhone = (phone: string) => {
    if (!phone) return true // Optionnel
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    return phoneRegex.test(phone) && phone.length >= 8
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Validation des champs obligatoires
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis"
    } else if (formData.username.length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères"
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Format de téléphone invalide"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert("Erreur", "Veuillez corriger les erreurs dans le formulaire")
      return
    }

    setIsValidating(true)
    try {
      await dispatch(register(formData) as any).unwrap()
      Alert.alert(
        "Succès", 
        "Inscription réussie ! Vous allez être redirigé vers la connexion.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login")
          }
        ]
      )
    } catch (err: any) {
      console.error("Erreur d'inscription:", err)
      let errorMessage = "Échec de l'inscription"
      
      if (err.response?.data) {
        // Gestion des erreurs spécifiques du serveur
        if (err.response.data.username) {
          errorMessage = `Nom d'utilisateur: ${err.response.data.username[0]}`
        } else if (err.response.data.email) {
          errorMessage = `Email: ${err.response.data.email[0]}`
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      Alert.alert("Erreur d'inscription", errorMessage)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez Elite 2.0</Text>


        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.username && styles.inputError]}
            placeholder="Nom d'utilisateur *"
            value={formData.username}
            onChangeText={(text) => {
              setFormData({ ...formData, username: text })
              if (errors.username) {
                setErrors({ ...errors, username: "" })
              }
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text })
              if (errors.email) {
                setErrors({ ...errors, email: "" })
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Mot de passe *"
            value={formData.password}
            onChangeText={(text) => {
              setFormData({ ...formData, password: text })
              if (errors.password) {
                setErrors({ ...errors, password: "" })
              }
            }}
            secureTextEntry
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          {!errors.password && formData.password && (
            <Text style={styles.helperText}>
              Le mot de passe doit contenir au moins 8 caractères
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.first_name && styles.inputError]}
            placeholder="Prénom"
            value={formData.first_name}
            onChangeText={(text) => {
              setFormData({ ...formData, first_name: text })
              if (errors.first_name) {
                setErrors({ ...errors, first_name: "" })
              }
            }}
            autoCapitalize="words"
          />
          {errors.first_name ? <Text style={styles.errorText}>{errors.first_name}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.last_name && styles.inputError]}
            placeholder="Nom"
            value={formData.last_name}
            onChangeText={(text) => {
              setFormData({ ...formData, last_name: text })
              if (errors.last_name) {
                setErrors({ ...errors, last_name: "" })
              }
            }}
            autoCapitalize="words"
          />
          {errors.last_name ? <Text style={styles.errorText}>{errors.last_name}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Téléphone"
            value={formData.phone}
            onChangeText={(text) => {
              setFormData({ ...formData, phone: text })
              if (errors.phone) {
                setErrors({ ...errors, phone: "" })
              }
            }}
            keyboardType="phone-pad"
          />
          {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.city && styles.inputError]}
            placeholder="Ville"
            value={formData.city}
            onChangeText={(text) => {
              setFormData({ ...formData, city: text })
              if (errors.city) {
                setErrors({ ...errors, city: "" })
              }
            }}
            autoCapitalize="words"
          />
          {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Niveau académique</Text>
          <Picker
            selectedValue={formData.academic_level}
            onValueChange={(value) => setFormData({ ...formData, academic_level: value })}
            style={styles.picker}
          >
            <Picker.Item label="BEPC" value="BEPC" />
            <Picker.Item label="BAC" value="BAC" />
            <Picker.Item label="Licence" value="LICENCE" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Code de parrainage (optionnel)"
          value={formData.referral_code_used}
          onChangeText={(text) => setFormData({ ...formData, referral_code_used: text })}
          autoCapitalize="characters"
        />


        <TouchableOpacity 
          style={[styles.button, (isLoading || isValidating) && styles.buttonDisabled]} 
          onPress={handleRegister} 
          disabled={isLoading || isValidating}
        >
          {isLoading || isValidating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>Déjà un compte ? Connectez-vous</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6366f1",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    paddingTop: 8,
    paddingLeft: 16,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    color: "#6366f1",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
})

export default RegisterScreen
