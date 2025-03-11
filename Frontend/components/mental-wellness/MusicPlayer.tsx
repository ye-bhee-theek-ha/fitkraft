import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { useMusicPlayer } from "@/context/MusicPlayer";
import FullPlayer from "./FullPlayer";
import MiniPlayer from "./MiniPlayer";

const MusicPlayerUI: React.FC = () => {
  const { isExpanded, controlsVisible } = useMusicPlayer();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  
  // Animation values (controlled by state)
  const translateY = useSharedValue(0);
  const indicatorOpacity = useSharedValue(1);
  
  // Update animation when expanded state changes
  React.useEffect(() => {
    translateY.value = withSpring(isExpanded ? -screenHeight : 0, {
      damping: 20,
      stiffness: 90,
    });
    indicatorOpacity.value = withTiming(isExpanded ? 0 : 1, { duration: 200 });
  }, [isExpanded, screenHeight, translateY, indicatorOpacity]);
  
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  
  const miniPlayerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-screenHeight / 2, 0],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      height: interpolate(
        translateY.value,
        [-screenHeight / 2, 0],
        [0, 60],
        Extrapolate.CLAMP
      ),
    };
  });
  
  const fullPlayerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-screenHeight, -screenHeight / 2],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });
  
  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{
      translateY: interpolate(
        translateY.value,
        [-50, 0],
        [-10, 0],
        Extrapolate.CLAMP
      )
    }]
  }));

  useEffect (() => {
    console.log("rendering player")
    console.log('controlsVisible :', controlsVisible )
  }, [])

  return (
    <Reanimated.View
      style={[
        {
          position: "absolute",
          width: screenWidth,
          backgroundColor: "#121225",
          bottom: -insets.bottom,
          zIndex: 1000,
        },
        containerStyle,
      ]}
    >
      {/* Mini Player handles its own gestures */}
      <MiniPlayer style={miniPlayerStyle} indicatorStyle={indicatorStyle} />
      
      {/* Full Screen Player */}
      <FullPlayer style={fullPlayerStyle} screenHeight={screenHeight} />
    </Reanimated.View>
  );
};

export default MusicPlayerUI;