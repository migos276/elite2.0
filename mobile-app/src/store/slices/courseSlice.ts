import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import apiClient from "../../config/api"

interface CourseState {
  courses: any[]
  currentChapter: any
  isLoading: boolean
  error: string | null
}

const initialState: CourseState = {
  courses: [],
  currentChapter: null,
  isLoading: false,
  error: null,
}


export const fetchUserCourses = createAsyncThunk("course/fetchUserCourses", async () => {
  try {
    console.log("📚 Chargement des cours utilisateur...")
    
    const response = await apiClient.get("/api/courses/my-courses/")
    const courses = response.data
    
    console.log("✅ Cours récupérés:", courses.length)
    console.log("📖 Détails des cours:", courses.map((c: any) => `${c.title} (${c.id})`))
    
    return courses
  } catch (error: any) {
    console.error("❌ Erreur lors du chargement des cours:", error.response?.data || error.message)
    throw error
  }
})

export const purchaseCoursePack = createAsyncThunk(
  "course/purchasePack",
  async ({ packId, paymentMethod }: { packId: number; paymentMethod: string }) => {
    const response = await apiClient.post(`/api/courses/${packId}/purchase/`, {
      payment_method: paymentMethod,
    })
    return response.data
  },
)

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCourses.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchUserCourses.fulfilled, (state, action) => {
        state.isLoading = false
        state.courses = action.payload
      })
      .addCase(fetchUserCourses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch courses"
      })
  },
})

export default courseSlice.reducer
