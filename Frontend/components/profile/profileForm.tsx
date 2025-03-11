import React from "react";
import { Text, View, TouchableOpacity, TextInput, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProfileFormProps } from "@/constants/types";


export default function ProfileForm({ profile, onProfileChange, onImageSelect }: ProfileFormProps) {
    return (
      <View className="flex flex-1 items-center w-screen">
        {/* <ScrollView 
            className="py-4 px-6 w-screen"
            nestedScrollEnabled={true}
        > */}
          {/* Form Fields */}
          <View className="space-y-4 mt-3 mb-14">
            {/* Full Name */}
            <View>
              <Text className="text-white text-btn_title mb-1">Full Name</Text>
              <TextInput
                value={profile.fullName}
                onChangeText={(value) => onProfileChange("fullName", value)}
                placeholder="Enter your full name"
                placeholderTextColor="#687791"
                className="bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
              />
            </View>
  
            {/* Nickname */}
            <View>
              <Text className="text-white text-btn_title mb-1">Nickname</Text>
              <TextInput
                value={profile.nickname}
                onChangeText={(value) => onProfileChange("nickname", value)}
                placeholder="Enter your nickname"
                placeholderTextColor="#687791"
                className="bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
              />
            </View>
  
            {/* Email */}
            <View>
              <Text className="text-white text-btn_title mb-1">Email</Text>
              <TextInput
                value={profile.email}
                onChangeText={(value) => onProfileChange("email", value)}
                placeholder="Enter your email"
                placeholderTextColor="#687791"
                className="bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
              />
            </View>
  
            {/* Mobile Number */}
            <View>
              <Text className="text-white text-btn_title mb-1">Mobile Number</Text>
              <TextInput
                value={profile.mobile}
                onChangeText={(value) => onProfileChange("mobile", value)}
                placeholder="Enter your mobile number"
                placeholderTextColor="#687791"
                className="bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
              />
            </View>
  
            {/* Gender */}
            <View>
              <Text className="text-white text-btn_title mb-1">Gender</Text>
              <TextInput
                value={profile.gender ? profile.gender.toString() : ""}
                onChangeText={(value) => onProfileChange("gender", value)}
                placeholder="Enter your gender"
                placeholderTextColor="#687791"
                className="bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
              />
            </View>
  
            {/* Age */}
            <View>
              <Text className="text-white text-btn_title mb-1">Age</Text>
              <TextInput
                value={profile.age ? profile.age.toString() : ""}
                onChangeText={(value) => onProfileChange("age", value)}
                placeholder="Enter your age"
                placeholderTextColor="#687791"
                keyboardType="numeric"
                className="bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
              />
            </View>
  
            {/* Weight */}
            <View>
              <Text className="text-white text-btn_title mb-1">Weight (kg)</Text>
              <View className="flex-row space-x-2">
                <TextInput
                  value={profile.weight?.whole ? profile.weight.whole.toString() : ""}
                  onChangeText={(value) => onProfileChange("weightWhole", value)}
                  placeholder="Whole"
                  placeholderTextColor="#687791"
                  keyboardType="numeric"
                  className="bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light flex-1"
                />
              </View>
            </View>
  
            {/* Height */}
            <View>
              <Text className="text-white text-btn_title mb-1">Height (cm)</Text>
              <View className="flex-row space-x-2">
                <TextInput
                  value={profile.height?.whole ? profile.height.whole.toString() : ""}
                  onChangeText={(value) => onProfileChange("heightWhole", value)}
                  placeholder="Whole"
                  placeholderTextColor="#687791"
                  keyboardType="numeric"
                  className="bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light flex-1"
                />
              </View>
            </View>
  
            {/* Goal */}
            <View>
              <Text className="text-white text-btn_title mb-1">Goal</Text>
              <TextInput
                value={profile.goal ? profile.goal.toString() : ""}
                onChangeText={(value) => onProfileChange("goal", value)}
                placeholder="Enter your goal"
                placeholderTextColor="#687791"
                className="bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
              />
            </View>
  
            {/* Activity Level */}
            <View>
              <Text className="text-white text-btn_title mb-1">Activity Level</Text>
              <TextInput
                value={profile.activityLevel ? profile.activityLevel.toString() : ""}
                onChangeText={(value) => onProfileChange("activityLevel", value)}
                placeholder="Enter your activity level"
                placeholderTextColor="#687791"
                className="bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
              />
            </View>
          </View>
        {/* </ScrollView> */}
      </View>
    );
  }