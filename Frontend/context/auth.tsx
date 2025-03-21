import { useRouter, useSegments } from 'expo-router';
import axios from 'axios';
import * as React from 'react';
import { Onboarding, SignUpData, User, UserProfile } from '@/constants/types';
import { BASE_URL } from '@/constants/baseUrl';
import { useApp } from './app';

const AuthContext = React.createContext<any>(null);

  
export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const rootSegment = useSegments()[0];
  const router = useRouter();
  const { user, setUser, jwt, setJwt } = useApp();


  React.useEffect(() => {
    console.log(BASE_URL);
    // if (user === undefined) return;
    console.log(user)
    // router.replace("/(setup)/setup")

    if (user === null && rootSegment !== "(auth)") {
      router.replace("/(auth)/login")
    }
  }, [user]);

    
  const signIn = async (email: string, password: string) => {
    try {
        if (!email || !password) {
            throw new Error('Email and password are required.');
        }

        const response = await axios.post(`${BASE_URL}/user/login`, {
            email,
            password,
        }, {
            headers: { "Content-Type": "application/json" },
        });

        const userData = response.data;

        if (!userData.token) {
            throw new Error(userData.message || 'Login failed. Please try again.');
        }

        const userDetails: UserProfile = {
            fullName: userData.name, 
            nickname: userData.nickname || '',
            email: userData.email,
            image: null,
        };

        setUser(userDetails);
        setJwt(userData.token);


        console.log("Signed in user:", userDetails);
        console.log(jwt, "jwt");
       
    
    } catch (error) {

        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            alert(errorMessage);
        } else {
            alert('An unexpected error occurred. Please try again.');
        }
    }
};

  React.useEffect(() => {
    if (jwt) {
        console.log("Updated JWT:", jwt);
        checkOnboardingStatus(jwt).then((isOnboardingComplete) => {
          console.log("Onboarding status:", isOnboardingComplete);
            router.replace(isOnboardingComplete ? "/(home)/home" : "/(setup)/setup");
        });
    }
  }, [jwt]);


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
        return response.data.onboardingComplete;
      }
    } catch (error) {
      return false; 
    }
  };


  const signUp = async (data: SignUpData) => {
    console.log("Inside signup", data);
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
        const userData = response.data.user;
  
        const userDetails: UserProfile = {
          fullName: userData.name,  
          nickname: userData.nickname,
          email: userData.email,
        };
      
        console.log("User created successfully:", response.data);
        setUser(userDetails);
        setJwt(userData.token);
        console.log("signed in user", userDetails);
        console.log("jwt", userData.token);
  
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

  const convertToFloat = (data: { whole: number; fraction?: number }): number => {
    return data.whole + (data.fraction ? data.fraction / 10 : 0);
  };

  const completeOnboarding = async (onboardingData:Onboarding) => {
    try {

      const processedData = {
        ...onboardingData,
        weight: onboardingData.weight ? convertToFloat(onboardingData.weight) : undefined,
        height: onboardingData.height ? convertToFloat(onboardingData.height) : undefined,
      };

      const response = await axios.post(
        `${BASE_URL}/user/onboard`,
        {
          ...processedData
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        }
      );
      
      console.log(response);
      
      return response.data;
    } catch (error:any) {
      console.error('Onboarding error:', error.response?.data || error.message);
      throw error;
    }
  };

  const signOut = () => {
    router.replace("/(auth)/login");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, signUp, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}
