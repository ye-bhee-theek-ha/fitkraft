
import React from 'react'
import { Text, View } from 'react-native';

const WelcomeScreen = () => {
  return (
    <View className='flex-1 justify-end w-screen'>
      <View className='w-full items-center justify-center '>
        <Text className='text-hero text-white w-[80%] text-center py-6'>
          Consistency Is the Key To progress. Don't Give Up!
        </Text>
        <View className='bg-primary_light w-full items-center justify-center'>
          <Text className='text-text text-white w-[80%] text-center py-6'>
            we have 1000+ samlpes to get you started
          </Text>
        </View>
      </View>
    </View>
    );
};

export default WelcomeScreen
