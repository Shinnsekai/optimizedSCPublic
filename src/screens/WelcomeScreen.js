import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';

const APP_NAME = 'Optimized';
const CHAR_INTERVAL_MS = 130;    // ms per character (9 chars = ~1170ms)
const POST_TYPE_PAUSE_MS = 1400; // pause after typing completes
const FADE_OUT_DURATION_MS = 800; // total ~3370ms

export default function WelcomeScreen() {
  const { setWelcomePending } = useStore();

  const [typedText, setTypedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [typingDone, setTypingDone] = useState(false);

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cursorAnim = useRef(null);

  // Fade in the "Welcome to" subtitle as soon as the screen mounts
  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [headerOpacity]);

  // Typing animation for "Optimized"
  useEffect(() => {
    let charIndex = 0;

    const typeTimer = setInterval(() => {
      charIndex += 1;
      setTypedText(APP_NAME.slice(0, charIndex));

      if (charIndex >= APP_NAME.length) {
        clearInterval(typeTimer);
        setTypingDone(true);
      }
    }, CHAR_INTERVAL_MS);

    return () => clearInterval(typeTimer);
  }, []);

  // Blinking cursor — stops once typing is done
  useEffect(() => {
    if (typingDone) {
      setCursorVisible(false);
      return;
    }

    const blinkTimer = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);

    cursorAnim.current = blinkTimer;
    return () => clearInterval(blinkTimer);
  }, [typingDone]);

  // Once typing is done: pause, then fade the whole screen out
  useEffect(() => {
    if (!typingDone) return;

    const pauseTimer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: FADE_OUT_DURATION_MS,
        useNativeDriver: true,
      }).start(() => {
        // Fade is complete — let App.js transition to MainTabs
        setWelcomePending(false);
      });
    }, POST_TYPE_PAUSE_MS);

    return () => clearTimeout(pauseTimer);
  }, [typingDone, screenOpacity, setWelcomePending]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Text style={[styles.welcomeTo, { opacity: headerOpacity }]}>
        Welcome to
      </Animated.Text>

      <View style={styles.appNameRow}>
        <Text style={styles.appName}>{typedText}</Text>
        <Text style={[styles.cursor, { opacity: cursorVisible ? 1 : 0 }]}>|</Text>
      </View>

      <Animated.Text style={[styles.tagline, { opacity: headerOpacity }]}>
        Train. Track. Repeat.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  welcomeTo: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  cursor: {
    color: '#1D4ED8',
    fontSize: 48,
    fontWeight: '200',
    marginLeft: 2,
    lineHeight: 56,
  },
  tagline: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 20,
  },
});
