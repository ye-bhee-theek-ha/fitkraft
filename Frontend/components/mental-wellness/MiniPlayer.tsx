// MiniPlayer.tsx (modified)
import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Reanimated, { runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/context/MusicPlayer";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface MiniPlayerProps {
  style: any;
  indicatorStyle: any;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ style, indicatorStyle }) => {
  const { currentSong, toggleExpanded, playbackState, skipToPrevious, togglePlay, skipToNext } = useMusicPlayer();
  const insets = useSafeAreaInsets();

  if (!currentSong) return null;


  // Define a tap gesture that toggles expanded state.
  const tapGesture = Gesture.Tap().onStart(() => {
    runOnJS(toggleExpanded)();
  });

  // Optionally, add a pan gesture to detect an upward swipe
  const panGesture = Gesture.Pan().onEnd((event) => {
    if (event.translationY < -50) {
      runOnJS(toggleExpanded)();
    }
  });

  // Combine gestures so that either a tap or an upward swipe works
  const combinedGesture = Gesture.Simultaneous(tapGesture, panGesture);

  // ... (rest of your renderControls and layout remain unchanged)
  const renderControls = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        onPress={skipToPrevious}
        style={{ padding: 8 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome6 name="backward-step" size={20} color="#FFC1A1" />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={togglePlay}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(255, 193, 161, 0.2)",
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: 12,
        }}
      >
        <FontAwesome6 name={playbackState.isPlaying ? "pause" : "play"} size={16} color="#FFC1A1" />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={skipToNext}
        style={{ padding: 8 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome6 name="forward-step" size={20} color="#FFC1A1" />
      </TouchableOpacity>
    </View>
  );

  // console.log("mini player");


  return (
    <GestureDetector gesture={combinedGesture}>
      <Reanimated.View
        style={[
          {
            height: 600,
            width: "100%",
            position: "absolute",
            bottom: insets.bottom,
          },
          style,
        ]}
      >
        <BlurView intensity={20} tint="dark">
          <LinearGradient
            colors={["rgba(40, 40, 60, 0.8)", "rgba(20, 20, 30, 0.9)"]}
            style={{
              height: 60,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              borderTopWidth: 1,
              borderTopColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Album Art */}
            <Image
              source={{ uri: currentSong.image }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                marginRight: 12,
              }}
              resizeMode="cover"
            />
            
            {/* Song Info */}
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: "white", fontWeight: "bold" }} numberOfLines={1} ellipsizeMode="tail">
                {currentSong.title}
              </Text>
              <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }} numberOfLines={1} ellipsizeMode="tail">
                {currentSong.artist} • {currentSong.playlistName}
              </Text>
            </View>
            
            {/* Controls */}
            {renderControls()}
            
            {/* Swipe Indicator */}
            <Reanimated.View
              style={[
                {
                  position: "absolute",
                  top: 2,
                  left: "50%",
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  transform: [{ translateX: -18 }],
                },
                indicatorStyle,
              ]}
            />
          </LinearGradient>
        </BlurView>
      </Reanimated.View>
    </GestureDetector>
  );
};

export default MiniPlayer;
