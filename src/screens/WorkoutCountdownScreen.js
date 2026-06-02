import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const COUNTDOWN_SECONDS = 3;
const SIZE = 240;
const STROKE_WIDTH = 16;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function buildRoutineExerciseState(routine) {
  return (routine?.exercises || []).map((exercise) => ({
    ...exercise,
    sets: (exercise.sets || []).map((set) => ({
      ...set,
      completed: false,
      weight: set.weight,
      reps: set.reps,
    })),
  }));
}

export default function WorkoutCountdownScreen({ navigation, route }) {
  const { startWorkoutSession } = useStore();
  const countdownBackground = getThemeColors('dark').background;
  const routine = route.params?.routine || null;
  const progress = useRef(new Animated.Value(0)).current;
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const strokeDashoffset = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, CIRCUMFERENCE],
      }),
    [progress]
  );

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: COUNTDOWN_SECONDS * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        startWorkoutSession({
          routine,
          workoutName: routine?.name || 'Quick Workout',
          comments: '',
          exercises: routine ? buildRoutineExerciseState(routine) : [],
        });
        navigation.replace('ActiveWorkout', { routine });
      }
    });

    const countdownInterval = setInterval(() => {
      setCount((currentCount) => {
        if (currentCount <= 1) {
          clearInterval(countdownInterval);
          return 1;
        }

        return currentCount - 1;
      });
    }, 1000);

    return () => {
      animation.stop();
      clearInterval(countdownInterval);
    };
  }, [navigation, progress, routine, startWorkoutSession]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: countdownBackground }]}>
      <View style={styles.content}>
        <Svg width={SIZE} height={SIZE} style={styles.svg}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#FFFFFF"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            originX={SIZE / 2}
            originY={SIZE / 2}
          />
        </Svg>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 86,
    fontWeight: '300',
    letterSpacing: -2,
  },
});
