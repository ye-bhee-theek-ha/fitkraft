import React, { useRef, useState } from 'react';
import { Text, View, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
  runOnJS,
  useAnimatedStyle,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 5; 

const AgeSelect = () => {
  const flatListRef = useRef<FlatList>(null);

  const [selectedAge, setSelectedAge] = useState<number>(25);
  const scrollX = useSharedValue(0);

  let ages = Array.from({ length: 100 }, (_, i) => i + 1);
  ages = [0, 0, ...ages, 0, 0]

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const centeredIndex = Math.round(offsetX / ITEM_WIDTH) + 2;
    setSelectedAge(ages[centeredIndex]);
  };

  const AgeItem = ({ age, index }: { age: number; index: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {

      };
    });

    console.log(age)

    if (age === 0)
    {
      return(
        <View  style={{
            width: ITEM_WIDTH
          }} 
        >

        </View>
      )
    }
    else
    {
      return (
        <TouchableOpacity onPress={() => {setSelectedAge(age); }}>
          <Animated.View
            style={[
              {
                width: ITEM_WIDTH,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Text
              style={{
                fontSize: 38,
                color: 'white',
                fontWeight: selectedAge === age ? 'bold' : 'normal',
              }}
            >
              {age}
            </Text>
          </Animated.View>
        </TouchableOpacity>

      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#212835' }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 24, color: 'white', marginBottom: 20 }}>
          How Old Are You?
        </Text>

        <Text style={{ fontSize: 24, color: 'white', marginBottom: 20 }}>
          {selectedAge}
        </Text>

        <View style={{ height: 120 }}>
          {/* <FlatList
            data={ages}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate={0}

            renderItem={({ item, index }) => <AgeItem age={item} index={index} />}
            
          /> */}

           <FlatList
            ref={flatListRef}
            data={ages}
            initialScrollIndex={56}
            getItemLayout={(data, index) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index })}
            horizontal
            removeClippedSubviews
            snapToInterval={ITEM_WIDTH}
            snapToAlignment='start'
            decelerationRate= 'fast'
            
            // onViewableItemsChanged={({ viewableItems }) => {viewableItems && setSelectedAge(viewableItems[Math.floor((viewableItems.length-1)/2)]?.item)}}
            onMomentumScrollEnd={handleScrollEnd}

            renderItem={({ item, index }) => (
              <AgeItem age={item} index={index} />
            )}
          />

          
        </View>
      </View>
    </View>
  );
};

export default AgeSelect;
