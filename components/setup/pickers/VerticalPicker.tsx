import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, FlatList, Animated, NativeScrollEvent, NativeSyntheticEvent, LayoutChangeEvent } from 'react-native';

type VerticalPickerProps = {
  data: Array<number>;
};

export type VerticalPickerRef = {
  getSelectedItem: () => { whole: number; fraction: number } | null;
};

const VerticalPicker = forwardRef<VerticalPickerRef, VerticalPickerProps>(({ data }, ref) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const NUM_VISIBLE_ITEMS = 5;
  const ITEM_HEIGHT = containerHeight / NUM_VISIBLE_ITEMS;
  const flatListRef = useRef<FlatList>(null);
  const y = useRef(new Animated.Value(0)).current;
  const scrollIndex = useRef<{ whole: number; fraction: number }>({ whole: 0, fraction: 0 });
  
  // Handle container layout
  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
  };

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

    if (!containerHeight) return null;

    const position = Animated.subtract(Animated.multiply(index, ITEM_HEIGHT), y);
    const midPoint = containerHeight / 2;
    const fraction = Animated.divide(Animated.modulo(y, ITEM_HEIGHT), ITEM_HEIGHT / 10);

    const [fractionValue, setFractionValue] = useState(0);

    useEffect(() => {
      const listenerId = fraction.addListener(({ value }) => {
        setFractionValue(value);
        console.log(fractionValue);
      });

      return () => {
        fraction.removeListener(listenerId); // Clean up listener
      };
    }, []);

    // 
    // 
    // CONVERT FRACTION TO TEXT 
    // 
    //


    const scale = position.interpolate({
      inputRange: [
        -ITEM_HEIGHT,
        0,
        midPoint,
        containerHeight,
        containerHeight + ITEM_HEIGHT
      ],
      outputRange: [0.3, 0.6, 1, 0.6, 0.3],
      extrapolate: 'clamp',
    });

    const opacity = position.interpolate({
      inputRange: [
        -ITEM_HEIGHT,
        0,
        midPoint,
        containerHeight,
        containerHeight + ITEM_HEIGHT
      ],
      outputRange: [0.3, 0.6, 1, 0.6, 0.3],
    });


    const colors = position.interpolate({
      inputRange: [-ITEM_HEIGHT, 0 + ITEM_HEIGHT + ((ITEM_HEIGHT/2)), ITEM_HEIGHT * 2, containerHeight - ITEM_HEIGHT - ((ITEM_HEIGHT/2)), containerHeight - ITEM_HEIGHT],
      outputRange: ["white", "white", "#FFC1A1" ,"white", "white"],
      extrapolate: 'clamp',
    });
    
    
    const opacity_head = position.interpolate({
      inputRange: [
        // Fade-in zone: before the new header appears, opacity is 0…
        ITEM_HEIGHT * 2 - (ITEM_HEIGHT / 2) - 1, 
        ITEM_HEIGHT * 2 - (ITEM_HEIGHT / 2),     
        ITEM_HEIGHT * 2 - (ITEM_HEIGHT / 2) + 1,
        // containerHeight/2,
        ITEM_HEIGHT * 2 + (ITEM_HEIGHT / 2) - 1,
        ITEM_HEIGHT * 2 + (ITEM_HEIGHT / 2),
        ITEM_HEIGHT * 3 + (ITEM_HEIGHT / 2) + 1 
      ],
      outputRange: [
        0,  // Before new header reaches fade-in start
        0,  // Still 0 right at the boundary
        1,  // Faded in fully
        1,  // Stay fully visible until fade-out begins
        0,  // Fade out to 0
        0   // Remain 0 afterwards
      ],
      extrapolate: 'clamp'
    });
    
    const Y_Offset_head = position.interpolate({
      inputRange: [
        0,
        ITEM_HEIGHT * 2 - ITEM_HEIGHT / 2,   
        ITEM_HEIGHT * 3 - ITEM_HEIGHT / 2,
        containerHeight
      ],
      outputRange: [
        -5000,
        -ITEM_HEIGHT * 2 + (ITEM_HEIGHT*2 + ITEM_HEIGHT/2),  
        -ITEM_HEIGHT * 3 + (ITEM_HEIGHT*2 + ITEM_HEIGHT/2),
        5000
        // 0,0,0,0
      ],
      extrapolate: 'clamp'
    });

    const fraction_index = fraction.interpolate({
      inputRange: [0, 9], // Assuming fraction ranges from 0 to 9
      outputRange: ["0", "9"], // Convert to string representation
      extrapolate: "clamp",
    });

    return (
      <View style={{ height: ITEM_HEIGHT }} className="flex flex-row w-72">
        
        <Animated.View
          className="header items-center justify-center flex flex-1"
          style={[
            { 
              height: ITEM_HEIGHT,
              opacity: opacity_head,
              transform: [{translateY: Y_Offset_head }]
            }
          ]}
        >
          <Animated.Text
              style={{
                fontSize: 10,
                color: 'white',
              }}
            >
              {weight === 0 ? '' : `${weight}.`}
          </Animated.Text>
        </Animated.View>


        {/* ------------------------------------------------------------------ */}
        
        <Animated.View
          className="items-center justify-center flex flex-1"
          style={[
            { 
              height: ITEM_HEIGHT,
              opacity,
              transform: [{ scale }]
            }
          ]}
        >
            <Text className="text-white text-4xl justify-center">
              {weight === 0 ? '' : weight}
            </Text>
        </Animated.View>

        <View className='flex flex-row w-20 justify-end items-center'>

          <View style={[{ height: ITEM_HEIGHT }, {}]}
            className='w-24 items-center flex flex-col justify-around bg-primary_light rounded-lg'  
          >
            {Array.from({ length: 6 }).map((_, i) => {
              return (
                <Animated.View
                className="rounded-full items-center bg-slate-50"
                  key={i}
                  style={[{
                    width: (i == 2 || i == 3) ? 40 : 30, 
                    height: 4,
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

    if (ITEM_HEIGHT <= 0) return;
    
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollIndex.current.whole = Math.round(offsetY / ITEM_HEIGHT);
    scrollIndex.current.fraction = Math.round((offsetY % ITEM_HEIGHT) / (ITEM_HEIGHT/10));
  };

  return (
    <View 
      className="h-full rounded-lg"
      onLayout={handleContainerLayout}
    >
      {containerHeight > 0 && (
        <Animated.FlatList
          ref={flatListRef}
          scrollEventThrottle={16}
          className="w-full"
          data={data}
          keyExtractor={(item) => item.toString()}
          snapToInterval={ITEM_HEIGHT/10}
          decelerationRate="fast"
          bounces={false}
          renderItem={({ item, index }) => <FlatlistItem weight={item} index={index} y={y} />}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y } } }],
            { useNativeDriver: true, listener: handleScroll }
          )}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          contentContainerStyle={{
            paddingBottom: containerHeight - ITEM_HEIGHT
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
});

export default VerticalPicker;