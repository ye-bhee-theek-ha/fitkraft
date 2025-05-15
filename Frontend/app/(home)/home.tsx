import { useState } from "react"
import { Dimensions, View } from "react-native"

import WorkoutList from "@/components/home screen/WorkoutListHome"
import DietaryList from "@/components/home screen/DietaryListHome"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler"
import { BarChart } from "react-native-gifted-charts"
import { DietaryItem } from "@/constants/types"
import MusicPlayerCard from "@/components/home screen/Music"
import { useMusicPlayer } from "@/context/MusicPlayer"
import { useApp } from "@/context/app"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

const Home = () => {
  const {dietaryPlan} = useApp()
  const { currentSong, togglePlayerExpansion, playbackState, skipToPrevious, togglePlay, skipToNext } = useMusicPlayer();
  
  const initialTranslateX = useSharedValue(0);

  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  const PAGE_SPACING = 40;
  const PAGE_WIDTH = SCREEN_WIDTH + PAGE_SPACING;
  const NUM_PAGES = currentSong ? 3 : 2; // Adjust based on your data
  

  const translateX = useSharedValue(0);


  const panGesture = Gesture.Pan()
  .onStart(() => {
    // Capture starting translation if needed (not shown here)
  })
  .onUpdate((event) => {
    translateX.value = event.translationX * 0.1 + translateX.value;
    // In many cases you might want to use a worklet-safe pattern here (storing a start value)
  })
  .onEnd((event) => {
    'worklet';
    // Calculate the current page based on the translation value
    let currentPage = Math.round(-translateX.value / PAGE_WIDTH);
    let nextPage = currentPage;

    // Define a threshold of half the screen width
    const threshold = SCREEN_WIDTH * 0.3;

    // Decide if we should swipe to the next page (left swipe)
    if (event.velocityX < -500  || (event.velocityX >= -5000 && event.velocityX <= 5000 && translateX.value < -threshold)) {
      nextPage = Math.min(currentPage + 1, NUM_PAGES - 1);
    }
    // Decide if we should swipe to the previous page (right swipe)
    if (event.velocityX > 500 || (event.velocityX >= -5000 && event.velocityX <= 5000 && translateX.value > threshold)) {
      nextPage = Math.max(currentPage - 1, 0);
    }

    // Animate to the snapped position based on the page index.
    translateX.value = withSpring(-nextPage * PAGE_WIDTH, {
      velocity: event.velocityX,
      stiffness: 70,
    });
  });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));



  const data = [
    { value: 2500, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Jan" },
    { value: 2400, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 3500, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Feb" },
    { value: 3000, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 4500, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Mar" },
    { value: 4000, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 5200, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Apr" },
    { value: 4900, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 3000, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "May" },
    { value: 2800, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 4500, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Mar" },
    { value: 4000, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 5200, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Apr" },
    { value: 4900, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },
  ]

  return (
      <ScrollView className="flex-1">
          <View>
            <View className="w-full flex items-center">
              <GestureDetector gesture={panGesture}>
                <Animated.View className="w-[90%] flex-row mb-6" style={animatedStyle}>
                  <View className="w-full">
                    <DietaryList />
                  </View>
                  <View className="w-20"/>
                  <View className="w-full">
                    <WorkoutList />
                  </View>
                  <View className="w-20"/>
                  <View className="w-full">
                    <MusicPlayerCard
                      currentSong={currentSong}
                      playbackState={playbackState}
                      togglePlay={togglePlay}
                      skipToNext={skipToNext}
                      skipToPrevious={skipToPrevious}
                    />
                  </View>
                </Animated.View>
              </GestureDetector>
            </View>
            <View className="w-full flex items-center justify-center mb-6">
              <View className="w-[90%] bg-primary_dark rounded-3xl p-3 border-2 border-white/20 overflow-hidden">
                <BarChart
                  data={data}
                  barWidth={16}
                  initialSpacing={10}
                  spacing={14}
                  barBorderRadius={4}
                  showGradient
                  yAxisThickness={0}
                  xAxisType={"dashed"}
                  xAxisColor={"lightgray"}
                  yAxisLabelWidth={0}
                  stepValue={1000}
                  maxValue={6000}
                  noOfSections={6}
                  labelWidth={40}
                  xAxisLabelTextStyle={{ color: "lightgray", textAlign: "center" }}
                  showLine
                  lineConfig={{
                    color: "#F29C6E",
                    thickness: 3,
                    curved: true,
                    hideDataPoints: true,
                    shiftY: 20,
                    initialSpacing: -30,
                  }}
                />
              </View>
            </View>
          </View>
      </ScrollView>
  )
}


export default Home


