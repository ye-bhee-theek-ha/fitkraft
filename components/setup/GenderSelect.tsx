
import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';



const GenderSelect = () => {

  const [selection, setSelection] = useState("")
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
        <Animated.View style={animatedStyle} className={`h-36 w-36 items-center justify-center rounded-full border-white ${
          selection === 'male' ? selected_classnames : Not_selected_classnames
          }`}
        >
          <SimpleLineIcons name="symbol-male" size={70} color={selection == "male" ? "#212835" : "white"} />
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
        <Animated.View style={animatedStyle} className={`h-36 w-36 items-center justify-center rounded-full border-white ${
          selection === 'female' ? selected_classnames : Not_selected_classnames
          }`}
        >
          <SimpleLineIcons name="symbol-female" size={70} color={selection === "female" ? "#212835" : "white"} />
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
    <View className='h-full justify-start'>
      <View className='w-full items-center justify-center my-12'>
        <Text className='text-hero text-white w-[80%] text-center py-6'>
          What is your Gender?
        </Text>
        <View className='bg-primary_light w-full items-center justify-center'>
          <Text className='text-text text-white w-[80%] text-center py-6'>
            we have 1000+ samlpes to get you started
          </Text>
        </View>

        <View>
          <MaleBtn
            selection={selection}
            setSelection={() => {setSelection("male")}}
          />
          <FemaleBtn
            selection={selection}
            setSelection={() => {setSelection("female")}}
          />
        </View>

      </View>
    </View>
    );
};

export default GenderSelect;
