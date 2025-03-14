import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import Ionicons from "@expo/vector-icons/Ionicons"
import AntDesign from "@expo/vector-icons/AntDesign"
import Feather from "@expo/vector-icons/Feather"
import { NotificationCategory, Notification } from "@/constants/types"
import { SafeAreaView } from "react-native-safe-area-context"

// Icon Mapping for Notification Categories
const getCategoryIcon = (category: NotificationCategory) => {
  switch (category) {
    case "system":
      return <Ionicons name="settings-outline" size={24} color="#4A90E2" />
    case "badges":
      return <MaterialIcons name="military-tech" size={24} color="#FFD700" />
    case "progress":
      return <Feather name="trending-up" size={24} color="#63F19E" />
    case "achievement":
      return <AntDesign name="Trophy" size={24} color="#FF6B6B" />
    case "workout":
      return <MaterialIcons name="fitness-center" size={24} color="#7B68EE" />
    case "diet":
      return <MaterialIcons name="apple" size={24} color="#FF4500" />
    case "reminder":
      return <Ionicons name="notifications-outline" size={24} color="#20B2AA" />
    default:
      return <Ionicons name="alert-circle-outline" size={24} color="white" />
  }
}

// TODO Fetch Notifications (Simulated Backend Request)
const fetchNotifications = async (): Promise<Notification[]> => {
  // Simulated API call - replace with actual backend fetch
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleNotifications)
    }, 1500)
  })
}

// Notifications Component
const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<NotificationCategory | null>(null)

  // Format Date/Time
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'just now'
  }

  // Fetch Notifications Effect
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true)
        const fetchedNotifications = await fetchNotifications()
        setNotifications(fetchedNotifications)
      } catch (error) {
        console.error("Failed to fetch notifications", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [])

  // Filter Notifications
  const filteredNotifications = filter 
    ? notifications.filter(n => n.category === filter)
    : notifications

  // Category Filter Buttons
  const CategoryFilters = () => {
    const categories: NotificationCategory[] = [
      "system", "badges", "progress", "achievement", 
      "workout", "diet", "reminder"
    ]

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-3"
      >
        <TouchableOpacity 
          onPress={() => setFilter(null)}
          className={`mr-2 px-3 py-2 rounded-lg ${filter === null ? 'bg-white/20' : 'bg-white/10'}`}
        >
          <Text className="text-white">All</Text>
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity 
            key={category}
            onPress={() => setFilter(category)}
            className={`mr-2 px-3 py-2 rounded-lg ${filter === category ? 'bg-white/20' : 'bg-white/10'}`}
          >
            <Text className="text-white capitalize">{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )
  }

  // Render Loading State
  if (isLoading) {
    return (
      <View className="flex-1 bg-primary_dark items-center justify-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-4">Loading Notifications...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-primary_dark">
      <LinearGradient
        colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.1)"]}
        locations={[0, 0.5, 1]}
        style={{ flex: 1, }}
        className="absolute bottom-0 left-0 h-full w-full"
      />
      <SafeAreaView className="flex-1  p-3">
        <View className="flex-row items-center mb-4">
          <Ionicons name="notifications-outline" size={24} color="white" />
          <Text className="text-white text-xl font-semibold ml-2">Notifications</Text>
        </View>

        {/* Category Filters */}
        <View className=" rounded-3xl py-4 w-full">
          <CategoryFilters />
        </View>

        {/* Notifications Container */}
        <View className="rounded-3xl flex-1">
          <ScrollView 
            showsVerticalScrollIndicator={false}
          >
            {filteredNotifications.length === 0 ? (
              <View className="items-center justify-center h-full">
                <Text className="text-white/50 text-center">
                  No notifications in this category
                </Text>
              </View>
            ) : (
              filteredNotifications.map(notification => (
                <View 
                  key={notification.id} 
                  className={`flex-row items-center p-4 rounded-xl mb-3 bg-white/10 border border-white/20`}
                >
                  {/* Category Icon */}
                  <View className="mr-4">
                    {getCategoryIcon(notification.category)}
                  </View>

                  {/* Notification Content */}
                  <View className="flex-1">
                    <Text className="text-white font-semibold mb-1">
                      {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                    </Text>
                    <Text className="text-white/70 text-sm">
                      {notification.message}
                    </Text>
                    <Text className="text-white/50 text-xs mt-1">
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </View>

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <View className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>

  )
}

// Sample Notifications Data
const sampleNotifications: Notification[] = [
  {
    id: "1",
    category: "achievement",
    message: "Congratulations! You've completed 10 consecutive workouts!",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false
  },
  {
    id: "2",
    category: "progress",
    message: "You're 2 lbs away from your weight loss goal!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false
  },
  {
    id: "3",
    category: "system",
    message: "App update available. Please update to the latest version.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true
  },
  {
    id: "4",
    category: "badges",
    message: "You've earned the 'Early Bird' badge for 5 AM workouts!",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    read: true
  },
  {
    id: "5",
    category: "reminder",
    message: "Don't forget your scheduled yoga session today!",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: false
  },
  {
    id: "6",
    category: "workout",
    message: "New workout plan recommended based on your progress!",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    read: true
  }
]

export default NotificationsScreen