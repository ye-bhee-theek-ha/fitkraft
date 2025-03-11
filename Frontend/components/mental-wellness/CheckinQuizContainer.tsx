import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import DailyCheckInQuiz from './CheckinQuiz';
const DailyQuizContainer = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [isStatusChecked, setIsStatusChecked] = useState(false);

  // Check with backend if today's quiz has already been conducted
  useEffect(() => {
    const checkQuizStatus = async () => {
      try {
        const response = await fetch('https://your-api-endpoint.com/quiz-status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        // Expecting a response with a boolean "quizTaken"
        if (!data.quizTaken) {
          setShowQuiz(true);
        }
      } catch (error) {
        // TODO
        // console.error('Error checking quiz status:', error);
        setIsStatusChecked(true);
        setShowQuiz(true);

        // Optionally decide whether to show the quiz if there's an error
      } finally {
        setIsStatusChecked(true);
      }
    };

    checkQuizStatus();
  }, []);

  // While checking status, render a loading indicator (or nothing)
  if (!isStatusChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00BCD4" />
      </View>
    );
  }

  return (
    <DailyCheckInQuiz
      visible={showQuiz}
      onClose={() => setShowQuiz(false)}
      onComplete={(score) => {
        console.log('Quiz completed with score:', score);
        setShowQuiz(false);
      }}
    />
  );
};

export default DailyQuizContainer;
