"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserCourses } from "../../store/slices/courseSlice"
import type { RootState } from "../../store"
import { Ionicons } from "@expo/vector-icons"

const CourseListScreen = ({ navigation }: any) => {
  const dispatch = useDispatch()
  const { courses, isLoading } = useSelector((state: RootState) => state.course)

  useEffect(() => {
    dispatch(fetchUserCourses() as any)
  }, [])

  const renderCourseItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => navigation.navigate("Chapter", { coursePackId: item.id })}
    >
      <View style={styles.courseHeader}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Ionicons name="chevron-forward" size={24} color="#6366f1" />
      </View>
      <Text style={styles.courseDomain}>{item.domain}</Text>
      <Text style={styles.courseDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.courseFooter}>
        <Text style={styles.chapterCount}>{item.chapters?.length || 0} chapitres</Text>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  if (courses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="book-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyText}>Aucun cours acheté</Text>
        <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate("CoursePacks")}>
          <Text style={styles.browseButtonText}>Parcourir les packs</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("CoursePacks")}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  courseDomain: {
    fontSize: 14,
    color: "#6366f1",
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  courseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chapterCount: {
    fontSize: 12,
    color: "#9ca3af",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})

export default CourseListScreen
