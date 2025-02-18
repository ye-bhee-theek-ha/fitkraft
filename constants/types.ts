// types.ts

  // Auth Types 
export interface User {
  name: string;
  role: string;
  user_code: string;
  user_id: string;
}

// Navigation Types
export type Section = "Home" | "Workout" | "Dietary" | "Mental Wellness"

// Workout Types
export interface Exercise {
  name: string
  duration: {
    minutes: number
    seconds: number
  }
  repetitions: number
  completed: boolean
  caloriesBurned: number
}

export interface WorkoutData {
  date: string
  userID: string
  Exercises: Exercise[]
}

export interface WorkoutDayProgress {
  date: Date
  day?: string
  current?: boolean
  hasWorkout?: boolean
}


// Dietary Types

export type MealTimeName = "breakfast" | "lunch" | "dinner" | "snack" | "pre-workout" | "post-workout" | "workout"
export interface DietaryItem {
  name: string
  time_name: MealTimeName
  time?: string
  fats?: number
  proteins?: number
  carbohydrates?: number
  completed: boolean
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

