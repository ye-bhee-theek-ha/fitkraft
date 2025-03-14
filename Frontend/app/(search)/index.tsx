import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DietaryItemDetail, ExerciseDetail, MusicItem, SearchResults, WorkoutType, YogaPose } from "@/constants/types";
import { router } from "expo-router";


// Types for internal component use
type SearchResultItem = 
  | { type: 'header'; category: keyof SearchResults; title: string } 
  | { type: 'item'; category: keyof SearchResults; data: ExerciseDetail | DietaryItemDetail | MusicItem | YogaPose };

// Sample data for search results
const sampleExercises: ExerciseDetail[] = [
  {
    id: "w0",
    name: "Push-ups",
    type: "strength",
  },
  {
    id: "w1",
    name: "Running",
    type: "cardio",
  },
  {
    id: "w2",
    name: "Squats",
    type: "strength",
  },
  {
    id: "w3",
    name: "Meditation",
    type: "recovery",
  },
  {
    id: "w4",
    name: "HIT Circuit",
    type: "hit",
  }
];

const sampleFoods: DietaryItemDetail[] = [
  {
    id: "d1",
    name: "Grilled Chicken Salad",
    time_name: "lunch",
  },
  {
    id: "d2",
    name: "Protein Smoothie",
    time_name: "post-workout",
  },
  {
    id: "d3",
    name: "Avocado Toast",
    time_name: "breakfast",
  },
  {
    id: "d4",
    name: "Oatmeal with Berries",
    time_name: "breakfast",
  }
];

const sampleMusics: MusicItem[] = [
  {
    id: "m1",
    title: "Ocean Waves",
    category: "nature",
  },
  {
    id: "m2",
    title: "Meditation Journey",
    category: "relaxing music",
  },
  {
    id: "m3",
    title: "Workout Beats",
    category: "exercise music",
  },
  {
    id: "m4",
    title: "Forest Sounds",
    category: "nature",
  }
];

const sampleYogaExercises: YogaPose[] = [
  {
    id: "y1",
    name: "Downward Dog",
  },
  {
    id: "y2",
    name: "Warrior Pose",
  },
  {
    id: "y3",
    name: "Tree Pose",
  }
];

// Main Search Screen Component
const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResults>({
    exercises: [],
    foods: [],
    music: [],
    yoga: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get icon based on item category
  const getIconForCategory = (category: keyof SearchResults, type?: string): JSX.Element => {
    if (category === "exercises") {
      switch (type as WorkoutType) {
        case "cardio":
          return <MaterialIcons name="directions-run" size={24} color="white" />;
        case "strength":
          return <MaterialIcons name="fitness-center" size={24} color="white" />;
        case "yoga":
          return <MaterialIcons name="self-improvement" size={24} color="white" />;
        case "hit":
          return <MaterialIcons name="timer" size={24} color="white" />;
        case "recovery":
          return <MaterialIcons name="healing" size={24} color="white" />;
        default:
          return <MaterialIcons name="directions-run" size={24} color="white" />;
      }
    } else if (category === "foods") {
      return <MaterialIcons name="restaurant" size={24} color="white" />;
    } else if (category === "music") {
      return <MaterialIcons name="music-note" size={24} color="white" />;
    } else if (category === "yoga") {
      return <MaterialIcons name="self-improvement" size={24} color="white" />;
    }
    
    return <MaterialIcons name="search" size={24} color="white" />;
  };

  // Handle search input
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length >= 0) {
        handleSearch();
      } else {
        setSearchResults({
          exercises: [],
          foods: [],
          music: [],
          yoga: []
        });
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // TODO Simulate search API call
  const handleSearch = async (): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter results based on search query
    const filteredExercises = sampleExercises.filter(
      exercise => exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredFoods = sampleFoods.filter(
      food => food.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredMusic = sampleMusics.filter(
      music => music.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredYoga = sampleYogaExercises.filter(
      yoga => yoga.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults({
      exercises: filteredExercises,
      foods: filteredFoods,
      music: filteredMusic,
      yoga: filteredYoga
    });
    
    setIsLoading(false);
  };

  // Handle item click
  const handleItemPress = (
    item: ExerciseDetail | DietaryItemDetail | MusicItem | YogaPose, 
    category: keyof SearchResults
  ): void => {

    if (category === "exercises") {
      // Navigate to exercise details page
      router.push({
        pathname: "../(workoutInfo)",
        params: { exerciseId: (item as ExerciseDetail).id },
      });

    } else if (category === "foods") {
      // Navigate to food details page
      router.push({
        pathname: "../(DietaryInfo)",
        params: { exerciseId: (item as ExerciseDetail).id },
      });

    } else if (category === "music") {
      // Navigate to music page
      router.push({
        pathname: "../(home)/(mental-wellness)/music",
        params: { exerciseId: (item as ExerciseDetail).id },
      });

    } else if (category === "yoga") {
      
      router.push({
        pathname: "../(home)/(mental-wellness)/(meditation)/yoga",
        params: { exerciseId: (item as ExerciseDetail).id },
      });
    
    }
  };

  // Render section header
  const renderSectionHeader = (title: string, count: number): JSX.Element | null => {
    if (count === 0) return null;
    
    return (
      <View className="bg-white/10 px-4 py-2 mt-2 rounded-full">
        <Text className="text-white font-semibold text-medium">{title} ({count})</Text>
      </View>
    );
  };

  // Get item name or title with type safety
  const getItemName = (
    item: ExerciseDetail | DietaryItemDetail | MusicItem | YogaPose, 
    category: keyof SearchResults
  ): string => {
    if (category === "music") {
      return (item as MusicItem).title;
    }
    return (item as ExerciseDetail | DietaryItemDetail | YogaPose).name;
  };

  // Get item subtext with type safety
  const getItemSubtext = (
    item: ExerciseDetail | DietaryItemDetail | MusicItem | YogaPose, 
    category: keyof SearchResults
  ): string => {
    if (category === "exercises") {
      return (item as ExerciseDetail).type || "";
    } else if (category === "foods") {
      return (item as DietaryItemDetail).time_name;
    } else if (category === "music") {
      return (item as MusicItem).category;
    }
    return "";
  };

  // Render search results
  const renderSearchResults = (): JSX.Element => {

    if (isLoading) {
      return (
        <View className="items-center justify-center mt-10">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="text-white mt-4">Searching...</Text>
        </View>
      );
    }

    const hasResults = 
      searchResults.exercises.length > 0 || 
      searchResults.foods.length > 0 || 
      searchResults.music.length > 0 || 
      searchResults.yoga.length > 0;

    if (!hasResults && searchQuery.length > 0) {
      return (
        <View className="items-center justify-center mt-10">
          <MaterialIcons name="search-off" size={48} color="white" />
          <Text className="text-white mt-4">No results found for "{searchQuery}"</Text>
        </View>
      );
    }

    // Create data for FlatList with proper typing
    const flatListData: SearchResultItem[] = [
      { type: 'header' as const, category: 'exercises' as const, title: 'Exercises' },
      ...searchResults.exercises.map(item => ({
        type: 'item' as const,
        category: 'exercises' as const,
        data: item,
      })),
      { type: 'header' as const, category: 'foods' as const, title: 'Foods' },
      ...searchResults.foods.map(item => ({
        type: 'item' as const,
        category: 'foods' as const,
        data: item,
      })),
      { type: 'header' as const, category: 'music' as const, title: 'Music' },
      ...searchResults.music.map(item => ({
        type: 'item' as const,
        category: 'music' as const,
        data: item,
      })),
      { type: 'header' as const, category: 'yoga' as const, title: 'Yoga' },
      ...searchResults.yoga.map(item => ({
        type: 'item' as const,
        category: 'yoga' as const,
        data: item,
      })),
    ];

    console.log(flatListData)

    return (
      <FlatList
        data={flatListData}
        keyExtractor={(item, index) => 
          item.type === 'header' ? `header-${item.category}-${index}` : `item-${item.category}-${index}`
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            const count = searchResults[item.category].length;
            return renderSectionHeader(item.title, count);
          }
          
          const category = item.category;
          const data = item.data;
          console.log("category : " , category)
          console.log("data : ", data)
          const itemType = category === 'exercises' || category === 'yoga' 
            ? (data as ExerciseDetail).type 
            : category === 'music' ? (data as MusicItem).category : undefined;
          
          return (
            <TouchableOpacity
              className="flex-row items-center p-3 mb-1 rounded-lg "
              onPress={() => handleItemPress(data, category)}
            >
              <View className="flex justify-center items-center w-10 h-10 rounded-full bg-primary_dark mr-3 overflow-hidden">
                {getIconForCategory(category, itemType)}
              </View>
              
              <View className="flex-1">
                <Text className="text-white font-semibold text-medium">
                  {getItemName(data, category)}
                </Text>
                
                <Text className="text-gray-400 text-sm">
                  {getItemSubtext(data, category)}
                </Text>
              </View>
              
              <MaterialIcons name="chevron-right" size={24} color="white" />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View className="flex-1 bg-primary_dark">
      {/* Search Header */}
      <LinearGradient
       colors={["rgba(255,255,255,0.01)", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.3)"]}
       locations={[0, 0.5, 1]}
       start={{ x: 0, y: 0 }}
       end={{ x: 1, y: 2 }}
       style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      <View className="pt-12 px-4 pb-4 z-20">
        <View className="flex-row items-center bg-white/10 rounded-full px-4 py-2 border shadow-2xl border-white/20">
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            className="flex-1 text-white ml-2 h-10"
            placeholder="Search foods, exercises, music..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Search Results */}
      <View className="flex-1 border-2 bg-primary_dark/80 border-white/20 rounded-t-3xl overflow-hidden mx-4">
        {/* <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.1)"]}
          locations={[0, 0.5, 1]}
          style={{ flex: 1, borderRadius: 15 }}
          className="absolute bottom-0 left-0 h-full w-full"
        /> */}
        
        <View className="flex-1 p-2">
          {renderSearchResults()}
        </View>
      </View>
    </View>
  );
};

export default SearchScreen;