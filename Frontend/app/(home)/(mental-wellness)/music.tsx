"use client"

import { View, Text, Image, ScrollView, ActivityIndicator, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { TouchableOpacity } from "react-native-gesture-handler"
import { FontAwesome6 } from "@expo/vector-icons"
import type { MusicItem, Song } from "@/constants/types"
import { useMusicPlayer } from "@/context/MusicPlayer"
import { useCallback, useEffect, useState } from "react"

const API_BASE_URL = "https://your-api-domain.com/api";

const songData: Song[] = [
  {
    id: '1',
    title: 'Tu Rehti Hai',
    artist: 'Aditya Rikhari',
    audioUrl:
      'https://dl.dropboxusercontent.com/scl/fi/51n6p7zwibuzeke4sz3wn/Aditya-Rikhari-Tu-Rehti-Hai-Studio-Version-MP3_160K.mp3?rlkey=9tet0rnogkssveae15cv5xl3t&e=1&st=yf1eqzd2',
    duration: 158766, // milliseconds
    image: "",
    playlistName: ""
  },
  {
    id: '2',
    title: 'FAASLE',
    artist: 'Aditya Rikhari',
    audioUrl:
      'https://dl.dropboxusercontent.com/scl/fi/wb8xqswy2c9xtreyiavcq/Aditya-Rikhari-FAASLE-MP3_160K.mp3?rlkey=96gcsdqdaonthq6wymd2epbnd&e=1&st=8g32pcx9',
    duration: 142500, // estimated duration
    image: "",
    playlistName: ""
  },
  {
    id: '3',
    title: 'SAMJHO NA NASAMAJH',
    artist: 'Aditya Rikhari',
    audioUrl:
      'https://dl.dropboxusercontent.com/scl/fi/allbjzq9q4giu3q74k8a3/Aditya-Rikhari-SAMJHO-NA-NASAMAJH-MP3_160K.mp3?rlkey=u2j8i51tjj62vpjylzsiogby8&e=1&st=6nijme8j',
    duration: 168200, // estimated duration
    image: "",
    playlistName: ""
  },
  {
    id: '4',
    title: 'Ik Lamha',
    artist: 'Azaan Sami Khan ft. Maya Ali',
    audioUrl:
      'https://dl.dropboxusercontent.com/scl/fi/adsjz4m0jbtefwwqtivl2/Azaan-Sami-Khan-Ik-Lamha-ft.-Maya-Ali-Official-Lyric-Video-MP3_160K.mp3?rlkey=fm24xq94ep03rxnq27hskih5p&e=1&st=kxw9kw0p',
    duration: 174500, // estimated duration
    image: "",
    playlistName: ""
  }
]

// Define the Relaxing Music playlist (songs in a custom order)
export const relaxingPlaylist: Song[] = [
  {
    ...songData[0],
    image: 'https://i.scdn.co/image/ab67616d0000b27327b2e970c158a0727a9e0261',
    playlistName: 'Relaxing Music'
  },
  {
    ...songData[3],
    image: 'https://i.scdn.co/image/ab67616d0000b273d2aaf635815c265aa1ecdecc',
    playlistName: 'Relaxing Music'
  },
  {
    ...songData[1],
    image: 'https://i.scdn.co/image/ab67616d0000b2737d214af8499aa95ad220f573',
    playlistName: 'Relaxing Music'
  },
  {
    ...songData[2],
    image: 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431',
    playlistName: 'Relaxing Music'
  }
]

// Define the Nature Sounds playlist (custom order)
export const naturePlaylist: Song[] = [
  {
    ...songData[3],
    image: 'https://i.scdn.co/image/ab67616d0000b273d2aaf635815c265aa1ecdecc',
    playlistName: 'Nature Sounds'
  },
  {
    ...songData[2],
    image: 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431',
    playlistName: 'Nature Sounds'
  },
  {
    ...songData[0],
    image: 'https://i.scdn.co/image/ab67616d0000b27327b2e970c158a0727a9e0261',
    playlistName: 'Nature Sounds'
  },
  {
    ...songData[1],
    image: 'https://i.scdn.co/image/ab67616d0000b2737d214af8499aa95ad220f573',
    playlistName: 'Nature Sounds'
  }
]

// Define the Exercise Music playlist (custom order)
export const exercisePlaylist: Song[] = [
  {
    ...songData[1],
    image: 'https://i.scdn.co/image/ab67616d0000b2737d214af8499aa95ad220f573',
    playlistName: 'Exercise Music'
  },
  {
    ...songData[0],
    image: 'https://i.scdn.co/image/ab67616d0000b27327b2e970c158a0727a9e0261',
    playlistName: 'Exercise Music'
  },
  {
    ...songData[3],
    image: 'https://i.scdn.co/image/ab67616d0000b273d2aaf635815c265aa1ecdecc',
    playlistName: 'Exercise Music'
  },
  {
    ...songData[2],
    image: 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431',
    playlistName: 'Exercise Music'
  }
]

// Function to fetch playlists (simulated here)
// In production, this would be a real API call
const fetchPlaylists = async (): Promise<{[key: string]: Song[]}> => {
  // In a real app, you would do something like:
  // const response = await fetch(`${API_BASE_URL}/playlists`);
  // const data = await response.json();
  // return data;
  
  // For now, just simulate a network delay and return our hardcoded data
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    "Relaxing Music": relaxingPlaylist,
    "Nature": naturePlaylist,
    "Exercise Music": exercisePlaylist
  };
};

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

  // Categories for your music items
  const musicItems: MusicItem[] = [
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