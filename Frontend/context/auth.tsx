import { router, useRouter, useSegments } from 'expo-router';
import axios from 'axios';
import * as React from 'react';
import { Onboarding, SignUpData, User, UserProfile } from '@/constants/types';
import { BASE_URL } from '@/constants/baseUrl';
import * as SecureStore from 'expo-secure-store';
import LoadingSpinner from '@/components/LoadingSpinner';

// --- Constants for Storage Keys ---
const TOKEN_KEY = 'user_jwt_token';

interface AuthUser {
  _id: string;
  name: string; // Or just name if preferred
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
  completeOnboarding: (onboardingData: Onboarding) => Promise<any>; //TODO: Define a proper type for the response
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
    authUser: null, // Initialize authUser as null
    isAuthenticated: false,
    isLoading: true, // Start in loading state
  });

  React.useEffect(() => {
    const loadAuthData = async () => {
      let storedJwt: string | null = null;
      try {
        storedJwt = await SecureStore.getItemAsync(TOKEN_KEY);

        if (storedJwt) {
          console.log('Stored JWT found. Attempting to verify...');

          const onboardingStatus = await checkOnboardingStatus(storedJwt);

          if (onboardingStatus) { 
             console.log('Token seems valid. Onboarding status:', onboardingStatus);

             if (onboardingStatus) {
                setAuthState({
                    jwt: storedJwt,
                    authUser: {
                      onboardingComplete: onboardingStatus.onboardingComplete,
                      _id: onboardingStatus._id,
                      name: onboardingStatus.name,
                      email: onboardingStatus.email,
                    },
                    isAuthenticated: true,
                    isLoading: false,
                });
             } else {
                 throw new Error("Failed to fetch basic user info with stored token.");
             }
          } else {
             throw new Error("Token validation failed (onboarding status check).");
          }
        } else {
          console.log('No stored JWT found.');
          setAuthState({ jwt: null, authUser: null, isAuthenticated: false, isLoading: false });
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        // Ensure clean state on error
        if (storedJwt) { // Only clear if a token was involved in the error
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
        setAuthState({ jwt: null, authUser: null, isAuthenticated: false, isLoading: false });
      }
    };

    loadAuthData();
  }, []); // Run only once on mount

    
  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }

      const response = await axios.post(`${BASE_URL}/user/login`, { email, password }, {
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      });

      const loginData = response.data;

      if (!loginData.token || !loginData._id) {
        throw new Error(loginData.message || 'Login failed. Invalid response from server.');
      }

      const token = loginData.token;

      const onboardingComplete = await checkOnboardingStatus(token);



      // Create AuthUser from login response
      const basicUser: AuthUser = {
        _id: loginData._id,
        name: loginData.name,
        email: loginData.email,
        onboardingComplete: onboardingComplete.onboardingComplete ?? false,
      };

      // Store JWT
      await SecureStore.setItemAsync(TOKEN_KEY, token);

      // Update Auth State
      setAuthState({
        jwt: token,
        authUser: basicUser,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log("Signed in user (basic info):", basicUser);

      if (onboardingComplete.onboardingComplete === false) {
        router.replace("/(setup)/setup");
      }

    } catch (error) {
      console.error('Sign in error:', error);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, authUser: null, jwt: null }));

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred during login.');
      }
    }
  };


  const checkOnboardingStatus = async (jwt: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/user/onboarding-status`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
        timeout: 5000,
      });


      if (response.data) {
        return response.data;
      }
    } catch (error) {
      return false; 
    }
  };


  const signUp = async (data: SignUpData) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/user/create`,
        {
          name: data.fullName,         // Maps to backend 'name'
          nickname: data.nickname,     // Maps to backend 'nickname'
          email: data.email,           // Maps to backend 'email'
          password: data.password,     // Password remains unchanged
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        }
      );
  
      if (response.data && response.data.message === "User created successfully") {
        const creationData = response.data.user;
        const token = creationData.token;
  
        const basicUser: AuthUser = {
          _id: creationData._id,
          name: creationData.name,
          email: creationData.email,
          onboardingComplete: false,
        };

        await SecureStore.setItemAsync(TOKEN_KEY, token)

        setAuthState({
          jwt: token,
          authUser: basicUser,
          isAuthenticated: true,
          isLoading: false,
        });
      
        router.replace("/(setup)/setup");
      } else {
        throw new Error(response.data?.message || 'Sign-up failed. Please try again.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'An error occurred during sign up.');
      } else {
        throw new Error('An unknown error occurred.');
      }
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
    if (!authState.jwt) {
      throw new Error("Authentication token is missing.");
    }
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

      console.log("Onboarding response:", response.data); // Expects { message: "...", user: { ..., onboardingComplete: true } }

      setAuthState(prev => ({
        ...prev,
        authUser: prev.authUser ? { ...prev.authUser, onboardingComplete: true } : null,
      }));

      console.log("AuthUser onboarding status updated.");
      return response.data; // Return backend response

    } catch (error: any) {
      console.error('Onboarding completion error:', error.response?.data || error.message);
      alert(`Onboarding failed: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setAuthState({
        jwt: null,
        authUser: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      setAuthState({ jwt: null, authUser: null, isAuthenticated: false, isLoading: false });
    }
    finally {
      router.replace("/(auth)/login")
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
  const router = useRouter();

  React.useEffect(() => {

    if (rootSegment === undefined) return;

    const onboardingComplete = authUser?.onboardingComplete ?? false;
    console.log(`(AuthNavigator) Auth State Changed: isLoading=${isLoading}, isAuthenticated=${isAuthenticated}, authUser=${!!authUser}, onboardingComplete=${onboardingComplete}`);


    if (isLoading) {
      console.log("AuthNavigator: Still loading auth state...");
      return;
    }

    const isInAuthRoute = rootSegment === '(auth)';
    const isInSetupRoute = rootSegment === '(setup)';

    if (!isAuthenticated) {
      if (!isInAuthRoute) {
        console.log("AuthNavigator: Not authenticated, redirecting to login.");
        router.replace('/(auth)/login');
      }
    } else {
      if (!onboardingComplete) {
        if (!isInSetupRoute) {
          console.log("AuthNavigator: Onboarding incomplete, redirecting to setup.");
          router.replace('/(setup)/setup');
        }
      } else {
        if (isInAuthRoute || isInSetupRoute) {
          console.log("AuthNavigator: Onboarding complete, redirecting to home.");
          router.replace('/(home)/home');
        }
      }
    }
  }, [isAuthenticated, isLoading, authUser, rootSegment, router]);

  return null;
}