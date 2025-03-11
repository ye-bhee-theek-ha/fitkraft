import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
  Easing,
  Image
} from 'react-native';
import { Checkbox } from 'expo-checkbox';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { Activity, DailyCheckInQuizProps, Emotion } from '@/constants/types';
import { EMOTIONS, MENTAL_HEALTH_ACTIVITIES } from '@/constants/sampledata';

const { width } = Dimensions.get('window');
// Calculate the container width (90% of device width capped at 400)
const containerWidth = Math.min(width * 0.9, 400);
const numberOfSteps = 4;

const DailyCheckInQuiz = ({ visible, onClose, onComplete }: DailyCheckInQuizProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activities, setActivities] = useState<Activity[]>(MENTAL_HEALTH_ACTIVITIES);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [mentalHealthRating, setMentalHealthRating] = useState(5);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Calculate score based on user responses
  const calculateScore = () => {
    let newScore = 0;
    newScore += activities.filter(a => a.checked).length * 3;
    if (selectedEmotion) {
      if (selectedEmotion.label === 'Happy') newScore += 5;
      if (selectedEmotion.label === 'Content') newScore += 3;
    }
    newScore += mentalHealthRating;
    return newScore;
  };

  // Handle next step transition with animation
  const goToNextStep = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(slideAnim, {
        toValue: -(currentStep + 1) * containerWidth,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      setCurrentStep(currentStep + 1);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        delay: 100,
        useNativeDriver: true,
      }).start();

      if (currentStep === 3) {
        const finalScore = calculateScore();
        setScore(finalScore);
        setQuizCompleted(true);
        sendResultsToServer(finalScore);
      }
    });
  };

  // Toggle activity selection
  const toggleActivity = (id: number) => {
    setActivities(
      activities.map(activity =>
        activity.id === id ? { ...activity, checked: !activity.checked } : activity
      )
    );
  };

  // Send results to backend server
  const sendResultsToServer = async (finalScore: number) => {
    try {
      const response = await fetch('https://your-api-endpoint.com/quiz-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: finalScore,
          activities: activities.filter(a => a.checked).map(a => a.label),
          emotion: selectedEmotion?.label || null,
          rating: mentalHealthRating,
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      console.log('Results sent successfully:', data);
    } catch (error) {
      console.error('Error sending quiz results:', error);
    }
  };

  // Handle quiz completion
  const handleComplete = () => {
    onComplete && onComplete(score);
    onClose();
  };

  // Reset quiz state when reopened
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setActivities(MENTAL_HEALTH_ACTIVITIES);
      setSelectedEmotion(null);
      setMentalHealthRating(5);
      setScore(0);
      setQuizCompleted(false);
      slideAnim.setValue(0);
      fadeAnim.setValue(1);
    }
  }, [visible]);

  // Render progress dots
  const renderProgressDots = () => {
    return (
      <View className="flex-row justify-center mt-2.5">
        {[0, 1, 2, 3].map((step) => (
          <View
            key={step}
            className={`mx-1 rounded-full h-2 ${currentStep === step ? 'bg-[#FF6F61] w-4' : 'bg-[#475569] w-2'}`}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <View className="flex-1 justify-center items-center bg-black/70">
        <View style={{ width: containerWidth }} className="rounded-2xl overflow-hidden relative">
          {/* Main container */}
          <View className="bg-primary rounded-2xl overflow-hidden pb-5">
            <Text className="text-lg font-bold text-white text-center py-4 bg-primary_light">
              Daily Check-In Quiz
            </Text>
            <Animated.View
              style={{
                width: containerWidth * numberOfSteps,
                transform: [{ translateX: slideAnim }],
                opacity: fadeAnim,
              }}
              className="flex-row"
            >
              {/* Step 1: Welcome Screen */}
              <View style={{ width: containerWidth }} className="px-5 py-4 bg-primary_dark">
                <Text className="text-text font-semibold text-white text-center mb-5">
                  Today's Mental Health
                </Text>
                {quizCompleted ? (
                  <View className="bg-primary_light/50 border-2 border-error_bg rounded-lg p-5 items-center justify-center min-h-[150px]">
                    <Text className="text-2xl font-bold text-white mb-2">
                      Score: {score}
                    </Text>
                    <Text className="text-text font-medium text-white text-center">
                      You are making great progress. Keep Going!
                    </Text>
                  </View>
                ) : (
                  <View className="bg-primary_light/50 border-2 border-error_bg rounded-lg p-5 items-center justify-center min-h-[150px]">
                    <Text className="text-white text-text text-center font-medium">
                      Let's check in on your mental health today. This will only take a minute.
                    </Text>
                  </View>
                )}
              </View>

              {/* Step 2: Activities */}
              <View style={{ width: containerWidth }} className="px-5 py-4">
                <Text className="text-text font-semibold text-white text-center mb-5">
                  What did you do for your mental health today?
                </Text>
                <ScrollView className="max-h-[300px]">
                  {activities.map((activity) => (
                    <TouchableOpacity
                      key={activity.id}
                      className="flex-row items-center py-2.5 border-b border-b-[#334155]"
                      onPress={() => toggleActivity(activity.id)}
                    >
                      <Checkbox
                        value={activity.checked}
                        onValueChange={() => toggleActivity(activity.id)}
                        color={activity.checked ? '#FF9B91' : undefined}
                        className="mr-2.5 rounded"
                      />
                      <Text className="text-white text-base">{activity.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Step 3: Emotions */}
              <View style={{ width: containerWidth }} className="px-5 py-4">
                <Text className="text-base font-semibold text-white text-center mb-5">
                  How Do You Feel Today?
                </Text>
                <View className="flex-row flex-wrap justify-between mt-2.5">
                  {EMOTIONS.map((emotion) => (
                    <TouchableOpacity
                      key={emotion.id}
                      className={`w-[48%] rounded-lg p-4 items-center mb-4 ${
                        selectedEmotion?.id === emotion.id ? 'bg-[#00BCD4]' : 'bg-[#334155]'
                      }`}
                      onPress={() => setSelectedEmotion(emotion)}
                    >
                      <Image
                        source={emotion.emoji}
                        style={{ width: 40, height: 40, marginBottom: 10 }}
                        resizeMode="contain"
                      />
                      <Text className="text-white text-base font-medium">{emotion.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Step 4: Rating */}
              <View style={{ width: containerWidth }} className="px-5 py-4">
                <Text className="text-text font-semibold text-white text-center mb-5">
                  Mental Health Rating
                </Text>
                <View className="bg-primary_light/50 border-2 border-error_bg rounded-lg p-5 items-center">
                  <Text className="text-white text-text font-semibold mb-5">
                    Today's Rating
                  </Text>
                  <View className="flex-row items-center w-full mb-2.5">
                    <Text className="text-white text-sm">1</Text>
                    <Slider
                      style={{ flex: 1, height: 40, marginHorizontal: 10}}
                      minimumValue={0}
                      maximumValue={10}
                      step={1}
                      value={mentalHealthRating}
                      onValueChange={setMentalHealthRating}
                      minimumTrackTintColor="#FF6F61"
                      maximumTrackTintColor="#FF6F61"
                      thumbTintColor="#FFC1A1"
                    />
                    <Text className="text-white text-sm">10</Text>
                  </View>
                  <Text className="text-2xl font-bold text-white">{mentalHealthRating}</Text>
                </View>
              </View>
            </Animated.View>

            {renderProgressDots()}

            <TouchableOpacity
              className="bg-error_bg rounded-full py-3 px-7 self-center mt-5"
              onPress={currentStep === 3 ? handleComplete : goToNextStep}
            >
              <Text className="text-white text-btn_title font-semibold">
                {currentStep === 3 ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>

          </View>

          {/* <TouchableOpacity
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 justify-center items-center"
            onPress={onClose}
          >
            <Text className="text-white text-xl font-bold">×</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  );
};

export default DailyCheckInQuiz;
