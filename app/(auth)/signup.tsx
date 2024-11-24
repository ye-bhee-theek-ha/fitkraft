import React, { useState } from 'react';
import "@/global.css";
import { useAuth } from '@/context/auth';
import AppButton from '@/components/Button';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
  });

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => /^\d{10,15}$/.test(phone); // Assumes 10-15 digit numbers

  const handleSignUp = async () => {
    setErrors({
      fullName: '',
      username: '',
      emailOrPhone: '',
      password: '',
      confirmPassword: '',
    });

    let hasError = false;
    const newErrors: typeof errors = { fullName: '', username: '', emailOrPhone: '', password: '', confirmPassword: '' };

    // Validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
      hasError = true;
    }
    if (!username.trim()) {
      newErrors.username = 'Username is required';
      hasError = true;
    }
    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or Phone Number is required';
      hasError = true;
    } else if (!isValidEmail(emailOrPhone) && !isValidPhone(emailOrPhone)) {
      newErrors.emailOrPhone = 'Enter a valid Email or Phone Number';
      hasError = true;
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      hasError = true;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await signUp({ fullName, username, emailOrPhone, password });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign-up failed. Please try again.';
      setErrors((prev) => ({ ...prev, emailOrPhone: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <View className="items-center h-full my-12">
        <Text className="text-white font-bold text-heading font-Display my-12">Sign Up</Text>
        
        <View className="bg-primary_dark rounded-xl py-6 w-full px-12">
          {/* Full Name */}
          <View className="w-full mb-4">
            <Text className="text-btn_title text-white mb-2 pl-3">Full Name</Text>
            <TextInput
              className="h-12 px-2 rounded-xl text-btn_title bg-textInput_bg focus:border-2 border-primary_light focus:shadow-md"
              value={fullName}
              onChangeText={setFullName}
            />
            {errors.fullName && <Text className="text-error text-sm mt-1 pl-3">{errors.fullName}</Text>}
          </View>

          {/* Username */}
          <View className="w-full mb-4">
            <Text className="text-btn_title text-white mb-2 pl-3">Username</Text>
            <TextInput
              className="h-12 px-2 rounded-xl text-btn_title bg-textInput_bg focus:border-2 border-primary_light focus:shadow-md"
              value={username}
              onChangeText={setUsername}
            />
            {errors.username && <Text className="text-error text-sm mt-1 pl-3">{errors.username}</Text>}
          </View>

          {/* Email or Phone */}
          <View className="w-full mb-4">
            <Text className="text-btn_title text-white mb-2 pl-3">Email or Phone Number</Text>
            <TextInput
              className="h-12 px-2 rounded-xl text-btn_title bg-textInput_bg focus:border-2 border-primary_light focus:shadow-md"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              autoCapitalize="none"
              keyboardType="default"
            />
            {errors.emailOrPhone && <Text className="text-error text-sm mt-1 pl-3">{errors.emailOrPhone}</Text>}
          </View>

          {/* Password */}
          <View className="w-full mb-4">
            <Text className="text-btn_title text-white mb-2 pl-3">Password</Text>
            <TextInput
              className="h-12 px-2 rounded-xl text-btn_title bg-textInput_bg focus:border-2 border-primary_light focus:shadow-md"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password && <Text className="text-error text-sm mt-1 pl-3">{errors.password}</Text>}
          </View>

          {/* Confirm Password */}
          <View className="w-full mb-4">
            <Text className="text-btn_title text-white mb-2 pl-3">Confirm Password</Text>
            <TextInput
              className="h-12 px-2 rounded-xl text-btn_title bg-textInput_bg focus:border-2 border-primary_light focus:shadow-md"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {errors.confirmPassword && <Text className="text-error text-sm mt-1 pl-3">{errors.confirmPassword}</Text>}
          </View>
        </View>

        <View className="flex flex-row mt-6 flex-wrap w-[50%] justify-center text-extra_small ">
          <Text className="text-white text-[extra_small]">By continuing, you agree to </Text>
          <TouchableOpacity 
            className="justify-center"
          >
            <Text className="text-accent text-extra_small">Terms of Use </Text>
          </TouchableOpacity>
          <Text className="text-white text-[extra_small]">and </Text>
          <TouchableOpacity 
            className="justify-center"
          >
            <Text className="text-accent text-extra_small">Privacy Policy.</Text>
          </TouchableOpacity>
        </View>

        <View className="w-full my-6 items-center">          
          <AppButton
            title="Sign Up"
            onPress={handleSignUp}
            class_Name="w-[50%] text-white font-semibold text-text font-Display"
            textClassName=""
            Loading={loading}
          />

            <Text className='mt-6 mb-4 text-white text-extra_small'>
              or sign up with
            </Text>

            <TouchableOpacity 
              className='bg-white rounded-lg p-[2px]'
              onPress={() => {

              }}
              >
              <MaterialCommunityIcons name="google" size={24} color="#9175FE" />
            </TouchableOpacity>
        </View>

        <View className="flex flex-row">
          <Text className="text-white text-[extra_small]">Already have an account? </Text>
          <TouchableOpacity 
            className="justify-center"
            onPress={() => {router.back()}}
          >
            <Text className="text-accent text-extra_small">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
