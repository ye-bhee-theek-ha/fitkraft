import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedScrollHandler,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import LoadingSpinner from '@/components/LoadingSpinner';
import { launchCameraAsync } from 'expo-image-picker';

const { width } = Dimensions.get('window');

// Extended the type definition to include more details
export type MealTimeName = "breakfast" | "lunch" | "dinner" | "snack" | "pre-workout" | "post-workout" | "workout";

export interface DietaryItem {
  id: string;
  name: string;
  time_name: MealTimeName;
  imageUrl: string;
  calories: number;
  fats?: number;
  proteins?: number;
  carbohydrates?: number;
  servingSize: string;
  // tags: string[];
  description: string;
  ingredients: string[];
  instructions: string[];
  preparationTime: number; // in minutes
  cookingTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  dietaryPreferences: string[]; // vegan, vegetarian, etc.
  allergens?: string[];
}

// Sample dietary items data
const dietaryItems: DietaryItem[] = [
  {
    id: '1',
    name: 'Greek Yogurt Bowl with Berries',
    time_name: 'breakfast',
    imageUrl: 'https://source.unsplash.com/random/?greek-yogurt-bowl',
    calories: 320,
    fats: 12,
    proteins: 22,
    carbohydrates: 38,
    servingSize: '1 bowl (250g)',
    tags: ['high-protein', 'low-calorie', 'quick'],
    description: 'A delicious and protein-rich Greek yogurt bowl topped with fresh berries, honey, and granola. Perfect for starting your day with energy and nutrients.',
    ingredients: [
      '1 cup Greek yogurt',
      '½ cup mixed berries (strawberries, blueberries, raspberries)',
      '2 tbsp honey',
      '¼ cup granola',
      '1 tbsp chia seeds',
      '5 almonds, chopped'
    ],
    instructions: [
      'Add Greek yogurt to a bowl',
      'Top with mixed berries',
      'Drizzle honey over the top',
      'Sprinkle granola, chia seeds, and chopped almonds',
      'Serve immediately or refrigerate for up to 1 hour'
    ],
    preparationTime: 5,
    cookingTime: 0,
    difficulty: 'easy',
    dietaryPreferences: ['vegetarian', 'gluten-free optional'],
    allergens: ['dairy', 'nuts']
  },
  {
    id: '2',
    name: 'Grilled Chicken Salad',
    time_name: 'lunch',
    imageUrl: 'https://source.unsplash.com/random/?grilled-chicken-salad',
    calories: 425,
    fats: 18,
    proteins: 40,
    carbohydrates: 25,
    servingSize: '1 plate (350g)',
    tags: ['high-protein', 'low-carb', 'meal-prep'],
    description: 'A satisfying grilled chicken salad with mixed greens, vegetables, and a light vinaigrette. High in protein and perfect for a balanced lunch.',
    ingredients: [
      '150g grilled chicken breast',
      '2 cups mixed greens',
      '½ cup cherry tomatoes, halved',
      '¼ cucumber, sliced',
      '¼ avocado, sliced',
      '2 tbsp olive oil',
      '1 tbsp balsamic vinegar',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Season chicken breast with salt and pepper',
      'Grill chicken until fully cooked (internal temp 165°F)',
      'Slice chicken into strips',
      'In a large bowl, combine mixed greens, tomatoes, cucumber',
      'Add sliced avocado and chicken',
      'Whisk together olive oil and balsamic vinegar',
      'Drizzle dressing over salad and serve'
    ],
    preparationTime: 10,
    cookingTime: 15,
    difficulty: 'medium',
    dietaryPreferences: ['gluten-free', 'dairy-free'],
    allergens: []
  },
  {
    id: '3',
    name: 'Sweet Potato & Black Bean Bowl',
    time_name: 'dinner',
    imageUrl: 'https://source.unsplash.com/random/?sweet-potato-bowl',
    calories: 520,
    fats: 15,
    proteins: 18,
    carbohydrates: 82,
    servingSize: '1 bowl (400g)',
    tags: ['plant-based', 'high-fiber', 'anti-inflammatory'],
    description: 'A hearty and nutritious bowl featuring roasted sweet potatoes, black beans, and a variety of vegetables and spices for a satisfying dinner.',
    ingredients: [
      '1 medium sweet potato, cubed',
      '½ cup black beans, cooked',
      '½ cup quinoa, cooked',
      '½ avocado, sliced',
      '¼ cup corn kernels',
      '2 tbsp red onion, diced',
      '2 tbsp cilantro, chopped',
      '1 tbsp olive oil',
      '1 tsp cumin',
      '½ tsp paprika',
      'Juice of ½ lime',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Preheat oven to 400°F (200°C)',
      'Toss sweet potato cubes with olive oil, cumin, paprika, salt and pepper',
      'Roast for 25-30 minutes until tender',
      'In a bowl, arrange quinoa as the base',
      'Top with roasted sweet potatoes, black beans, corn, and red onion',
      'Add avocado slices',
      'Squeeze lime juice over the bowl',
      'Garnish with fresh cilantro and serve'
    ],
    preparationTime: 15,
    cookingTime: 30,
    difficulty: 'medium',
    dietaryPreferences: ['vegan', 'gluten-free'],
    allergens: []
  },
  {
    id: '4',
    name: 'Protein Smoothie',
    time_name: 'post-workout',
    imageUrl: 'https://source.unsplash.com/random/?protein-smoothie',
    calories: 310,
    fats: 8,
    proteins: 30,
    carbohydrates: 35,
    servingSize: '1 glass (450ml)',
    tags: ['recovery', 'high-protein', 'quick'],
    description: 'A refreshing and protein-packed smoothie perfect for post-workout recovery, helping to rebuild muscles and replenish energy stores.',
    ingredients: [
      '1 scoop whey protein powder (30g)',
      '1 banana',
      '1 cup almond milk',
      '½ cup frozen berries',
      '1 tbsp peanut butter',
      '1 tbsp chia seeds',
      '5 ice cubes'
    ],
    instructions: [
      'Add all ingredients to a blender',
      'Blend until smooth and creamy',
      'Add more almond milk if needed to adjust consistency',
      'Pour into a glass and serve immediately'
    ],
    preparationTime: 5,
    cookingTime: 0,
    difficulty: 'easy',
    dietaryPreferences: ['vegetarian', 'gluten-free'],
    allergens: ['dairy', 'nuts']
  }
];

// Function to get the color based on meal time
const getMealTimeColor = (mealTime: MealTimeName): string => {
  switch (mealTime) {
    case 'breakfast': return '#FF9500';
    case 'lunch': return '#30D158';
    case 'dinner': return '#BF5AF2';
    case 'snack': return '#64D2FF';
    case 'pre-workout': return '#FF375F';
    case 'post-workout': return '#0A84FF';
    case 'workout': return '#FFD60A';
    default: return '#6D8A96';
  }
};



const DietaryFoodInfoScreen = () => {
  // Get the food ID from the route params
  const { foodId } = useLocalSearchParams();
  
  // TODO get food item from api
  const foodItem = dietaryItems.find(item => item.id === foodId) || dietaryItems[0];


  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Reanimated shared values
  const scrollY = useSharedValue(0);
  const fadeValue = useSharedValue(0);
  const slideValue = useSharedValue(50);

  useEffect(() => {
    // Run entrance animations with Reanimated
    fadeValue.value = withTiming(1, { duration: 800 });
    slideValue.value = withTiming(0, { duration: 800 });
  }, []);

  

  const fetchUnsplashImage = async () => {
    const accessKey = '1ztY_iDLnOzBQULqZXq_966COxXFzIiJvflO20HFs-M';
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(foodItem.name)}&client_id=${accessKey}&per_page=1`;

    try {
      setLoading(true); // Start loading

      const response = await fetch(url);
      const data = await response.json();
      

      if (data.results.length > 0) {
        setImageUrl(data.results[0].urls.regular);
      } else {
        setImageUrl(null);
      }
      console.log("try", loading)
    } catch (error) {
      console.error('Error fetching image:', error);
      setImageUrl(null);
      setLoading(false)
      console.log("err", loading)

    } finally {
      console.log("finally", loading)
      console.log(imageUrl)
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchUnsplashImage();
  }, []);

  
  // Calculate total macros
  const totalMacros = (foodItem.fats || 0) + (foodItem.proteins || 0) + (foodItem.carbohydrates || 0);

  // Calculate percentage of each macro
  const getFatPercentage = () => {
    return totalMacros > 0 ? ((foodItem.fats || 0) / totalMacros) * 100 : 0;
  };
  
  const getProteinPercentage = () => {
    return totalMacros > 0 ? ((foodItem.proteins || 0) / totalMacros) * 100 : 0;
  };
  
  const getCarbPercentage = () => {
    return totalMacros > 0 ? ((foodItem.carbohydrates || 0) / totalMacros) * 100 : 0;
  };

  // Scroll handler with Reanimated
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles with Reanimated
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100, 150],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [-60, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0, 100],
      [1.2, 1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeValue.value,
      transform: [{ translateY: slideValue.value }],
      paddingHorizontal: 16,
    };
  });

  return (
    <View className="flex-1 bg-primary_dark">
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header, 
          headerAnimatedStyle
        ]}
        className="pt-4"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">{foodItem.name}</Text>
        <View style={{ width: 32 }} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Back Button (visible when not scrolled) */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="absolute left-4 top-12 z-10 bg-black/50 rounded-full p-2"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Image Section */}
        <Animated.View className="rounded-b-3xl mx-3 overflow-hidden" style={[imageAnimatedStyle, { height: 330 }]}>
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <LoadingSpinner isLoading={loading} size={50} color="#fff" />
            </View>
          ) : (
            imageUrl ?
            <Image
              key={imageUrl}
              source={
               { uri: imageUrl }
              }
              style={{
                width: '100%',
                height: '100%',
              }}
              resizeMode="cover"
            />
            :
            <View className='flex items-center justify-center h-full'>
              <MaterialCommunityIcons name="food-turkey" size={124} color="#3D4656" />
              <Text className="text-gray-500 text-heading text-center mt-2">No image available</Text>
            </View>
          )}

          {/* Gradient Overlay */}
          {
            imageUrl !== null &&
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              locations={[0.6, 1]}
              style={{
                height: 150,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
              }}
          />
          }
        </Animated.View>

        {/* Main Content */}
        <Animated.View 
          style={[
            contentAnimatedStyle,
            { zIndex: 10, paddingTop: 5, paddingBottom: 40 }
          ]}
        >
          {/* Food Title */}
          <Animatable.Text 
            animation="fadeInUp" 
            delay={200}
            className="text-white text-3xl font-bold mb-1"
          >
            {foodItem.name}
          </Animatable.Text>
          
          {/* Meal Type & Calories */}
          <View className="flex-row items-center justify-between mb-6">
            <Animatable.View 
              animation="fadeInLeft" 
              delay={400}
              className="flex-row items-center"
            >
              <View 
                className="px-3 py-1 rounded-full mr-2 flex-row items-center" 
                style={{ 
                  backgroundColor: getMealTimeColor(foodItem.time_name) + '30', 
                  borderColor: getMealTimeColor(foodItem.time_name), 
                  borderWidth: 1 
                }}
              >
                <MaterialIcons 
                  name={
                    foodItem.time_name === 'breakfast' ? 'wb-sunny' : 
                    foodItem.time_name === 'lunch' ? 'restaurant' : 
                    foodItem.time_name === 'dinner' ? 'nightlight-round' : 
                    foodItem.time_name === 'snack' ? 'cookie' :
                    foodItem.time_name === 'pre-workout' ? 'fitness-center' :
                    foodItem.time_name === 'post-workout' ? 'local-drink' : 'directions-run'
                  } 
                  size={16} 
                  color={getMealTimeColor(foodItem.time_name)} 
                />
                <Text className="text-white ml-1 capitalize">
                  {foodItem.time_name.replace('-', ' ')}
                </Text>
              </View>
            </Animatable.View>
            
            <Animatable.View 
              animation="fadeInRight" 
              delay={400}
              className="flex-row items-center"
            >
              <Feather name="zap" size={16} color="#FFD60A" />
              <Text className="text-white ml-1 font-semibold">
                {foodItem.calories} kcal
              </Text>
            </Animatable.View>
          </View>

          {/* Description */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={500}
            className="mb-6"
          >
            <Text className="text-white text-base leading-6">
              {foodItem.description}
            </Text>
          </Animatable.View>

          {/* Macros Chart */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={600}
            className="mb-6"
          >
            <Text className="text-white text-lg font-bold mb-3">Macronutrients</Text>
            <View className="bg-secondary_background p-4 rounded-xl">
              <View className="flex-row justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                  <Text className="text-white">Proteins: {foodItem.proteins}g</Text>
                </View>
                <Text className="text-white font-bold">{getProteinPercentage().toFixed(0)}%</Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                  <Text className="text-white">Fats: {foodItem.fats}g</Text>
                </View>
                <Text className="text-white font-bold">{getFatPercentage().toFixed(0)}%</Text>
              </View>
              
              <View className="flex-row justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
                  <Text className="text-white">Carbs: {foodItem.carbohydrates}g</Text>
                </View>
                <Text className="text-white font-bold">{getCarbPercentage().toFixed(0)}%</Text>
              </View>
              
              {/* Progress Bar */}
              <View className="h-2 bg-gray-800 rounded-full overflow-hidden flex-row">
                <View 
                  className="h-full bg-blue-500" 
                  style={{ width: `${getProteinPercentage()}%` }} 
                />
                <View 
                  className="h-full bg-yellow-500" 
                  style={{ width: `${getFatPercentage()}%` }} 
                />
                <View 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${getCarbPercentage()}%` }} 
                />
              </View>
            </View>
          </Animatable.View>

          {/* Serving Size */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={700}
            className="flex-row items-center mb-6"
          >
            <MaterialCommunityIcons name="food-variant" size={20} color="#64D2FF" />
            <Text className="text-white ml-2">Serving Size: {foodItem.servingSize}</Text>
          </Animatable.View>

          {/* Preparation Info */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={800}
            className="flex-row justify-between mb-6"
          >
            <View className="flex-1 items-center p-3 bg-secondary_background rounded-xl mr-2">
              <Feather name="clock" size={20} color="#FFD60A" />
              <Text className="text-white text-xs mt-1">Prep Time</Text>
              <Text className="text-white font-bold">{foodItem.preparationTime} min</Text>
            </View>
            <View className="flex-1 items-center p-3 bg-secondary_background rounded-xl mr-2">
              <MaterialCommunityIcons name="pot-steam" size={20} color="#FF9500" />
              <Text className="text-white text-xs mt-1">Cook Time</Text>
              <Text className="text-white font-bold">{foodItem.cookingTime} min</Text>
            </View>
            <View className="flex-1 items-center p-3 bg-secondary_background rounded-xl">
              <FontAwesome5 name="dumbbell" size={18} color="#FF375F" />
              <Text className="text-white text-xs mt-1">Difficulty</Text>
              <Text className="text-white font-bold capitalize">{foodItem.difficulty}</Text>
            </View>
          </Animatable.View>

          {/* Tags */}
          {/* <Animatable.View 
            animation="fadeInUp" 
            delay={900}
            className="mb-6"
          >
            <Text className="text-white text-lg font-bold mb-3">Tags</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {foodItem.tags.map((tag, index) => (
                <View 
                  key={index} 
                  className="px-3 py-1 bg-secondary_background rounded-full mr-2 mb-2"
                >
                  <Text className="text-white"># {tag}</Text>
                </View>
              ))}
            </ScrollView>
          </Animatable.View> */}

          {/* Dietary Preferences */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={1000}
            className="mb-6"
          >
            <Text className="text-white text-lg font-bold mb-3">Dietary Preferences</Text>
            <View className="flex-row flex-wrap">
              {foodItem.dietaryPreferences.map((pref, index) => (
                <View 
                  key={index} 
                  className="px-3 py-1 bg-primary_green/30 border border-primary_green rounded-full mr-2 mb-2"
                >
                  <Text className="text-white">{pref}</Text>
                </View>
              ))}
            </View>
          </Animatable.View>

          {/* Allergens */}
          {foodItem.allergens && foodItem.allergens.length > 0 && (
            <Animatable.View 
              animation="fadeInUp" 
              delay={1100}
              className="mb-6"
            >
              <Text className="text-white text-lg font-bold mb-3">Allergens</Text>
              <View className="flex-row flex-wrap">
                {foodItem.allergens.map((allergen, index) => (
                  <View 
                    key={index} 
                    className="px-3 py-1 bg-red-500/30 border border-red-500 rounded-full mr-2 mb-2 flex-row items-center"
                  >
                    <MaterialIcons name="warning" size={16} color="#FF375F" />
                    <Text className="text-white ml-1">{allergen}</Text>
                  </View>
                ))}
              </View>
            </Animatable.View>
          )}

          {/* Ingredients */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={1200}
            className="mb-6"
          >
            <Text className="text-white text-lg font-bold mb-3">Ingredients</Text>
            <View className="bg-secondary_background p-4 rounded-xl">
              {foodItem.ingredients.map((ingredient, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <View className="w-2 h-2 rounded-full bg-primary_green mr-3" />
                  <Text className="text-white">{ingredient}</Text>
                </View>
              ))}
            </View>
          </Animatable.View>

          {/* Instructions */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={1300}
          >
            <Text className="text-white text-lg font-bold mb-3">Instructions</Text>
            <View className="bg-secondary_background p-4 rounded-xl">
              {foodItem.instructions.map((instruction, index) => (
                <View key={index} className="flex-row mb-4">
                  <View className="w-6 h-6 rounded-full bg-primary_blue items-center justify-center mr-3">
                    <Text className="text-white font-bold">{index + 1}</Text>
                  </View>
                  <Text className="text-white flex-1">{instruction}</Text>
                </View>
              ))}
            </View>
          </Animatable.View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  backButton: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default DietaryFoodInfoScreen;