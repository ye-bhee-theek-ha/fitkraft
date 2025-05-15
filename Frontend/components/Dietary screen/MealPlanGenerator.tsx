// components/MealPlanGenerator.tsx
"use client";

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Feather, Ionicons, AntDesign, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons"; // Added more icons
import axios, { AxiosError } from 'axios';
import { useAuth } from '@/context/auth'; // Assuming path is correct
import { useApp } from '@/context/app';   // Assuming path is correct
import { BASE_URL, BASE_URL_AI } from "@/constants/baseUrl"; // For your backend
import { MealItem, MealTimeName, DietaryItem } from "@/constants/types"; // Ensure these types are comprehensive

// --- Interfaces for API interaction ---
interface AIRequestBody {
  userId: string;
  name: string;
  goal: string;
  calories_intake: number;
  num_meals: number;
  allergies: string[];
  preferred_foods: string[];
}

interface AIMealResponse {
  Name: string;
  Calories: number;
  Protein: number;
  Carbs: number;
  Fats: number;
  Ingredients: string[];
  Instructions: string;
  Image: string; 
  Category: MealTimeName; 
  UserCreated_ID?: string; 
  isCompleted?: boolean;
}

// Matches the AI server's overall response structure
interface AIPlanResponse {
  UserId: string;
  Date: string;
  Day: string;  
  Meals: AIMealResponse[];
  TotalCalories: number;
  TotalProtein: number;
  TotalCarbs: number;
  TotalFats: number;
}

// Structure for updating your backend's DietaryItem
interface BackendDietaryUpdatePayload {
    UserId: string;
    Date: string; // ISOString
    Meals: BackendMealInput[]; // Array of meals in the format backend expects
    Day: string;
    TotalCalories: number;
    TotalProtein: number;
    TotalCarbs: number;
    TotalFats: number;
}

// Structure for a single meal when sending to your backend (matches backend's MealModel)
interface BackendMealInput {
    Name: string;
    Calories: number;
    Protein: number;
    Carbs: number;
    Fats: number;
    Category: MealTimeName;
    Ingredients?: string[];
    Instructions?: string;
    Image?: string;
    UserCreated_ID?: string; // Mark as AI generated
    completed?: boolean;
}


const MealPlanGenerator: React.FC = () => {
  const { authUser, jwt } = useAuth();
  const { userProfile, dietary, fetchDietaryData, selectedDate } = useApp(); // Use selectedDate from AppContext

  const [caloriesIntake, setCaloriesIntake] = useState<string>("2500");
  const [numMeals, setNumMeals] = useState<string>("3");
  const [allergies, setAllergies] = useState<string>(""); // Comma-separated
  const [preferredFoods, setPreferredFoods] = useState<string>(""); // Comma-separated

  const [generatedPlan, setGeneratedPlan] = useState<AIPlanResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSavingToBackend, setIsSavingToBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const aiServerUrl = "http://127.0.0.1:5000/generate/mealplan"; // Your AI server URL

  const canGenerate = caloriesIntake && numMeals; // Basic validation

  const handleGeneratePlan = async () => {
    if (!canGenerate) {
      Alert.alert("Missing Info", "Please fill in calories and number of meals.");
      return;
    }
    if (!authUser || !userProfile) {
      Alert.alert("Error", "User information not available. Please log in again.");
      return;
    }

    setIsLoadingAI(true);
    setAiError(null);
    setGeneratedPlan(null);

    const requestBody: AIRequestBody = {
      userId: authUser._id || "guestUser", // Fallback if _id is not on authUser
      name: userProfile.fullName,
      goal: userProfile.goal || "general wellness", // Fallback goal
      calories_intake: parseInt(caloriesIntake, 10),
      num_meals: parseInt(numMeals, 10),
      allergies: allergies.split(',').map(s => s.trim()).filter(s => s),
      preferred_foods: preferredFoods.split(',').map(s => s.trim()).filter(s => s),
    };

    try {
      console.log("Sending to AI Server:", requestBody);
      //TODO
      const response = await axios.post<AIPlanResponse>(`${BASE_URL_AI}/generate/mealplan`, requestBody,
        {
          headers: {
          'Content-Type': 'application/json'
        },
         timeout: 60000
       }); 
      console.log("AI Server Response:", response.data);
      console.log("url", `${BASE_URL_AI}/generate/mealplan`);
      setGeneratedPlan(response.data);
    } catch (error) {
      console.error("Error generating meal plan from AI:", error);
      const message = error instanceof AxiosError ? error.response?.data?.message || error.message : "Failed to generate meal plan.";
      setAiError(message);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleConfirmPlan = async () => {
    if (!generatedPlan || !authUser?._id || !dietary?.id || !jwt) {
      Alert.alert("Error", "Missing generated plan, user data, or dietary log ID.");
      return;
    }

    setIsSavingToBackend(true);
    setBackendError(null);

    // Map AIPlanResponse.Meals to BackendMealInput[]
    const mealsForBackend: BackendMealInput[] = generatedPlan.Meals.map(aiMeal => ({
        Name: aiMeal.Name,
        Calories: aiMeal.Calories,
        Protein: aiMeal.Protein,
        Carbs: aiMeal.Carbs,
        Fats: aiMeal.Fats,
        Category: aiMeal.Category,
        Ingredients: aiMeal.Ingredients,
        Instructions: aiMeal.Instructions,
        Image: aiMeal.Image,
        UserCreated_ID: "AI_GENERATED" + authUser._id,
        completed: false,
    }));

    const payload: BackendDietaryUpdatePayload = {
        UserId: authUser._id,
        Date: selectedDate.toISOString(), // Use selectedDate from AppContext
        Meals: mealsForBackend,
        Day: generatedPlan.Day, // Use Day from AI response
        TotalCalories: generatedPlan.TotalCalories,
        TotalProtein: generatedPlan.TotalProtein,
        TotalCarbs: generatedPlan.TotalCarbs,
        TotalFats: generatedPlan.TotalFats,
    };

    try {
      // Your backend route: PUT /updatedietery/dietery/:dieteryId/
      // The parameter is dieteryId, which is dietary._id from context
      console.log(`Updating dietary log ${dietary.id} on backend:`, payload);
      await axios.put(`${BASE_URL}/dietery/updatedietery/dietery/${dietary.id}/`, payload, {
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      });
      Alert.alert("Success", "Meal plan has been saved to your dietary log!");
      setGeneratedPlan(null); // Clear the plan after saving
      // Refresh dietary data for the current day
      if (authUser?._id) {
        fetchDietaryData(authUser._id, selectedDate);
      }
    } catch (error) {
      console.error("Error saving meal plan to backend:", error);
      const message = error instanceof AxiosError ? error.response?.data?.message || error.message : "Failed to save meal plan.";
      setBackendError(message);
      Alert.alert("Save Failed", message);
    } finally {
      setIsSavingToBackend(false);
    }
  };

  const handleCancelPlan = () => {
    setGeneratedPlan(null);
    setAiError(null);
  };

  // --- Render Input Fields ---
  const renderInputFields = () => (
    <View style={styles.inputSection}>
      <Text style={styles.title}>Generate Your Meal Plan</Text>
      <Text style={styles.subtitle}>Personalized nutrition, just for you.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Target Daily Calories</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2500"
          placeholderTextColor="#6b7280"
          keyboardType="number-pad"
          value={caloriesIntake}
          onChangeText={setCaloriesIntake}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Number of Meals per Day</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 3 or 4"
          placeholderTextColor="#6b7280"
          keyboardType="number-pad"
          value={numMeals}
          onChangeText={setNumMeals}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Allergies (comma-separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., peanuts, shellfish"
          placeholderTextColor="#6b7280"
          value={allergies}
          onChangeText={setAllergies}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred Foods (comma-separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., chicken, broccoli, rice"
          placeholderTextColor="#6b7280"
          value={preferredFoods}
          onChangeText={setPreferredFoods}
          autoCapitalize="none"
        />
      </View>

      {aiError && <Text style={styles.errorText}>{aiError}</Text>}

      <TouchableOpacity
        onPress={handleGeneratePlan}
        disabled={!canGenerate || isLoadingAI}
        style={[styles.generateButton, (!canGenerate || isLoadingAI) && styles.buttonDisabled]}
      >
        {isLoadingAI ? (
          <ActivityIndicator color="#2A3445" />
        ) : (
          <>
            <Text style={styles.generateButtonText}>Generate Now</Text>
            <MaterialIcons name="keyboard-double-arrow-right" size={24} color="#2A3445" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  // --- Render Generated Plan ---
  const renderGeneratedPlanView = () => {
    if (!generatedPlan) return null;

    return (
      <ScrollView style={styles.resultsScrollView}>
        <Text style={styles.title}>Your Generated Meal Plan</Text>
        <Text style={styles.subtitle}>For {generatedPlan.Day}, {new Date(generatedPlan.Date).toLocaleDateString()}</Text>

        {generatedPlan.Meals.map((meal, index) => (
          <View key={index} style={styles.mealCard}>
            <Text style={styles.mealName}>{meal.Name} ({meal.Category})</Text>
            <Text style={styles.mealDetail}>Calories: {meal.Calories} kcal</Text>
            <View style={styles.macrosContainer}>
                <Text style={styles.mealMacro}>P: {meal.Protein}g</Text>
                <Text style={styles.mealMacro}>C: {meal.Carbs}g</Text>
                <Text style={styles.mealMacro}>F: {meal.Fats}g</Text>
            </View>
            {/* Optionally display ingredients and instructions */}
            {/* <Text style={styles.mealDetail}>Ingredients: {meal.Ingredients.join(', ')}</Text> */}
          </View>
        ))}
        <View style={styles.totalInfo}>
            <Text style={styles.totalText}>Total Calories: {generatedPlan.TotalCalories} kcal</Text>
            {/* Add other totals if needed */}
        </View>

        {backendError && <Text style={[styles.errorText, {marginTop: 10}]}>{backendError}</Text>}

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity onPress={handleCancelPlan} style={[styles.actionButton, styles.cancelButton]} disabled={isSavingToBackend}>
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleConfirmPlan} style={[styles.actionButton, styles.confirmButton, isSavingToBackend && styles.buttonDisabled]} disabled={isSavingToBackend}>
            {isSavingToBackend ? <ActivityIndicator color="white"/> : <Text style={styles.actionButtonText}>Confirm & Save</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#2A3445", "#1E2532"]} // Dark theme gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject} // Fill the container
      />
      <ScrollView contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
        {generatedPlan ? renderGeneratedPlanView() : renderInputFields()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 24, // rounded-3xl
    overflow: 'hidden', // Ensures gradient is clipped to rounded corners
    marginVertical: 10, // Add some vertical margin
  },
  scrollContentContainer: {
    padding: 20, // p-6 equivalent
    flexGrow: 1,
  },
  inputSection: {
    // Styles for the input form section
  },
  title: {
    color: "white",
    fontSize: Platform.OS === 'ios' ? 30 : 28, // text-3xl
    fontWeight: "bold",
    marginBottom: 8, // mb-2
    textAlign: 'center',
  },
  subtitle: {
    color: "#9ca3af", // text-gray-400
    fontSize: Platform.OS === 'ios' ? 16 : 15, // text-base
    marginBottom: 24, // mb-6
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "white",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  generateButton: {
    backgroundColor: "#FFC1A1", // accent color
    marginTop: 24, // mt-6
    paddingVertical: 14, // py-3.5
    borderRadius: 999, // rounded-full
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  generateButtonText: {
    color: "#2A3445", // primary color
    fontWeight: "bold",
    fontSize: 18, // text-lg
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: "#f87171", // text-red-400
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
  },
  resultsScrollView: {
    // No specific styles needed if content fits, or add flex:1 if needed
  },
  mealCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  mealName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  mealDetail: {
    color: "#d1d5db", // text-gray-300
    fontSize: 14,
    marginBottom: 4,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  mealMacro: {
    color: "#e5e7eb", // text-gray-200
    fontSize: 13,
  },
  totalInfo: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
  },
  totalText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    marginBottom: 10,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: "#4b5563", // text-gray-600
  },
  confirmButton: {
    backgroundColor: "#10B981", // text-emerald-500
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MealPlanGenerator;
