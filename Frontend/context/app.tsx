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

export function useApp() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
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
