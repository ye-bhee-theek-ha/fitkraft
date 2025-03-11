import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Modal, 
  ImageSourcePropType 
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeOut, 
  BounceIn, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing, 
  useSharedValue
} from 'react-native-reanimated';
import { Badge } from '@/constants/types';
import { LinearGradient } from 'expo-linear-gradient';

// Sample Badge Data
const SAMPLE_BADGES: Badge[] = [
  {
    id: "ST02",
    name: "Healthy Eating Streak",
    category: "Streak",
    type: "streak",
    BadgeIconImage: "https://dl.dropboxusercontent.com/scl/fi/ni91uag0hxchzsbmpj5z2/Asset-58.png?rlkey=32dwxszqlvlxgyyq21ctm41dl&e=1&st=thak41u7",
    criteria: "Log a healthy meal daily for 10 days",
    unlockCondition: "10-day healthy meal streak",
    points: 35,
    reward: "Unlock exclusive diet tips"
  },
  {
    id: "ST03",
    name: "Meditation Momentum",
    category: "Streak",
    type: "streak",
    BadgeIconImage: "https://dl.dropboxusercontent.com/scl/fi/di5gidwwsj3siiakkogq8/Asset-44.png?rlkey=2o0cnuel3lx2rx57i4axo5kca&e=1&st=y28evpn9",
    criteria: "Meditate daily for 14 days",
    unlockCondition: "14-day meditation streak",
    points: 40,
    reward: "Unlock premium meditation sessions"
  },
  {
    id: "ST04",
    name: "Fitness Challenge",
    category: "Challenge",
    type: "challenge",
    BadgeIconImage: "https://dl.dropboxusercontent.com/scl/fi/f52cwudli9sl83ammmha7/Asset-45.png?rlkey=dyr9wdwlzaaea4b2wr5s96gu5&e=1&st=qeyw3u9p",
    criteria: "Complete 30 workouts in 45 days",
    unlockCondition: "30 workouts in 45 days",
    points: 50,
    reward: "Unlock advanced workout plans"
  },
  {
    id: "ST04",
    name: "Fitness Challenge",
    category: "Challenge",
    type: "challenge",
    BadgeIconImage: "https://dl.dropboxusercontent.com/scl/fi/ni75urex6kwfh2tlq2b4r/Asset-49.png?rlkey=y6cf30x78gwio3ygs7zp9bksm&e=1&st=eyh981ju",
    criteria: "Complete 30 workouts in 45 days",
    unlockCondition: "30 workouts in 45 days",
    points: 50,
    reward: "Unlock advanced workout plans"
  }
];

export default function BadgesScreen(): React.JSX.Element {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const glowAnim = useSharedValue(1);
  // Animated glow effect
  const glowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withRepeat(withTiming(1.2, { 
        duration: 1500, 
        easing: Easing.bounce 
      }), -1, true) }],
      opacity: withRepeat(withTiming(0.7, { 
        duration: 1500, 
        easing: Easing.ease 
      }), -1, true)
    };
  });

  const openBadgeModal = (badge: Badge): void => {
    setSelectedBadge(badge);
  };

  const closeBadgeModal = (): void => {
    setSelectedBadge(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary_dark">
      <Stack.Screen
        options={{
          title: 'My Badges',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mx-2">
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerTintColor: 'white',
          headerTransparent: true
        }}
      />

      {/* Badges Grid */}
      <View className="flex-row flex-wrap justify-center p-4 space-x-2 space-y-2 mt-20">
        {SAMPLE_BADGES.map((badge) => (
            <TouchableOpacity 
                key={badge.id} 
                onPress={() => openBadgeModal(badge)}
                className="w-[40%] p-2 bg-[#2d3748] rounded-lg items-center justify-center shadow-md border-2 border-white/40"
            >
            <View className="w-24 h-24 items-center justify-center">
                <Image 
                source={{ uri: badge.BadgeIconImage }} 
                className="w-full h-full"
                resizeMode="contain"
                />
            </View>
            <Text className="text-white text-center mt-2 text-xs">
                {badge.name}
            </Text>
            </TouchableOpacity>
        ))}
      </View>
      {/* Badge Details Modal */}
      <Modal
        transparent={true}
        visible={!!selectedBadge}
        animationType="fade"
        onRequestClose={closeBadgeModal}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          {selectedBadge && (
            <Animated.View 
              entering={BounceIn}
              exiting={FadeOut}
              className="w-[85%] border-white/50 border-2 bg-primary_dark rounded-2xl py-6 items-center"
            >
                <LinearGradient
                    colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.1)"]}
                    locations={[0, 0.5, 1]}
                    style={{ borderRadius: 15 }}
                    className="absolute bottom-0 left-0 right-0 h-full w-full"
                />
              {/*
              <Animated.View 
                style={[
                  glowStyle, 
                  { 
                    position: 'absolute', 
                    width: '120%', 
                    height: '120%', 
                    backgroundColor: 'rgba(233, 233, 233, 0.5)', 
                    borderRadius: 20,
                    zIndex: -100
                  }
                ]} 
              /> */}

              {/* Close Button */}
              <TouchableOpacity 
                onPress={closeBadgeModal} 
                className="absolute top-4 right-4"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              {/* Badge Icon */}
                <View className="w-40 h-40 relative rounded-full p-2">
                    <Image 
                        source={{ uri: selectedBadge.BadgeIconImage }} 
                        className="absolute w-40 h-40 mb-4"
                        resizeMode="contain"
                    />
                </View>
              
              {/* Badge Details */}
              <Text className="text-white text-2xl font-bold mb-2">
                {selectedBadge.name}
              </Text>

              <View className="w-[90%] bg-primary_dark rounded-lg p-4 mb-4">
                <Text className="text-white text-base mb-2">
                  🏆 Criteria: {selectedBadge.criteria}
                </Text>
                <Text className="text-white text-base mb-2">
                  🔓 Unlock Condition: {selectedBadge.unlockCondition}
                </Text>
                <Text className="text-white text-base">
                  💎 Points: {selectedBadge.points}
                </Text>
              </View>

              <Text className="text-slate-300 text-center italic">
                {selectedBadge.reward}
              </Text>
            </Animated.View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}