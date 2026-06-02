import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { Plus, Play, ChevronRight, Trash2 } from 'lucide-react-native';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';
import { runSmoothLayoutAnimation } from '../utils/layoutAnimations';
import HomeBackdrop from '../components/HomeBackdrop';
import { TAB_BAR_CONTENT_HEIGHT } from '../components/BottomTabBar';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme, routines, workouts, deleteRoutine, deleteWorkout, user, userProfile } = useStore();
  const colors = getThemeColors(theme);

  const [focusedItem, setFocusedItem] = useState(null);

  const isEmpty = routines.length === 0 && workouts.length === 0;
  const username = userProfile?.username || user?.displayName || 'Athlete';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLongPress = (item, type) => {
    setFocusedItem({ ...item, type });
  };

  const handleDeleteFocused = () => {
    if (!focusedItem) return;

    runSmoothLayoutAnimation();

    if (focusedItem.type === 'routine') {
      deleteRoutine(focusedItem.id);
    } else {
      deleteWorkout(focusedItem.id);
    }

    setFocusedItem(null);
  };

  const renderRoutine = (item) => (
    <TouchableOpacity
      key={`routine-${item.id}`}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('RoutineDetail', { routine: item })}
    >
      <View>
        <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.cardInfo, { color: colors.textSecondary }]}>
          {t('Tap to view details, start, or delete this routine.')}
        </Text>
      </View>
      <ChevronRight color={colors.textSecondary} size={20} />
    </TouchableOpacity>
  );

  const renderWorkout = (item) => (
    <TouchableOpacity
      key={`workout-${item.id}`}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
      onLongPress={() => handleLongPress(item, 'workout')}
      delayLongPress={1000}
    >
      <View>
        <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.cardInfo, { color: colors.textSecondary }]}>
          {new Date(item.date).toLocaleDateString()} | {item.exercises?.length || 0} {t('Exercises')}
        </Text>
      </View>
      <ChevronRight color={colors.textSecondary} size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HomeBackdrop theme={theme} />
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_BAR_CONTENT_HEIGHT + 24 }]}
      >
        <View style={styles.centerWrap}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>TRAIN. TRACK. REPEAT.</Text>
          <Text style={[styles.mainTitle, { color: colors.text }]}>{t("Let's crush it today")}, {username}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Build stronger sessions, stay consistent, and keep your progress moving.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('CreateRoutine')}
            >
              <Plus color="#FFF" size={20} />
              <Text style={styles.actionText}>{t('Add Routine')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.push('WorkoutStartIntro')}
            >
              <Play color="#FFF" size={20} />
              <Text style={styles.actionText}>{t('Start Workout')}</Text>
            </TouchableOpacity>
          </View>

          {!isEmpty ? (
            <View style={styles.listsContainer}>
              {routines.length > 0 ? (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('Your Routines')}</Text>
                  {routines.map(renderRoutine)}
                </>
              ) : null}

              {workouts.length > 0 ? (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>{t('Your Workouts')}</Text>
                  {[...workouts].reverse().map(renderWorkout)}
                </>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
      </Animated.View>

      <Modal visible={focusedItem !== null} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setFocusedItem(null)}>
          <View style={styles.blurOverlay}>
            <BlurView intensity={50} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.focusContainer}>
                {focusedItem ? (
                  <View style={[styles.card, styles.focusedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View>
                      <Text style={[styles.cardName, { color: colors.text }]}>{focusedItem.name}</Text>
                      <Text style={[styles.cardInfo, { color: colors.textSecondary }]}>
                        {focusedItem.type === 'workout' && focusedItem.date
                          ? `${new Date(focusedItem.date).toLocaleDateString()} | `
                          : ''}
                        {focusedItem.exercises?.length || 0} {t('Exercises')}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.danger }]}
                  onPress={handleDeleteFocused}
                >
                  <Trash2 color="#FFF" size={20} />
                  <Text style={styles.deleteText}>
                    {t('Delete ')}
                    {focusedItem?.type === 'routine' ? t('Routine') : t('Workout')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingVertical: 24 },
  centerWrap: { paddingHorizontal: 16 },
  eyebrow: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginBottom: 14,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.72,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  listsContainer: { width: '100%' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardInfo: { fontSize: 14 },
  blurOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  focusContainer: {
    width: '100%',
    alignItems: 'stretch',
    gap: 8,
  },
  focusedCard: {
    marginBottom: 0,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
