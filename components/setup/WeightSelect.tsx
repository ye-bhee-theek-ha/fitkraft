import { View, Text, FlatList, Dimensions, Animated } from 'react-native'
import React, { useState } from 'react'

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 5; 

const WeightSelect = () => {

  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<number>);

  /**
   * first
   */

  const [selectedWeight, setSelectedWeight] = useState<number>(25);

  let weights = Array.from({ length: 100 }, (_, i) => i + 1);
  weights = [0, 0, ...weights, 0, 0]
  
  const FlatlistItem = ({ weight, index, x }: { x:Animated.Value ,weight: number; index: number }) => {
     
    const position = Animated.subtract(index * ITEM_WIDTH, x);
    const IsDissapearing = -ITEM_WIDTH
    const isTop = 0
    const isBottom = width - ITEM_WIDTH
    const isAppearing = width;

    console.log(position)
    console.log(IsDissapearing)
    console.log(isTop)
    console.log(ITEM_WIDTH)
    console.log(isBottom)
    console.log(isAppearing)



    const translateX = Animated.add(x ,x.interpolate({
      inputRange: [0, 0.0001 + index * ITEM_WIDTH],
      outputRange: [0, -index * ITEM_WIDTH ],
      extrapolate: "clamp"
    }));

    const scale = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_WIDTH*2, isBottom, isAppearing],
      outputRange: [0.5, 1, 2, 1,0.5],
      extrapolate:"clamp"
    })

    const opacity = position.interpolate({
      inputRange: [IsDissapearing, isTop, ITEM_WIDTH*2, isBottom, isAppearing],
      outputRange: [0.3, 0.6, 1, 0.6, 0.3],
    })

    return (
      <Animated.View style={[
        {width:ITEM_WIDTH},
        {opacity, transform: [{translateX}, {scale}]}

      ]} className='rounded-lg items-center justify-center'>
        <Text style={{
          fontSize: 34,
          color: 'white',
        }}>
          {weight === 0? "" : weight}
        </Text>
      </Animated.View>
    )
  }

  /**
   * first
   */

  const x = new Animated.Value(0);

  const onScroll = Animated.event([{nativeEvent: { contentOffset: {x}}}], {
    useNativeDriver: true,
  });

  return (
    <View className='w-full h-full items-center justify-center'>
      <View className='h-36'>
        <AnimatedFlatList
          scrollEventThrottle={16}
          className=' bg-primary_light'
          data={weights}
          horizontal
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          bounces= {false}
          renderItem={({ item, index }) => (
            <FlatlistItem weight={item} index={index} x={x} />

          )}
          {...{ onScroll}}
        />
      </View>
    </View>
  )
}

export default WeightSelect