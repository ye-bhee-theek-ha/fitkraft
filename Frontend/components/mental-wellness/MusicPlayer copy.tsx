// // MusicPlayer.tsx
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { View, Text, Image, TouchableOpacity, Dimensions, Animated, Pressable } from "react-native";
// import { 
//   Audio,
//   InterruptionModeAndroid,
//   InterruptionModeIOS,
//   AVPlaybackStatus
//  } from "expo-av";
// import { FontAwesome6 } from "@expo/vector-icons";
// import { GestureDetector, Gesture, ScrollView } from "react-native-gesture-handler";
// import Slider from "@react-native-community/slider";
// import { LinearGradient } from "expo-linear-gradient";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { BlurView } from "expo-blur";
// import Reanimated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   Easing,
//   interpolate,
//   Extrapolate,
// } from "react-native-reanimated";

// // Music Player Context
// import { createContext, useContext } from "react";

// // Types
// type Song = {
//   id: string;
//   title: string;
//   artist: string;
//   image: string;
//   audioUrl: string;
//   duration: number;
//   playlistName: string;
// };

// type PlaybackState = {
//   isPlaying: boolean;
//   currentPosition: number;
//   duration: number;
//   currentSongIndex: number;
//   shuffle: boolean;
//   repeat: "off" | "all" | "one";
//   queue: Song[];
//   volume: number;
// };

// type MusicPlayerContextType = {
//   playbackState: PlaybackState;
//   currentSong: Song | null;
//   controlsVisible: boolean;
//   isExpanded: boolean;
//   togglePlay: () => void;
//   skipToNext: () => void;
//   skipToPrevious: () => void;
//   seek: (position: number) => void;
//   toggleShuffle: () => void;
//   toggleRepeat: () => void;
//   setVolume: (volume: number) => void;
//   toggleExpanded: () => void;
//   playSong: (song: Song, insertQueue?: boolean) => void;
//   addToQueue: (song: Song) => void;
//   clearQueue: () => void;
// };

// // Create Context
// const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// // Create Provider
// export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   // State for current song and playback
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [currentSong, setCurrentSong] = useState<Song | null>(null);
//   const [controlsVisible, setControlsVisible] = useState<boolean>(false);
//   const [isExpanded, setIsExpanded] = useState<boolean>(false);

//   // Playback state
//   const [playbackState, setPlaybackState] = useState<PlaybackState>({
//     isPlaying: false,
//     currentPosition: 0,
//     duration: 0,
//     currentSongIndex: 0,
//     shuffle: false,
//     repeat: "off",
//     queue: [],
//     volume: 1.0,
//   });

//   // Set up audio mode on mount
//   useEffect(() => {
//     const setupAudio = async () => {
//       try {
//         await Audio.setAudioModeAsync({
//           playsInSilentModeIOS: true,
//           staysActiveInBackground: true,
//           interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
//           interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
//           shouldDuckAndroid: true,
//         });
//       } catch (e) {
//         console.error("Failed to setup audio mode:", e);
//       }
//     };

//     setupAudio();

//     // Cleanup
//     return () => {
//       if (sound) {
//         sound.unloadAsync();
//       }
//     };
//   }, []);

//   // Position updater
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
    
//     if (playbackState.isPlaying && sound) {
//       interval = setInterval(async () => {
//         try {
//           const status = await sound.getStatusAsync();
//           if (status.isLoaded) {
//             setPlaybackState((prev) => ({
//               ...prev,
//               currentPosition: status.positionMillis,
//               duration: status.durationMillis || 0,
//             }));
//           }
//         } catch (e) {
//           console.error("Failed to get status:", e);
//         }
//       }, 1000);
//     }

//     return () => clearInterval(interval);
//   }, [sound, playbackState.isPlaying]);

//   // Load a song
//   const loadSong = async (song: Song) => {
//     try {
//       // Unload previous sound
//       if (sound) {
//         await sound.unloadAsync();
//       }

//       // Load new sound
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         { uri: song.audioUrl },
//         { shouldPlay: true },
//         onPlaybackStatusUpdate
//       );
//       setSound(newSound);
      
//       setControlsVisible(true);
//     } catch (e) {
//       console.error("Failed to load song:", e);
//     }
//   };

//   // Playback status update callback
//   const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
//     if (!status.isLoaded) return;

//     // Handle playback completion
//     if (status.didJustFinish) {
//       handleSongEnd();
//     }
//   }, [playbackState.repeat, playbackState.shuffle, playbackState.queue]);

//   // Handle song end
//   const handleSongEnd = useCallback(() => {
//     const { repeat, currentSongIndex, queue } = playbackState;

//     if (repeat === "one") {
//       // Replay the same song
//       sound?.replayAsync();
//     } else if (currentSongIndex < queue.length - 1 || repeat === "all") {
//       skipToNext();
//     } else {
//       // End of queue and no repeat
//       setPlaybackState(prev => ({ ...prev, isPlaying: false, currentPosition: 0 }));
//     }
//   }, [playbackState, sound]);

//   // Play a song
//   const playSong = useCallback((song: Song, replaceQueue = true) => {
//     if (replaceQueue) {
//       setPlaybackState(prev => ({
//         ...prev,
//         queue: [song],
//         currentSongIndex: 0,
//         isPlaying: true,
//         currentPosition: 0,
//       }));
//     } else {
//       // Add to queue and play next
//       const newQueue = [...playbackState.queue];
//       newQueue.splice(playbackState.currentSongIndex + 1, 0, song);
//       setPlaybackState(prev => ({
//         ...prev,
//         queue: newQueue,
//       }));
//     }
//     setCurrentSong(song);
//     loadSong(song);
//   }, [playbackState]);

//   // Add to queue
//   const addToQueue = useCallback((song: Song) => {
//     setPlaybackState(prev => ({
//       ...prev,
//       queue: [...prev.queue, song],
//     }));
    
//     // If nothing is playing, start with this song
//     if (!currentSong) {
//       playSong(song, false);
//     }
//   }, [currentSong, playSong]);

//   // Clear queue
//   const clearQueue = useCallback(() => {
//     if (sound) {
//       sound.stopAsync();
//       sound.unloadAsync();
//     }
//     setPlaybackState(prev => ({
//       ...prev,
//       queue: [],
//       currentSongIndex: 0,
//       isPlaying: false,
//       currentPosition: 0,
//     }));
//     setCurrentSong(null);
//     setControlsVisible(false);
//   }, [sound]);

//   // Toggle play/pause
//   const togglePlay = useCallback(async () => {
//     if (!sound || !currentSong) return;

//     try {
//       if (playbackState.isPlaying) {
//         await sound.pauseAsync();
//       } else {
//         await sound.playAsync();
//       }
      
//       setPlaybackState(prev => ({
//         ...prev,
//         isPlaying: !prev.isPlaying,
//       }));
//     } catch (e) {
//       console.error("Failed to toggle play:", e);
//     }
//   }, [sound, currentSong, playbackState.isPlaying]);

//   // Skip to next song
//   const skipToNext = useCallback(() => {
//     const { queue, currentSongIndex, shuffle } = playbackState;
    
//     if (queue.length <= 1) return;
    
//     let nextIndex: number;
    
//     if (shuffle) {
//       // Get random index that's not current
//       do {
//         nextIndex = Math.floor(Math.random() * queue.length);
//       } while (nextIndex === currentSongIndex && queue.length > 1);
//     } else {
//       // Normal sequential next
//       nextIndex = (currentSongIndex + 1) % queue.length;
//     }
    
//     setPlaybackState(prev => ({
//       ...prev,
//       currentSongIndex: nextIndex,
//       currentPosition: 0,
//     }));
    
//     setCurrentSong(queue[nextIndex]);
//     loadSong(queue[nextIndex]);
//   }, [playbackState]);

//   // Skip to previous song
//   const skipToPrevious = useCallback(() => {
//     const { queue, currentSongIndex, currentPosition } = playbackState;
    
//     if (queue.length <= 1) return;
    
//     // If we're more than 3 seconds into a song, restart it instead
//     if (currentPosition > 3000) {
//       sound?.setPositionAsync(0);
//       setPlaybackState(prev => ({
//         ...prev,
//         currentPosition: 0,
//       }));
//       return;
//     }
    
//     // Go to previous track
//     const prevIndex = (currentSongIndex - 1 + queue.length) % queue.length;
    
//     setPlaybackState(prev => ({
//       ...prev,
//       currentSongIndex: prevIndex,
//       currentPosition: 0,
//     }));
    
//     setCurrentSong(queue[prevIndex]);
//     loadSong(queue[prevIndex]);
//   }, [playbackState, sound]);

//   // Seek to position
//   const seek = useCallback(async (position: number) => {
//     if (!sound) return;
    
//     await sound.setPositionAsync(position);
//     setPlaybackState(prev => ({
//       ...prev,
//       currentPosition: position,
//     }));
//   }, [sound]);

//   // Toggle shuffle
//   const toggleShuffle = useCallback(() => {
//     setPlaybackState(prev => ({
//       ...prev,
//       shuffle: !prev.shuffle,
//     }));
//   }, []);

//   // Toggle repeat
//   const toggleRepeat = useCallback(() => {
//     setPlaybackState(prev => {
//       const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
//       const currentIndex = modes.indexOf(prev.repeat);
//       const nextIndex = (currentIndex + 1) % modes.length;
//       return {
//         ...prev,
//         repeat: modes[nextIndex],
//       };
//     });
//   }, []);

//   // Set volume
//   const setVolume = useCallback(async (volume: number) => {
//     if (!sound) return;
    
//     await sound.setVolumeAsync(volume);
//     setPlaybackState(prev => ({
//       ...prev,
//       volume,
//     }));
//   }, [sound]);

//   // Toggle expanded view
//   const toggleExpanded = useCallback(() => {
//     setIsExpanded(prev => !prev);
//   }, []);

//   // Context value
//   const value: MusicPlayerContextType = {
//     playbackState,
//     currentSong,
//     controlsVisible,
//     isExpanded,
//     togglePlay,
//     skipToNext,
//     skipToPrevious,
//     seek,
//     toggleShuffle,
//     toggleRepeat,
//     setVolume,
//     toggleExpanded,
//     playSong,
//     addToQueue,
//     clearQueue,
//   };

//   return (
//     <MusicPlayerContext.Provider value={value}>
//       {children}
//       {controlsVisible && <MusicPlayerUI />}
//     </MusicPlayerContext.Provider>
//   );
// };

// // Hook for using the music player
// export const useMusicPlayer = () => {
//   const context = useContext(MusicPlayerContext);
//   if (context === undefined) {
//     throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
//   }
//   return context;
// };

// // Music Player UI Component
// const MusicPlayerUI: React.FC = () => {
//   const { 
//     playbackState, 
//     currentSong, 
//     isExpanded,
//     togglePlay, 
//     skipToNext, 
//     skipToPrevious, 
//     seek,
//     toggleShuffle,
//     toggleRepeat,
//     setVolume,
//     toggleExpanded 
//   } = useMusicPlayer();
  
//   const insets = useSafeAreaInsets();
//   const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  
//   // Animation values
//   const translateY = useSharedValue(0);
//   const gestureActive = useSharedValue(false);
//   const indicatorOpacity = useSharedValue(1);
  
//   // Effect to update expanded state
//   useEffect(() => {
//     translateY.value = withSpring(isExpanded ? -screenHeight : 0, {
//       damping: 20,
//       stiffness: 90,
//     });
    
//     // Hide indicator when expanded
//     indicatorOpacity.value = withTiming(isExpanded ? 0 : 1, {
//       duration: 200,
//     });
//   }, [isExpanded, screenHeight]);
  
//   // Pan gesture handler
//   const panGesture = Gesture.Pan()
//     .onStart(() => {
//       gestureActive.value = true;
//     })
//     .onUpdate((event) => {
//       // Clamp values between -screenHeight and 0
//       const newValue = Math.max(-screenHeight, Math.min(0, event.translationY));
//       translateY.value = newValue;
//     })
//     .onEnd((event) => {
//       gestureActive.value = false;
      
//       // Determine whether to snap open or closed
//       const shouldExpand = event.velocityY < -500 || 
//         (Math.abs(event.velocityY) < 500 && translateY.value < -screenHeight / 2);
      
//       translateY.value = withSpring(
//         shouldExpand ? -screenHeight : 0,
//         { damping: 20, stiffness: 90 }
//       );
      
//       // Update expanded state
//       if (shouldExpand !== isExpanded) {
//         toggleExpanded();
//       }
//     });
  
//   // Tap gesture for mini player
//   const tapGesture = Gesture.Tap()
//     .onStart(() => {
//       if (!isExpanded) {
//         toggleExpanded();
//       }
//     });
  
//   // Compose gestures
//   const composedGestures = Gesture.Simultaneous(panGesture, tapGesture);
  
//   // Animated styles
//   const containerStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ translateY: translateY.value }],
//     };
//   });
  
//   const miniPlayerStyle = useAnimatedStyle(() => {
//     const opacity = interpolate(
//       translateY.value,
//       [-screenHeight / 2, 0],
//       [0, 1],
//       Extrapolate.CLAMP
//     );
    
//     return {
//       opacity,
//       height: interpolate(
//         translateY.value,
//         [-screenHeight / 2, 0],
//         [0, 60],
//         Extrapolate.CLAMP
//       ),
//     };
//   });
  
//   const fullPlayerStyle = useAnimatedStyle(() => {
//     const opacity = interpolate(
//       translateY.value,
//       [-screenHeight, -screenHeight / 2],
//       [1, 0],
//       Extrapolate.CLAMP
//     );
    
//     return {
//       opacity,
//     };
//   });
  
//   const indicatorStyle = useAnimatedStyle(() => {
//     return {
//       opacity: indicatorOpacity.value,
//       transform: [
//         { 
//           translateY: interpolate(
//             translateY.value,
//             [-50, 0],
//             [-10, 0],
//             Extrapolate.CLAMP
//           )
//         }
//       ]
//     };
//   });
  
//   // Format time function
//   const formatTime = (milliseconds: number) => {
//     if (milliseconds <= 0) return "0:00";
    
//     const totalSeconds = Math.floor(milliseconds / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
    
//     return `${minutes}:${seconds.toString().padStart(2, "0")}`;
//   };
  
//   // Empty state check
//   if (!currentSong) return null;
  
//   return (
//     <GestureDetector gesture={composedGestures}>
//       <Reanimated.View
//         style={[
//           {
//             position: "absolute",
//             height: screenHeight + insets.bottom,
//             width: screenWidth,
//             bottom: -insets.bottom,
//             zIndex: 1000,
//           },
//           containerStyle,
//         ]}
//       >
//         {/* Mini Player Bar */}
//         <Reanimated.View
//           style={[
//             {
//               height: 60,
//               width: "100%",
//               position: "absolute",
//               bottom: insets.bottom,
//             },
//             miniPlayerStyle,
//           ]}
//         >
//           <BlurView intensity={20} tint="dark">
//             <LinearGradient
//               colors={["rgba(40, 40, 60, 0.8)", "rgba(20, 20, 30, 0.9)"]}
//               style={{
//                 height: 60,
//                 flexDirection: "row",
//                 alignItems: "center",
//                 paddingHorizontal: 16,
//                 borderTopWidth: 1,
//                 borderTopColor: "rgba(255, 255, 255, 0.1)",
//               }}
//             >
//               {/* Album Art */}
//               <Image
//                 source={{ uri: currentSong.image }}
//                 style={{
//                   width: 40,
//                   height: 40,
//                   borderRadius: 4,
//                   marginRight: 12,
//                 }}
//                 resizeMode="cover"
//               />
              
//               {/* Song Info */}
//               <View style={{ flex: 1, marginRight: 12 }}>
//                 <Text
//                   style={{ color: "white", fontWeight: "bold" }}
//                   numberOfLines={1}
//                   ellipsizeMode="tail"
//                 >
//                   {currentSong.title}
//                 </Text>
//                 <Text
//                   style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
//                   numberOfLines={1}
//                   ellipsizeMode="tail"
//                 >
//                   {currentSong.artist} • {currentSong.playlistName}
//                 </Text>
//               </View>
              
//               {/* Controls */}
//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <TouchableOpacity
//                   onPress={skipToPrevious}
//                   style={{ padding: 8 }}
//                   hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                 >
//                   <FontAwesome6 name="backward-step" size={20} color="#FFC1A1" />
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   onPress={togglePlay}
//                   style={{
//                     width: 36,
//                     height: 36,
//                     borderRadius: 18,
//                     backgroundColor: "rgba(255, 193, 161, 0.2)",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     marginHorizontal: 12,
//                   }}
//                 >
//                   <FontAwesome6
//                     name={playbackState.isPlaying ? "pause" : "play"}
//                     size={16}
//                     color="#FFC1A1"
//                   />
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   onPress={skipToNext}
//                   style={{ padding: 8 }}
//                   hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                 >
//                   <FontAwesome6 name="forward-step" size={20} color="#FFC1A1" />
//                 </TouchableOpacity>
//               </View>
              
//               {/* Swipe Indicator */}
//               <Reanimated.View
//                 style={[
//                   {
//                     position: "absolute",
//                     top: 2,
//                     left: "50%",
//                     width: 36,
//                     height: 4,
//                     borderRadius: 2,
//                     backgroundColor: "rgba(255, 255, 255, 0.3)",
//                     transform: [{ translateX: -18 }],
//                   },
//                   indicatorStyle,
//                 ]}
//               />
//             </LinearGradient>
//           </BlurView>
//         </Reanimated.View>
        
//         {/* Full Screen Player */}
//         <Reanimated.View
//           style={[
//             {
//               height: screenHeight,
//               width: "100%",
//               backgroundColor: "#121225",
//               position: "absolute",
//               top: 0,
//               paddingTop: insets.top,
//               paddingBottom: insets.bottom,
//             },
//             fullPlayerStyle,
//           ]}
//         >
//           <LinearGradient
//             colors={["rgba(30, 30, 45, 1)", "rgba(10, 10, 20, 1)"]}
//             style={{ flex: 1 }}
//           >
//             {/* Header */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 paddingHorizontal: 16,
//                 paddingVertical: 12,
//               }}
//             >
//               <TouchableOpacity
//                 onPress={toggleExpanded}
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               >
//                 <FontAwesome6 name="chevron-down" size={20} color="white" />
//               </TouchableOpacity>
              
//               <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
//                 {currentSong.playlistName}
//               </Text>
              
//               <TouchableOpacity
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               >
//                 <FontAwesome6 name="ellipsis-vertical" size={20} color="white" />
//               </TouchableOpacity>
//             </View>
            
//             {/* Album Art */}
//             <View style={{ alignItems: "center", marginTop: 20 }}>
//               <Image
//                 source={{ uri: currentSong.image }}
//                 style={{
//                   width: screenWidth * 0.7,
//                   height: screenWidth * 0.7,
//                   borderRadius: 12,
//                   marginBottom: 24,
//                 }}
//                 resizeMode="cover"
//               />
//             </View>
            
//             {/* Song Info */}
//             <View style={{ paddingHorizontal: 24, alignItems: "center" }}>
//               <Text
//                 style={{
//                   color: "white",
//                   fontSize: 24,
//                   fontWeight: "bold",
//                   marginBottom: 8,
//                   textAlign: "center",
//                 }}
//               >
//                 {currentSong.title}
//               </Text>
//               <Text
//                 style={{
//                   color: "rgba(255, 255, 255, 0.7)",
//                   fontSize: 16,
//                   marginBottom: 24,
//                   textAlign: "center",
//                 }}
//               >
//                 {currentSong.artist}
//               </Text>
//             </View>
            
//             {/* Progress */}
//             <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
//               <Slider
//                 style={{ width: "100%", height: 40 }}
//                 minimumValue={0}
//                 maximumValue={playbackState.duration || 1}
//                 value={playbackState.currentPosition}
//                 onSlidingComplete={seek}
//                 minimumTrackTintColor="#FFC1A1"
//                 maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
//                 thumbTintColor="#FFC1A1"
//               />
              
//               <View
//                 style={{
//                   flexDirection: "row",
//                   justifyContent: "space-between",
//                   marginTop: -8,
//                 }}
//               >
//                 <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}>
//                   {formatTime(playbackState.currentPosition)}
//                 </Text>
//                 <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}>
//                   {formatTime(playbackState.duration)}
//                 </Text>
//               </View>
//             </View>
            
//             {/* Controls */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 paddingHorizontal: 40,
//                 marginBottom: 32,
//               }}
//             >
//               <TouchableOpacity
//                 onPress={toggleShuffle}
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               >
//                 <FontAwesome6
//                   name="shuffle"
//                   size={20}
//                   color={playbackState.shuffle ? "#FFC1A1" : "rgba(255, 255, 255, 0.6)"}
//                 />
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 onPress={skipToPrevious}
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               >
//                 <FontAwesome6 name="backward-step" size={28} color="white" />
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 onPress={togglePlay}
//                 style={{
//                   width: 64,
//                   height: 64,
//                   borderRadius: 32,
//                   backgroundColor: "rgba(255, 193, 161, 0.2)",
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <FontAwesome6
//                   name={playbackState.isPlaying ? "pause" : "play"}
//                   size={28}
//                   color="#FFC1A1"
//                 />
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 onPress={skipToNext}
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               >
//                 <FontAwesome6 name="forward-step" size={28} color="white" />
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 onPress={toggleRepeat}
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               >
//                 <FontAwesome6
//                   name={playbackState.repeat === "one" ? "repeat-1" : "repeat"}
//                   size={20}
//                   color={
//                     playbackState.repeat !== "off"
//                       ? "#FFC1A1"
//                       : "rgba(255, 255, 255, 0.6)"
//                   }
//                 />
//               </TouchableOpacity>
//             </View>
            
//             {/* Volume */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 paddingHorizontal: 30,
//                 marginBottom: 24,
//               }}
//             >
//               <FontAwesome6
//                 name="volume-low"
//                 size={16}
//                 color="rgba(255, 255, 255, 0.6)"
//               />
//               <Slider
//                 style={{ flex: 1, marginHorizontal: 12, height: 40 }}
//                 minimumValue={0}
//                 maximumValue={1}
//                 value={playbackState.volume}
//                 onValueChange={setVolume}
//                 minimumTrackTintColor="#FFC1A1"
//                 maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
//                 thumbTintColor="#FFC1A1"
//               />
//               <FontAwesome6
//                 name="volume-high"
//                 size={16}
//                 color="rgba(255, 255, 255, 0.6)"
//               />
//             </View>
            
//             {/* Queue */}
//             <View style={{ flex: 1 }}>
//               <Text
//                 style={{
//                   color: "white",
//                   fontSize: 16,
//                   fontWeight: "bold",
//                   marginBottom: 12,
//                   paddingHorizontal: 24,
//                 }}
//               >
//                 Up Next
//               </Text>
              
//               <ScrollView style={{ flex: 1 }}>
//                 {playbackState.queue.map((song, index) => (
//                   <Pressable
//                     key={`${song.id}-${index}`}
//                     style={({ pressed }) => [
//                       {
//                         flexDirection: "row",
//                         alignItems: "center",
//                         paddingVertical: 12,
//                         paddingHorizontal: 24,
//                         backgroundColor:
//                           index === playbackState.currentSongIndex
//                             ? "rgba(255, 193, 161, 0.15)"
//                             : pressed
//                             ? "rgba(255, 255, 255, 0.05)"
//                             : "transparent",
//                       },
//                     ]}
//                     onPress={() => {
//                       // Logic to play this song
//                     }}
//                   >
//                     <Image
//                       source={{ uri: song.image }}
//                       style={{
//                         width: 40,
//                         height: 40,
//                         borderRadius: 4,
//                         marginRight: 12,
//                       }}
//                       resizeMode="cover"
//                     />
                    
//                     <View style={{ flex: 1 }}>
//                       <Text
//                         style={{
//                           color: "white",
//                           fontWeight:
//                             index === playbackState.currentSongIndex
//                               ? "bold"
//                               : "normal",
//                         }}
//                         numberOfLines={1}
//                         ellipsizeMode="tail"
//                       >
//                         {song.title}
//                       </Text>
//                       <Text
//                         style={{
//                           color: "rgba(255, 255, 255, 0.7)",
//                           fontSize: 12,
//                         }}
//                         numberOfLines={1}
//                         ellipsizeMode="tail"
//                       >
//                         {song.artist}
//                       </Text>
//                     </View>
                    
//                     <Text
//                       style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
//                     >
//                       {formatTime(song.duration)}
//                     </Text>
//                   </Pressable>
//                 ))}
//               </ScrollView>
//             </View>
//           </LinearGradient>
//         </Reanimated.View>
//       </Reanimated.View>
//     </GestureDetector>
//   );
// };

