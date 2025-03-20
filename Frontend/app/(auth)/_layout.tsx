import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        animation: 'ios',
      }}>
      <Stack.Screen name="login" options={{}} />
      <Stack.Screen name="signup" options={{}} />
    </Stack>
  );
}
