import { Text, View, TouchableOpacity, TextInput, Image, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface ProfileFormProps {
  profile: {
    fullName: string
    nickname: string
    email: string
    mobile: string
    image: string | null
  }
  onProfileChange: (field: string, value: string) => void
  onImageSelect: () => void
}

export default function ProfileForm({ profile, onProfileChange, onImageSelect }: ProfileFormProps) {
  return (
    <View className="flex flex-1 items-center w-screen">
      <View className="items-center">
        <Text className="text-white text-2xl font-semibold text-center">Fill Your Profile</Text>

        {/* <Text className="text-gray-400 text-base mb-12 text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </Text> */}
      </View>

      <ScrollView className=" py-4 px-6 w-screen">
        {/* Profile Image Picker */}
        <View className="self-center py-2 bg-primary_dark w-screen items-center">
          <TouchableOpacity onPress={onImageSelect} className="w-20 h-20 rounded-full bg-gray-700 items-center justify-center relative">
            {profile.image ? (
              <Image source={{ uri: profile.image }} className="w-20 h-20 rounded-full" />
            ) : (
              <Ionicons name="person" size={30} color="#94a3b8" />
            )}
            <View className="absolute bottom-0 right-0 bg-accent rounded-full p-2">
              <Ionicons name="pencil" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="space-y-4 mt-3 mb-5">
          <View>
            <Text className="text-white text-btn_title mb-1">Full name</Text>
            <TextInput
              value={profile.fullName}
              onChangeText={(value) => onProfileChange("fullName", value)}
              placeholder="Enter your full name"
              placeholderTextColor="#687791"
              className=" bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
            />
          </View>

          <View>
            <Text className="text-white text-btn_title mb-1">Nickname</Text>
            <TextInput
              value={profile.nickname}
              onChangeText={(value) => onProfileChange("nickname", value)}
              placeholder="Enter your nickname"
              placeholderTextColor="#687791"
              className=" bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
            />
          </View>

          <View>
            <Text className="text-white text-btn_title mb-1">Email</Text>
            <TextInput
              value={profile.email}
              onChangeText={(value) => onProfileChange("email", value)}
              placeholder="Enter your email"
              placeholderTextColor="#687791"
              className=" bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
            />
          </View>

          <View>
            <Text className="text-white text-btn_title mb-1">Mobile Number</Text>
            <TextInput
              value={profile.mobile}
              onChangeText={(value) => onProfileChange("mobile", value)}
              placeholder="Enter your mobile number"
              placeholderTextColor="#687791"
              className=" bg-white text-primary_dark text-text font-Display px-3 py-2 rounded-2xl border-2 border-primary_light"
            />
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

