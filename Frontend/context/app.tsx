import { User, UserProfile } from '@/constants/types';
import React, { createContext, useState, useEffect } from 'react';


  interface AppContextType {
    user: UserProfile | null;
    setUser: Dispatch<SetStateAction<UserProfile | null>>;
    jwt: string | null;
    setJwt: Dispatch<SetStateAction<string | null>>;
    dietaryPlan: DietaryItem | null;
    setDietaryPlan: Dispatch<SetStateAction<DietaryItem | null>>;
    isLoadingDietaryPlan: boolean;
  }

const API_BASE_URL = 'http://localhost:5000/';

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
  // State for JWT authentication token
  const [jwt, setJwt] = useState<string | null>(null); // TODO: Initialize from AsyncStorage/SecureStore on app load
  // State for the user's dietary plan
  const [dietaryPlan, setDietaryPlan] = useState<DietaryItem | null>(null);
  // State to track if the dietary plan is currently being fetched
  const [isLoadingDietaryPlan, setIsLoadingDietaryPlan] = useState<boolean>(false);

  // Effect Hook: Fetch dietary data when JWT token is available
  useEffect(() => {
    // Define the async function to fetch data
    const fetchDietaryData = async () => {
      // Only proceed if we have a JWT token (user is likely logged in)
      if (!jwt) {
        setDietaryPlan(null); // Clear plan if user logs out or token expires
        setIsLoadingDietaryPlan(false); // Not loading if no token
        return; // Exit if no JWT
      }

      // Set loading state to true before starting the fetch
      setIsLoadingDietaryPlan(true);
      // Clear previous plan while loading new data (optional, provides feedback)
      // setDietaryPlan(null);

      try {
        // --- Backend Endpoint ---
        // This endpoint needs to be implemented on your backend.
        // It should:
        // 1. Be protected (require JWT authentication).
        // 2. Extract the user ID from the validated JWT.
        // 3. Find the 'Dietery' document for that user ID and the current date.
        // 4. **Crucially use .populate('Meals')** to include full meal details.
        // 5. Handle cases where no plan exists for today (e.g., return 404 or create one).
        const response = await fetch(`${API_BASE_URL}/dietary/today`, { // <-- ADJUST ENDPOINT IF NEEDED
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include the JWT in the Authorization header
            'Authorization': `Bearer ${jwt}`,
          },
        });

        // Check if the request was successful
        if (!response.ok) {
          // Log specific errors for debugging
          console.error(`Error fetching dietary plan: ${response.status} ${response.statusText}`);
           if (response.status === 404) {
             console.log("No dietary plan found for today.");
             // Set plan to null or an empty state if 404
             setDietaryPlan(null);
           } else if (response.status === 401) {
             console.error("Unauthorized. Check JWT token.");
             // Handle unauthorized access, maybe clear JWT and prompt login
             setJwt(null); // Example: Clear JWT on auth failure
             setDietaryPlan(null);
           } else {
             // Handle other HTTP errors
             setDietaryPlan(null);
           }
          // Throw an error to be caught by the catch block
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response body
        const data: DietaryItem = await response.json();

        // --- Optional: Data Validation ---
        // You could add checks here to ensure 'data' has the expected
        // structure (e.g., check for _id, Meals array, etc.) before setting state.

        // Update the dietary plan state with the fetched data
        setDietaryPlan(data);

      } catch (error) {
        // Log any errors that occurred during the fetch process
        console.error("Failed to fetch or process dietary plan:", error);
        // Ensure the plan is null if an error occurs
        setDietaryPlan(null);
      } finally {
        // Always set loading state to false after the fetch attempt completes
        // (whether successful or not)
        setIsLoadingDietaryPlan(false);
      }
    };

    // Call the fetch function
    fetchDietaryData();

    // --- Dependency Array ---
    // This effect should re-run whenever the JWT token changes.
    // This handles cases like user login (JWT becomes available)
    // or logout (JWT becomes null).
  }, [jwt]);

  // --- Provide the state and setters to consuming components ---
  const contextValue: AppContextType = {
    user,
    setUser,
    jwt,
    setJwt,
    dietaryPlan,
    setDietaryPlan,
    isLoadingDietaryPlan,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
