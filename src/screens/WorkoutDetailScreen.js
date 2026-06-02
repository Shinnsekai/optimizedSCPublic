import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { getThemeColors } from '../constants/theme';
import { useStore } from '../store';
import { getAdjustedBodyPartBreakdown, isCardioExercise } from '../constants/exercises';
import { getSetContribution as sharedSetContribution } from '../utils/workoutStats';

function AnimatedBar({ percentage, color }) {
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: percentage,
      duration: 700,
      delay: 250,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <Animated.View
      style={[
        styles.barFill,
        {
          backgroundColor: color,
          width: animWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        },
      ]}
    />
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor((day % 100) / 10) === 1) ? 0 : day % 10];
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

export default function WorkoutDetailScreen({ route }) {
  const { t } = useTranslation();
  const { workout } = route.params;
  const { theme, unit, userProfile } = useStore();
  const colors = getThemeColors(theme);
  const bodyWeight = userProfile?.bodyweight || 70;

  const getSetContribution = (set) => sharedSetContribution(set, bodyWeight);

  const strengthExercises = workout.exercises.filter(
    (ex) => !(ex.isCardio || isCardioExercise(ex.name))
  );
  const cardioExercises = workout.exercises.filter(
    (ex) => ex.isCardio || isCardioExercise(ex.name)
  );

  const totalVolume = strengthExercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + getSetContribution(set), 0),
    0
  );
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const durationMin = Math.floor((workout.durationMs || 0) / 60000);
  const fitnessLevel = userProfile?.fitnessLevel;

  const bodyPartVolumes = strengthExercises.reduce((summary, exercise) => {
    const breakdown = getAdjustedBodyPartBreakdown(exercise.name, fitnessLevel);
    const exVol = exercise.sets.reduce((s, set) => s + getSetContribution(set), 0);
    if (exVol <= 0) return summary;
    Object.entries(breakdown).forEach(([part, pct]) => {
      summary[part] = (summary[part] || 0) + exVol * (pct / 100);
    });
    return summary;
  }, {});

  const bodyPartBreakdown = Object.entries(bodyPartVolumes)
    .map(([bodyPart, volume]) => ({
      bodyPart,
      percentage: totalVolume > 0 ? Math.round((volume / totalVolume) * 100) : 0,
    }))
    .filter((e) => e.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  // Returns "Max 90 kg × 8 reps" for the highest-weight set
  const getStrengthSummary = (sets) => {
    if (!sets?.length) return null;
    const maxSet = sets.reduce(
      (best, s) => (Number(s.weight) || 0) >= (Number(best.weight) || 0) ? s : best,
      sets[0]
    );
    const weightLabel = !Number(maxSet.weight) ? 'BW' : `${maxSet.weight} ${unit}`;
    return `Max ${weightLabel} × ${maxSet.reps || 0} reps`;
  };

  // Returns "X min total · Y intervals" or "X min" for cardio
  const getCardioSummary = (sets) => {
    if (!sets?.length) return null;
    const total = sets.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
    return sets.length > 1 ? `${total} min total · ${sets.length} intervals` : `${total} min`;
  };

  const formatStrengthSet = (set) => {
    const weightLabel = !Number(set.weight) ? 'BW' : `${set.weight} ${unit}`;
    return `${weightLabel} × ${set.reps || 0}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{workout.name}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(workout.date)}</Text>
        </View>

        {workout.comments ? (
          <Text style={[styles.comments, { color: colors.textSecondary }]}>
            "{workout.comments}"
          </Text>
        ) : null}

        {/* ── 2×2 Stat Grid ── */}
        <View style={styles.statGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalVolume.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('Volume')} ({unit})</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{durationMin}m</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('Duration')}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{workout.exercises.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('Exercises')}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalSets}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Sets</Text>
          </View>
        </View>

        {/* ── Strength Exercises ── */}
        {strengthExercises.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('Exercises')}</Text>
            {strengthExercises.map((exercise, index) => {
              const summary = getStrengthSummary(exercise.sets);
              return (
                <View key={index} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.exName, { color: colors.text }]}>{exercise.name}</Text>
                  {summary ? (
                    <Text style={[styles.exSummary, { color: colors.textSecondary }]}>{summary}</Text>
                  ) : null}
                  <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
                  {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setRow}>
                      <Text style={[styles.setLabel, { color: colors.textSecondary }]}>Set {setIndex + 1}</Text>
                      <Text style={[styles.setValue, { color: colors.text }]}>{formatStrengthSet(set)}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        ) : null}

        {/* ── Cardio ── */}
        {cardioExercises.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Cardio</Text>
            {cardioExercises.map((exercise, index) => {
              const summary = getCardioSummary(exercise.sets);
              return (
                <View key={index} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.exName, { color: colors.text }]}>{exercise.name}</Text>
                  {summary ? (
                    <Text style={[styles.exSummary, { color: colors.textSecondary }]}>{summary}</Text>
                  ) : null}
                  <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
                  {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setRow}>
                      <Text style={[styles.setLabel, { color: colors.textSecondary }]}>
                        {exercise.sets.length > 1 ? `Interval ${setIndex + 1}` : 'Duration'}
                      </Text>
                      <Text style={[styles.setValue, { color: colors.text }]}>{set.duration || 0} min</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        ) : null}

        {/* ── Muscle Activation ── */}
        {bodyPartBreakdown.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Muscle Activation</Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {bodyPartBreakdown.map((entry) => (
                <View key={entry.bodyPart} style={styles.barRow}>
                  <Text style={[styles.barLabel, { color: colors.text }]}>{entry.bodyPart}</Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                    <AnimatedBar percentage={entry.percentage} color={colors.primary} />
                  </View>
                  <Text style={[styles.barPct, { color: colors.textSecondary }]}>{entry.percentage}%</Text>
                </View>
              ))}
              <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                Estimates based on exercise science research, adjusted for your fitness level. Not medical data.
              </Text>
            </View>
          </>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 12 },

  // ── Header ──
  header: { gap: 3 },
  title:  { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  date:   { fontSize: 13 },
  comments: { fontSize: 13, fontStyle: 'italic', lineHeight: 19 },

  // ── Stat grid ──
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    width: '47.5%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 3,
  },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },

  // ── Section label ──
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  // ── Exercise / cardio card ──
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  exName:    { fontSize: 15, fontWeight: '700' },
  exSummary: { fontSize: 12, fontWeight: '500' },
  cardDivider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setLabel: { fontSize: 12 },
  setValue:  { fontSize: 13, fontWeight: '600' },

  // ── Muscle activation bars ──
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    width: 88,
    fontSize: 13,
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  barPct: {
    width: 36,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 10,
    lineHeight: 15,
    opacity: 0.6,
    marginTop: 4,
  },
});
