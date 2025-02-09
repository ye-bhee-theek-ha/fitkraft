
import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface GenderSelectProps {
  selectedGender: string | null
  onGenderSelect: (gender: string) => void
}

const GenderSelect = ({ selectedGender, onGenderSelect }: GenderSelectProps) => {
  const selected_classnames = "border-2" ;
  const Not_selected_classnames = "border-[0.5px]"; 
  
  
  const MaleBtn = ({ selection, setSelection }: { selection: string | null; setSelection: () => void }) => {

    const progress = useSharedValue(0);
    
    useEffect(() => {
      progress.value = withTiming(selection === 'male' ? 1 : 0, { duration: 400,  });
    }, [selection]);
  

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: 1 + progress.value * 0.05 }],
        backgroundColor: interpolateColor(
         progress.value,
        [0, 1],
        ['#212835', '#687791'],
        'RGB'
        ),
      };
    });
    return (
      <Pressable
        onPressOut={setSelection}
        className='items-center my-4'
      >
        <Animated.View style={animatedStyle} className={`h-32 w-32 items-center justify-center rounded-full border-white ${
          selection === 'male' ? selected_classnames : Not_selected_classnames
          }`}
        >
          <SimpleLineIcons name="symbol-male" size={60} color={selection == "male" ? "#212835" : "white"} />
        </Animated.View>
        <View className='mt-4'>
          <Text className='text-text font-bold text-white'>
            Male
          </Text>
        </View>
      </Pressable>
    );
  }

  const FemaleBtn = ({selection, setSelection}: {selection: string | null, setSelection: () => void}) => {
    const progress = useSharedValue(0);
    
    useEffect(() => {
      progress.value = withTiming(selection === 'female' ? 1 : 0, { duration: 400 });
    }, [selection]);
  

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: 1 + progress.value * 0.05  }],
        backgroundColor: interpolateColor(
         progress.value,
        [0, 1],
        ['#212835', '#687791'],
        'RGB'
        ),
      };
    });

    return (
      <Pressable
        onPressOut={setSelection}
        className='items-center'
       >
        <Animated.View style={animatedStyle} className={`h-32 w-32 items-center justify-center rounded-full border-white ${
          selection === 'female' ? selected_classnames : Not_selected_classnames
          }`}
        >
          <SimpleLineIcons name="symbol-female" size={60} color={selection === "female" ? "#212835" : "white"} />
        </Animated.View>
        <View className='my-4'>
          <Text className='text-text font-bold text-white'>
            Female
          </Text>
        </View>
      </Pressable>
    );
  }
  
  

  return (
    <View className='flex flex-1 justify-start w-screen '>
      <View className='w-full items-center justify-center mt-4 mb-10'>
        <Text className='text-hero text-white w-[80%] text-center py-6'>
          What is your Gender?
        </Text>
        {/* <View className='bg-primary_light w-full items-center justify-center'>
          <Text className='text-text text-white w-[80%] text-center py-6'>
            we have 1000+ samlpes to get you started
          </Text>
        </View> */}

        <View>
          <MaleBtn
            selection={selectedGender}
            setSelection={() => onGenderSelect("male")}
          />
          <FemaleBtn
            selection={selectedGender}
            setSelection={() => onGenderSelect("female")}
          />
        </View>

      </View>
    </View>
    );
};

export default GenderSelect;
