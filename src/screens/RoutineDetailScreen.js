import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Play, Trash2 } from 'lucide-react-native';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';
import { isCardioExercise } from '../constants/exercises';

export default function RoutineDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { routine } = route.params;
  const { theme, deleteRoutine, unit } = useStore();
  const colors = getThemeColors(theme);

  const handleDelete = () => {
    deleteRoutine(routine.id);
    navigation.goBack();
  };

  const handleStart = () => {
    navigation.push('WorkoutStartIntro', { routine });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>{t('Routine Details')}</Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{routine.name}</Text>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {t('Review the planned exercises below, then start or delete the routine from this page.')}
          </Text>
        </View>

        {routine.exercises.map((ex, i) => {
          const cardio = ex.isCardio || isCardioExercise(ex.name);
          return (
            <View key={i} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.exHeader}>
                <Text style={[styles.exName, { color: colors.text, flex: 1 }]}>{ex.name}</Text>
                {cardio ? (
                  <Text style={[styles.cardioBadge, { color: colors.primary, borderColor: colors.primary }]}>Cardio</Text>
                ) : null}
              </View>
              {ex.sets.map((set, j) => (
                <View key={j} style={styles.setRow}>
                  <Text style={{ color: colors.textSecondary }}>Set {j + 1}</Text>
                  {cardio ? (
                    <Text style={{ color: colors.text }}>{set.duration || 0} min</Text>
                  ) : (
                    <Text style={{ color: colors.text }}>
                      {!Number(set.weight) ? 'BW' : `${set.weight || 0} ${unit}`} × {set.reps || 0}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        <View style={styles.actionGroup}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.danger }]} onPress={handleDelete}>
            <Trash2 color="#FFF" size={20} />
            <Text style={styles.btnText}>{t('Delete')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, flex: 2 }]} onPress={handleStart}>
            <Play color="#FFF" size={20} />
            <Text style={styles.btnText}>{t('Start Routine')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  summaryCard: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  exName: { fontSize: 18, fontWeight: '600' },
  cardioBadge: {
    fontSize: 11,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  setRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
