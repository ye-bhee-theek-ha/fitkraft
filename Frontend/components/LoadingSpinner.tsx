import React, { useEffect } from 'react';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { StyleProp, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  isLoading: boolean;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading, size = 24, color = "grey", style }) => {
  const rotateValue = useSharedValue(0);

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotateValue.value}deg` }],
    };
  });

  useEffect(() => {
    if (isLoading) {
      rotateValue.value = withRepeat(withTiming(360, { duration: 1000 }), -1);
    } else {
      rotateValue.value = 0; // Reset rotation if not loading
    }
  }, [isLoading, rotateValue]);

  return (
    <Animated.View style={[rotateStyle, style]}>
      <EvilIcons name="spinner-3" size={size} color={color} />
    </Animated.View>
  );
};

export default LoadingSpinner;
