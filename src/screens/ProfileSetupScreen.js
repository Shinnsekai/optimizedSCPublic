import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getThemeColors } from '../constants/theme';
import { useStore } from '../store';
import { saveBodyProfile } from '../services/userProfileService';

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function ProfileSetupScreen({ navigation }) {
  const { theme, user, userProfile, setUserProfile, setWelcomePending } = useStore();
  const colors = getThemeColors(theme);

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bodyweight, setBodyweight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!age || !gender || !bodyweight || !height || !fitnessLevel) {
      Alert.alert('Missing Details', 'Please fill in all fields to continue.');
      return;
    }

    if (isNaN(Number(age)) || Number(age) < 10 || Number(age) > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 10 and 100.');
      return;
    }

    if (isNaN(Number(bodyweight)) || Number(bodyweight) <= 0) {
      Alert.alert('Invalid Bodyweight', 'Please enter a valid bodyweight.');
      return;
    }

    if (isNaN(Number(height)) || Number(height) <= 0) {
      Alert.alert('Invalid Height', 'Please enter a valid height.');
      return;
    }

    setSaving(true);

    try {
      const profileData = {
        age: Number(age),
        gender,
        bodyweight: Number(bodyweight),
        bodyweightUnit: weightUnit,
        height: Number(height),
        heightUnit,
        fitnessLevel,
        profileComplete: true,
      };

      await saveBodyProfile(user.uid, profileData);
      // Merge with existing userProfile so fields like username are preserved.
      setUserProfile({ ...userProfile, ...profileData });
      // Trigger the one-time welcome screen before MainTabs renders.
      setWelcomePending(true);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const SelectGroup = ({ label, options, value, onSelect }) => (
    <View style={styles.fieldBlock}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.pillRow}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.pill,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: active ? '#FFF' : colors.textSecondary },
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const UnitToggle = ({ unitA, unitB, value, onToggle }) => (
    <TouchableOpacity
      style={[styles.unitToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onToggle(value === unitA ? unitB : unitA)}
      activeOpacity={0.8}
    >
      <Text style={[styles.unitToggleText, { color: colors.primary }]}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Text style={[styles.eyebrow, { color: colors.primary }]}>ALMOST THERE</Text>
            <Text style={[styles.title, { color: colors.text }]}>Set Up Your Profile</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              This helps us personalise your workout summaries and volume tracking.
              Your data is stored securely and never shared.
            </Text>

            {/* Age */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Age</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="e.g. 24"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
                maxLength={3}
                keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
              />
            </View>

            {/* Gender */}
            <SelectGroup
              label="Gender"
              options={GENDERS}
              value={gender}
              onSelect={setGender}
            />

            {/* Bodyweight */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Bodyweight</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. 75"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={bodyweight}
                  onChangeText={setBodyweight}
                  keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
                />
                <UnitToggle unitA="kg" unitB="lbs" value={weightUnit} onToggle={setWeightUnit} />
              </View>
            </View>

            {/* Height */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Height</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder={heightUnit === 'cm' ? 'e.g. 175' : 'e.g. 5.9'}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={height}
                  onChangeText={setHeight}
                  keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
                />
                <UnitToggle unitA="cm" unitB="ft" value={heightUnit} onToggle={setHeightUnit} />
              </View>
            </View>

            {/* Fitness Level */}
            <SelectGroup
              label="Gym Fitness Level"
              options={FITNESS_LEVELS}
              value={fitnessLevel}
              onSelect={setFitnessLevel}
            />

            {/* Continue */}
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: colors.primary, opacity: saving ? 0.75 : 1 }]}
              onPress={handleContinue}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.continueBtnText}>Continue</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  fieldBlock: { marginBottom: 22 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  inputFlex: { flex: 1 },
  unitToggle: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  unitToggleText: { fontSize: 14, fontWeight: '700' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  pillText: { fontSize: 14, fontWeight: '500' },
  continueBtn: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
