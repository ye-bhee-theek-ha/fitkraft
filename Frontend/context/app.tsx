// context/app.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserProfile, DietaryItem, MealItem, MealTimeName, WeightOrHeight } from '@/constants/types'; // Adjust path as needed
import { BASE_URL } from '@/constants/baseUrl'; // Adjust path as needed
import { useAuth } from './auth'; // Import useAuth from your AuthProvider file

// TODO how to get meals for the specific day of the week?

// TODO this currently fetches all meals for the user, not just the ones for today.
// TODO add a date parameter to the fetchDietaryData backend function to get meals for a specific date


interface AppState {
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
  
  dietary: DietaryItem | null;
  isDietaryLoading: boolean;
  
  weeklyDietary: DietaryItem[];
  isWeeklyDietaryLoading: boolean;
  
  dietaryHistory: DietaryItem[];
  isDietaryHistoryLoading: boolean;
  
  selectedDate: Date;
}

interface AppContextType extends AppState {
  fetchUserProfile: () => Promise<void>;
  fetchDietaryData: (userId: string, date?: Date) => Promise<void>;
  fetchWeeklyDietary: (userId: string) => Promise<void>;
  fetchDietaryHistory: (userId: string, limit?: number) => Promise<void>;
  setSelectedDate: (date: Date) => void;
}

export interface DietarySummary {
  totalDays: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFats: number;
}

export interface DietaryResponse {
  message: string;
  period: string;
  count: number;
  summary?: DietarySummary;
  data: any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function parseWeightHeightString(value: string | number | undefined): WeightOrHeight | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }

    let wholePart: number;
    let fractionPart: number = 0; // Default fraction to 0

    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        if (trimmedValue === "") {
            return undefined; // Empty string is invalid
        }
        const parts = trimmedValue.split('.');
        wholePart = parseInt(parts[0], 10);

        // If there's a decimal part, try to parse the first digit
        if (parts.length > 1 && parts[1].length > 0) {
            const firstFractionDigit = parseInt(parts[1].substring(0, 1), 10);
            if (!isNaN(firstFractionDigit)) {
                fractionPart = firstFractionDigit;
            }
            // If parts[1] exists but starts with non-digit, fraction remains 0
        }

    } else if (typeof value === 'number') {
        if (!isFinite(value)) {
             return undefined; // Handle NaN, Infinity, -Infinity
        }
        wholePart = Math.floor(value);

        // Calculate fraction based on the first decimal place
        // Multiply by 10, get remainder, round to handle floating point issues
        const decimalPart = Math.round((value - wholePart) * 10);
        fractionPart = decimalPart > 0 ? decimalPart : 0; // Ensure non-negative

    } else {
        // Should not be reached with current type signature but good for safety
        return undefined;
    }

    // Validate the results
    if (isNaN(wholePart)) {
        return undefined; // Parsing failed
    }

    // Ensure fraction is a single digit (0-9)
    const validFraction = Math.min(Math.max(fractionPart, 0), 9);

    return {
        whole: wholePart,
        fraction: validFraction,
    };
}




export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated, jwt, authUser, signOut } = useAuth(); 

  const [appState, setAppState] = useState<AppState>({
    userProfile: null,
    isProfileLoading: false,
    dietary: null,
    isDietaryLoading: false,
    weeklyDietary: [],
    isWeeklyDietaryLoading: false,
    dietaryHistory: [],
    isDietaryHistoryLoading: false,
    selectedDate: new Date()
  });

  const setSelectedDate = (date: Date) => {
    setAppState(prev => ({ ...prev, selectedDate: date }));
  };
 
  const fetchUserProfile = async () => {
    if (!isAuthenticated || !jwt) {
      console.log("Cannot fetch profile: User not authenticated or JWT missing.");
      setAppState(prev => ({ ...prev, userProfile: null, isProfileLoading: false }));
      return;
    }

    console.log("AppProvider: Attempting to fetch full user profile...");
    setAppState(prev => ({ ...prev, isProfileLoading: true }));

    try {
      const response = await axios.get(`${BASE_URL}/user/get`, {
        headers: { Authorization: `Bearer ${jwt}` },
        timeout: 5000,
      });
      const userData = response.data;

       const fullUserProfile: UserProfile = {
         _id: userData._id,
         fullName: userData.name,
         nickname: userData.nickname,
         email: userData.email,

        weight: typeof userData.weight === 'number'
            ? parseWeightHeightString(userData.weight) 
            : (userData.weight && typeof userData.weight === 'object' 
                ? { ...userData.weight } 
                : undefined), 

        height: typeof userData.height === 'number'
            ? parseWeightHeightString(userData.height) 
            : (userData.height && typeof userData.height === 'object' 
                ? { ...userData.height } 
                : undefined),

         age: userData.age,
         gender: userData.gender,
         goal: userData.goal,
         activityLevel: userData.activityLevel,
         bmi: userData.bmi,
         bmr: userData.bmr,
         mobile: userData.mobile || null,
         image: userData.image || null,
         onboardingComplete: !!(userData.height && userData.weight && userData.age && userData.gender && userData.goal && userData.activityLevel),
       };

      console.log("AppProvider: Full user profile fetched:", fullUserProfile);
      setAppState(prev => ({
        ...prev,
        userProfile: fullUserProfile,
        isProfileLoading: false,
      }));

    } catch (error) {
      console.error('AppProvider: Failed to fetch full user profile:', error);
      setAppState(prev => ({ ...prev, userProfile: null, isProfileLoading: false })); 
      if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error("AppProvider: Token likely invalid, user should be signed out.");
          signOut();
      }
    }
  };

  const fetchDietaryData = async (userId: string, date?: Date) => {
    const targetDate = date || appState.selectedDate;
    const formattedDate = targetDate.toISOString().split('T')[0];

    console.log(`AppProvider: Fetching dietary data for user ${userId} on ${formattedDate}...`);

    if (!isAuthenticated || !userId) {
      console.log("Cannot fetch dietary data: User not authenticated or userId missing.");
      setAppState(prev => ({ ...prev, dietary: null, isDietaryLoading: false }));
      return;
    }

    setAppState(prev => ({ ...prev, isDietaryLoading: true }));

    try {
      const response = await axios.get(`${BASE_URL}/dietery/get/${userId}?period="all"`, {
        // headers: { Authorization: `Bearer ${jwt}` },
        timeout: 5000,
      });

      console.log("response dietary date ==>> ", response.data);
      const responseData = response.data;
      
      if (responseData.count > 0 && responseData.data.length > 0) {
        const apiData = responseData.data[0];
        
        const mappedMeals: MealItem[] = (apiData.Meals || []).map((meal: any) => ({
          _id: meal._id,
          name: meal.Name,
          time_name: meal.Category as MealTimeName,
          calories: meal.Calories,
          fats: meal.Fats,
          proteins: meal.Protein,
          carbohydrates: meal.Carbs,
          completed: meal.completed || false,
        }));

        const mappedDietary: DietaryItem = {
          UserId: apiData.UserId,
          id: apiData._id,
          Date: new Date(apiData.Date),
          Meals: mappedMeals,
          TotalCalories: apiData.TotalCalories,
          TotalProtein: apiData.TotalProtein,
          TotalCarbs: apiData.TotalCarbs,
          TotalFats: apiData.TotalFats,
          Day: apiData.Day
        };

        console.log(`AppProvider: Dietary data found for ${targetDate.toDateString()}:`, mappedDietary);
        setAppState(prev => ({ ...prev, dietary: mappedDietary, isDietaryLoading: false }));
      } else {
        console.log(`AppProvider: No dietary data found for ${targetDate.toDateString()}.`);
        setAppState(prev => ({ ...prev, dietary: null, isDietaryLoading: false }));
      }
    } catch (error) {
      console.error('AppProvider: Error fetching dietary data:', error,);
      setAppState(prev => ({ ...prev, dietary: null, isDietaryLoading: false }));
    }
  };

  const fetchWeeklyDietary = async (userId: string) => {
    if (!isAuthenticated || !userId) {
      console.log("Cannot fetch weekly dietary data: User not authenticated or userId missing.");
      setAppState(prev => ({ ...prev, weeklyDietary: [], isWeeklyDietaryLoading: false }));
      return;
    }

    console.log(`AppProvider: Fetching weekly dietary data for user ${userId}...`);
    setAppState(prev => ({ ...prev, isWeeklyDietaryLoading: true }));

    try {
      const response = await axios.get(`${BASE_URL}/dietery/get/${userId}?period=week`, {
        headers: { Authorization: `Bearer ${jwt}` },
        timeout: 5000,
      });

      console.log("response dietary weekly ==>> ", response.data);
      const responseData = response.data;
      
      if (responseData.count > 0) {
        // Map the API response to our frontend model
        const mappedWeeklyData = responseData.data.map((apiData: any) => {
          const mappedMeals: MealItem[] = (apiData.Meals || []).map((meal: any) => ({
            _id: meal._id,
            name: meal.Name,
            time_name: meal.Category as MealTimeName,
            calories: meal.Calories,
            fats: meal.Fats,
            proteins: meal.Protein,
            carbohydrates: meal.Carbs,
            completed: meal.completed || false,
          }));

          return {
            _id: apiData._id,
            UserId: apiData.UserId,
            Date: new Date(apiData.Date),
            Meals: mappedMeals,
            TotalCalories: apiData.TotalCalories,
            TotalProtein: apiData.TotalProtein,
            TotalCarbs: apiData.TotalCarbs,
            TotalFats: apiData.TotalFats,
            Day: apiData.Day
          };
        });

        console.log(`AppProvider: Weekly dietary data found:`, mappedWeeklyData);
        setAppState(prev => ({ 
          ...prev, 
          weeklyDietary: mappedWeeklyData, 
          isWeeklyDietaryLoading: false 
        }));
      } else {
        console.log(`AppProvider: No weekly dietary data found.`);
        setAppState(prev => ({ ...prev, weeklyDietary: [], isWeeklyDietaryLoading: false }));
      }
    } catch (error) {
      console.error('AppProvider: Error fetching weekly dietary data:', error);
      setAppState(prev => ({ ...prev, weeklyDietary: [], isWeeklyDietaryLoading: false }));
    }
  };

  const fetchDietaryHistory = async (userId: string, limit?: number) => {
    if (!isAuthenticated || !userId) {
      console.log("Cannot fetch dietary history: User not authenticated or userId missing.");
      setAppState(prev => ({ ...prev, dietaryHistory: [], isDietaryHistoryLoading: false }));
      return;
    }

    console.log(`AppProvider: Fetching dietary history for user ${userId}...`);
    setAppState(prev => ({ ...prev, isDietaryHistoryLoading: true }));

    try {
      const response = await axios.get(`${BASE_URL}/dietary/get/${userId}?period=all`, {
        headers: { Authorization: `Bearer ${jwt}` },
        timeout: 10000,
      });

      const responseData = response.data;
      
      if (responseData.count > 0) {
        let mappedHistoryData = responseData.data.map((apiData: any) => {
          const mappedMeals: MealItem[] = (apiData.Meals || []).map((meal: any) => ({
            _id: meal._id,
            name: meal.Name,
            time_name: meal.Category as MealTimeName,
            calories: meal.Calories,
            fats: meal.Fats,
            proteins: meal.Protein,
            carbohydrates: meal.Carbs,
            completed: meal.completed || false,
          }));

          return {
            _id: apiData._id,
            UserId: apiData.UserId,
            Date: new Date(apiData.Date),
            Meals: mappedMeals,
            TotalCalories: apiData.TotalCalories,
            TotalProtein: apiData.TotalProtein,
            TotalCarbs: apiData.TotalCarbs,
            TotalFats: apiData.TotalFats,
            Day: apiData.Day
          };
        });

        if (limit && mappedHistoryData.length > limit) {
          mappedHistoryData = mappedHistoryData.slice(0, limit);
        }

        console.log(`AppProvider: Dietary history found (${mappedHistoryData.length} records)`);
        setAppState(prev => ({ 
          ...prev, 
          dietaryHistory: mappedHistoryData, 
          isDietaryHistoryLoading: false 
        }));
      } else {
        console.log(`AppProvider: No dietary history found.`);
        setAppState(prev => ({ ...prev, dietaryHistory: [], isDietaryHistoryLoading: false }));
      }
    } catch (error) {
      console.error('AppProvider: Error fetching dietary history:', error);
      setAppState(prev => ({ ...prev, dietaryHistory: [], isDietaryHistoryLoading: false }));
    }
  };



  useEffect(() => {
    if (isAuthenticated && jwt) {
      fetchUserProfile(); 
    } else {
      setAppState(prev => ({ ...prev, userProfile: null, isProfileLoading: false, dietary: null, isDietaryLoading: false }));
    }
  }, [isAuthenticated, jwt]);

  useEffect(() => {
    if (appState.userProfile?._id) {
      fetchDietaryData(appState.userProfile._id);
      fetchWeeklyDietary(appState.userProfile._id);
    } else {
      setAppState(prev => ({ 
        ...prev, 
        dietary: null, 
        isDietaryLoading: false,
        weeklyDietary: [],
        isWeeklyDietaryLoading: false
      }));
    }
  }, [appState.userProfile?._id]);

  useEffect(() => {
    if (appState.userProfile?._id) {
      fetchDietaryData(appState.userProfile._id, appState.selectedDate);
    }
  }, [appState.selectedDate]);


  // --- Provide the App Context Value ---
  return (
    <AppContext.Provider value={{
      ...appState,
      fetchUserProfile,
      fetchDietaryData,
      fetchWeeklyDietary,
      fetchDietaryHistory,
      setSelectedDate
    }}>
      {children}
    </AppContext.Provider>
  );
};

