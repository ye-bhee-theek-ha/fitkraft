import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { UserProfile } from '@/constants/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileForm from '@/components/profile/profileForm';
import * as ImagePicker from "expo-image-picker"


// Sample data for testing
const sampleUserData: UserProfile = {
  fullName: 'Madison Smith',
  email: 'madisons@example.com',
  mobile: '+1234567890',
  image: null,
  gender: 'female',
  age: 28,
  weight: { whole: 75, fraction: 0 },
  height: { whole: 165, fraction: 0 },
  goal: 'Weight loss',
  activityLevel: 'Moderate'
};

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [NewUserData, setNewUserData] = useState<UserProfile | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [onTop, setOnTop] = useState(true);

  // when profile is selected.
  const [profileSelected, setProfileSelected] = useState(false);
  const fadeHeight = 50;
  const containerHeight = 100;

  // Animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 
  // functions to handle profile changes
  // 

  const onProfileSave = () => {
    // TODO: Save the new user data to the backend
    setUserData(NewUserData)
  };

  
  const onProfileChange = (key: string, value: string) => {
    setNewUserData((prev) => {
      if (!prev) return prev;
      // For nested values (weight and height), update the nested objects:
      if (key === "weightWhole") {
        return {
          ...prev,
          weight: { whole: parseFloat(value) || 0, fraction: prev.weight?.fraction || 0 },
        };
      } else if (key === "weightFraction") {
        return {
          ...prev,
          weight: { whole: prev.weight?.whole || 0, fraction: parseFloat(value) || 0 },
        };
      } else if (key === "heightWhole") {
        return {
          ...prev,
          height: { whole: parseFloat(value) || 0, fraction: prev.height?.fraction || 0 },
        };
      } else if (key === "heightFraction") {
        return {
          ...prev,
          height: { whole: prev.height?.whole || 0, fraction: parseFloat(value) || 0 },
        };
      } else if (key === "age") {
        return { ...prev, age: parseInt(value) || 0 };
      }
      // For other fields, update directly.
      return { ...prev, [key]: value };
    });
  };

  const handleImageSelect = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      setNewUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          image: result.assets[0].uri,
        };
      })
    }
  }



  // Log scrollY whenever it updates and set onTop state
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      console.log('Scroll Y value:', value);
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

  // Scroll to top when onTop is true
  useEffect(() => {
    if (onTop && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [onTop]);


  // Interpolated header height: from 200 to 80 (adjust as needed)
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [250, 90],
    extrapolate: 'clamp'
  });

  // Move profile image from center to left (-50 on X axis)
  const imageTranslateX = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, -80 ,-110],
    extrapolate: 'clamp'
  });

  const imageSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [90, 60],
    extrapolate: 'clamp'
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.6],
    extrapolate: 'clamp'
  });

  // Shift details (full name, email, etc.) slightly to the right as image moves left
  const detailsTranslateX = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 30],
    extrapolate: 'clamp'
  });

  const detailsTranslateY = scrollY.interpolate({
    inputRange: [0, 50 ,100],
    outputRange: [0, -10 ,-65],
    extrapolate: 'clamp'
  });

  const detailOpacity = scrollY.interpolate({
    inputRange: [0, 30 ,100],
    outputRange: [1, 1 ,0],
    extrapolate: 'clamp'
  });

  const detailNameFontSize = scrollY.interpolate({
    inputRange: [0, 50 ,100],
    outputRange: [32, 32 ,24],
    extrapolate: 'clamp'
  });

  const detailEmailFontSize = scrollY.interpolate({
    inputRange: [0, 50 ,100],
    outputRange: [18, 18 ,14],
    extrapolate: 'clamp'
  });

  const menuTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [30, -30],
    extrapolate: 'clamp'
  });

  const menuYIndex = scrollY.interpolate({
    inputRange: [0, 40, 100],
    outputRange: [0, 40, 0],
    extrapolate: 'clamp'
  });

  const statsScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.6],
    extrapolate: 'clamp'
  });

  const headerindex = scrollY.interpolate({
    inputRange: [0, 60, 61, 100],
    outputRange: [0, 0, 1000 ,1000],
    extrapolate: 'clamp'
  });

  const statsYIndex = scrollY.interpolate({
    inputRange: [0, 40 ,100],
    outputRange: [1, 50, 0],
    extrapolate: 'clamp'
  });

  const ProfileMenu_Y_Index = scrollY.interpolate({
    inputRange: [0 ,100, 5000],
    outputRange: [90, 30, 0],
    extrapolate: 'clamp'
  });

  const profileSelected_Header_X = 
  profileSelected ?
  scrollY.interpolate({
    inputRange: [0, 100, 120],
    outputRange: [0, 0, 350],
    extrapolate: 'clamp'
  })
  :
  scrollY.interpolate({
    inputRange: [0, 5000],
    outputRange: [0, 0],
    extrapolate: 'clamp'
  })



  useEffect(() => {
    // Simulate fetching data from backend
    const fetchUserData = async () => {
      try {
        // Replace with actual API call when backend is ready
        // const response = await fetch('your-api-endpoint');
        // const data = await response.json();

        // Using sample data for now
        setUserData(sampleUserData);
        setNewUserData(sampleUserData);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
          title: !profileSelected? 'My Profile' : 'Back',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => {
                profileSelected? setProfileSelected(false) : router.back()
              }} 
              className="px-2">
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          ),

          headerRight: () => (
            profileSelected ? (
            <TouchableOpacity
              onPress={() => {
                onProfileSave();
                setProfileSelected(false);
              }} 
              className="bg-white rounded-lg py-1 px-6 border-2 border-white/20"
            >
                <Text className='text-btn_title'>
                  Save
                </Text>
            </TouchableOpacity>) : null
          ),
          headerStyle: { backgroundColor: '#212835' },
          headerTintColor: 'white',
          headerTransparent: true
        }}
      />

      {/* Wrap content in an Animated.ScrollView */}
      <Animated.ScrollView
        ref={scrollViewRef}
        className="z-10 w-full flex relative"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 250}}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        // when onTop is true, scroll to top
        
      >
        {/* Animated Header */}
        <Animated.View
        style={{ 
          position: 'absolute', 
          top: 80, 
          left: 0, 
          right: 0, 
          height: headerHeight,
          backgroundColor: '#2A3445',
          marginHorizontal: 20,
          borderRadius: 8,

          transform: [
            {translateY: scrollY},
            {translateX: profileSelected_Header_X},
          ],

          zIndex: headerindex
        }}>
          <TouchableOpacity 
            disabled={profileSelected}
            onPress={() => {
              setOnTop(true);
            }}
            className="items-center h-full w-full border-2 border-white/20 rounded-lg relative overflow-hidden"  
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.01)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.1)"]}
              locations={[0, 0.5, 1]}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <Animated.View 
              className="mt-5 flex items-center justify-center"
              style={{width:imageSize, height:imageSize, transform: [{ translateX: imageTranslateX }] }}
            >
              <View className='rounded-full bg-primary_light h-full w-full flex items-center justify-center mb-4'>
                {userData?.image ? (
                  <Image
                    source={{ uri: userData.image }}
                    className="rounded-full mb-2.5"
                  />
                ) : (
                  <Animated.View className="" style={{ transform: [{ scale: imageScale }] }}>
                    <Ionicons name="person" color="#94a3b8" size={60} />
                  </Animated.View>
                )}
                {profileSelected && <View className="absolute bottom-0 right-0 bg-accent rounded-full p-2">
                  <Ionicons name="pencil" size={16} color="white" />
                </View>}
              </View>
            </Animated.View>

            {/* Animated details container */}
            <Animated.View 
              style={{ transform: [{ translateX: detailsTranslateX}, {translateY: detailsTranslateY}] }}
              className="flex items-center justify-center"
            >
              <Animated.Text 
                className="text-[22px] font-bold text-white mb-1"
                style={{fontSize:detailNameFontSize}}
              >
                {userData?.fullName}
              </Animated.Text>

              <Animated.Text 
                className="text-[14px] text-slate-400 mb-1"
                style={{fontSize:detailEmailFontSize}}
              >
                {userData?.email}
              </Animated.Text>

              <Animated.Text
               className="text-[14px] text-slate-400"
               style={{opacity: detailOpacity}}
              >
                {userData?.mobile}
              </Animated.Text>
            </Animated.View>
          </TouchableOpacity>

        </Animated.View>
        {profileSelected && NewUserData ? 
          <Animated.View 
            style={{
                width: '100%',
                overflow: "hidden",
                transform: [{ translateY: ProfileMenu_Y_Index }]
              }}
            >
              <ProfileForm 
                profile={NewUserData}
                onProfileChange={onProfileChange}
                onImageSelect={handleImageSelect}
              />
          </Animated.View>
        :
        <Animated.View style={{ transform: [{ translateY: menuTranslateY }] }}>
          <View className="p-5">
            {/* Stats Section (can be animated similarly if desired) */}
            <Animated.View 
              className='relative h-14 mb-8'
              style={{transform: [{ scale: statsScale }, { translateY: statsYIndex }] }}
            >
              <View className="flex-row bg-[#2d3748] border-2 border-white/50 rounded-lg p-4 w-[90%] self-center">
                <View className="flex-1 items-center justify-center">
                  <Text className="text-[16px] font-bold text-white mb-1">
                    {userData?.weight?.whole} Kg
                  </Text>
                  <Text className="text-[12px] text-slate-400">Weight</Text>
                </View>
                <View className="flex-1 items-center justify-center border-l-2 border-r-2 border-white/50">
                  <Text className="text-[16px] font-bold text-white mb-1">
                    {userData?.age}
                  </Text>
                  <Text className="text-[12px] text-slate-400">Years Old</Text>
                </View>
                <View className="flex-1 items-center justify-center">
                  <Text className="text-[16px] font-bold text-white mb-1">
                    {userData?.height?.whole} CM
                  </Text>
                  <Text className="text-[12px] text-slate-400">Height</Text>
                </View>
              </View>
            </Animated.View>
            
            {/* Menu Options */}
            <Animated.View 
              className="space-y-4"
              style={{ transform: [{ translateY: menuYIndex}] }}
            >
              <MenuOption
                icon="person"
                title="Profile"
                onPress={() => {
                  setProfileSelected(true);
                }}
              />
              <MenuOption
                icon="trophy"
                title="Badges"
                onPress={() => router.push('./(profile)/badges')}
              />
              <MenuOption
                icon="log-out"
                title="Logout"
                onPress={() => {
                  console.log('Logging out...');
                  // router.replace('/login');
                }}
              />
              <MenuOption
                icon="star-outline"
                title="Favorites"
                onPress={() => router.push('./(profile)/favorites')}
              />
              <MenuOption
                icon="restaurant-outline"
                title="My Food Plan"
                onPress={() => router.push('./(profile)/foodPlan')}
              />
              <MenuOption
                icon="notifications-outline"
                title="My Workout Plan"
                source="FontAwesome6"
                onPress={() => router.push('./(profile)/workoutPlan')}
              />
            </Animated.View>
          </View>
        </Animated.View>
    }
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
      colors={["rgba(255,255,255,0.01)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.1)"]}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />

      <View className="flex-row items-center">
        {source == "FontAwesome6"? 
          <FontAwesome6 name={icon} size={24} color="#cbd5e1" className="mr-4" />
          :
          <Ionicons name={icon} size={24} color="#cbd5e1" className="mr-4" />
        }
        <View className='w-2'/>
        <Text className="text-[16px] text-white">{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </TouchableOpacity>
  );
}
