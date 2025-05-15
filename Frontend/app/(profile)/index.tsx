import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, ScrollView, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { UserProfile, WeightOrHeight } from '@/constants/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileForm from '@/components/profile/profileForm';
import * as ImagePicker from "expo-image-picker";
import { useAuth } from '@/context/auth';
import { useApp } from '@/context/app';
import axios from 'axios';
import { BASE_URL } from '@/constants/baseUrl';

const { width, height } = Dimensions.get("window");

export function parseWeightHeightString(value: string | number | undefined): WeightOrHeight | undefined {
    // Return undefined for null or undefined input
    if (value === undefined || value === null) {
        return undefined;
    }

    let wholePart: number;
    let fractionPart: number = 0; // Default fraction to 0

    // Handle string input
    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        // Return undefined for empty strings
        if (trimmedValue === "") {
            return undefined;
        }
        // Split the string by the decimal point
        const parts = trimmedValue.split('.');
        // Parse the whole number part
        wholePart = parseInt(parts[0], 10);

        // If there's a decimal part, parse the first digit after the decimal
        if (parts.length > 1 && parts[1].length > 0) {
            const firstFractionDigit = parseInt(parts[1].substring(0, 1), 10);
            // Only assign if the first fraction digit is a valid number
            if (!isNaN(firstFractionDigit)) {
                fractionPart = firstFractionDigit;
            }
        }
    // Handle number input
    } else if (typeof value === 'number') {
        // Return undefined for non-finite numbers (NaN, Infinity)
        if (!isFinite(value)) {
             return undefined;
        }
        // Get the integer part
        wholePart = Math.floor(value);

        // Calculate the first decimal place value
        // Multiply by 10, get the fractional part, round to handle floating point issues
        const decimalPart = Math.round((value - wholePart) * 10);
        // Assign if positive, otherwise keep 0
        fractionPart = decimalPart > 0 ? decimalPart : 0;

    } else {
        // Should not be reached due to type signature, but acts as a safeguard
        return undefined;
    }

    // Final validation: Ensure the whole part is a valid number
    if (isNaN(wholePart)) {
        return undefined; // Parsing failed
    }

    // Ensure fraction is a single digit (0-9) - clamp the value
    const validFraction = Math.min(Math.max(fractionPart, 0), 9);

    // Return the structured object
    return {
        whole: wholePart,
        fraction: validFraction,
    };
}

export function parseAgeString(value: string | undefined): number | undefined {
    // Return undefined for null, undefined, or empty/whitespace strings
    if (value === undefined || value === null || value.trim() === "") {
        return undefined;
    }
    // Parse the trimmed string as an integer (base 10)
    const num = parseInt(value.trim(), 10);
    // Return the number if valid, otherwise undefined
    return isNaN(num) ? undefined : num;
}

export function weightOrHeightToNumber(value: WeightOrHeight | undefined | null): number {
    if (!value || typeof value.whole !== 'number') {
        // Handle cases where value or value.whole is not a valid number
        return 0; // Or throw an error, or return NaN, depending on desired handling
    }
    // Ensure fraction is treated as a single decimal digit
    const fractionValue = typeof value.fraction === 'number' && !isNaN(value.fraction)
        ? Math.min(9, Math.max(0, value.fraction)) // Clamp fraction to 0-9
        : 0;

    return value.whole + (fractionValue / 10);
}


export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [NewUserData, setNewUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onTop, setOnTop] = useState(true);
  const [profileSelected, setProfileSelected] = useState(false);

  // Use Animated.Value for scroll events
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const { signOut, jwt } = useAuth();
  const { userProfile, fetchUserProfile } = useApp()

  // Define responsive constants based on screen dimensions
  const HEADER_MAX_HEIGHT = height * 0.35; // 35% of screen height
  const HEADER_MIN_HEIGHT = height * 0.12; // 15% of screen height
  const IMAGE_MAX_SIZE = width * 0.25;     // 25% of screen width
  const IMAGE_MIN_SIZE = width * 0.15;     // 15% of screen width

  const [contentHeight, setContentHeight] = useState<number>(0);

  // Interpolated header height
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp'
  });

  // Animate image translation, size, and scale
  const imageTranslateX = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, -width * 0.2, -width * 0.3],
    extrapolate: 'clamp'
  });
  const imageSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [IMAGE_MAX_SIZE, IMAGE_MIN_SIZE],
    extrapolate: 'clamp'
  });
  const imageScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.6],
    extrapolate: 'clamp'
  });

  // Animated translation and opacity for the details container
  const detailsTranslateX = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 30],
    extrapolate: 'clamp'
  });
  const detailsTranslateY = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, -10, -65],
    extrapolate: 'clamp'
  });
  const detailOpacity = scrollY.interpolate({
    inputRange: [0, 30, 100],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp'
  });
  const detailNameFontSize = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [32, 32, 24],
    extrapolate: 'clamp'
  });
  const detailEmailFontSize = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [18, 18, 14],
    extrapolate: 'clamp'
  });

  // Menu translation for responsiveness
  const menuTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [30, -30],
    extrapolate: 'clamp'
  });
  const statsScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.6],
    extrapolate: 'clamp'
  });
  const headerindex = scrollY.interpolate({
    inputRange: [0, 60, 61, 100],
    outputRange: [0, 0, 1000, 1000],
    extrapolate: 'clamp'
  });
  const statsYIndex = scrollY.interpolate({
    inputRange: [0, 40, 100],
    outputRange: [0, 30, -20],
    extrapolate: 'clamp'
  });
  const ProfileMenu_Y_Index = scrollY.interpolate({
    inputRange: [0, 100, 5000],
    outputRange: [90, 30, 0],
    extrapolate: 'clamp'
  });
  const profileSelected_Header_X = profileSelected
    ? scrollY.interpolate({
        inputRange: [0, 100, 120],
        outputRange: [0, 0, 550],
        extrapolate: 'clamp'
      })
    : scrollY.interpolate({
        inputRange: [0, 5000],
        outputRange: [0, 0],
        extrapolate: 'clamp'
      });

  // Simulate fetching data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {

        console.log("Fetched user data for profile:", userProfile);
        setUserData(userProfile);
        setNewUserData(userProfile);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error (e.g., show error message)
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userProfile]); // Re-fetch if authUser changes


  // Listen to scrollY updates to update the onTop state
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value > 0 && onTop) {
        setOnTop(false);
      } else if (value === 0 && !onTop) {
        setOnTop(true);
      }
    });
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY, onTop]);

  // Scroll to top if needed
  useEffect(() => {
    if (onTop && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [onTop]);

  // Profile form handlers
  const onProfileSave = async () => {
    setUserData(NewUserData);
    console.log("body for save")
    console.log({...NewUserData, height: weightOrHeightToNumber(NewUserData?.height), weight: weightOrHeightToNumber(NewUserData?.weight) })
    try {
      const response = await axios.patch(`${BASE_URL}/user/update`,
      { ...NewUserData, height: weightOrHeightToNumber(NewUserData?.height), weight: weightOrHeightToNumber(NewUserData?.weight) },
      {  
        headers: { Authorization: `Bearer ${jwt}` },
        timeout: 5000,
      });
    } catch (error) {
      console.error('AppProvider: Failed to update full user profile:', error);
    }
  };

const onProfileChange = (key: keyof UserProfile, value: string) => {
    setNewUserData((prev) => {
        if (!prev) return prev; // Should not happen if initialized correctly

        // Create a copy to modify
        const updatedProfile = { ...prev };

        // Use a switch or if/else if to handle parsing based on the key
        switch (key) {
            case 'age':
                updatedProfile.age = parseAgeString(value); // Parse string to number | undefined
                break;
            case 'weight':
                updatedProfile.weight = parseWeightHeightString(value);
                break;
            case 'height':
                updatedProfile.height = parseWeightHeightString(value);
                break;

            case 'fullName':
            case 'nickname':
            case 'email':
            case 'mobile':
            case 'image':
            case 'gender': // Assuming gender is stored as string in state based on form
            case 'goal':   // Assuming goal is stored as string in state
            case 'activityLevel': // Assuming activityLevel is stored as string in state
                // We assert the key is a valid key of UserProfile that accepts string
                updatedProfile[key] = value;
                break;
            // Add cases for any other specific fields if needed
            // Default case could log an error for unhandled keys if strictness is desired
            default:
                 console.warn(`onProfileChange received unhandled key: ${key}`);
                 // Decide if you want to handle unknown keys or ignore them
                 // updatedProfile[key as keyof UserProfile] = value; // Less safe option
                 break;

        }
        return updatedProfile;
    });
};


  const handleImageSelect = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setNewUserData((prev) => {
        if (!prev) return prev;
        return { ...prev, image: result.assets[0].uri };
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-800">
        <LoadingSpinner isLoading={true} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary_dark">
      <Stack.Screen
        options={{
          title: !profileSelected ? 'My Profile' : 'Back',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                profileSelected ? setProfileSelected(false) : router.back();
              }}
              className="px-2"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerRight: () =>
            profileSelected ? (
              <TouchableOpacity
                onPress={() => {
                  onProfileSave();
                  setProfileSelected(false);
                }}
                className="bg-white rounded-lg py-1 px-6 border-2 border-white/20"
              >
                <Text className="text-btn_title">Save</Text>
              </TouchableOpacity>
            ) : null,
          headerStyle: { backgroundColor: '#212835' },
          headerTintColor: 'white',
          headerTransparent: true,
        }}
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        className="z-10 w-full flex relative"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT, paddingBottom: 85}}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: height * 0.1,
            left: 20,
            right: 20,
            height: headerHeight,
            backgroundColor: '#2A3445',
            borderRadius: 8,
            transform: [{ translateY: scrollY }, { translateX: profileSelected_Header_X }],
            zIndex: headerindex,
          }}
        >
          <TouchableOpacity
            disabled={profileSelected}
            onPress={() => setOnTop(true)}
            className="items-center h-full w-full border-2 border-white/20 rounded-lg relative overflow-hidden"
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']}
              locations={[0, 0.5, 1]}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <Animated.View
              className="mt-5 flex items-center justify-center"
              style={{ width: imageSize, height: imageSize, transform: [{ translateX: imageTranslateX }] }}
            >
              <View className="rounded-full bg-primary_light h-full w-full flex items-center justify-center mb-4">
                {userData?.image ? (
                  <Image source={{ uri: userData.image }} className="rounded-full mb-2.5" style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Animated.View style={{ transform: [{ scale: imageScale }] }}>
                    <Ionicons name="person" color="#94a3b8" size={60} />
                  </Animated.View>
                )}
                {profileSelected && (
                  <View className="absolute bottom-0 right-0 bg-accent rounded-full p-2">
                    <Ionicons name="pencil" size={16} color="white" />
                  </View>
                )}
              </View>
            </Animated.View>
            <Animated.View style={{ transform: [{ translateX: detailsTranslateX }, { translateY: detailsTranslateY }] }} className="flex items-center justify-center">
              <Animated.Text className="text-white font-bold mb-1" style={{ fontSize: detailNameFontSize }}>
                {userData?.fullName}
              </Animated.Text>
              <Animated.Text className="text-slate-400 mb-1" style={{ fontSize: detailEmailFontSize }}>
                {userData?.email}
              </Animated.Text>
              <Animated.Text className="text-slate-400" style={{ opacity: detailOpacity }}>
                Goal: {userData?.goal}
              </Animated.Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
        {profileSelected && NewUserData ? (
          <Animated.View style={{ width: '100%', overflow: 'hidden', transform: [{ translateY: ProfileMenu_Y_Index }] }}>
            <ProfileForm profile={NewUserData} onProfileChange={onProfileChange} onImageSelect={handleImageSelect} />
          </Animated.View>
        ) : (
          <Animated.View style={{ transform: [{ translateY: menuTranslateY }] }}>
            <View className="p-5">
              <Animated.View className="relative mb-8" style={{ height: height * 0.1, transform: [{ scale: statsScale }, { translateY: statsYIndex }] }}>
                <View className="flex-row bg-[#2d3748] border-2 border-white/50 rounded-lg p-4 w-[90%] self-center">
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-[16px] font-bold text-white mb-1">{(userData?.weight?.fraction || 0)+ (userData?.weight?.whole || 0)} Kg</Text>
                    <Text className="text-[12px] text-slate-400">Weight</Text>
                  </View>
                  <View className="flex-1 items-center justify-center border-l-2 border-r-2 border-white/50">
                    <Text className="text-[16px] font-bold text-white mb-1">{userData?.age}</Text>
                    <Text className="text-[12px] text-slate-400">Years Old</Text>
                  </View>
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-[16px] font-bold text-white mb-1">{(userData?.height?.fraction || 0) + (userData?.height?.whole || 0)} CM</Text>
                    <Text className="text-[12px] text-slate-400">Height</Text>
                  </View>
                </View>
              </Animated.View>
              <Animated.View className="space-y-4" style={{ transform: [{ translateY: menuTranslateY }] }}>
                
                <MenuOption icon="person" title="Profile" onPress={() => setProfileSelected(true)} />

                <MenuOption icon="trophy" title="Badges" onPress={() => router.push('./(profile)/badges')} />

                <MenuOption
                  icon="log-out"
                  title="Logout"
                  onPress={() => {
                    signOut();
                    router.push('/(auth)/login');
                  }}
                />

                {/* <MenuOption icon="star-outline" title="Favorites" onPress={() => router.push('./(profile)/favorites')} /> */}

                <MenuOption icon="restaurant-outline" title="My Food Plan" onPress={() => router.push('./(profile)/foodPlan')} />

                <MenuOption icon="list" title="My Workout Plan" onPress={() => router.push('./(profile)/workoutPlan')} />
              
              </Animated.View>
            </View>
          </Animated.View>
        )}
        <View className='h-[70px]' />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// Menu Option Component
function MenuOption({
  icon,
  title,
  onPress,
  source = null,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  source?: string | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-5 mb-2 border-2 border-white/20 rounded-lg"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="flex-row items-center">
        {source == "FontAwesome6" ? (
          <FontAwesome6 name={icon} size={24} color="#cbd5e1" className="mr-4" />
        ) : (
          <Ionicons name={icon} size={24} color="#cbd5e1" className="mr-4" />
        )}
        <View className="w-2" />
        <Text className="text-[16px] text-white">{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </TouchableOpacity>
  );
}
