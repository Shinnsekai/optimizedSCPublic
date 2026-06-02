import React, { useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  X,
  Globe,
  HelpCircle,
  Mail,
  FileText,
  LogOut,
  Scale,
  Trash2,
  User,
  CheckCircle2,
  Circle,
  ChevronRight,
  Download,
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';
import { deleteCurrentUserAccount, logoutUser, reauthenticateUser } from '../services/authService';
import { deleteRoutineFromDatabase, deleteWorkoutFromDatabase } from '../services/trainingDataService';
import { deleteUserProfileRecords } from '../services/userProfileService';
import LegalPolicyModal from './LegalPolicyModal';
import { auth } from '../config/firebase';

export default function SettingsModal({ visible, onClose, onNavigate }) {
  const { t, i18n } = useTranslation();
  const { theme, language, setLanguage, unit, setUnit, user, userProfile, routines, workouts, clearUser } = useStore();
  const colors = getThemeColors(theme);

  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [tempUnit, setTempUnit] = useState(unit);
  const [legalPolicyVisible, setLegalPolicyVisible] = useState(false);
  const [reauthModalVisible, setReauthModalVisible] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);
  const pendingDeleteRef = useRef(false);

  const languages = [
    { code: 'en', label: t('English') },
    { code: 'hi', label: t('Hindi') },
    { code: 'mr', label: t('Marathi') },
    { code: 'gu', label: t('Gujarati') },
  ];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setLanguage(code);
  };

  const username = userProfile?.username || user?.displayName || 'Athlete';

  const handleSignOut = async () => {
    onClose();

    const { error } = await logoutUser();

    if (error) {
      Alert.alert('Sign out failed', error);
      return;
    }

    clearUser();
  };

  const saveUnit = () => {
    setUnit(tempUnit);
    setUnitModalVisible(false);
  };

  const handleExportData = async () => {
    try {
      if (!workouts || workouts.length === 0) {
        Alert.alert('Nothing to Export', 'You have no workouts saved yet.');
        return;
      }

      const exportPayload = {
        exportVersion: 1,
        exportedAt: new Date().toISOString(),
        source: 'optimized-beta',
        unit,
        workouts: workouts.map((w) => ({
          id: w.id,
          name: w.name,
          date: w.date,
          durationMs: w.durationMs || 0,
          comments: w.comments || '',
          exercises: w.exercises || [],
        })),
      };

      const json = JSON.stringify(exportPayload, null, 2);
      const fileName = `optimized-export-${Date.now()}.json`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, json, {
        encoding: 'utf8',
      });

      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert('Export Unavailable', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export Workout Data',
        UTI: 'public.json',
      });
    } catch (error) {
      Alert.alert('Export Failed', error?.message || 'Something went wrong. Please try again.');
    }
  };

  const deleteUserData = async () => {
    // Delete each document by its known ID to avoid collection list queries,
    // which require a broader Firestore 'list' rule that may not be granted.
    await Promise.all([
      ...routines.map((r) => deleteRoutineFromDatabase(user, r.id).catch(() => {})),
      ...workouts.map((w) => deleteWorkoutFromDatabase(user, w.id).catch(() => {})),
    ]);
    await deleteUserProfileRecords(auth.currentUser || user).catch(() => {});
  };

  const performDelete = async () => {
    try {
      const { error, requiresReauth } = await deleteCurrentUserAccount();

      if (requiresReauth) {
        // Firebase requires fresh credentials — show re-auth modal.
        // No data has been touched yet at this point.
        pendingDeleteRef.current = true;
        setReauthPassword('');
        setReauthModalVisible(true);
        return;
      }

      if (error) {
        Alert.alert('Delete account failed', error);
        return;
      }

      // Account deleted — best-effort Firestore cleanup.
      // Auth is now invalid so these may fail silently; that is acceptable.
      await deleteUserData();

      onClose();
      clearUser();
    } catch (err) {
      Alert.alert('Delete account failed', err?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleReauthAndDelete = async () => {
    if (!reauthPassword.trim()) {
      Alert.alert('Password required', 'Enter your password to confirm deletion.');
      return;
    }

    setReauthLoading(true);
    const { error: reauthError } = await reauthenticateUser(reauthPassword);
    setReauthLoading(false);

    if (reauthError) {
      Alert.alert('Incorrect password', reauthError);
      return;
    }

    setReauthModalVisible(false);
    pendingDeleteRef.current = false;

    // Credentials are now fresh — delete Firestore data while auth is valid,
    // then delete the account.
    try {
      await deleteUserData();
      const { error } = await deleteCurrentUserAccount();
      if (error) {
        Alert.alert('Delete account failed', error);
        return;
      }
      onClose();
      clearUser();
    } catch (err) {
      Alert.alert('Delete account failed', err?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This is permanent and cannot be undone. Your account and all saved data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: performDelete,
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('Settings')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 24 }]}>
            <View style={styles.supportRow}>
              <User color={colors.primary} size={20} />
              <View>
                <Text style={[styles.supportText, styles.signedInLabel, { color: colors.text }]}>
                   {username}
                </Text>
                {user?.email ? (
                  <Text style={[styles.supportText, { color: colors.textSecondary }]}>{user.email}</Text>
                ) : null}
              </View>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('Preferences')}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.supportRow}
              onPress={() => {
                setTempUnit(unit);
                setUnitModalVisible(true);
              }}
            >
              <Scale color={colors.textSecondary} size={20} />
              <Text style={[styles.supportText, { color: colors.text, flex: 1 }]}>{t('Unit of Measurement')}</Text>
              <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>{unit.toUpperCase()}</Text>
              <ChevronRight color={colors.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 24 }]}>{t('Change Language')}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageRow,
                  index < languages.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <View style={styles.langLeft}>
                  <Globe color={language === lang.code ? colors.primary : colors.textSecondary} size={20} />
                  <Text
                    style={[
                      styles.langText,
                      { color: language === lang.code ? colors.primary : colors.text },
                    ]}
                  >
                    {lang.label}
                  </Text>
                </View>
                {language === lang.code ? <CheckCircle2 color={colors.primary} size={20} /> : null}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 24 }]}>{t('Account & Support')}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.supportRow} onPress={handleExportData}>
              <Download color={colors.textSecondary} size={20} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.supportText, { color: colors.text }]}>Export Workouts</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                  Save your data as a file to import later
                </Text>
              </View>
              <ChevronRight color={colors.textSecondary} size={18} />
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <TouchableOpacity style={styles.supportRow} onPress={() => onNavigate?.('Help')}>
              <HelpCircle color={colors.textSecondary} size={20} />
              <Text style={[styles.supportText, { color: colors.text }]}>{t('Help')}</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <TouchableOpacity style={styles.supportRow} onPress={() => setLegalPolicyVisible(true)}>
              <FileText color={colors.textSecondary} size={20} />
              <Text style={[styles.supportText, { color: colors.text }]}>{t('Legal Policy')}</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <TouchableOpacity style={styles.supportRow} onPress={() => onNavigate?.('ContactUs')}>
              <Mail color={colors.textSecondary} size={20} />
              <Text style={[styles.supportText, { color: colors.text }]}>{t('Contact Us')}</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <TouchableOpacity style={styles.supportRow} onPress={handleSignOut}>
              <LogOut color={colors.danger} size={20} />
              <Text style={[styles.supportText, { color: colors.danger, fontWeight: 'bold' }]}>{t('Sign Out')}</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <TouchableOpacity style={styles.supportRow} onPress={handleDeleteAccount}>
              <Trash2 color={colors.danger} size={20} />
              <Text style={[styles.supportText, { color: colors.danger, fontWeight: 'bold' }]}>{t('Delete Account')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal visible={unitModalVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 16 }]}>{t('Unit of Measurement')}</Text>

              <TouchableOpacity style={styles.unitOption} onPress={() => setTempUnit('kg')}>
                {tempUnit === 'kg' ? <CheckCircle2 color={colors.primary} size={24} /> : <Circle color={colors.textSecondary} size={24} />}
                <Text style={{ color: colors.text, fontSize: 18, marginLeft: 12 }}>Kilograms (kg)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.unitOption, { marginBottom: 24 }]} onPress={() => setTempUnit('lbs')}>
                {tempUnit === 'lbs' ? <CheckCircle2 color={colors.primary} size={24} /> : <Circle color={colors.textSecondary} size={24} />}
                <Text style={{ color: colors.text, fontSize: 18, marginLeft: 12 }}>Pounds (lbs)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={saveUnit}>
                <Text style={styles.primaryBtnText}>{t('Confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <LegalPolicyModal
          visible={legalPolicyVisible}
          onClose={() => setLegalPolicyVisible(false)}
        />

        {/* Re-authentication modal — shown when Firebase requires fresh credentials */}
        <Modal visible={reauthModalVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 8 }]}>Confirm your password</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
                For security, enter your password to permanently delete your account.
              </Text>
              <TextInput
                style={[styles.reauthInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
                value={reauthPassword}
                onChangeText={setReauthPassword}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.danger, marginBottom: 12 }]}
                onPress={handleReauthAndDelete}
                disabled={reauthLoading}
              >
                <Text style={styles.primaryBtnText}>{reauthLoading ? 'Deleting…' : 'Delete Account'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                onPress={() => { setReauthModalVisible(false); pendingDeleteRef.current = false; }}
                disabled={reauthLoading}
              >
                <Text style={[styles.primaryBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { position: 'absolute', right: 16, padding: 8 },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  langLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langText: { fontSize: 16, fontWeight: '500' },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  supportText: { fontSize: 16 },
  signedInLabel: {
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  reauthInput: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 16,
  },
});
