"use client" // If this is a Next.js component, otherwise remove

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import DailyCheckInQuiz from './CheckinQuiz'; // Assuming this is your actual quiz UI component
import { useAuth } from '@/context/auth'; // Adjust path as necessary
import * as SecureStore from 'expo-secure-store';

const DAILY_QUIZ_TAKEN_PREFIX_LOCAL = 'daily_quiz_taken_local_'; // Local prefix

const DailyQuizContainer = () => {
  const { authUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [showQuiz, setShowQuiz] = useState(false);
  const [isStatusChecked, setIsStatusChecked] = useState(false); // To know when local check is done

  // hello
  const getFormattedDate = () => { 
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const checkQuizStatusLocally = async () => {
      if (isAuthLoading) {
        // Wait for auth loading to complete before checking,
        // as we need authUser and isAuthenticated status.
        return;
      }

      setIsStatusChecked(false); // Start check

      if (!isAuthenticated || !authUser?._id) {
        // If user is not authenticated or no authUser, don't show quiz.
        // Also, mark status as checked to prevent loading spinner indefinitely.
        console.log('[DailyQuizContainer] User not authenticated or authUser not available. Quiz will not be shown.');
        setShowQuiz(false);
        setIsStatusChecked(true);
        return;
      }

      const userId = authUser._id;
      const todayStr = getFormattedDate();
      const quizTakenKey = `${DAILY_QUIZ_TAKEN_PREFIX_LOCAL}${userId}_${todayStr}`;

      try {
        const quizTakenToday = await SecureStore.getItemAsync(quizTakenKey);
        if (quizTakenToday === 'true') {
          console.log(`[DailyQuizContainer] Quiz already taken today (${todayStr}) for user: ${userId} (checked locally).`);
          setShowQuiz(false);
        } else {
          console.log(`[DailyQuizContainer] Quiz not taken today (${todayStr}) for user: ${userId}. Showing quiz (checked locally).`);
          setShowQuiz(true);
        }
      } catch (error) {
        console.error('[DailyQuizContainer] Error checking quiz status locally for user', userId, ':', error);
        // Fallback behavior: decide whether to show the quiz or not.
        // For safety, let's not show it if there's an error reading the status.
        setShowQuiz(false);
        Alert.alert("Quiz Status Error", "Could not determine if the daily quiz was taken. Please try again later.");
      } finally {
        setIsStatusChecked(true);
      }
    };

    checkQuizStatusLocally();
  }, [authUser, isAuthenticated, isAuthLoading]); // Re-run if auth state changes

  const markQuizAsTakenLocally = async () => {
    if (!authUser?._id) return; // Should not happen if quiz was shown

    const userId = authUser._id;
    const todayStr = getFormattedDate();
    const quizTakenKey = `${DAILY_QUIZ_TAKEN_PREFIX_LOCAL}${userId}_${todayStr}`;

    try {
      await SecureStore.setItemAsync(quizTakenKey, 'true');
      console.log(`[DailyQuizContainer] Quiz marked as taken for today (${todayStr}) for user: ${userId} (saved locally).`);
    } catch (error) {
      console.error('[DailyQuizContainer] Error marking quiz as taken locally for user', userId, ':', error);
      Alert.alert("Save Error", "Could not save quiz completion status.");
    }
  };

  const handleQuizComplete = async (score: any) => { // Define 'any' or a proper score type
    console.log('[DailyQuizContainer] Quiz completed with score:', score);
    setShowQuiz(false);
    await markQuizAsTakenLocally(); 
  };

  const handleQuizClose = async () => {
    console.log('[DailyQuizContainer] Quiz closed without completion.');
    setShowQuiz(false);
    // Decide if closing without completion should also mark it as "taken" for the day.
    // For this example, we'll mark it as taken to prevent it from showing again today.
    await markQuizAsTakenLocally();
  };

  // While checking status OR if auth is still loading, render a loading indicator (or nothing)
  if (!isStatusChecked || isAuthLoading) {
    return (
      <View >
        {/* You can put a global loading spinner here if desired, or keep it minimal */}
        {/* <ActivityIndicator size="large" color="#00BCD4" /> */}
      </View>
    );
  }

  // If user is not authenticated (e.g., after status check and auth load), don't show the quiz component.
  // This check is important if the component is mounted in a shared layout.
  if (!isAuthenticated) {
      return null;
  }

  return (
    <DailyCheckInQuiz // Your actual quiz component
      visible={showQuiz} // Controlled by local state
      onClose={handleQuizClose}
      onComplete={handleQuizComplete}
    />
  );
};


export default DailyQuizContainer;
