"use client"

import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import { useSelector } from "react-redux"
import type { RootState } from "../store"


import HomeScreen from "../screens/home/HomeScreen"
import MatchingFormScreen from "../screens/matching/MatchingFormScreen"
import MatchingResultsScreen from "../screens/matching/MatchingResultsScreen"
import ManualProfileSearchScreen from "../screens/matching/ManualProfileSearchScreen"
import AdaptivePathScreen from "../screens/matching/AdaptivePathScreen"
import CourseListScreen from "../screens/courses/CourseListScreen"
import CoursePacksScreen from "../screens/courses/CoursePacksScreen"
import ChapterScreen from "../screens/courses/ChapterScreen"
import QuizScreen from "../screens/courses/QuizScreen"
import QuizResultScreen from "../screens/courses/QuizResultScreen"
import ChatListScreen from "../screens/chat/ChatListScreen"
import ChatScreen from "../screens/chat/ChatScreen"
import UserSearchScreen from "../screens/chat/UserSearchScreen"
import JobOffersScreen from "../screens/opportunities/JobOffersScreen"
import CompetitionsScreen from "../screens/opportunities/CompetitionsScreen"


import ProfileScreen from "../screens/profile/ProfileScreen"
import RewardsScreen from "../screens/profile/RewardsScreen"
import FAQScreen from "../screens/faq/FAQScreen"
import PhysicalCentersScreen from "../screens/centers/PhysicalCentersScreen"
import NetworkDebug from "../components/NetworkDebug"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()


const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: "Accueil" }} />
    <Stack.Screen
      name="MatchingForm"
      component={MatchingFormScreen}
      options={{ title: "Formulaire de correspondance" }}
    />
    <Stack.Screen name="MatchingResults" component={MatchingResultsScreen} options={{ title: "Résultats" }} />
    <Stack.Screen
      name="ManualProfileSearch"
      component={ManualProfileSearchScreen}
      options={{ title: "Recherche manuelle" }}
    />
    <Stack.Screen name="AdaptivePath" component={AdaptivePathScreen} options={{ title: "Votre parcours" }} />
    <Stack.Screen name="FAQ" component={FAQScreen} options={{ title: "FAQ & Assistance" }} />
    <Stack.Screen name="PhysicalCenters" component={PhysicalCentersScreen} options={{ title: "Centres physiques" }} />
    <Stack.Screen name="NetworkDebug" component={NetworkDebug} options={{ title: "Débogage Réseau" }} />
  </Stack.Navigator>
)

const CourseStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CourseList" component={CourseListScreen} options={{ title: "Mes cours" }} />
    <Stack.Screen name="CoursePacks" component={CoursePacksScreen} options={{ title: "Packs disponibles" }} />
    <Stack.Screen name="Chapter" component={ChapterScreen} options={{ title: "Chapitre" }} />
    <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: "Quiz" }} />
    <Stack.Screen name="QuizResult" component={QuizResultScreen} options={{ title: "Résultat" }} />
  </Stack.Navigator>
)


const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: "Messages" }} />
    <Stack.Screen name="ChatDetail" component={ChatScreen} options={{ title: "Discussion" }} />
    <Stack.Screen name="UserSearch" component={UserSearchScreen} options={{ title: "Rechercher un utilisateur" }} />
  </Stack.Navigator>
)

const JobsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="JobOffers" component={JobOffersScreen} options={{ title: "Offres d'emploi" }} />
    <Stack.Screen name="Competitions" component={CompetitionsScreen} options={{ title: "Concours" }} />
  </Stack.Navigator>
)


const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Profil" }} />
    <Stack.Screen name="Rewards" component={RewardsScreen} options={{ title: "Récompenses" }} />
    <Stack.Screen name="FAQ" component={FAQScreen} options={{ title: "FAQ & Assistance" }} />
    <Stack.Screen name="NetworkDebug" component={NetworkDebug} options={{ title: "Débogage Réseau" }} />
  </Stack.Navigator>
)

const MainNavigator = () => {
  const user = useSelector((state: RootState) => state.auth.user)

  React.useEffect(() => {
    if (user && !user.has_completed_matching) {
      // Navigation will be handled in HomeScreen
    }
  }, [user])

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Courses") {
            iconName = focused ? "book" : "book-outline"
          } else if (route.name === "Chat") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline"
          } else if (route.name === "Jobs") {
            iconName = focused ? "briefcase" : "briefcase-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: "Accueil" }} />
      <Tab.Screen name="Courses" component={CourseStack} options={{ title: "Cours" }} />
      <Tab.Screen name="Chat" component={ChatStack} options={{ title: "Chat" }} />
      <Tab.Screen name="Jobs" component={JobsStack} options={{ title: "Offres" }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: "Profil" }} />
    </Tab.Navigator>
  )
}

export default MainNavigator
