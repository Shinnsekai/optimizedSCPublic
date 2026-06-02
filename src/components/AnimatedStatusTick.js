import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

export default function AnimatedStatusTick({ completed, colors, size = 88 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (completed) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.06,
            duration: 760,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.72,
            duration: 760,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 760,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 760,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [completed, opacity, scale]);

  const accentColor = completed ? colors.success : colors.primary;
  const backgroundColor = completed ? 'rgba(16, 185, 129, 0.18)' : 'rgba(29, 78, 216, 0.14)';
  const borderColor = completed ? 'rgba(16, 185, 129, 0.42)' : 'rgba(29, 78, 216, 0.28)';

  return (
    <Animated.View
      style={[
        styles.shell,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          backgroundColor,
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <Check color={accentColor} size={size * 0.44} strokeWidth={3} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
