"use client"

import { View, Text, Image, ScrollView, ActivityIndicator, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { TouchableOpacity } from "react-native-gesture-handler"
import { FontAwesome6 } from "@expo/vector-icons"
import type { MusicItem, Song } from "@/constants/types"
import { useMusicPlayer } from "@/context/MusicPlayer"
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { BASE_URL } from "@/constants/baseUrl"


interface BackendSongItem {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  duration: number;
  image: string;
  playlistName: string; // This is the playlistName from the backend song item
}

interface PlaylistApiResponse {
  _id: string;
  name: string; // The name of the playlist (e.g., "Nature")
  musicItems: BackendSongItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}


const MusicScreen = () => {
  const { 
    playSong, 
    addToQueue, 
    clearQueue, 
    isLoading: playerIsLoading,
    errorMessage 
  } = useMusicPlayer();
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<{[key: string]: Song[]}>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);




  const musicItems = [
    {
      title: "Relaxing Music",

      description: "Calm your mind with soothing melodies",

      image: require("@/assets/images/MentalWellness/Music/relaxing music.png"),
  
    },

    {
      title: "Nature",

      description: "Connect with the outdoors through natural sounds",

      image: require("@/assets/images/MentalWellness/Music/nature.png"),
    },

    {
      title: "Exercise Music",

      description: "Energetic beats to power your workout",

      image: require("@/assets/images/MentalWellness/Music/workout music.png"),
    },
  ];



  const fetchPlaylists = async (): Promise<{ [key: string]: Song[] }> => {
  const playlistNames = ["Relaxing Music", "Nature", "Exercise Music"];
  const fetchedPlaylists: { [key: string]: Song[] } = {};

  try {
    // Create an array of promises for fetching each playlist
    const playlistPromises = playlistNames.map(async (name) => {
      // URL encode the playlist name in case it has spaces or special characters
      const encodedName = encodeURIComponent(name);
      const response = await axios.get<PlaylistApiResponse>(`${BASE_URL}/mentalwellness/GetPlaylist/${encodedName}`);
      
      if (response.data && response.data.musicItems) {
        // Transform backend song items to frontend Song type
        // The `playlistName` for the Song object will be the category key (e.g., "Relaxing Music")
        const songs: Song[] = response.data.musicItems.map(item => ({
          id: item._id, // Map _id to id
          title: item.title,
          artist: item.artist,
          audioUrl: item.audioUrl,
          duration: item.duration,
          image: item.image,
          playlistName: name, // Assign the category name as playlistName for the Song object
        }));
        return { name, songs };
      } else {
        console.warn(`No music items found for playlist: ${name} or unexpected response format.`);
        return { name, songs: [] }; // Return empty array if no items or bad format
      }
    });

    // Wait for all playlist fetches to complete
    const results: { name: string; songs: Song[] }[] = await Promise.all<{ name: string; songs: Song[] }>(
      playlistPromises
    );

    // Populate the fetchedPlaylists object
    results.forEach(result => {
      if (result) {
        fetchedPlaylists[result.name] = result.songs;
      }
    });

    return fetchedPlaylists;

  } catch (error) {
    console.error("Error fetching playlists from backend:", error);
    // If one playlist fails, we might still want to return others,
    // or handle this more gracefully depending on requirements.
    // For now, rethrow or return empty to indicate failure.
    throw new Error("Failed to fetch one or more playlists.");
  }
};

  // Fetch playlists on component mount
  useEffect(() => {
    const loadPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error("Error loading playlists:", error);
        setError("Failed to load music playlists");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  // Effect to show errors
  useEffect(() => {
    if (errorMessage) {
      Alert.alert("Music Player Error", errorMessage);
    }
  }, [errorMessage]);

  // Helper function to play a playlist with error handling
  const playPlaylist = useCallback(async (playlist: Song[]) => {
    try {
      if (playlist && playlist.length > 0) {
        // Clear the queue first
        await clearQueue();
        
        // Add all songs to the queue first
        for (let i = 0; i < playlist.length; i++) {
          addToQueue(playlist[i]);
        }
        
        // Then play the first song
        await playSong(playlist[0], false);
      }
    } catch (error) {
      console.error("Error playing playlist:", error);
      setError("Failed to start playback");
    }
  }, [playSong, addToQueue, clearQueue]);

  // Handle playlist selection safely
  const handlePlaylistSelection = useCallback(async (playlistName: string) => {
    if (isProcessing || isLoading || playerIsLoading) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // First clear the queue
      await clearQueue();
      
      // Get the appropriate playlist
      const selectedPlaylist = playlists[playlistName];
      
      if (!selectedPlaylist || selectedPlaylist.length === 0) {
        setError(`No songs found in ${playlistName} playlist`);
        return;
      }
      
      // Play the playlist
      await playPlaylist(selectedPlaylist);
    } catch (error) {
      console.error("Error handling playlist selection:", error);
      setError("Could not start playlist");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isLoading, playerIsLoading, clearQueue, playPlaylist, playlists]);

  // Determine if any loading is happening
  const isAnyLoading = isLoading || isProcessing || playerIsLoading;

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="text-white text-2xl font-bold mb-4">Music</Text>
        
        {error && (
          <View className="bg-red-900/30 p-3 rounded-lg mb-4">
            <Text className="text-white">{error}</Text>
          </View>
        )}
        
        <View className="space-y-4">
          <TouchableOpacity
            className="bg-primary_dark rounded-3xl overflow-hidden border-2 h-32 border-white/20"
            onPress={async () => {
              if (isAnyLoading) return;
              
              setIsProcessing(true);
              setError(null);
              
              try {
                await clearQueue();
              } catch (error) {
                console.error("Error clearing queue:", error);
                setError("Failed to stop playback");
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={isAnyLoading}
          >
            <View className="flex-row items-center justify-center h-full">
              {isAnyLoading ? (
                <ActivityIndicator size="large" color="#FFC1A1" />
              ) : (
                <Text className="text-white text-xl font-bold">Stop and Clear Queue</Text>
              )}
            </View>
          </TouchableOpacity>
          
          {musicItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`bg-primary_dark rounded-3xl overflow-hidden border-2 ${isAnyLoading ? 'border-gray-700/30' : 'border-white/20'}`}
              onPress={() => handlePlaylistSelection(item.title)}
              disabled={isAnyLoading}
              style={{ opacity: isAnyLoading ? 0.7 : 1 }}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute bottom-0 left-0 h-full w-full"
              />
              <View className="flex-row items-center justify-between m-4">
                <View className="flex-1 pr-2">
                  <Text numberOfLines={1} adjustsFontSizeToFit className="text-white text-heading font-semibold mb-1">
                    {item.title}
                  </Text>
                  <Text numberOfLines={2} className="text-gray-400 pl-2 text-sm">
                    {item.description}
                  </Text>
                  <View className="flex-row items-center mt-4 ml-3">
                    <Text className="text-black text-small rounded-lg bg-white mr-2 border-2 border-white/25 px-3 py-1">
                      {isAnyLoading ? "Loading..." : "Play Now"}
                    </Text>
                    {isAnyLoading ? (
                      <ActivityIndicator size="small" color="#FFC1A1" />
                    ) : (
                      <FontAwesome6 name="play-circle" size={24} color="#FFC1A1" />
                    )}
                  </View>
                </View>
                <View className="w-20 h-20 justify-center items-center">
                  <Image source={item.image} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default MusicScreen