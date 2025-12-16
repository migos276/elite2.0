import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import courseReducer from "./slices/courseSlice"
import chatReducer from "./slices/chatSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    chat: chatReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
