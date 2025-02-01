import React, { useRef, useState } from 'react';
import { Text, View, Dimensions, FlatList, TouchableOpacity, Alert } from 'react-native';
import HorizontalPicker, { HorizontalPickerRef } from './horizontalPicker';
import AppButton from '../Button';
import HorizontalPicker2 from './horizontalPicker2';
import VerticalPicker from './VerticalPicker';

const AgeSelect = () => {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const handleSubmit = (value: number) => {
    setSelectedValue(value);
  };

  const pickerRef = useRef<HorizontalPickerRef>(null);

  const handleGetSelected = () => {
    const selectedItem = pickerRef.current?.getSelectedItem();
    console.log('Selected Item:', selectedItem);
  };

  let data = Array.from({ length: 100 }, (_, i) => i + 1);
  // data = [0, 0, ...data, 0, 0]


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

      <Text className='text-hero text-white w-[80%] text-center py-6'>What is your Age?</Text>

      <View style={{height: 450}}>
        <VerticalPicker ref={pickerRef} data={data}/>
      </View>
      <AppButton title="Get Selected Item" onPress={handleGetSelected} />

      {selectedValue !== null && (
        <Text style={{ marginTop: 20, fontSize: 18 }}>
          Current Selection: {selectedValue}
        </Text>
      )}
    </View>
  );
};

export default AgeSelect;
