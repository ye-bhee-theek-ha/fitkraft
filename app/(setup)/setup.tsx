import React, { useRef, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from "expo-image-picker"

import AntDesign from '@expo/vector-icons/AntDesign';
import WelcomeScreen from '@/components/setup/Welcome';
import GenderSelect from '@/components/setup/GenderSelect';
import AgeSelect from '@/components/setup/AgeSelect';
import WeightSelect from '@/components/setup/WeightSelect';
import GoalSelect from '@/components/setup/GoalSelect';
import AppButton from '@/components/Button';
import HeightSelect from '@/components/setup/HeightSelect';
import ActivityLevelSelect from '@/components/setup/ActivityLevelSelect';


const FitnessProfileScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentStep, setCurrentStep] = useState(0)

  const onboardingSteps = [
    { key: "ageSelector", component: AgeSelect },
    { key: "goalSelector", component: GoalSelect },
    { key: "heightSelector", component: HeightSelect },
  ]

  const handleContinue = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      flatListRef.current?.scrollToIndex({ index: currentStep + 1, animated: true })
    } else {
      console.log("Onboarding completed")
      // Handle onboarding completion
    }
  }

  const flatListRef = useRef<FlatList>(null)


  // Goal select
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal)
  }

  // Activity Level select
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const handleLevelSelect = (Level: string) => {
    setSelectedGoal(Level)
  }

  //Profile Info Select
  const [profile, setProfile] = useState({
    fullName: "",
    nickname: "",
    email: "",
    mobile: "",
    image: null as string | null,
  })

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

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
      setProfile((prev) => ({
        ...prev,
        image: result.assets[0].uri,
      }))
    }
  }



  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      flatListRef.current?.scrollToIndex({ index: currentStep - 1, animated: true })
    }
  }

  
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.key === "goalSelector") {
      return <item.component selectedGoal={selectedGoal} onGoalSelect={handleGoalSelect} />
    }
    return <item.component />
  }


  return (
    <View className='h-screen'>

      <View className="flex-row items-center justify-between px-6 py-8">
        {currentStep > -1 && (
          <TouchableOpacity onPress={handleBack} className="flex-row items-center" activeOpacity={0.7}>
            <AntDesign name="left" size={24} color="white" />
            <Text className="text-white text-base ml-1">Back</Text>
          </TouchableOpacity>
        )}
        <Text className="text-white text-base">
          Step {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </View>
      
      {/* <ActivityLevelSelect selectedLevel={selectedLevel} onLevelSelect={handleLevelSelect} /> */}
      <AgeSelect />

      <View className='flex-1 justify-end items-center my-12'>
        <AppButton
            title={currentStep === onboardingSteps.length - 1 ? "Finish" : "Continue"}
            onPress={handleContinue}
            class_Name={'w-[60%] text-white font-semibold text-text font-Display ' + (currentStep === onboardingSteps.length - 1 ? 'bg-accent_blue border-none' : '')}
            textClassName='font-semibold'
            Loading= {loading}
          />
      </View>

    </View>
  );
};

export default FitnessProfileScreen;
