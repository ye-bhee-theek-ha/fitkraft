import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, FlatList, Dimensions, Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';


type VerticalPickerProps = {
  data: Array<number>;
};

export type VerticalPickerRef = {
  getSelectedItem: () => number | null;
};

const VerticalPicker = forwardRef<VerticalPickerRef, VerticalPickerProps>(({ data }, ref) => {

  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dimensions = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  console.log(pos, dimensions);
  
  const height = dimensions.y;
  const ITEM_HEIGHT = height / 10;
  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<number>);
  const y = useRef(new Animated.Value(0)).current;

  const scrollIndex = useRef<number>(0);

  // Expose function to get the selected item
  useImperativeHandle(ref, () => ({
    getSelectedItem: () => scrollIndex.current,
  }));

  const FlatlistItem = ({
    weight,
    index,
    y,
  }: {
    y: Animated.Value;
    weight: number;
    index: number;
  }) => {
    const position = Animated.subtract(Animated.multiply(index, ITEM_HEIGHT), y);
    const IsDissapearing = -ITEM_HEIGHT;
    const isTop = 0;
    const isBottom = height - ITEM_HEIGHT;
    const isAppearing = height;

    const lines = [0.5, 0.5, 1.5, 0.5, 0.5]

    // const translateX = Animated.add(
    //   y,
    //   y.interpolate({
    //     inputRange: [0, 0.0001 + index * ITEM_HEIGHT],
    //     outputRange: [0, -index * ITEM_HEIGHT],
    //     extrapolate: 'clamp',
    //   })
    // );

    const Y_Offset_text = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_HEIGHT * 2, isBottom, isAppearing],
      outputRange: [14, 14, 0, 14, 14],
    });

    const scale = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_HEIGHT * 2, isBottom, isAppearing],
      outputRange: [0.25, 0.4, 1, 0.4, 0.25],
      extrapolate: 'clamp',
    });

    const colors = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_HEIGHT + ((ITEM_HEIGHT/2)), ITEM_HEIGHT * 2, isBottom - ITEM_HEIGHT - ((ITEM_HEIGHT/2)), isAppearing],
      outputRange: ["white", "white", "#FFC1A1" ,"white", "white"],
      extrapolate: 'clamp',
    });

    const scale_ruler_mid = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_HEIGHT + ((ITEM_HEIGHT/2)), ITEM_HEIGHT * 2, isBottom - ITEM_HEIGHT - ((ITEM_HEIGHT/2)), isAppearing],
      outputRange: [1, 1, 1.5, 1, 1],
      extrapolate: 'clamp',
    });

    const opacity = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_HEIGHT * 2, isBottom, isAppearing],
      outputRange: [0.3, 0.5, 1, 0.5, 0.3],
    });

    const opacity_head = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_HEIGHT + ((ITEM_HEIGHT/3)), ITEM_HEIGHT * 2, isBottom - ITEM_HEIGHT - ((ITEM_HEIGHT/3)), isAppearing],
      outputRange: [0, 0, 1, 0, 0],
    });

    const scale_head = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_HEIGHT + ((ITEM_HEIGHT/3)), ITEM_HEIGHT * 2, isBottom - ITEM_HEIGHT - ((ITEM_HEIGHT/3)), isAppearing],
      outputRange: [0.5, 0.5, 1, 0.5, 0.5],
    });
    
    const Y_Offset_head = position.interpolate({
      inputRange: [IsDissapearing, isTop + ITEM_HEIGHT + ((ITEM_HEIGHT/3)), ITEM_HEIGHT * 2, isBottom - ITEM_HEIGHT - ((ITEM_HEIGHT/3)), isAppearing],
      outputRange: [-10, -10, 0, -10, -10],
    });

    return (
      <View className='border-2 border-red-600'>
          <Animated.View
            style={[{ height: ITEM_HEIGHT }, { opacity, transform: [{translateY: Y_Offset_text }, { scale }] }]}
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
      </View>
    );
  };



  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollIndex.current = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    
  }


  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    console.log('Scroll Index:', scrollIndex.current);
  };
  


  return (
    <View className="w-32 h-full items-center justify-center bg-primary_light rounded-lg"
    onLayout = { (event: any) => {
      event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        // Update Animated.ValueXY with new position
        pos.setValue({ x: pageX, y: pageY });
        dimensions.setValue({ x: width, y: height })
      });
    }}
    >
      <View className="">
        <AnimatedFlatList
          scrollEventThrottle={16}
          className=""
          data={data}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          bounces={false}
          renderItem={({ item, index }) => <FlatlistItem weight={item} index={index} y={y} />}
          
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: { y },
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

export default VerticalPicker;
