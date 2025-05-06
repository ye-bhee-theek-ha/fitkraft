// app/_layout.tsx

import {
    // Import the specific font objects for each icon set you use
    Feather,
    MaterialCommunityIcons,
    MaterialIcons,
    AntDesign,
    FontAwesome6, // Keep if used elsewhere, otherwise remove if only FontAwesome 5 is needed
    Ionicons,
    FontAwesome // Keep this if you use FontAwesome 5 directly
} from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Slot, Stack } from 'expo-router'; // Keep Slot if RootLayoutNav uses it
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthNavigator, AuthProvider } from '@/context/auth';
import { AppProvider } from '@/context/app';
import { StatusBar } from 'expo-status-bar';
import React from 'react';


export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(home)', // Keep this as '(home)'
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        // Load all the necessary icon fonts
        ...Feather.font,
        ...MaterialCommunityIcons.font,
        ...MaterialIcons.font,
        ...AntDesign.font,
        ...Ionicons.font,
        ...FontAwesome.font, // Keep FontAwesome 5 if used
        // ...FontAwesome6.font, // Add this line if you use FontAwesome 6 icons
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        // Return null or a custom loading screen while fonts are loading
        return null;
    }

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    // Assuming you removed WorkoutProvider based on previous request
    return (
        <>
            <StatusBar style="light"/>
            <AuthProvider>
                <AuthNavigator />
                <AppProvider>
                    {/* Slot renders the current matching child route */}
                    <Slot/>
                </AppProvider>
            </AuthProvider>
        </>
    );
}
