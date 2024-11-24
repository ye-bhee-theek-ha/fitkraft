import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import LoadingSpinner from './LoadingSpinner';
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";


interface AppButtonProps {
  title: string;
  onPress?: () => void;
  class_Name?: string;
  textClassName?: string;
  Loading?: boolean;
  spinnerSize?: number;
  spinnerColor?: string;
  spinnerStyle?: object;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  class_Name,
  textClassName,
  Loading = false,
  spinnerSize = 24,
  spinnerColor = "white",
  spinnerStyle = { marginLeft: 8 }
}) => {

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(Loading ? -5 : 0, { duration: 150 }), // Smooth transition
      },
    ],
  }));


  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={Loading}
      className={`bg-button_bg border-[0.3px] border-white rounded-full px-4 py-2 flex items-center justify-center flex-row  ${class_Name}`}
    >
      <Animated.Text
        style={animatedStyle}
        className={`text-white text-center text-lg ${textClassName}`}
      >  
        {title}
      </Animated.Text>
      {Loading && <LoadingSpinner isLoading={Loading} size={spinnerSize} color={spinnerColor} style={spinnerStyle} />}
    </TouchableOpacity>
  );
};

export default AppButton;
