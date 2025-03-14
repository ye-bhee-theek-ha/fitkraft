import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedScrollHandler,
  withTiming,
  interpolate,
  Extrapolate,
  withSpring
} from 'react-native-reanimated';
import { WorkoutDetails, WorkoutType } from '@/constants/types';
import { router } from 'expo-router';


const { width } = Dimensions.get('window');

const workout: WorkoutDetails = {
  id: '1',
  name: 'Morning Yoga Flow',
  mediaUrl: 'https://dl.dropboxusercontent.com/scl/fi/lorhliry3xwk0cclct193/cn5a6s1hfqya1.mp4?rlkey=sep02o9bazbxviic94pf09uk4&e=1&st=m1gc5de0',
  mediaType: 'video',
  duration: { minutes: 30, seconds: 0 },
  type: 'yoga',
  caloriesBurned: 200,
  description: {
    intensity: 3
  },
  additionalDetails: {
    rep: 3,
    location: 'Home'
  }
};



const WorkoutDetailsScreen = () => {
  // Reanimated shared values
  const scrollY = useSharedValue(0);
  const fadeValue = useSharedValue(0);
  const slideValue = useSharedValue(50);


  const mediaRef = useRef(null);

  useEffect(() => {
    // Run entrance animations with Reanimated
    fadeValue.value = withTiming(1, { duration: 800 });
    slideValue.value = withTiming(0, { duration: 800 });
  }, []);

  const formatDuration = (duration: { minutes: number; seconds: number }) => {
    const minutes = String(duration.minutes).padStart(2, '0');
    const seconds = String(duration.seconds).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getTypeColor = (type: WorkoutType): string => {
    switch (type) {
      case 'cardio': return '#FF6B6B';
      case 'strength': return '#4ECDC4';
      case 'flexibility': return '#9D65C9';
      case 'hit': return '#FFD166';
      default: return '#6D8A96';
    }
  };

  // Scroll handler with Reanimated
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles with Reanimated
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100, 150],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [-60, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  const mediaAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0, 100],
      [1.2, 1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeValue.value,
      transform: [{ translateY: slideValue.value }],
      paddingHorizontal: 16,
    };
  });

  return (
    <View className="flex-1 bg-primary_dark">
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header, 
          headerAnimatedStyle
        ]}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity onPress={() => {}} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">{workout.name}</Text>
        <View style={{ width: 32 }} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Back Button (visible when not scrolled) */}
        <TouchableOpacity 
        // TODO: Add navigation functionality
          onPress={() => { router.back() }} 
          className="absolute left-4 top-12 z-10 bg-black/50 rounded-full p-2"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Media Section */}
        <Animated.View className="rounded-b-3xl mx-3 overflow-hidden" style={mediaAnimatedStyle}>
          {workout.mediaType === 'video' ? (
            <Video
              ref={mediaRef}
              source={{ uri: workout.mediaUrl }}
              resizeMode= {ResizeMode.COVER}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              shouldPlay
              isLooping
              style={{
                width: '100%',
                height: 330,
              }}
            />
          ) : (
            <Image
              source={{ uri: workout.mediaUrl }}
              style={{
                width: '100%',
                height: 330,
              }}
              resizeMode="cover"
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            locations={[0.6, 1]}
            style={{
              height: 200,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
        </Animated.View>

        {/* Main Content */}
        <Animated.View 
          style={[
            contentAnimatedStyle,
            { zIndex: 10, paddingTop:5, paddingBottom:40 }
          ]}
        >
          {/* Workout Title */}
          <Animatable.Text 
            animation="fadeInUp" 
            delay={200}
            className="text-white text-3xl font-bold mb-1"
          >
            {workout.name}
          </Animatable.Text>

          {/* Workout Type & Duration */}
          <View className="flex-row items-center justify-between mb-6">
            <Animatable.View 
              animation="fadeInLeft" 
              delay={400}
              className="flex-row items-center"
            >
              <View 
                className="px-3 py-1 rounded-full mr-2 flex-row items-center" 
                style={{ backgroundColor: getTypeColor(workout.type) + '30', borderColor: getTypeColor(workout.type), borderWidth: 1 }}
              >
                <MaterialIcons 
                  name={workout.type === 'cardio' ? 'directions-run' : 
                        workout.type === 'strength' ? 'fitness-center' : 
                        workout.type === 'flexibility' ? 'self-improvement' : 
                        workout.type === 'hit' ? 'timer' : 'category'}
                  size={14} 
                  color={getTypeColor(workout.type)} 
                />
                <Text className="text-white text-xs ml-1">{workout.type}</Text>
              </View>
            </Animatable.View>
            
            <Animatable.View 
              animation="fadeInRight" 
              delay={400}
              className="flex-row items-center"
            >
              <Ionicons name="time-outline" size={16} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm ml-1">{formatDuration(workout.duration)}</Text>
            </Animatable.View>
          </View>

          {/* Stats Overview */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={600}
            className="flex-row justify-between mb-6"
          >
            <View className="bg-white/10 px-4 py-3 rounded-2xl flex-1 mr-2 border border-white/20">
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="local-fire-department" size={16} color="#FF6F61" />
                <Text className="text-white text-xs ml-1">Calories</Text>
              </View>
              <Text className="text-white text-xl font-bold">{workout.caloriesBurned}</Text>
            </View>
            <View className="bg-white/10 px-4 py-3 rounded-2xl flex-1 mr-2 border border-white/20">
              <View className="flex-row items-center mb-1">
                <FontAwesome5 name="tachometer-alt" size={14} color="#FFD166" />
                <Text className="text-white text-xs ml-1">Intensity</Text>
              </View>
              <Text className="text-white text-xl font-bold">{workout.description.intensity}/5</Text>
            </View>
            <View className="bg-white/10 px-4 py-3 rounded-2xl flex-1 border border-white/20">
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="speed" size={16} color="#64B6AC" />
                <Text className="text-white text-xs ml-1">RPE</Text>
              </View>
              <Text className="text-white text-xl font-bold">{workout.additionalDetails.rep}/10</Text>
            </View>
          </Animatable.View>

          {/* Workout Description Card */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={800}
            className="bg-white/5 rounded-3xl p-4 mb-6 border border-white/10"
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
              locations={[0, 1]}
              style={StyleSheet.absoluteFill}
              className="rounded-3xl"
            />
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="list" size={18} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Exercises</Text>
            </View>

            {/* {workout.description.exercises.map((exercise, index) => (
              <View key={index} className="mb-3">
                <View className="flex-row items-center">
                  <View className="h-2 w-2 rounded-full bg-green mr-2" />
                  <Text className="text-white font-medium">{exercise.name}</Text>
                </View>
                <View className="flex-row flex-wrap ml-4 mt-1">
                  {exercise.sets && exercise.reps && (
                    <View className="bg-white/10 px-2 py-1 rounded-md mr-2 mb-1">
                      <Text className="text-gray-300 text-xs">{exercise.sets} sets × {exercise.reps} reps</Text>
                    </View>
                  )}
                  {exercise.distance && (
                    <View className="bg-white/10 px-2 py-1 rounded-md mr-2 mb-1">
                      <Text className="text-gray-300 text-xs">{exercise.distance}</Text>
                    </View>
                  )}
                  {exercise.equipment && (
                    <View className="bg-white/10 px-2 py-1 rounded-md mb-1">
                      <Text className="text-gray-300 text-xs">{exercise.equipment}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))} */}
          </Animatable.View>

          {/* Additional Details Card */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={1000}
            className="bg-white/5 rounded-3xl p-4 mb-6 border border-white/10"
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
              locations={[0, 1]}
              style={StyleSheet.absoluteFill}
              className="rounded-3xl"
            />
            
            <View className="flex-row items-center mb-4">
              <Feather name="info" size={18} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Additional Details</Text>
            </View>

            <View className="flex-row flex-wrap">
              <View className="w-1/2 pr-2 mb-4">
                <Text className="text-gray-400 text-xs mb-1">Location</Text>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={
                      workout.additionalDetails.location === 'Home' ? 'home-outline' :
                      workout.additionalDetails.location === 'Gym' ? 'fitness-outline' :
                      workout.additionalDetails.location === 'Outdoors' ? 'leaf-outline' : 'location-outline'
                    } 
                    size={16} 
                    color="white" 
                  />
                  <Text className="text-white text-sm ml-1">{workout.additionalDetails.location}</Text>
                </View>
              </View>
              {(workout.additionalDetails.preWorkoutEnergy !== undefined || workout.additionalDetails.postWorkoutEnergy !== undefined) && (
                <View className="w-full mb-4">
                  <Text className="text-gray-400 text-xs mb-2">Energy Levels</Text>
                  <View className="flex-row items-center">
                    {workout.additionalDetails.preWorkoutEnergy !== undefined && (
                      <View className="flex-row items-center mr-4">
                        <Text className="text-gray-300 text-xs mr-2">Pre:</Text>
                        <View className="bg-white/10 rounded-full h-2" style={{ width: `${workout.additionalDetails.preWorkoutEnergy * 20}%` }} />
                      </View>
                    )}
                    {workout.additionalDetails.postWorkoutEnergy !== undefined && (
                      <View className="flex-row items-center">
                        <Text className="text-gray-300 text-xs mr-2">Post:</Text>
                        <View className="bg-white/10 rounded-full h-2" style={{ width: `${workout.additionalDetails.postWorkoutEnergy * 20}%` }} />
                      </View>
                    )}
                  </View>
                </View>
              )}

            </View>
          </Animatable.View>

          
          {/* Share/Save Button */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={1400}
            className="mb-6"
          >
            <TouchableOpacity className="bg-accent py-4 rounded-2xl flex-row items-center justify-center">
              <Ionicons name="share-outline" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Share Workout</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Start Workout Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-primary_dark">
        <TouchableOpacity className="bg-green py-4 rounded-2xl flex-row items-center justify-center">
          <Ionicons name="play" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Start Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  backButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },

});

export default WorkoutDetailsScreen;