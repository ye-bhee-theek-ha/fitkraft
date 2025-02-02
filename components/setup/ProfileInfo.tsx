import { Text, View, TouchableOpacity, TextInput, Image } from "react-native"
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
    <View className="flex flex-1 items-center">
      <View className="px-6 items-center">
        <Text className="text-white text-3xl font-semibold mb-4 text-center">Fill Your Profile</Text>

        <Text className="text-gray-400 text-base mb-12 text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </Text>
      </View>

      <View className="space-y-6 bg-primary_dark w-full py-10 px-6">
        {/* Profile Image Picker */}
        <TouchableOpacity onPress={onImageSelect} className="self-center mb-6">
          <View className="w-24 h-24 rounded-full bg-gray-700 items-center justify-center relative">
            {profile.image ? (
              <Image source={{ uri: profile.image }} className="w-24 h-24 rounded-full" />
            ) : (
              <Ionicons name="person" size={40} color="#94a3b8" />
            )}
            <View className="absolute bottom-0 right-0 bg-accent rounded-full p-2">
              <Ionicons name="pencil" size={16} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Form Fields */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-400 mb-2">Full name</Text>
            <TextInput
              value={profile.fullName}
              onChangeText={(value) => onProfileChange("fullName", value)}
              placeholder="Enter your full name"
              placeholderTextColor="#94a3b8"
              className="bg-[#1c2632] text-white p-4 rounded-lg border border-gray-600"
            />
          </View>

          <View>
            <Text className="text-gray-400 mb-2">Nickname</Text>
            <TextInput
              value={profile.nickname}
              onChangeText={(value) => onProfileChange("nickname", value)}
              placeholder="Enter your nickname"
              placeholderTextColor="#94a3b8"
              className="bg-[#1c2632] text-white p-4 rounded-lg border border-gray-600"
            />
          </View>

          <View>
            <Text className="text-gray-400 mb-2">Email</Text>
            <TextInput
              value={profile.email}
              onChangeText={(value) => onProfileChange("email", value)}
              placeholder="Enter your email"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-[#1c2632] text-white p-4 rounded-lg border border-gray-600"
            />
          </View>

          <View>
            <Text className="text-gray-400 mb-2">Mobile Number</Text>
            <TextInput
              value={profile.mobile}
              onChangeText={(value) => onProfileChange("mobile", value)}
              placeholder="Enter your mobile number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              className="bg-[#1c2632] text-white p-4 rounded-lg border border-gray-600"
            />
          </View>
        </View>
      </View>
    </View>
  )
}

