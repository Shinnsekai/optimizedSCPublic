import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, X } from 'lucide-react-native';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';
import { findMatchingExerciseOptions, getCanonicalExerciseName, isCardioExercise } from '../constants/exercises';
import { prepareWorkoutForSave } from '../utils/trainingValidation';
import { runSmoothLayoutAnimation } from '../utils/layoutAnimations';

function capitalizeFirst(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const makeStrengthSet = () => ({ weight: '', reps: '', completed: false });
const makeCardioSet  = () => ({ duration: '', completed: false });

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}


export default function ActiveWorkoutScreen({ route, navigation }) {
  const { t } = useTranslation();
  const {
    theme,
    user,
    userProfile,
    workouts,
    addWorkout,
    unit,
    activeWorkoutSession,
    updateWorkoutSession,
    clearWorkoutSession,
  } = useStore();
  const colors = getThemeColors(theme);
  const keyboardAppearance = theme === 'dark' ? 'dark' : 'light';
  const username = userProfile?.username || user?.displayName || 'Athlete';
  const initialRoutine = activeWorkoutSession?.routine || route.params?.routine || null;
  const isLive = !initialRoutine;

  const [exercises, setExercises]               = useState(() => activeWorkoutSession?.exercises || []);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [workoutName, setWorkoutName]           = useState(
    activeWorkoutSession?.workoutName || initialRoutine?.name || 'Quick Workout'
  );
  const [comments, setComments]                 = useState(activeWorkoutSession?.comments || '');
  const [selectorVisible, setSelectorVisible]   = useState(false);
  // -1 = selector opened for a brand-new exercise (not yet in the list)
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
  const [searchText, setSearchText]             = useState('');
  const [elapsedMs, setElapsedMs]               = useState(0);
  const scrollViewRef                           = useRef(null);
  const shouldRevealNewExerciseRef              = useRef(false);
  const allowExitRef                            = useRef(false);

  // Live elapsed timer
  useEffect(() => {
    if (!activeWorkoutSession?.startedAt) return;
    const tick = () => setElapsedMs(Date.now() - activeWorkoutSession.startedAt);
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeWorkoutSession?.startedAt]);

  useEffect(() => {
    if (activeWorkoutSession || allowExitRef.current) return;
    allowExitRef.current = true;
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
  }, [activeWorkoutSession, navigation]);

  useEffect(() => {
    if (!activeWorkoutSession) return;
    setExercises(activeWorkoutSession.exercises || []);
    setWorkoutName(activeWorkoutSession.workoutName || initialRoutine?.name || 'Quick Workout');
    setComments(activeWorkoutSession.comments || '');
  }, [activeWorkoutSession?.startedAt]);

  useEffect(() => {
    if (!activeWorkoutSession?.startedAt) return;
    updateWorkoutSession({ routine: initialRoutine, workoutName, comments, exercises });
  }, [activeWorkoutSession?.startedAt, comments, exercises, initialRoutine, updateWorkoutSession, workoutName]);

  useEffect(() => {
    if (!shouldRevealNewExerciseRef.current) return;
    const timeoutId = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd?.(true);
      shouldRevealNewExerciseRef.current = false;
    }, 80);
    return () => clearTimeout(timeoutId);
  }, [exercises.length]);

  // Hide nav header — we build our own topbar
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false, gestureEnabled: false });
  }, [navigation]);

  const handleStopWorkout = useCallback(() => {
    Alert.alert(
      'Stop workout?',
      'Your current workout will be closed and nothing from this session will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Workout',
          style: 'destructive',
          onPress: () => {
            allowExitRef.current = true;
            setFinishModalVisible(false);
            clearWorkoutSession();
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
          },
        },
      ]
    );
  }, [clearWorkoutSession, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (allowExitRef.current) return;
      event.preventDefault();
      Alert.alert('Workout in progress', 'Finish or stop your workout before leaving this page.');
    });
    return unsubscribe;
  }, [navigation]);

const handleFinishSave = useCallback(async () => {
    Keyboard.dismiss();
    const { isValid, message, workout } = prepareWorkoutForSave({ name: workoutName, exercises, comments });
    if (!isValid) { Alert.alert('Incomplete workout', message); return; }
    const totalDurationMs = Math.max(0, Date.now() - (activeWorkoutSession?.startedAt || Date.now()));
    allowExitRef.current = true;
    await addWorkout({ ...workout, durationMs: totalDurationMs, date: new Date().toISOString() });
    clearWorkoutSession();
    setFinishModalVisible(false);
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
  }, [activeWorkoutSession?.startedAt, addWorkout, clearWorkoutSession, comments, exercises, navigation, workoutName]);

  // "Add Exercise" opens the selector immediately — no empty card is added yet.
  // The card is only created once the user picks an exercise.
  const handleAddLiveExercise = () => {
    Keyboard.dismiss();
    setActiveExerciseIndex(-1); // -1 = pending new exercise
    setSearchText('');
    setSelectorVisible(true);
  };

  const handleAddLiveSet = (exerciseIndex) => {
    Keyboard.dismiss();
    runSmoothLayoutAnimation();
    const next = [...exercises];
    next[exerciseIndex].sets.push(next[exerciseIndex].isCardio ? makeCardioSet() : makeStrengthSet());
    setExercises(next);
  };

  const handleRemoveLiveSet = (exerciseIndex, setIndex) => {
    if (exercises[exerciseIndex].sets.length <= 1) return;
    Keyboard.dismiss();
    runSmoothLayoutAnimation();
    const next = [...exercises];
    next[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(next);
  };

  const handleRemoveExercise = (index) => {
    Keyboard.dismiss();
    runSmoothLayoutAnimation();
    const next = [...exercises];
    next.splice(index, 1);
    setExercises(next);
  };

  // Open selector to rename/change an existing exercise
  const openExerciseSelector = (index) => {
    Keyboard.dismiss();
    setActiveExerciseIndex(index);
    setSearchText(exercises[index].name || '');
    setSelectorVisible(true);
  };

  const selectExercise = (name) => {
    runSmoothLayoutAnimation();
    const canonicalName = getCanonicalExerciseName(name) || capitalizeFirst(name);
    const cardio = isCardioExercise(canonicalName || name);

    if (activeExerciseIndex === -1) {
      // Brand-new exercise — append to list
      shouldRevealNewExerciseRef.current = true;
      setExercises((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: canonicalName,
          isCardio: cardio,
          sets: [cardio ? makeCardioSet() : makeStrengthSet()],
        },
      ]);
    } else {
      // Update existing exercise at activeExerciseIndex
      const next = [...exercises];
      next[activeExerciseIndex] = {
        ...next[activeExerciseIndex],
        name: canonicalName,
        isCardio: cardio,
        sets: [cardio ? makeCardioSet() : makeStrengthSet()],
      };
      setExercises(next);
    }
    setSelectorVisible(false);
  };

  const matchingExerciseOptions = findMatchingExerciseOptions(searchText);
  const canonicalSearchExercise = getCanonicalExerciseName(searchText.trim());


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Custom topbar ── */}
      <View style={[styles.topbar, { borderBottomColor: colors.border }]}>
        <View style={[styles.timerPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.timerDot, { backgroundColor: colors.textSecondary }]} />
          <Text style={[styles.timerText, { color: colors.text }]}>{formatElapsed(elapsedMs)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.stopBtn, { borderColor: colors.danger }]}
          onPress={handleStopWorkout}
          activeOpacity={0.75}
        >
          <View style={[styles.stopSquare, { backgroundColor: colors.danger }]} />
          <Text style={[styles.stopBtnText, { color: colors.danger }]}>Stop</Text>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable content ── */}
      <KeyboardAwareScrollView
        innerRef={(ref) => { scrollViewRef.current = ref; }}
        onScrollBeginDrag={Keyboard.dismiss}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        extraScrollHeight={100}
        enableResetScrollToCoords={false}
        enableOnAndroid
        scrollEnabled
      >
        {/* ── Hero greeting ── */}
        <View style={styles.heroBlock}>
          <Text style={[styles.heroText, { color: colors.text }]}>
            Lets do this,
          </Text>
          <Text style={[styles.heroName, { color: colors.primary }]}>{username}.</Text>
        </View>

        {/* ── Exercise cards ── */}
        {exercises.map((exercise, exerciseIndex) => {
          const exerciseIsCardio = exercise.isCardio || isCardioExercise(exercise.name);

          let previousExercise = null;
          if (exercise.name?.trim().length > 0) {
            for (let idx = workouts.length - 1; idx >= 0; idx--) {
              const prior = workouts[idx].exercises?.find(
                (e) => e.name?.toLowerCase() === exercise.name?.toLowerCase()
              );
              if (prior) { previousExercise = prior; break; }
            }
          }

          const prevMax = previousExercise
            ? exerciseIsCardio
              ? `${Math.max(...previousExercise.sets.map((s) => Number(s.duration) || 0), 0)} min`
              : `${Math.max(...previousExercise.sets.map((s) => Number(s.weight) || 0), 0)} ${unit}`
            : null;
          const prevSetCount = previousExercise?.sets.length ?? null;

          return (
            <View
              key={exercise.id || exerciseIndex.toString()}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {/* ── Exercise name + trash ── */}
              <View style={styles.cardNameRow}>
                {isLive ? (
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => openExerciseSelector(exerciseIndex)}>
                    <View style={styles.nameWithBadge}>
                      <Text
                        style={[styles.cardName, { color: exercise.name ? colors.text : colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {exercise.name || t('Tap to select exercise')}
                      </Text>
                      {exerciseIsCardio && exercise.name ? (
                        <Text style={[styles.cardioBadge, { color: colors.primary, borderColor: colors.primary }]}>
                          Cardio
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.nameWithBadge, { flex: 1 }]}>
                    <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
                      {exercise.name}
                    </Text>
                    {exerciseIsCardio ? (
                      <Text style={[styles.cardioBadge, { color: colors.primary, borderColor: colors.primary }]}>
                        Cardio
                      </Text>
                    ) : null}
                  </View>
                )}
                {isLive ? (
                  <TouchableOpacity
                    onPress={() => handleRemoveExercise(exerciseIndex)}
                    style={styles.trashBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 color={colors.danger} size={17} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* ── Last max row (hidden when no history) ── */}
              {prevMax ? (
                <View style={[styles.prevRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.prevLabel, { color: colors.textSecondary }]}>Last max</Text>
                  <Text style={[styles.prevSep,   { color: colors.border }]}>·</Text>
                  <Text style={[styles.prevValue,  { color: colors.text }]}>{prevMax}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={[styles.prevSets, { color: colors.textSecondary }]}>
                    {prevSetCount} {prevSetCount === 1 ? 'set' : 'sets'} last session
                  </Text>
                </View>
              ) : null}

              {/* ── Column headers ── */}
              <View style={styles.colHeaderRow}>
                <View style={styles.colHeaderSetCell} />
                {exerciseIsCardio ? (
                  <Text style={[styles.colHeaderCellFull, { color: colors.textSecondary }]}>
                    DURATION (MIN)
                  </Text>
                ) : (
                  <>
                    <Text style={[styles.colHeaderCell, { color: colors.textSecondary }]}>
                      {unit.toUpperCase()}
                    </Text>
                    <View style={styles.colHeaderMul} />
                    <Text style={[styles.colHeaderCell, { color: colors.textSecondary }]}>
                      REPS
                    </Text>
                  </>
                )}
                <View style={styles.colHeaderDel} />
              </View>
              <View style={[styles.colDivider, { backgroundColor: colors.border }]} />

              {/* ── Set rows ── */}
              <View style={styles.setsContainer}>
                {exercise.sets.map((set, setIndex) => {
                  const updateField = (field, text) => {
                    const next = [...exercises];
                    next[exerciseIndex].sets[setIndex][field] = text;
                    setExercises(next);
                  };

                  return (
                    <View key={setIndex} style={styles.setRow}>
                      <Text style={[styles.setLabel, { color: colors.textSecondary }]}>
                        {`Set ${setIndex + 1}`}
                      </Text>

                      {exerciseIsCardio ? (
                        <View style={[styles.inp, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          {isLive ? (
                            <TextInput
                              style={[styles.inpVal, { color: colors.text }]}
                              placeholder="0"
                              placeholderTextColor={colors.border}
                              keyboardType="numeric"
                              keyboardAppearance={keyboardAppearance}
                              value={set.duration?.toString()}
                              onChangeText={(v) => updateField('duration', v)}
                              onSubmitEditing={Keyboard.dismiss}
                              textAlign="center"
                            />
                          ) : (
                            <Text style={[styles.inpVal, { color: colors.text, textAlign: 'center' }]}>
                              {set.duration || '0'}
                            </Text>
                          )}
                        </View>
                      ) : (
                        <>
                          <View style={[styles.inp, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            {isLive ? (
                              <TextInput
                                style={[styles.inpVal, { color: colors.text }]}
                                placeholder="0"
                                placeholderTextColor={colors.border}
                                keyboardType="numeric"
                                keyboardAppearance={keyboardAppearance}
                                value={set.weight?.toString()}
                                onChangeText={(v) => updateField('weight', v)}
                                onSubmitEditing={Keyboard.dismiss}
                                textAlign="center"
                              />
                            ) : (
                              <Text style={[styles.inpVal, { color: colors.text, textAlign: 'center' }]}>
                                {set.weight || '0'}
                              </Text>
                            )}
                          </View>
                          <Text style={[styles.mul, { color: colors.textSecondary }]}>×</Text>
                          <View style={[styles.inp, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            {isLive ? (
                              <TextInput
                                style={[styles.inpVal, { color: colors.text }]}
                                placeholder="0"
                                placeholderTextColor={colors.border}
                                keyboardType="numeric"
                                keyboardAppearance={keyboardAppearance}
                                value={set.reps?.toString()}
                                onChangeText={(v) => updateField('reps', v)}
                                onSubmitEditing={Keyboard.dismiss}
                                textAlign="center"
                              />
                            ) : (
                              <Text style={[styles.inpVal, { color: colors.text, textAlign: 'center' }]}>
                                {set.reps || '0'}
                              </Text>
                            )}
                          </View>
                        </>
                      )}

                      {/* Delete set */}
                      {isLive ? (
                        <TouchableOpacity
                          style={styles.delSetBtn}
                          onPress={() => handleRemoveLiveSet(exerciseIndex, setIndex)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={[styles.delSetText, { color: colors.danger }]}>×</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.delSetBtn} />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* ── Add Set — dashed row ── */}
              <TouchableOpacity
                style={[styles.addSetRow, { borderColor: colors.border }]}
                onPress={() => handleAddLiveSet(exerciseIndex)}
                activeOpacity={0.7}
              >
                <Plus color={colors.primary} size={14} />
                <Text style={[styles.addSetText, { color: colors.primary }]}>
                  {exerciseIsCardio ? 'Add Interval' : t('Add Set')}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* ── Add Exercise — dashed card ── */}
        {isLive ? (
          <TouchableOpacity
            style={[styles.addExCard, { borderColor: colors.border }]}
            onPress={handleAddLiveExercise}
            activeOpacity={0.7}
          >
            <Plus color={colors.primary} size={16} />
            <Text style={[styles.addExText, { color: colors.primary }]}>{t('Add Exercise')}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ height: 24 }} />
      </KeyboardAwareScrollView>

      {/* ── Finish bar pinned at bottom ── */}
      <View style={[styles.finishBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.finishBtn, { backgroundColor: colors.primary }]}
          onPress={() => setFinishModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.finishBtnText}>{t('Finish Workout')}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Save / Finish Modal ── */}
      <Modal visible={finishModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modalInner}>
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            >
              <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{t('Save Workout')}</Text>
                  <TouchableOpacity onPress={() => setFinishModalVisible(false)}>
                    <X color={colors.text} size={24} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder={t('Workout Name')}
                  placeholderTextColor={colors.textSecondary}
                  keyboardAppearance={keyboardAppearance}
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  onSubmitEditing={Keyboard.dismiss}
                />
                <TextInput
                  style={[styles.modalInput, styles.commentsInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder={t('Comments (optional)')}
                  placeholderTextColor={colors.textSecondary}
                  keyboardAppearance={keyboardAppearance}
                  multiline
                  textAlignVertical="top"
                  value={comments}
                  onChangeText={setComments}
                />
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                  onPress={handleFinishSave}
                >
                  <Text style={styles.primaryBtnText}>{t('Save')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Exercise Selector Modal ── */}
      <Modal
        visible={selectorVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setSelectorVisible(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeaderFullScreen, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('Select Exercise')}</Text>
            <TouchableOpacity onPress={() => setSelectorVisible(false)}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.selectorBody}>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder={t('Search or enter custom exercise...')}
              placeholderTextColor={colors.textSecondary}
              keyboardAppearance={keyboardAppearance}
              value={searchText}
              onChangeText={(text) => setSearchText(capitalizeFirst(text))}
              onSubmitEditing={Keyboard.dismiss}
              autoFocus
            />
            {searchText.trim().length > 0 && !canonicalSearchExercise ? (
              <TouchableOpacity
                style={[styles.exerciseItem, { borderBottomColor: colors.border }]}
                onPress={() => selectExercise(searchText.trim())}
              >
                <Text style={[styles.exerciseItemText, { color: colors.primary }]}>
                  + Add "{searchText.trim()}"
                </Text>
              </TouchableOpacity>
            ) : null}
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}
            >
              {matchingExerciseOptions.map((exerciseOption) => {
                const cardio = isCardioExercise(exerciseOption);
                return (
                  <TouchableOpacity
                    key={exerciseOption}
                    style={[styles.exerciseItem, { borderBottomColor: colors.border }]}
                    onPress={() => selectExercise(exerciseOption)}
                  >
                    <View style={styles.exerciseItemRow}>
                      <Text style={[styles.exerciseItemText, { color: colors.text, flex: 1 }]}>{exerciseOption}</Text>
                      {cardio ? (
                        <Text style={[styles.cardioBadge, { color: colors.primary, borderColor: colors.primary }]}>
                          Cardio
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </KeyboardAwareScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Custom topbar ──
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  timerDot:  { width: 8, height: 8, borderRadius: 999 },
  timerText: { fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  stopSquare:  { width: 8, height: 8, borderRadius: 1 },
  stopBtnText: { fontSize: 14, fontWeight: '700' },

  // ── Hero greeting ──
  heroBlock: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 18,
  },
  heroText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  heroName: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.6,
    marginTop: 4,
  },

  // ── Scroll ──
  scroll: { paddingHorizontal: 18, paddingTop: 0, paddingBottom: 24 },

  // ── Card ──
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  nameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  trashBtn: { padding: 4, opacity: 0.5 },
  cardioBadge: {
    fontSize: 9,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
  },

  // ── Prev max row ──
  prevRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 5,
  },
  prevLabel: { fontSize: 12, fontWeight: '500' },
  prevSep:   { fontSize: 12 },
  prevValue: { fontSize: 12, fontWeight: '700' },
  prevSets:  { fontSize: 12 },

  // ── Column headers ──
  colHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8,
  },
  colHeaderSetCell: { width: 44, flexShrink: 0, paddingLeft: 2 },
  colHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  colHeaderCellFull: {
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  colHeaderMul: { width: 16, flexShrink: 0 },
  colHeaderDel: { width: 34, flexShrink: 0 },
  colDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16, marginBottom: 8 },

  // ── Sets ──
  setsContainer: {
    paddingHorizontal: 16,
    paddingTop: 2,
    gap: 10,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  setLabel: {
    width: 44,
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 0,
  },
  inp: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inpVal: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    padding: 0,
  },
  mul: { fontSize: 14, fontWeight: '500', width: 16, textAlign: 'center' },

  // ── Delete set button ──
  delSetBtn: {
    width: 34,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  delSetText: {
    fontSize: 20,
    fontWeight: '700',
    opacity: 0.5,
  },

  // ── Add Set dashed row ──
  addSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    margin: 14,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addSetText: { fontSize: 13, fontWeight: '600' },

  // ── Add Exercise dashed card ──
  addExCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addExText: { fontSize: 14, fontWeight: '600' },

  // ── Finish bar ──
  finishBar: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  finishBtn: {
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ── Modals ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalInner: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
  },
  modalScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    marginBottom: Platform.OS === 'ios' ? 30 : 16,
    maxHeight: '76%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalHeaderFullScreen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
  },
  commentsInput: { minHeight: 120 },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // ── Exercise Selector ──
  selectorBody: { padding: 16, flex: 1 },
  exerciseItem: { paddingVertical: 16, borderBottomWidth: 1 },
  exerciseItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exerciseItemText: { fontSize: 16 },
});
