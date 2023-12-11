import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import {Dimensions, StyleSheet, Text, View, Pressable} from 'react-native';
import Animated, {
  Extrapolation,
  SlideInUp,
  SlideOutUp,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  useAnimatedGestureHandler,
  withTiming,
  runOnUI,
} from 'react-native-reanimated';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const storyFeedItems = [
  {
    title: 'Story 1',
    backgroundColor: 'green',
  },
  {
    title: 'Story 2',
    backgroundColor: 'blue',
  },
  {
    title: 'Story 3',
    backgroundColor: '#eee',
  },
  {
    title: 'Story 4',
    backgroundColor: 'yellow',
  },
  {
    title: 'Story 5',
    backgroundColor: 'purple',
  },
  {
    title: 'Story 6',
    backgroundColor: 'orange',
  },
  {
    title: 'Story 7',
    backgroundColor: 'pink',
  },
  {
    title: 'Story 8',
    backgroundColor: 'brown',
  },
  {
    title: 'Story 9',
    backgroundColor: 'black',
  },
  {
    title: 'Story 10',
    backgroundColor: 'gray,',
  },
];

const HEADER_HIDE_THRESHOLD = 100;

const BOTTOM_TAB_HEIGHT = 80;

const STORY_PANEL_HEIGHT = 100;

const ButtomTab = () => {
  return (
    <View
      style={{
        backgroundColor: 'red',
        height: BOTTOM_TAB_HEIGHT,
        width: '100%',
      }}>
      <Text
        style={{
          color: 'white',
          padding: 16,
          textAlign: 'center',
          fontSize: 24,
        }}>
        Bottom Tab
      </Text>
    </View>
  );
};

const StoryPanel = () => {
  return (
    <View
      style={{
        backgroundColor: 'white',
        height: STORY_PANEL_HEIGHT,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
      }}>
      <Text>Story Panel</Text>
    </View>
  );
};

const StoryActionItem = ({
  onPressShowPanel,
}: {
  onPressShowPanel: () => void;
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '50%',
        paddingHorizontal: 16,
        alignItems: 'center',
        backgroundColor: 'rgba(256,256,256,0.3)',
        borderRadius: 16,
        marginBottom: 16,
        paddingVertical: 8,
      }}>
      <Pressable
        style={{
          backgroundColor: 'black',
          padding: 8,
          borderRadius: 4,
        }}
        onPress={onPressShowPanel}>
        <Text
          style={{
            color: 'white',
          }}>
          +
        </Text>
      </Pressable>
      <Text>Search</Text>
    </View>
  );
};

export default function App() {
  const [pageType, setPageType] = useState<'default' | 'story'>('default');
  const [storyPageHeaderVisibility, setStoryPageHeaderVisibility] =
    useState(true);
  const scrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      runOnJS(setPageType)(
        event.contentOffset.y > scrollOffset.value ? 'story' : 'default',
      );
    },
  });

  const onPressShowHidePanel = () => {
    if (pageType === 'default') {
      setPageType('story');
    } else {
      setStoryPageHeaderVisibility(prevValue => !prevValue);
    }
  };

  const listHeaderComponent = useMemo(() => {
    return (
      <View
        onLayout={({
          nativeEvent: {
            layout: {height},
          },
        }) => {
          scrollOffset.value = height;
        }}>
        <View
          style={[
            styles.header,
            {
              paddingTop: 120,
            },
          ]}>
          <StoryPanel />
        </View>
      </View>
    );
  }, []);

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
      }}>
      <SafeAreaProvider style={styles.container}>
        <View
          style={{
            position: 'absolute',
            zIndex: 20,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            top: 40,
          }}>
          <StoryActionItem onPressShowPanel={onPressShowHidePanel} />
        </View>
        {pageType === 'default' ? (
          <>
            <Animated.FlatList
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={listHeaderComponent}
              initialNumToRender={1}
              onScroll={scrollHandler}
              data={storyFeedItems}
              renderItem={({item}) => (
                <View
                  style={[
                    {
                      backgroundColor: item.backgroundColor,
                      height:
                        Dimensions.get('screen').height - BOTTOM_TAB_HEIGHT,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}>
                  <Text
                    style={{
                      color: 'white',
                      padding: 16,
                      fontSize: 24,
                    }}>
                    {item.title}
                  </Text>
                </View>
              )}
              keyExtractor={item => item.title}
            />
          </>
        ) : (
          <Stories storyPanelVisible={storyPageHeaderVisibility} />
        )}

        <ButtomTab />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const Stories = ({storyPanelVisible}: {storyPanelVisible: boolean}) => {
  const scrollOffset = useSharedValue(0);
  const itemHeightRef = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const x = useSharedValue(0);

  const setAnimationValue = useCallback(
    (isPennelVisible: boolean) => {
      'worklet';
      x.value = isPennelVisible ? 0 : itemHeightRef.value;
    },
    [itemHeightRef, x],
  );

  useEffect(() => {
    runOnUI(setAnimationValue)(storyPanelVisible);
  }, [storyPanelVisible, setAnimationValue]);

  runOnUI(() => {
    'worklet';
    const newXValue = storyPanelVisible ? itemHeightRef.value : 0;
    x.value = newXValue;
  });

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = x.value;
    },
    onActive: (event, ctx) => {
      x.value = Math.abs(ctx.startX + event.translationY);
    },
    onEnd: _ => {
      x.value =
        Math.abs(_.translationY) < itemHeightRef.value / 2
          ? 0
          : itemHeightRef.value;
    },
  });

  const rrStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(-x.value),
        },
      ],
    };
  }, []);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [0, itemHeightRef.value],
            [0, -itemHeightRef.value],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  }, []);

  return (
    <>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          entering={SlideInUp}
          exiting={SlideOutUp}
          style={[
            styles.header,
            {
              position: 'absolute',
              width: '100%',
              paddingTop: 120,
              zIndex: 10,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
            },
            rStyle,
            rrStyle,
          ]}
          onLayout={({
            nativeEvent: {
              layout: {height},
            },
          }) => {
            itemHeightRef.value = height;
          }}>
          <StoryPanel />
        </Animated.View>
      </PanGestureHandler>
      <Animated.FlatList
        pagingEnabled
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        data={storyFeedItems}
        onScroll={scrollHandler}
        renderItem={({item}) => (
          <View
            style={[
              {
                backgroundColor: item.backgroundColor,
                height: Dimensions.get('screen').height - BOTTOM_TAB_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}>
            <Text
              style={{
                color: 'white',
                padding: 16,
                fontSize: 24,
              }}>
              {item.title}
            </Text>
          </View>
        )}
        keyExtractor={item => item.title}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
