import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Platform, View, Text, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { MinusCircle, Plus, Save, Trash2, X } from 'lucide-react-native';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';
import { findMatchingExerciseOptions, getCanonicalExerciseName, isCardioExercise } from '../constants/exercises';
import { prepareRoutineForSave } from '../utils/trainingValidation';
import { runSmoothLayoutAnimation } from '../utils/layoutAnimations';

function capitalizeFirst(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const makeStrengthSet = () => ({ weight: '', reps: '' });
const makeCardioSet = () => ({ duration: '' });

export default function CreateRoutineScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme, addRoutine, unit } = useStore();
  const colors = getThemeColors(theme);
  const keyboardAppearance = theme === 'dark' ? 'dark' : 'light';

  const [name, setName] = useState('');
  const [exercises, setExercises] = useState([
    { id: '1', name: '', isCardio: false, sets: [makeStrengthSet()] }
  ]);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
  const [searchText, setSearchText] = useState('');
  const scrollViewRef = useRef(null);
  const shouldRevealNewExerciseRef = useRef(false);

  useEffect(() => {
    if (!shouldRevealNewExerciseRef.current) return;
    const timeoutId = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd?.(true);
      shouldRevealNewExerciseRef.current = false;
    }, 80);
    return () => clearTimeout(timeoutId);
  }, [exercises.length]);

  const handleAddExercise = () => {
    Keyboard.dismiss();
    runSmoothLayoutAnimation();
    shouldRevealNewExerciseRef.current = true;
    setExercises([...exercises, { id: Date.now().toString(), name: '', isCardio: false, sets: [makeStrengthSet()] }]);
  };

  const handleAddSet = (exerciseIndex) => {
    Keyboard.dismiss();
    runSmoothLayoutAnimation();
    const nextExercises = [...exercises];
    const exercise = nextExercises[exerciseIndex];
    nextExercises[exerciseIndex].sets.push(exercise.isCardio ? makeCardioSet() : makeStrengthSet());
    setExercises(nextExercises);
  };

  const handleRemoveExercise = (index) => {
    Keyboard.dismiss();
    runSmoothLayoutAnimation();
    const nextExercises = [...exercises];
    nextExercises.splice(index, 1);
    setExercises(nextExercises);
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    Keyboard.dismiss();
    runSmoothLayoutAnimation();
    const nextExercises = [...exercises];
    if (nextExercises[exerciseIndex].sets.length <= 1) return;
    nextExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(nextExercises);
  };

  const openExerciseSelector = (index) => {
    Keyboard.dismiss();
    setActiveExerciseIndex(index);
    setSearchText(exercises[index].name || '');
    setSelectorVisible(true);
  };

  const selectExercise = (exerciseName) => {
    runSmoothLayoutAnimation();
    const nextExercises = [...exercises];
    const canonicalName = getCanonicalExerciseName(exerciseName) || capitalizeFirst(exerciseName);
    const cardio = isCardioExercise(canonicalName || exerciseName);
    nextExercises[activeExerciseIndex] = {
      ...nextExercises[activeExerciseIndex],
      name: canonicalName,
      isCardio: cardio,
      sets: [cardio ? makeCardioSet() : makeStrengthSet()],
    };
    setExercises(nextExercises);
    setSelectorVisible(false);
  };

  const matchingExerciseOptions = findMatchingExerciseOptions(searchText);
  const canonicalSearchExercise = getCanonicalExerciseName(searchText.trim());

  const handleSave = async () => {
    Keyboard.dismiss();
    const { isValid, message, routine } = prepareRoutineForSave({ name, exercises });
    if (!isValid) {
      Alert.alert('Incomplete routine', message);
      return;
    }
    await addRoutine({ ...routine, dateCreated: new Date().toISOString() });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAwareScrollView
          innerRef={(ref) => { scrollViewRef.current = ref; }}
          onScrollBeginDrag={Keyboard.dismiss}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          extraScrollHeight={80}
          enableResetScrollToCoords={false}
        >
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder={t('Routine Name')}
            placeholderTextColor={colors.textSecondary}
            keyboardAppearance={keyboardAppearance}
            returnKeyType="done"
            value={name}
            onChangeText={setName}
            onSubmitEditing={Keyboard.dismiss}
          />

          {exercises.map((exercise, exIndex) => (
            <View key={exercise.id} style={[styles.exerciseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.exerciseHeader}>
                <TouchableOpacity
                  style={[styles.input, { flex: 1, backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => openExerciseSelector(exIndex)}
                >
                  <View style={styles.exerciseNameRow}>
                    <Text style={{ color: exercise.name ? colors.text : colors.textSecondary, flex: 1 }}>
                      {exercise.name || t('Select or type exercise')}
                    </Text>
                    {exercise.isCardio ? (
                      <Text style={[styles.cardioBadge, { color: colors.primary, borderColor: colors.primary }]}>Cardio</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveExercise(exIndex)} style={styles.removeExerciseButton}>
                  <Trash2 color={colors.danger} size={24} />
                </TouchableOpacity>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={[styles.setNumber, { color: colors.textSecondary }]}>{t('Set')} {setIndex + 1}</Text>

                  {exercise.isCardio ? (
                    <TextInput
                      style={[styles.smallInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      placeholder="Duration (min)"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      keyboardAppearance={keyboardAppearance}
                      value={set.duration}
                      onChangeText={(text) => {
                        const nextExercises = [...exercises];
                        nextExercises[exIndex].sets[setIndex].duration = text;
                        setExercises(nextExercises);
                      }}
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  ) : (
                    <>
                      <TextInput
                        style={[styles.smallInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder={`${t('Weight')} (${unit})`}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        keyboardAppearance={keyboardAppearance}
                        value={set.weight}
                        onChangeText={(text) => {
                          const nextExercises = [...exercises];
                          nextExercises[exIndex].sets[setIndex].weight = text;
                          setExercises(nextExercises);
                        }}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                      <TextInput
                        style={[styles.smallInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder={t('Reps')}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        keyboardAppearance={keyboardAppearance}
                        value={set.reps}
                        onChangeText={(text) => {
                          const nextExercises = [...exercises];
                          nextExercises[exIndex].sets[setIndex].reps = text;
                          setExercises(nextExercises);
                        }}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </>
                  )}

                  {exercise.sets.length > 1 ? (
                    <TouchableOpacity onPress={() => handleRemoveSet(exIndex, setIndex)} style={styles.removeSetButton}>
                      <MinusCircle color={colors.danger} size={22} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addSetBtn, { borderColor: colors.border }]}
                onPress={() => handleAddSet(exIndex)}
                activeOpacity={1}
              >
                <Plus color={colors.primary} size={16} />
                <Text style={{ color: colors.primary }}>{exercise.isCardio ? 'Add Interval' : t('Add Set')}</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={handleAddExercise}
            activeOpacity={0.75}
          >
            <Plus color={colors.text} size={20} />
            <Text style={[styles.btnText, { color: colors.text }]}>{t('Add Exercise')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Save color="#FFF" size={20} />
            <Text style={styles.primaryBtnText}>{t('Save Routine')}</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>

      <Modal visible={selectorVisible} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setSelectorVisible(false)}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeaderFullScreen}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('Select Exercise')}</Text>
            <TouchableOpacity onPress={() => setSelectorVisible(false)}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder={t('Search or enter custom exercise...')}
              placeholderTextColor={colors.textSecondary}
              keyboardAppearance={keyboardAppearance}
              value={searchText}
              onChangeText={(text) => setSearchText(capitalizeFirst(text))}
              onSubmitEditing={Keyboard.dismiss}
            />
            {searchText.trim().length > 0 && !canonicalSearchExercise ? (
              <TouchableOpacity
                style={[styles.exerciseItem, { borderBottomColor: colors.border }]}
                onPress={() => selectExercise(searchText.trim())}
              >
                <Text style={[styles.exerciseItemText, { color: colors.primary }]}>+ Add "{searchText.trim()}"</Text>
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
                        <Text style={[styles.cardioBadge, { color: colors.primary, borderColor: colors.primary }]}>Cardio</Text>
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
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardioBadge: {
    fontSize: 11,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  removeExerciseButton: {
    padding: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setNumber: {
    width: 50,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  smallInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  removeSetButton: {
    padding: 4,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  btnText: { fontWeight: '600', fontSize: 16 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalHeaderFullScreen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  modalBody: {
    padding: 16,
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
  },
  exerciseItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  exerciseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseItemText: {
    fontSize: 16,
  },
});
