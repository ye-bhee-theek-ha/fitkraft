import React, { useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import WelcomeScreen from '@/components/setup/Welcome';
import GenderSelect from '@/components/setup/GenderSelect';
import AgeSelect from '@/components/setup/AgeSelect';
import WeightSelect from '@/components/setup/WeightSelect';

const FitnessProfileScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(170);

  return (
    <View className='h-screen'>
      <AgeSelect/>
    </View>
  );
};

export default FitnessProfileScreen;
