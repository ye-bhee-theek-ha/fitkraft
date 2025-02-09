import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, FlatList, Dimensions, Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 5;

type WeightSelectProps = {
  data?: Array<number>;
};

export type WeightSelectRef = {
  getSelectedItem: () => number | null;
};

const WeightSelect = forwardRef<WeightSelectRef, WeightSelectProps>(({ data = Array.from({ length: 81 }, (_, i) => i + 40) }, ref) => {
  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<number>);
  const x = useRef(new Animated.Value(0)).current;
  const scrollIndex = useRef<number>(0);


  // Expose function to get the selected item
  useImperativeHandle(ref, () => ({
    getSelectedItem: () => scrollIndex.current,
  }));

  const FlatlistItem = ({
    weight,
    index,
    x,
  }: {
    x: Animated.Value;
    weight: number;
    index: number;
  }) => {
    const position = Animated.subtract(index * ITEM_WIDTH, x);
    const IsDissapearing = -ITEM_WIDTH;
    const isTop = 0;
    const isBottom = width - ITEM_WIDTH;
    const isAppearing = width;

    const lines = [0.5, 0.5, 1.5, 0.5, 0.5]

    const translateX = Animated.add(
      x,
      x.interpolate({
        inputRange: [0, 0.0001 + index * ITEM_WIDTH],
        outputRange: [0, -index * ITEM_WIDTH],
        extrapolate: 'clamp',
      })
    );

    const Y_Offset_text = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_WIDTH * 2, isBottom, isAppearing],
      outputRange: [14, 14, 0, 14, 14],
    });

    const scale = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_WIDTH * 2, isBottom, isAppearing],
      outputRange: [0.25, 0.4, 1, 0.4, 0.25],
      extrapolate: 'clamp',
    });

    const colors = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_WIDTH + ((ITEM_WIDTH/2)), ITEM_WIDTH * 2, isBottom - ITEM_WIDTH - ((ITEM_WIDTH/2)), isAppearing],
      outputRange: ["white", "white", "#FFC1A1" ,"white", "white"],
      extrapolate: 'clamp',
    });

    const scale_ruler_mid = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_WIDTH + ((ITEM_WIDTH/2)), ITEM_WIDTH * 2, isBottom - ITEM_WIDTH - ((ITEM_WIDTH/2)), isAppearing],
      outputRange: [1, 1, 1.5, 1, 1],
      extrapolate: 'clamp',
    });

    const opacity = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_WIDTH * 2, isBottom, isAppearing],
      outputRange: [0.3, 0.5, 1, 0.5, 0.3],
    });

    const opacity_head = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_WIDTH + ((ITEM_WIDTH/3)), ITEM_WIDTH * 2, isBottom - ITEM_WIDTH - ((ITEM_WIDTH/3)), isAppearing],
      outputRange: [0, 0, 1, 0, 0],
    });

    const scale_head = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_WIDTH + ((ITEM_WIDTH/3)), ITEM_WIDTH * 2, isBottom - ITEM_WIDTH - ((ITEM_WIDTH/3)), isAppearing],
      outputRange: [0.5, 0.5, 1, 0.5, 0.5],
    });
    
    const Y_Offset_head = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_WIDTH + ((ITEM_WIDTH/3)), ITEM_WIDTH * 2, isBottom - ITEM_WIDTH - ((ITEM_WIDTH/3)), isAppearing],
      outputRange: [-10, -10, 0, -10, -10],
    });

    return (
      
      <View className='h-full justify-evenly'>
        <View className=''>
          <Animated.View
            style={[{ width: ITEM_WIDTH }, { opacity, transform: [{ translateX }, {translateY: Y_Offset_text }, { scale }] }]}
            className="rounded-lg items-center my-2"
          >
            <Text
              style={{
                fontSize: 40,
                color: 'white',
              }}
            >
              {weight === 0 ? '' : weight}
            </Text>
          </Animated.View>


          <View style={[{ width: ITEM_WIDTH }, {}]}
            className=' bg-primary_light py-10 flex-1 flex flex-row items-center justify-around'  
          >
            {lines.map((value, i) => {
              const isCenter = i === Math.floor(lines.length / 2);
              return (
              <Animated.View
                className="bg-white rounded-full"
                key={i}
                style={[{
                  width: isCenter ? 4 : 2, 
                  height: value * 25,
                  backgroundColor: colors,
                  transform: [{
                    scaleY: isCenter ? scale_ruler_mid : 1
                  }]
                }
                ]}
              />
              )
              })} 
          </View>
        </View>
        <View
          className='h-24'
        >

        </View>
        <Animated.View
          style={[{ width: ITEM_WIDTH }, { opacity: opacity_head, transform: [{translateY: Y_Offset_head }, { scale: scale_head }] }]}
          className="rounded-lg items-center my-2 flex-nowrap"
        >
          <Text
            style={{
              fontSize: 60,
              fontWeight:"bold",
              color: 'white',
            }}
          >
            {weight === 0 ? '' : weight} 
          </Text>
        </Animated.View>

      </View>
    );
  };



  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollIndex.current = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
    
  }


  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    console.log('Scroll Index:', scrollIndex.current);
  };
  


  return (
    <View
      className="w-screen"
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text className="text-hero text-white w-[80%] text-center py-6">
        How much do you weigh?
      </Text>

      <View className="w-full h-fit items-center justify-center">
        <View className="h-full">
          <AnimatedFlatList
            getItemLayout={(data, index) => (
                {length: Dimensions.get('window').width / 5, offset: Dimensions.get('window').width / 5 * index, index}   
            )}
            scrollEventThrottle={16}
            className=""
            data={data}
            horizontal
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            bounces={false}
            renderItem={({ item, index }) => <FlatlistItem weight={item} index={index} x={x} />}
            
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: { x },
                  },
                },
              ],
              {
                useNativeDriver: true,
                listener: handleScroll,
              }
            )}
            onMomentumScrollEnd={handleScrollEnd}
          />
        </View>
      </View>
      
    </View>
  );
});

export default WeightSelect;
