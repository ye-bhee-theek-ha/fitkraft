// types.ts

// badges

// Define Badge Type
export type BadgeType = 'streak' | 'challenge';
export type BadgeCategory = 'Streak' | 'Challenge';

// Badge Interface
export interface Badge {
  id: string;
  name: string;
  category: BadgeCategory;
  type: BadgeType;
  BadgeIconImage: string;
  criteria: string;
  unlockCondition: string;
  points: number;
  reward: string;
}



// user


export interface WeightOrHeight {
  whole: number;
  fraction: number;
}

export interface User {
  fullName: string;
  nickname?: string;
  image?: string | null;
}


export interface UserProfile {
  fullName: string;
  nickname?: string;
  email: string;
  mobile: string;
  image?: string | null;
  BMI?: number;

  // Onboarding-related fields:
  gender?: 'male' | 'female' | string;
  age?: number;
  weight?: WeightOrHeight;
  height?: WeightOrHeight;
  goal?: string;
  activityLevel?: string;
}

export interface ProfileFormProps {
  profile: UserProfile;
  onProfileChange: (field: string, value: string) => void;
  onImageSelect: () => void;
}

// Navigation Types
export type Section = "Home" | "Workout" | "Dietary" | "Mental Wellness"


// Workout Types


// export interface Food {
//   id: string;
//   name: string;
//   time_name: string;
//   fats: number;
//   proteins: number;
//   carbohydrates: number;
//   completed: boolean;
// }

// export interface Music {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   audioUrl: string;
// }

// export interface YogaExercise {
//   id: string;
//   name: string;
//   duration: { minutes: number; seconds: number };
//   type: string;
//   caloriesBurned: number;
//   completed: boolean;
// }


export type WorkoutType = "cardio" | "strength" | "yoga" | "hit" | "recovery" | 'flexibility' | 'balance' | 'other' | 'stretching' | 'meditation' | 'pilates' | 'dance' | 'circuit' | 'bodyweight' | 'powerlifting' | 'crossfit' | 'functional' | 'aerobic' | 'anaerobic' | 'plyometric' | 'endurance' | 'mobility' | 'core' | 'full-body' | 'upper-body' | 'lower-body';

export interface Duration {
  minutes: number;
  seconds: number;
}
export interface Exercise {
  name: string
  duration: Duration
  type?: WorkoutType
  repetitions: number
  completed: boolean
  caloriesBurned: number
}

export interface WorkoutData {
  date: string
  userID: string
  Exercises: Exercise[]
}


export interface WorkoutDetails {
  id: string;
  name: string;
  mediaUrl: string;
  mediaType: 'gif' | 'video';
  duration: Duration;
  type: WorkoutType;
  otherTypeSpecification?: string;
  caloriesBurned: number;
  description: {
    intensity: 1 | 2 | 3 | 4 | 5;
  };
  additionalDetails: {
    rep: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    preWorkoutEnergy?: 1 | 2 | 3 | 4 | 5;
    postWorkoutEnergy?: 1 | 2 | 3 | 4 | 5;
    location: 'Home' | 'Gym' | 'Outdoors' | 'Other';
    progressNotes?: string;
    goalsAchieved?: string[];
  };
}

export interface WorkoutDayProgress {
  date: Date
  day?: string
  current?: boolean
  hasWorkout?: boolean
}


export interface WeeklyWorkoutTasksProps {
  isLoading?: boolean
  weeklyWorkouts: Exercise[][]
}

// Dietary Types

export type MealTimeName = "breakfast" | "lunch" | "dinner" | "snack" | "pre-workout" | "post-workout" | "workout"
export interface DietaryItem {
  UserId: string
  Date: Date
  Meals: MealItem[]
  TotalCalories: number
  TotalProtein: number 
  TotalCarbs: number
  TotalFats: number
}

export interface MealItem {
  _id: string
  name: string
  time_name: MealTimeName
  time?: string
  calories: number
  fats: number
  proteins: number
  carbohydrates: number
  completed: boolean
}

// menatl wellness types

export interface MentalWellnessExerciseItem {
  title: string
  description: string
  duration?: string
  image?: string
  videoUrl?: string
}

export interface MusicItem {
  id?:string
  title: string
  description?: string
  category: string;
  image?: any
  audioUrl?: string
}

export interface VideoItem {
  title: string
  description?: string
  thumbnail: string
  videoUrl?: string
}

export interface YogaPose {
  id: string;
  name: string
  description?: string
  duration?: string
  thumbnail?: string
  videoUrl?: string
}


// Component Props Types

// header
export interface HeaderProps {
  username: string
  currentSection: Section
  onSectionChange: (section: Section) => void
  onSearchPress: () => void
  onNotificationPress: () => void
  onProfilePress: () => void
}


// workout
export interface WorkoutListProps {
  workouts: Exercise[]
}

export interface WorkoutProgressListProps {
  WorkoutDataHistory: WorkoutData[]
  currentDate: Date
}

// Dietary
export interface TooltipState {
  visible: boolean
  text: string
  index: number
}

export interface DietaryListProps {
  diets: DietaryItem[]
}


export interface DietaryTimeInterfaceProps {
  diets: DietaryItem[]
  WorkoutTime?: string //HH:mm format
  onMarkDone: () => void
  onAddCustom: () => void
}

// Notification Types

export type NotificationCategory = 
  | "system" 
  | "badges" 
  | "progress" 
  | "achievement" 
  | "workout" 
  | "diet" 
  | "reminder"

export interface Notification {
  id: string
  category: NotificationCategory
  message: string
  timestamp: Date
  read: boolean
}

// search bar

export interface ExerciseDetail {
  id: string
  name: string
  type?: WorkoutType
}

export interface DietaryItemDetail {
  id: string
  name: string
  time_name: MealTimeName
}


export interface SearchResults {
  exercises: ExerciseDetail[];
  foods: DietaryItemDetail[];
  music: MusicItem[]; 
  yoga: YogaPose[]; 
}

// app btn
export interface AppButtonProps {
  title: string
  onPress?: () => void
  class_Name?: string
  textClassName?: string
  Loading?: boolean
  spinnerSize?: number
  spinnerColor?: string
  spinnerStyle?: object
}

export interface NotificationBannerProps {
  message?: string
  type?: "success" | "error"
}

export interface NotificationBannerRef {
  handleShowBanner: (message: string, type: "success" | "error") => void
}

export interface LoadingSpinnerProps {
  isLoading: boolean
  size?: number
  color?: string
  style?: any
}



// MUSIC MODAL

export type RepeatMode = "off" | "all" | "one";

export interface Song {
  id: string;
  title: string;
  artist: string;
  image: string;
  audioUrl: string;
  duration: number; // milliseconds
  playlistName: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentPosition: number;
  duration: number;
  currentSongIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: Song[];
  volume: number;
}

export interface MusicPlayerContextType {
  playbackState: PlaybackState;
  currentSong: Song | null;
  controlsVisible: boolean;
  isExpanded: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  togglePlay: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  seek: (position: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (volume: number) => void;
  toggleExpanded: () => void;
  playSong: (song: Song, replaceQueue?: boolean) => void;
  addToQueue: (song: Song) => void;
  clearQueue: () => void;
}

// daily quiz
export interface Activity {
  id: number;
  label: string;
  checked: boolean;
}

export interface Emotion {
  id: number;
  label: string;
  emoji: string;
}

export interface DailyCheckInQuizProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: (score: number) => void;
}

export interface QuizResult {
  score: number;
  activities: string[];
  emotion: string | null;
  rating: number;
  timestamp: string;
}
