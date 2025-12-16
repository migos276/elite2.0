import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import apiClient from "../../config/api"

interface ChatState {
  conversations: any[]
  messages: any[]
  isLoading: boolean
  error: string | null
}

const initialState: ChatState = {
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,
}

export const fetchConversations = createAsyncThunk("chat/fetchConversations", async () => {
  const response = await apiClient.get("/chat/conversations/")
  return response.data
})

export const fetchMessagesWithUser = createAsyncThunk("chat/fetchMessages", async (userId: number) => {
  const response = await apiClient.get(`/chat/with_user/?user_id=${userId}`)
  return response.data
})

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ recipientId, message }: { recipientId: number; message: string }) => {
    const response = await apiClient.post("/chat/", {
      recipient: recipientId,
      message,
    })
    return response.data
  },
)

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload
      })
      .addCase(fetchMessagesWithUser.fulfilled, (state, action) => {
        state.messages = action.payload
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload)
      })
  },
})

export const { addMessage } = chatSlice.actions
export default chatSlice.reducer
