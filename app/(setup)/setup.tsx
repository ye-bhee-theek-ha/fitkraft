import React, { useRef, useState } from 'react';
import { Animated, Dimensions, View, Text, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import WelcomeScreen from '@/components/setup/Welcome';
import GenderSelect from '@/components/setup/GenderSelect';
import AgeSelect, { AgeSelectRef } from '@/components/setup/AgeSelect';
import WeightSelect, { WeightSelectRef } from '@/components/setup/WeightSelect';
import GoalSelect from '@/components/setup/GoalSelect';
import AppButton from '@/components/Button';
import HeightSelect from '@/components/setup/HeightSelect';
import ActivityLevelSelect from '@/components/setup/ActivityLevelSelect';
import ProfileForm from '@/components/setup/ProfileInfo';
import HorizontalPicker from '@/components/setup/pickers/horizontalPicker copy';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  key: string;
  component: React.ComponentType<any>;
  isValid: () => boolean;
  setval?: () => void;
}

const SetupScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState<number>(0);
  const agepickerRef = useRef<AgeSelectRef>(null);
  const [selectedHeight, setSelectedHeight] = useState<number>(170);
  const [selectedWeight, setSelectedWeight] = useState<number>(70);
  const weightpickerRef = useRef<WeightSelectRef>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedActivityLevel, setSelectedActivityLevel] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    fullName: "",
    nickname: "",
    email: "",
    mobile: "",
    image: null as string | null,
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const onboardingSteps: OnboardingStep[] = [
    { key: "Welcome", component: WelcomeScreen, isValid: () => true },
    {
      key: "genderSelector",
      component: GenderSelect,
      isValid: () => selectedGender === "male" || selectedGender === "female",
    },
    {
      key: "ageSelector",
      component: AgeSelect,
      isValid: () => true,
    },
    {
      key: "weightSelector",
      component: WeightSelect,
      isValid: () => selectedWeight >= 40 && selectedWeight <= 150,
    },
    {
      key: "goalSelector",
      component: GoalSelect,
      isValid: () => selectedGoal !== null,
    },
    {
      key: "activitySelector",
      component: ActivityLevelSelect,
      isValid: () => selectedActivityLevel !== null,
    },
    {
      key: "Profile",
      component: ProfileForm,
      isValid: () => !!profile.fullName && !!profile.email && !!profile.mobile,
    },
  ];

  const slideAnim = useRef(new Animated.Value(0)).current;
  const currentStepAnim = useRef(new Animated.Value(0)).current;

  // Animate transition between steps.
  const animateTransition = (newStep: number, direction: 'left' | 'right') => {
    const toValue = direction === 'left' ? -width : width;
    Animated.timing(slideAnim, {
      toValue,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(newStep);
      slideAnim.setValue(direction === 'left' ? width : -width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });

    Animated.timing(currentStepAnim, {
      toValue: newStep,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const handleContinue = () => {
    if (!onboardingSteps[currentStep].isValid()) {
        alert("Please complete this step before continuing.");
        return;
    }
    if (currentStep < onboardingSteps.length - 1) {
      animateTransition(currentStep + 1, 'left');
    } else {
      console.log("Onboarding completed");
      // TODO
      // Add completion handling here.
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateTransition(currentStep - 1, 'right');
    }
  };

  const renderCurrentStep = () => {
    const step = onboardingSteps[currentStep];
    switch (step.key) {
      case "Welcome":
        return <step.component />;
      case "genderSelector":
        return <step.component selectedGender={selectedGender} onGenderSelect={setSelectedGender} />;
      case "ageSelector":
        return <step.component ref={agepickerRef} />;
      case "weightSelector":
        return <step.component ref={weightpickerRef} />;
      case "goalSelector":
        return <step.component selectedGoal={selectedGoal} onGoalSelect={setSelectedGoal} />;
      case "activitySelector":
        return <step.component selectedLevel={selectedActivityLevel} onLevelSelect={setSelectedActivityLevel} />;
      case "Profile":
        return <step.component profile={profile} onProfileChange={handleProfileChange} />;
      default:
        return null;
    }
  };

  return (
    <View className="h-screen">
      <View className="flex-row items-center justify-between px-6 pb-4 pt-8">
        {currentStep > 0 && (
          <TouchableOpacity onPress={handleBack} className="flex-row items-center">
            <AntDesign name="left" size={24} color="white" />
            <Text className="ml-1 text-base text-white">Back</Text>
          </TouchableOpacity>
        )}
        <Text className="text-base text-white">
          Step {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </View>

      {/* Animated content container */}
      <Animated.View
        className="flex-1 "
        style={{ width, transform: [{ translateX: slideAnim }] }}
      >
        {renderCurrentStep()}
      </Animated.View>

      <Animated.View
        className="h-10 "
        style={{ width }}
      >
        <View className="flex-row justify-center mt-4">
          {onboardingSteps.map((_, index) => {
            const Width = currentStepAnim.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [8, 16, 8],
              extrapolate: 'clamp',
            });

            const backgroundColor = currentStepAnim.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: ["gray", "white", "gray"],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                className={`mx-1 rounded-full`}
                style={{
                  width: Width,
                  height: 8,
                  backgroundColor: backgroundColor,
                }}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* Footer Button */}
      <View className="items-center mt-6 mb-12">
        <AppButton
          title={currentStep === onboardingSteps.length - 1 ? "Finish" : "Continue"}
          onPress={handleContinue}
          class_Name={`w-3/5 text-white font-semibold text-base font-Display ${
            currentStep === onboardingSteps.length - 1 ? "bg-accent_blue border-0" : ""
          }`}
          textClassName="font-semibold"
          Loading={false}
        />
      </View>
    </View>
  );
};

export default SetupScreen;
