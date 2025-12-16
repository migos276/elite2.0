import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import AsyncStorage from "@react-native-async-storage/async-storage"
import apiClient from "../../config/api"

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone: string
  city: string
  academic_level: string
  referral_code: string
  referral_points: number
  has_completed_matching: boolean
  selected_profile: number | null
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}


export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }) => {
    try {
      console.log("🔐 Tentative de connexion avec:", username)
      
      const response = await apiClient.post("/api/auth/login/", { username, password })
      const { access, refresh } = response.data
      
      console.log("✅ Token reçu:", access ? "OUI" : "NON")
      
      // Stocker les tokens
      await AsyncStorage.setItem("auth_token", access)
      await AsyncStorage.setItem("refresh_token", refresh)
      
      // Récupérer le profil utilisateur
      const userResponse = await apiClient.get("/api/auth/profile/")
      const userData = userResponse.data
      
      console.log("✅ Profil récupéré:", userData.username)
      
      await AsyncStorage.setItem("user_data", JSON.stringify(userData))
      
      return { token: access, user: userData }
    } catch (error: any) {
      console.error("❌ Erreur de connexion:", error.response?.data || error.message)
      throw error
    }
  },
)



interface RegisterError {
  message: string
  originalError: any
}

export const register = createAsyncThunk<any, any, { rejectValue: RegisterError }>(
  "auth/register", 
  async (userData: any, { rejectWithValue }) => {
    try {
      console.log("📝 Tentative d'inscription avec:", userData.username, userData.email)
      
      const response = await apiClient.post("/api/auth/register/", userData)
      console.log("✅ Inscription réussie:", response.status)
      
      return response.data
    } catch (error: any) {
      console.error("❌ Erreur d'inscription:", error.response?.data || error.message)
      
      // Transformer l'erreur en format plus utilisable
      let errorMessage = "Échec de l'inscription"
      
      if (error.response?.data) {
        // Gestion des erreurs spécifiques de Django REST
        const data = error.response.data
        
        if (data.username && Array.isArray(data.username)) {
          errorMessage = `Nom d'utilisateur: ${data.username[0]}`
        } else if (data.email && Array.isArray(data.email)) {
          errorMessage = `Email: ${data.email[0]}`
        } else if (data.password && Array.isArray(data.password)) {
          errorMessage = `Mot de passe: ${data.password[0]}`
        } else if (data.detail) {
          errorMessage = data.detail
        } else if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          errorMessage = data.non_field_errors[0]
        } else {
          errorMessage = "Erreur de validation des données"
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return rejectWithValue({
        message: errorMessage,
        originalError: error
      })
    }
  }
)



export const loadStoredAuth = createAsyncThunk("auth/loadStored", async () => {
  try {
    console.log("🔄 Chargement de l'authentification stockée...")
    
    const token = await AsyncStorage.getItem("auth_token")
    const userData = await AsyncStorage.getItem("user_data")
    
    console.log("📱 Token trouvé:", token ? "OUI" : "NON")
    console.log("👤 Données utilisateur trouvées:", userData ? "OUI" : "NON")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log("✅ Authentification chargée pour:", parsedUser.username)
        return { token, user: parsedUser }
      } catch (parseError) {
        console.warn("⚠️ Erreur lors du parsing des données utilisateur:", parseError)
        // Nettoyer les données corrompues
        await AsyncStorage.removeItem("auth_token")
        await AsyncStorage.removeItem("user_data")
      }
    }
    
    console.log("ℹ️ Aucune authentification stockée - état initial")
    // Retourner un état vide au lieu de lancer une erreur
    return { token: null, user: null }
  } catch (error: any) {
    console.error("❌ Erreur lors du chargement de l'auth:", error.message)
    // En cas d'erreur, retourner un état vide
    return { token: null, user: null }
  }
})

export const logout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("auth_token")
  await AsyncStorage.removeItem("user_data")
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Login failed"
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false
      })

      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        // Utiliser l'erreur formatée du thunk si disponible
        const errorMessage = action.payload?.message || action.error.message || "Registration failed"
        state.error = errorMessage
        console.log("❌ Inscription échouée:", errorMessage)
      })

      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = !!(action.payload.token && action.payload.user)
        state.isLoading = false
        state.error = null
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        // En cas d'erreur lors du chargement, traiter comme un état vide
        state.token = null
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null // Pas d'erreur car c'est un état normal au premier démarrage
        console.log("ℹ️ Chargement de l'auth rejeté - état initial appliqué")
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
  },
})

export const { updateUser } = authSlice.actions
export default authSlice.reducer
