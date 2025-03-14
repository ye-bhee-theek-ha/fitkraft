import { Stack } from "expo-router";
import DailyQuizContainer from '@/components/mental-wellness/CheckinQuizContainer';
export default function MentalWellnessLayout() {
  return (
    <>
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="meditation" />
        <Stack.Screen name="music" />
        <Stack.Screen name="sleep" />
        <Stack.Screen name="RelaxingVideos" />
      </Stack>
      {/* <DailyQuizContainer /> */}
    </>
  );
}
