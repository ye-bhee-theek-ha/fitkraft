"use client"

import { router, useRouter, useSegments } from 'expo-router';
import axios from 'axios';
import * as React from 'react';
import { Onboarding, SignUpData, User, UserProfile } from '@/constants/types'; // Ensure your types are correctly defined
import { BASE_URL } from '@/constants/baseUrl'; // Ensure BASE_URL is correctly defined
import * as SecureStore from 'expo-secure-store';
// import LoadingSpinner from '@/components/LoadingSpinner'; // Assuming you might use this elsewhere
import { Alert } from 'react-native'; // Import Alert

// --- Constants for Storage Keys ---
const TOKEN_KEY = 'user_jwt_token';
const WORKOUT_GENERATION_TIMESTAMP_KEY_PREFIX = 'workout_generation_timestamp_'; // Prefix for user-specific key

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
}

interface AuthState {
  jwt: string | null;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => void;
  completeOnboarding: (onboardingData: Onboarding) => Promise<any>;
  updateAuthUserOnboardingStatus: (status: boolean) => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [authState, setAuthState] = React.useState<AuthState>({
    jwt: null,
    authUser: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Function to check and trigger workout generation
  const checkAndGenerateWorkout = async (userId: string, token: string) => {
    if (!userId || !token) { 
        console.log('[AuthContext] Skipping workout generation: Missing userId or token.');
        return;
    }
    const WORKOUT_GENERATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; 
    const userSpecificWorkoutTimestampKey = `${WORKOUT_GENERATION_TIMESTAMP_KEY_PREFIX}${userId}`;

    try {
      const lastGenerationTimestampStr = await SecureStore.getItemAsync(userSpecificWorkoutTimestampKey);
      const currentTime = new Date().getTime();

      if (lastGenerationTimestampStr) {
        const lastGenerationTime = parseInt(lastGenerationTimestampStr, 10);
        if (currentTime - lastGenerationTime < WORKOUT_GENERATION_INTERVAL) {
          console.log('[AuthContext] Workout generation not due yet for user:', userId);
          return;
        }
      }
      console.log('[AuthContext] Triggering workout generation for user:', userId);
      await axios.post(
        `${BASE_URL}/workout/generate/${userId}`, 
        { userId: userId }, 
        {
          timeout: 15000,
        }
      );
      await SecureStore.setItemAsync(userSpecificWorkoutTimestampKey, currentTime.toString());
      console.log('[AuthContext] Workout plan generated (or request sent) and timestamp updated for user:', userId);
    } catch (error) {
      console.error('[AuthContext] Error during workout generation check/trigger for user', userId, ':', error);
      if (axios.isAxiosError(error)) {
        console.error('[AuthContext] Workout generation API error details:', error.response?.data || error.message);
      }
    }
  };

  React.useEffect(() => {
    const loadAuthData = async () => {
      let storedJwt: string | null = null;
      try {
        storedJwt = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedJwt) {
          console.log('[AuthContext] Stored JWT found. Verifying...');
          const userInfoFromToken = await checkOnboardingStatus(storedJwt); 

          if (userInfoFromToken && userInfoFromToken._id) {
            console.log('[AuthContext] Token seems valid. User info from token:', userInfoFromToken);
            setAuthState(prev => ({
              ...prev,
              jwt: storedJwt,
              authUser: userInfoFromToken,
              isAuthenticated: true,
              isLoading: false,
            }));
            await checkAndGenerateWorkout(userInfoFromToken._id, storedJwt);
          } else {
            throw new Error("Token validation failed or user info not found with stored token.");
          }
        } else {
          console.log('[AuthContext] No stored JWT found.');
          setAuthState({ jwt: null, authUser: null, isAuthenticated: false, isLoading: false });
        }
      } catch (error) {
        console.error('[AuthContext] Error loading auth data:', error);
        if (storedJwt) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
        setAuthState({ jwt: null, authUser: null, isAuthenticated: false, isLoading: false });
      }
    };
    loadAuthData();
  }, []);


  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await axios.post(`${BASE_URL}/user/login`, { email, password }, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      console.log("[AuthContext] Login API Response Data:", response.data);
      const loginData = response.data;

      if (!loginData.token || !loginData._id || !loginData.name || !loginData.email) {
        throw new Error(loginData.message || 'Login failed. Server response missing token or essential user details (_id, name, email).');
      }

      const token = loginData.token;
      const fullAuthUser = await checkOnboardingStatus(token);

      if (!fullAuthUser || !fullAuthUser._id) {
        await SecureStore.deleteItemAsync(TOKEN_KEY); // Clean up potentially bad token from login
        throw new Error('Login succeeded but failed to retrieve full user session details (onboarding status). Please try again.');
      }

      await SecureStore.setItemAsync(TOKEN_KEY, token); // Store the token that successfully fetched user status

      setAuthState({
        jwt: token,
        authUser: fullAuthUser,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log("[AuthContext] Signed in user:", fullAuthUser);
      await checkAndGenerateWorkout(fullAuthUser._id, token);

    } catch (error) {
      console.error('[AuthContext] Sign in error:', error);
      // Token might have been cleared already if fullAuthUser check failed
      // Ensure it's cleared if error happened before that.
      if (!(error instanceof Error && error.message.includes("full user session details"))) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
      setAuthState({ jwt: null, authUser: null, isAuthenticated: false, isLoading: false });

      let displayErrorMessage = 'An unexpected error occurred during login.';
      if (axios.isAxiosError(error)) {
        displayErrorMessage = error.response?.data?.message || 'Login failed. Please check your connection or credentials.';
      } else if (error instanceof Error) {
        displayErrorMessage = error.message;
      }
      Alert.alert('Sign In Failed', displayErrorMessage);
    }
  };

  // ** CORRECTED FUNCTION **
  // This function expects the backend at /user/onboarding-status to return a FLAT object
  // with AuthUser fields: { _id, name, email, onboardingComplete }
  const checkOnboardingStatus = async (jwt: string): Promise<AuthUser | null> => {
    try {
      // The type parameter for axios.get should match the expected flat response structure.
      const response = await axios.get<AuthUser>(`${BASE_URL}/user/onboarding-status`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
        timeout: 5000,
      });

      // Check if the response.data itself is the user object and has an _id
      if (response.data && response.data._id) {
        // Construct and return the AuthUser object from the flat response.data
        return {
            _id: response.data._id,
            name: response.data.name || "User", // Provide a fallback if name can be missing
            email: response.data.email, // Ensure email is present
            onboardingComplete: response.data.onboardingComplete ?? false, // Default to false if undefined
        };
      }
      // Log the actual response if it doesn't match expectations
      console.warn('[AuthContext] checkOnboardingStatus: User data not found directly in response or missing _id. Response:', response.data);
      return null;
    } catch (error) {
      console.error('[AuthContext] Error checking onboarding status:', error);
      if (axios.isAxiosError(error)) {
        console.error('[AuthContext] Onboarding status API error response:', error.response?.data);
      }
      return null;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await axios.post(
        `${BASE_URL}/user/create`,
        { name: data.fullName, nickname: data.nickname, email: data.email, password: data.password, },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000, }
      );

      console.log("[AuthContext] SignUp API Response Data:", response.data);
      // Expecting { message, token, user: { _id, name, email, onboardingComplete (usually false initially) } }
      if (response.data && response.data.message === "User created successfully" && response.data.user && response.data.user._id && response.data.token) {
        const createdUserFromBackend = response.data.user;
        const token = response.data.token;

        const authenticatedUser: AuthUser = {
          _id: createdUserFromBackend._id,
          name: createdUserFromBackend.name, 
          email: createdUserFromBackend.email, 
          onboardingComplete: createdUserFromBackend.onboardingComplete ?? false, 
        };

        await SecureStore.setItemAsync(TOKEN_KEY, token);

        setAuthState({
            jwt: token,
            authUser: authenticatedUser,
            isAuthenticated: true,
            isLoading: false,
        });
        console.log("[AuthContext] Signed up user:", authenticatedUser);

        try {
          await axios.post(`${BASE_URL}/user/CreateMentallScore/${authenticatedUser._id}`, {}, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            timeout: 5000,
          });
          console.log("[AuthContext] Mental score creation request sent for user:", authenticatedUser._id);
        } catch (mentalScoreError) {
          console.error('[AuthContext] Mental score creation error:', mentalScoreError);
        }
        await checkAndGenerateWorkout(authenticatedUser._id, token);
      } else {
        throw new Error(response.data?.message || 'Sign-up failed. Invalid response from server.');
      }
    } catch (error) {
      console.error('[AuthContext] Sign up error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      let displayErrorMessage = 'An unknown error occurred during sign-up.';
       if (axios.isAxiosError(error)) {
        displayErrorMessage = error.response?.data?.message || 'An error occurred during sign up.';
      } else if (error instanceof Error) {
        displayErrorMessage = error.message;
      }
      Alert.alert('Sign Up Failed', displayErrorMessage);
      throw new Error(displayErrorMessage);
    }
  };

  const updateAuthUserOnboardingStatus = (status: boolean) => {
    setAuthState(prev => ({
      ...prev,
      authUser: prev.authUser ? { ...prev.authUser, onboardingComplete: status } : null,
    }));
  };

  const convertToFloat = (data: { whole: number; fraction?: number }): number => {
    return data.whole + (data.fraction ? data.fraction / 10 : 0);
  };

  const completeOnboarding = async (onboardingData: Onboarding) => {
    if (!authState.jwt || !authState.authUser) {
      throw new Error("Authentication details are missing.");
    }
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await axios.post(
        `${BASE_URL}/user/onboard`,
        {
          ...onboardingData,
          weight: onboardingData.weight ? convertToFloat(onboardingData.weight) : undefined,
          height: onboardingData.height ? convertToFloat(onboardingData.height) : undefined,
        },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.jwt}` } }
      );
      console.log("[AuthContext] Onboarding response:", response.data);
      if (response.data && (response.data.user?.onboardingComplete === true || response.data.message?.toLowerCase().includes("success"))) {
         setAuthState(prev => ({
          ...prev,
          isLoading: false,
          authUser: prev.authUser ? { ...prev.authUser, onboardingComplete: true } : null,
        }));
        console.log("[AuthContext] AuthUser onboarding status updated to true locally.");
      } else {
         setAuthState(prev => ({ 
          ...prev,
          isLoading: false,
          authUser: prev.authUser ? { ...prev.authUser, onboardingComplete: true } : null,
        }));
        console.warn("[AuthContext] Onboarding completion confirmation from backend unclear. Updated locally.");
      }
      return response.data;
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      console.error('[AuthContext] Onboarding completion error:', error.response?.data || error.message);
      Alert.alert(`Onboarding Failed`, error.response?.data?.message || error.message);
      throw error;
    }
  };

  const signOut = async () => {
    const userId = authState.authUser?._id;
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      if (userId) {
        await SecureStore.deleteItemAsync(`${WORKOUT_GENERATION_TIMESTAMP_KEY_PREFIX}${userId}`);
        console.log(`[AuthContext] Cleared workout timestamp for user ${userId} on sign out.`);
      }
    } catch (error) {
      console.error('[AuthContext] Error clearing secure store on sign out:', error);
    } finally {
      setAuthState({
        jwt: null,
        authUser: null,
        isAuthenticated: false,
        isLoading: false,
      });
      router.replace("/(auth)/login");
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
      updateAuthUserOnboardingStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthNavigator() {
  const { isAuthenticated, isLoading, authUser } = useAuth();
  const segments = useSegments();
  const rootSegment = segments?.[0];
  const expoRouter = useRouter();
  const initialCheckComplete = React.useRef(false);

  React.useEffect(() => {
      if (isLoading || rootSegment === undefined) {
          return;
      }
      const onboardingComplete = authUser?.onboardingComplete ?? false;
      const currentPath = segments.join('/');
      const isInAuthRoute = rootSegment === '(auth)';
      const isInSetupRoute = rootSegment === '(setup)';

      if (!isAuthenticated) {
          initialCheckComplete.current = true;
          if (!isInAuthRoute) {
              console.log("[AuthNav Effect Action] Not authenticated. Redirecting to /login");
              expoRouter.replace('/(auth)/login');
          }
      } else { 
          if (!onboardingComplete) {
              initialCheckComplete.current = true;
              if (!isInSetupRoute) {
                  console.log("[AuthNav Effect Action] Onboarding incomplete. Redirecting to /setup");
                  expoRouter.replace('/(setup)/setup');
              }
          } else { 
              if (!initialCheckComplete.current) {
                  initialCheckComplete.current = true;
                  console.log("[AuthNav Effect Action] Initial check complete: Authenticated & Onboarded.");
                  console.log(`[AuthNav Effect Action] Initial redirect: Was on ${currentPath}, moving to /home.`);
                  expoRouter.replace('/(home)/home');
              } else {
                  if (isInAuthRoute || isInSetupRoute) {
                      console.log("[AuthNav Effect Action] Authenticated & Onboarded. Redirecting from auth/setup to /home");
                      expoRouter.replace('/(home)/home');
                  }
              }
          }
      }
  }, [isAuthenticated, isLoading, authUser, rootSegment, segments, expoRouter]);

  return null;
}
