import { DietaryItem, MealItem, MealTimeName, User, UserProfile } from '@/constants/types';
import React, { createContext, useState, useEffect } from 'react';
import axios, { Axios } from 'axios';
import { BASE_URL } from '@/constants/baseUrl';


interface AppContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  jwt: string | null;
  setJwt: React.Dispatch<React.SetStateAction<string | null>>;
  dietary: DietaryItem | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Custom Hook to Use the Context ---
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    // This error means you are trying to use the context
    // outside of where it's provided. Ensure the component
    // is wrapped by <AppProvider> in your component tree.
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// --- Context Provider Component ---
export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // State for user profile
  const [user, setUser] = useState<UserProfile | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);

  const [dietary, setDietary] = useState<DietaryItem | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/dietery/get/user123`);
        
        if (response.data && response.data.length > 0) {
          const apiData = response.data[0];
            interface ApiMeal {
              _id: string;
              Name: string;
              Category: string;
              Calories: number;
              Fats: number;
              Protein: number;
              Carbs: number;
              completed?: boolean;
            }

            const mappedMeals: MealItem[] = apiData.Meals.map((meal: ApiMeal) => ({
            _id: meal._id,
            name: meal.Name,
            time_name: meal.Category as MealTimeName, // Category seems to correspond to time_name
            calories: meal.Calories,
            fats: meal.Fats,
            proteins: meal.Protein,
            carbohydrates: meal.Carbs,
            completed: meal.completed || false
            }));
          
          // Create the dietary item according to your interface
          const mappedDietary: DietaryItem = {
            UserId: apiData.UserId,
            Date: new Date(apiData.Date),
            Meals: mappedMeals,
            TotalCalories: apiData.TotalCalories,
            TotalProtein: apiData.TotalProtein,
            TotalCarbs: apiData.TotalCarbs,
            TotalFats: apiData.TotalFats
          };
          
          setDietary(mappedDietary);
        } else {
          console.log('No dietary data found');
          setDietary(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchUser();
  }, []);


  return (
    <AppContext.Provider value={{ user, dietary, setUser, jwt, setJwt }}>
      {children}
    </AppContext.Provider>
  );
};
