import React, { useEffect, useState } from 'react';
import "@/global.css";
import { useAuth } from '@/context/auth';
import AppButton from '@/components/Button';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

export default function TabOneScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSignIn = async () => {
    if (email.trim() === '') {
      setError('Email is required');
      return;
    }
    else if (password.trim() === '') {
      setError('Password is required');
      return;
    }
    else
    {
      setError('');
    }

    setLoading(true);
    try {

      await signIn(email, password);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setError(errorMessage);
      // setEmail("");
      setPassword("")
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView>
      <View className='flex flex-1 h-screen mb-8'>
        <View className='h-[30%] items-center justify-center'>
          <View className='h-24 w-24 mt-8 bg-primary_light rounded-lg'>

          </View>
        </View>
        <View className='flex-1 items-center'>
          
          <Text className='text-white font-bold text-heading font-Display'>
            Log In
          </Text>

          <View className='w-full mt-6 mb-4'>
            <View className='w-full mx-12'>
              <Text className='text-white font-semibold text-text font-Display'>
                Welcome Back!
              </Text>
            </View>
          </View>

          <View className='bg-primary_dark rounded-xl py-6 w-full px-12'>
            
            <View className='w-full'>
              <Text className="text-btn_title text-white mb-2 pl-3">Username or Email</Text>
              <TextInput 
                className="h-12 mb-4 px-2 rounded-xl text-btn_title bg-textInput_bg focus:border-2 border-primary_light focus:shadow-md "
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className='w-full'>
              <Text className="text-btn_title text-white mb-2 pl-3">Password</Text>
              <TextInput
                className={`h-12 bg-textInput_bg px-2 rounded-xl text-btn_title border-primary_light focus:border-2 focus:shadow-md ${error === "" ? "mb-6" : "mb-2"}`}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

          </View>

          <View className='w-full my-6 items-center'>
            <AppButton
              title='Log In'
              onPress={handleSignIn}
              class_Name='w-[50%] text-white font-semibold text-text font-Display'
              textClassName=''
              Loading= {loading}
            />
            <Text className='mt-6 mb-4 text-white text-extra_small'>
              or log in with
            </Text>

            <TouchableOpacity 
              className='bg-white rounded-lg p-[2px]'
              onPress={() => {

              }}
              >
              <MaterialCommunityIcons name="google" size={24} color="#9175FE" />
            </TouchableOpacity>
          </View>


          <View className='flex flex-row'>
            <Text className='text-white text-[extra_small]'>
              Dont have an account? 
            </Text>
            <TouchableOpacity 
              className='px-2'
              onPress={() => {router.push("/signup")}}
            >
              <Text className='text-accent text-extra_small'>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </ScrollView>
  );
}