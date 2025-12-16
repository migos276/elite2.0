"use client"

import React, { useEffect } from "react"

import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { useDispatch, useSelector } from "react-redux"
import { loadStoredAuth } from "../store/slices/authSlice"
import type { RootState } from "../store"

import AuthNavigator from "./AuthNavigator"
import MainNavigator from "./MainNavigator"
import { ActivityIndicator, View, Text, TouchableOpacity } from "react-native"

const Stack = createStackNavigator()


const AppNavigator = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth)
  const [initializing, setInitializing] = React.useState(true)

  useEffect(() => {
    const loadAuth = async () => {
      try {
        await dispatch(loadStoredAuth() as any)
      } catch (error) {
        console.log("ℹ️ Erreur lors du chargement initial - traitement normal:", error)
      } finally {
        setInitializing(false)
      }
    }
    
    loadAuth()
  }, [dispatch])


  if (initializing || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 16, color: "#64748b", fontSize: 14 }}>
          Chargement...
        </Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}

export default AppNavigator
