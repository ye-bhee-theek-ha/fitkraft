import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

const { width } = Dimensions.get('window');
export const ITEM_WIDTH = width / 5;

type HorizontalPickerProps = {
  data: Array<number>;
};

export type HorizontalPickerRef = {
  getSelectedItem: () => number | null;
};

const HorizontalPicker = forwardRef<HorizontalPickerRef, HorizontalPickerProps>(
  ({ data }, ref) => {
    // Wrap FlatList with Animated
    const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
    const x = useRef(new Animated.Value(0)).current;
    const scrollIndex = useRef<number>(0);

    // Expose a function to get the selected item index
    useImperativeHandle(ref, () => ({
      getSelectedItem: () => scrollIndex.current,
    }));

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollIndex.current = Math.round(
        event.nativeEvent.contentOffset.x / ITEM_WIDTH
      );
    };

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      console.log('Scroll Index:', scrollIndex.current);
    };

    // Simple renderItem function for testing
    const renderItem = ({ item, index }: { item: number; index: number }) => {
      return (
        <View
          style={{
            width: ITEM_WIDTH,
            height: ITEM_WIDTH,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'black',
          }}
        >
          <Text style={{ fontSize: 20 }}>{item}</Text>
        </View>
      );
    };

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <AnimatedFlatList
          // Provide getItemLayout so FlatList can efficiently scroll to items
          getItemLayout={(data, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          scrollEventThrottle={16}
          data={data}
          horizontal
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          bounces={false}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
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
    );
  }
);

export default HorizontalPicker;
