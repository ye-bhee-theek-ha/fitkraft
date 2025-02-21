import { View, Text, FlatList, Dimensions, Animated, StyleSheet } from 'react-native';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 5; 

type AgeSelectProps = {};

export type AgeSelectRef = {
  getSelectedItem: () => number;
};

const AgeSelect = forwardRef<AgeSelectRef, AgeSelectProps>((_props, ref) => {
  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<number>);

  let ages = Array.from({ length: 100 }, (_, i) => i + 1);
  ages = [0, 0, ...ages, 0, 0];

  const x_val = useRef(new Animated.Value(0)).current;
  const scrollIndex = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    getSelectedItem: () => {
      const index = scrollIndex.current;
      return index >= 0 && index < ages.length ? ages[index] : 0;
    },
  }));

  const onMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollIndex.current = Math.round(offsetX / ITEM_WIDTH);
  };

  const FlatlistItem = ({
    age,
    index,
    x,
  }: {
    age: number;
    index: number;
    x: Animated.Value;
  }) => {
    const position = Animated.subtract(index * ITEM_WIDTH, x);
    const IsDissapearing = -ITEM_WIDTH;
    const isTop = 0;
    const isBottom = width - ITEM_WIDTH;
    const isAppearing = width;

    const translateX = Animated.add(
      x,
      x.interpolate({
        inputRange: [0, 0.0001 + index * ITEM_WIDTH],
        outputRange: [0, -index * ITEM_WIDTH],
        extrapolate: 'clamp',
      })
    );

    const scale = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_WIDTH * 2, isBottom, isAppearing],
      outputRange: [0.5, 1, 2, 1, 0.5],
      extrapolate: 'clamp',
    });

    const opacity = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_WIDTH * 2, isBottom, isAppearing],
      outputRange: [0.3, 0.6, 1, 0.6, 0.3],
    });

    return (
      <Animated.View
        style={[
          { width: ITEM_WIDTH },
          { opacity, transform: [{ translateX }, { scale }] },
        ]}
        className='rounded-lg items-center justify-center'
      >
        <Text style={{ fontSize: 34, color: 'white' }}>
          {age === 0 ? '' : age}
        </Text>
      </Animated.View>
    );
  };




  return (
    <View
      className="w-screen"
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text className="text-hero text-white w-[80%] text-center py-6">
        What is your Age?
      </Text>

      <View className="flex flex-1">
        <View className="w-full h-full items-center justify-center">
          <View className="h-36">
            <AnimatedFlatList
              scrollEventThrottle={16}

              className="bg-primary_light"

              data={ages as number[]}
             
              horizontal
             
              snapToInterval={ITEM_WIDTH}
             
              decelerationRate="fast"
             
              bounces={false}

              renderItem={({ item, index }: { item: number; index: number }) => (
                <FlatlistItem age={item} index={index} x={x_val} />
              )}

              // Use the animated value to drive scrolling.
              
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: x_val } } }],
                { useNativeDriver: true }
              )}
              onMomentumScrollEnd={onMomentumScrollEnd}
             
              // getItemLayout={(_data, index) => ({
              //   length: ITEM_WIDTH,
              //   offset: ITEM_WIDTH * index,
              //   index,
              // })}
             
              showsHorizontalScrollIndicator={false}
            />


          </View>
        </View>
      </View>
    </View>
  );
});

export default AgeSelect;
