
import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FlatList } from 'react-native-gesture-handler';



const HeightSelect = () => {

  const [selection, setSelection] = useState("")
  const selected_classnames = "border-2" ;
  const Not_selected_classnames = "border-[0.5px]"; 
  
  const ages = new Array(100).fill(0);

  return (
    <View className='h-full justify-start'>
      <View className='w-full items-center justify-center my-12'>
        <Text className='text-hero text-white w-[80%] text-center py-6'>
          What is your Gender?
        </Text>
    
        <View>
          <FlatList
            data={ages}
            horizontal
            renderItem={({index}) => <View style={{marginHorizontal: 10}}><Text>{index + 1}</Text></View>}
          />
        </View>

      </View>
    </View>
    );
};

export default HeightSelect
