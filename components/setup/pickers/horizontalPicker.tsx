import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, FlatList, Dimensions, Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const { width } = Dimensions.get('window');
export const ITEM_WIDTH = width / 5;

type HorizontalPickerProps = {
  data: Array<number>;
};

export type HorizontalPickerRef = {
  getSelectedItem: () => number;
};

const HorizontalPicker = forwardRef<HorizontalPickerRef, HorizontalPickerProps>(({ data }, ref) => {
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

    const lines = [1, 0.5, 1.5, 0.5, 1]

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
      outputRange: [0.25, 0.4, 1, 0.4, 0.25],
      extrapolate: 'clamp',
    });

    const opacity = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_WIDTH * 2, isBottom, isAppearing],
      outputRange: [0.3, 0.5, 1, 0.5, 0.3],
    });

    const colors = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_WIDTH + ((ITEM_WIDTH/2)), ITEM_WIDTH * 2, isBottom - ITEM_WIDTH - ((ITEM_WIDTH/2)), isAppearing],
      outputRange: ["white", "white", "#FFC1A1" ,"white", "white"],
      extrapolate: 'clamp',
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
      outputRange: [100, 100, 0, 100, 100],
    });

    const scale_ruler_mid = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_WIDTH + ((ITEM_WIDTH/2)), ITEM_WIDTH * 2, isBottom - ITEM_WIDTH - ((ITEM_WIDTH/2)), isAppearing],
      outputRange: [1, 1, 1.5, 1, 1],
      extrapolate: 'clamp',
    });


    return (
      <View className='h-full justify-evenly'>
        <Animated.View
          style={[{ width: ITEM_WIDTH }, { opacity: opacity_head, transform: [{ scale:scale_head }, {translateY: Y_Offset_head}] }]}
          className="rounded-lg items-center justify-start"
        >
          <Text
            style={{
              fontSize: 60,
              color: 'white',
            }}
          >
            {weight === 0 ? '' : weight}
          </Text>
        </Animated.View>

        <View className='bg-primary_light'>
          <Animated.View
            style={[{ width: ITEM_WIDTH }, { opacity, transform: [{ translateX }, { scale }] }]}
            className="rounded-lg items-center justify-start"
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
            className='h-12 items-end flex flex-row justify-around'  
          >
            {lines.map((value, i) => {
              const isCenter = i === Math.floor(lines.length / 2);
              return (
                <Animated.View
                className="rounded-full"
                  key={i}
                  style={[{
                    width: isCenter ? 4 : 2, 
                    height: value * 20,
                    backgroundColor: colors,
                    transform: [{
                      scaleY: isCenter ? scale_ruler_mid : 1
                    }]
                  }
                  ]}
                />
              )}
            )} 
          </View>
        </View>
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
    <View className="w-full h-full items-center justify-center">
      <View className="h-full">
        <AnimatedFlatList
          getItemLayout={(data, index) => (
              {length: Dimensions.get('window').width / 5, offset: Dimensions.get('window').width / 5 * index, index}   
          )}
          scrollEventThrottle={16}
          data={data}
          horizontal
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          bounces={false}
          renderItem={({ item, index }) => <FlatlistItem weight={item} index={index} x={x} />}
          showsHorizontalScrollIndicator= {false}
          
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
  );
});

export default HorizontalPicker;
