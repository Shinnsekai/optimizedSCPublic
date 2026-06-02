import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';

export default function WorkoutStartIntroScreen({ navigation, route }) {
  const { theme } = useStore();
  const colors = getThemeColors(theme);
  const routine = route.params?.routine || null;
  const title = routine ? 'You are about to start a routine' : 'You are about to start a workout';
  const description = routine
    ? 'Once you press the start button below, your routine session will begin and the app will start tracking the session duration in the background. Complete each exercise from the routine, log your sets, reps, and weights, then use finish workout when you are done so the session can be saved correctly.'
    : 'Once you press the start button below, your workout session will begin and the app will start tracking the session duration in the background. Add each exercise as you go, log your sets, reps, and weights, then use finish workout when you are done so the session can be saved correctly.';
  const followUp = routine
    ? 'The timer will stay hidden for now, but the app will still calculate the full session duration when you finish. If you decide not to continue with the routine, you can stop the session later without saving it.'
    : 'The timer calculates your workout duration when you finish. If you decide not to continue, you can stop the workout later without saving it.';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{description}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{followUp}</Text>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.replace('WorkoutCountdown', { routine })}
        >
          <Text style={styles.primaryButtonText}>{routine ? 'Start Routine' : 'Start Workout'}</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
    marginTop: -36,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.8,
    maxWidth: 320,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 330,
  },
  primaryButton: {
    marginTop: 12,
    minWidth: 220,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
