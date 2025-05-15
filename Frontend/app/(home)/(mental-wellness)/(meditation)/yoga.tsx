"use client"

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, Alert, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native-gesture-handler";
import { FontAwesome6 } from "@expo/vector-icons";
import axios from 'axios'; // Make sure to install axios: npm install axios or yarn add axios
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av'; // Import Video and related types
import { BASE_URL } from '@/constants/baseUrl';

// Define the type for a single yoga pose based on the backend response
interface YogaPose {
  _id: string;
  title: string;
  description: string;
  audioUrl: string; // MP4 video URL
  thumbnailUrl?: string; // Optional: URL for a video thumbnail
}

// Define the structure of the API response
interface ApiResponse {
  success: boolean;
  count: number;
  data: YogaPose[];
}

const YOGA_API_URL = BASE_URL + "/mentalwellness/yoga"; // Your backend route
const SCREEN_WIDTH = Dimensions.get('window').width;

const YogaScreen = () => {
  const [yogaPoses, setYogaPoses] = useState<YogaPose[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPoseId, setExpandedPoseId] = useState<string | null>(null); // ID of the expanded pose
  const videoPlayerRef = useRef<Video>(null); // Ref for the video player

  useEffect(() => {
    const fetchYogaPoses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<ApiResponse>(YOGA_API_URL);
        if (response.data && response.data.success) {
          setYogaPoses(response.data.data);
        } else {
          setError("Failed to fetch yoga poses. Unexpected response format.");
        }
      } catch (err) {
        console.error("Error fetching yoga poses:", err);
        if (axios.isAxiosError(err)) {
          setError(`Failed to fetch yoga poses: ${err.message}. Please ensure the backend server is running.`);
        } else {
          setError("An unexpected error occurred while fetching yoga poses.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchYogaPoses();
  }, []);

  // Handle pressing a yoga pose to expand/collapse and play/pause video
  const handlePosePress = async (poseId: string) => {
    if (expandedPoseId === poseId) {
      // Collapse the currently expanded item
      setExpandedPoseId(null);
      if (videoPlayerRef.current) {
        await videoPlayerRef.current.stopAsync(); // Stop video when collapsing
      }
    } else {
      // Collapse any previously expanded item
      if (expandedPoseId && videoPlayerRef.current) {
        await videoPlayerRef.current.stopAsync();
      }
      // Expand the new item
      setExpandedPoseId(poseId);
      // Video will autoplay due to shouldPlay prop when it becomes visible
    }
  };

  const onPlaybackStatusUpdate = (poseId: string, status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Error playing video ${poseId}: ${status.error}`);
        Alert.alert("Video Error", `Could not play video: ${status.error}. Please check the video URL or your connection.`);
        // Optionally collapse if video fails to load
        if (expandedPoseId === poseId) {
            setExpandedPoseId(null);
        }
      }
    } else {
      if (status.didJustFinish) {
        // Optionally reset or loop
        // videoPlayerRef.current?.replayAsync();
      }
    }
  };


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#FFC1A1" />
        <Text className="text-white/70 mt-2 text-medium">Loading Yoga Poses...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-primary p-4">
        <FontAwesome6 name="exclamation-triangle" size={48} color="#FF6F61" />
        <Text className="text-error text-heading font-semibold mt-4 text-center">{error}</Text>
        <Text className="text-white/70 mt-2 text-medium text-center">
          Please check your connection or try again later.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-primary">
      <View className="p-4">
        <Text className="text-white text-hero font-Display font-bold mb-2">Yoga</Text>
        <Text className="text-white/90 text-heading font-Sans font-semibold mb-6">Guided Yoga Exercises</Text>
        
        {yogaPoses.length === 0 && !loading && (
            <View className="flex-1 justify-center items-center mt-10">
                <FontAwesome6 name="leaf" size={48} color="#687791" />
                <Text className="text-primary_light text-lg mt-4">No yoga poses available at the moment.</Text>
            </View>
        )}

        <View className="space-y-4">
          {yogaPoses.map((pose) => (
            <View key={pose._id} className="bg-primary_dark rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePosePress(pose._id)}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.02)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4"
                >
                  <View className="flex-row items-center">
                    {/* <Image
                      source={{ uri: pose.thumbnailUrl || `https://placehold.co/80x80/212835/FFC1A1?text=${encodeURIComponent(pose.title.substring(0,1))}` }}
                      className="w-20 h-20 rounded-lg mr-4 bg-primary_light"
                      resizeMode="cover"
                      onError={(e) => console.log("Failed to load thumbnail:", e.nativeEvent.error)}
                    /> */}
                    <View className="flex-1">
                      <Text className="text-white text-lg font-Sans font-semibold">{pose.title}</Text>
                      <Text className="text-primary_light text-sm font-Sans mt-1" numberOfLines={2}>{pose.description}</Text>
                    </View>
                    <View className="w-12 h-12 items-center justify-center">
                       <FontAwesome6 
                          name={expandedPoseId === pose._id ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color="#FFC1A1" 
                        />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Expandable Video Section */}
              {expandedPoseId === pose._id && (
                <View className="bg-primary_dark p-0">
                  <Video
                    ref={videoPlayerRef}
                    source={{ uri: pose.audioUrl }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay // Auto-plays when the component is rendered/visible
                    useNativeControls
                    className="w-full aspect-video" // Make video responsive, common aspect ratio
                    onPlaybackStatusUpdate={(status) => onPlaybackStatusUpdate(pose._id, status)}
                    onError={(err) => {
                        console.error("Video component error:", err);
                        Alert.alert("Video Error", `Could not load video for ${pose.title}.`);
                        setExpandedPoseId(null); // Collapse on error
                    }}
                  />
                   {/* You can add custom controls here if needed, or style native controls if possible */}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export default YogaScreen;
