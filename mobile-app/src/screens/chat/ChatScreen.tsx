"use client"

import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSelector } from "react-redux"
import apiClient from "../../config/api"
import type { RootState } from "../../store"

interface Message {
  id: number
  sender: number
  recipient: number
  message: string
  is_read: boolean
  created_at: string
}

const ChatScreen = ({ route }: any) => {
  const { userId, userName } = route.params
  const { user } = useSelector((state: RootState) => state.auth)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [userId])

  const fetchMessages = async () => {
    try {

      const response = await apiClient.get(`/api/messages/with_user/?user_id=${userId}`)
      setMessages(response.data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {

      await apiClient.post("/api/messages/", {
        recipient: userId,
        message: newMessage.trim(),
      })
      setNewMessage("")
      fetchMessages()
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender === user?.id

    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble]}>
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun message</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Votre message..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessage: {
    alignItems: "flex-end",
  },
  theirMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 12,
  },
  myMessageBubble: {
    backgroundColor: "#6366f1",
  },
  theirMessageBubble: {
    backgroundColor: "#fff",
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#111827",
  },
  messageTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
})

export default ChatScreen
