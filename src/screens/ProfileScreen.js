import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Edit3, X } from 'lucide-react-native';
import { getThemeColors } from '../constants/theme';
import { useStore } from '../store';
import { updateAvatarId } from '../services/userProfileService';
import { TAB_BAR_CONTENT_HEIGHT } from '../components/BottomTabBar';

// ─── Avatar presets ───────────────────────────────────────────────────────────
export const AVATAR_PRESETS = [
  // Male (m1–m10)
  { id: 'm1',  gender: 'male',   bg: '#1D3A6B', emoji: '🏋️', name: 'Powerlifter'  },
  { id: 'm2',  gender: 'male',   bg: '#5B21B6', emoji: '🥊', name: 'Fighter'      },
  { id: 'm3',  gender: 'male',   bg: '#065F46', emoji: '🏃', name: 'Runner'       },
  { id: 'm4',  gender: 'male',   bg: '#7F1D1D', emoji: '💪', name: 'Athlete'      },
  { id: 'm5',  gender: 'male',   bg: '#78350F', emoji: '🏅', name: 'Champion'     },
  { id: 'm6',  gender: 'male',   bg: '#0C4A6E', emoji: '🏊', name: 'Swimmer'      },
  { id: 'm7',  gender: 'male',   bg: '#312E81', emoji: '🧗', name: 'Climber'      },
  { id: 'm8',  gender: 'male',   bg: '#14532D', emoji: '⚽', name: 'Player'       },
  { id: 'm9',  gender: 'male',   bg: '#431407', emoji: '🏈', name: 'Grinder'      },
  { id: 'm10', gender: 'male',   bg: '#1E3A5F', emoji: '🎯', name: 'Sniper'       },
  // Female (f1–f10)
  { id: 'f1',  gender: 'female', bg: '#831843', emoji: '🤸', name: 'Gymnast'      },
  { id: 'f2',  gender: 'female', bg: '#4C1D95', emoji: '🧘', name: 'Yogi'         },
  { id: 'f3',  gender: 'female', bg: '#134E4A', emoji: '🏋️', name: 'Lifter'       },
  { id: 'f4',  gender: 'female', bg: '#7C2D12', emoji: '🏃', name: 'Sprinter'     },
  { id: 'f5',  gender: 'female', bg: '#1E3A8A', emoji: '🏊', name: 'Swimmer'      },
  { id: 'f6',  gender: 'female', bg: '#713F12', emoji: '💪', name: 'Warrior'      },
  { id: 'f7',  gender: 'female', bg: '#3B0764', emoji: '🥇', name: 'Gold'         },
  { id: 'f8',  gender: 'female', bg: '#052E16', emoji: '🏅', name: 'Elite'        },
  { id: 'f9',  gender: 'female', bg: '#500724', emoji: '⚡', name: 'Lightning'    },
  { id: 'f10', gender: 'female', bg: '#172554', emoji: '🎯', name: 'Precision'    },
];

const AVATAR_MAP = Object.fromEntries(AVATAR_PRESETS.map((a) => [a.id, a]));

// ─── Avatar renderer (reusable) ───────────────────────────────────────────────
export function AvatarCircle({ avatarId, size = 72, borderColor, borderWidth = 0 }) {
  const preset = AVATAR_MAP[avatarId];
  const fontSize = size * 0.46;

  return (
    <View
      style={[
        styles.avatarCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: preset ? preset.bg : '#1B2740',
          borderColor: borderColor || 'transparent',
          borderWidth,
        },
      ]}
    >
      <Text style={{ fontSize, lineHeight: size }}>{preset ? preset.emoji : '👤'}</Text>
    </View>
  );
}

const DETAIL_ROWS = [
  { key: 'age',         label: 'Age',          format: (v)       => (v ? `${v} yrs` : '—') },
  { key: 'gender',      label: 'Gender',        format: (v)       => v || '—' },
  { key: 'bodyweight',  label: 'Bodyweight',    format: (v, p)    => (v ? `${v} ${p?.bodyweightUnit || 'kg'}` : '—') },
  { key: 'height',      label: 'Height',        format: (v, p)    => (v ? `${v} ${p?.heightUnit || 'cm'}` : '—') },
  { key: 'fitnessLevel',label: 'Fitness Level', format: (v)       => v || '—' },
];

export default function ProfileScreen({ navigation }) {
  const { theme, user, userProfile, setUserProfile } = useStore();
  const colors = getThemeColors(theme);

  const username  = userProfile?.username || user?.displayName || 'Athlete';
  const email     = user?.email || '';
  const avatarId  = userProfile?.avatarId || null;

  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelectAvatar = async (preset) => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await updateAvatarId(user.uid, preset.id);
      setUserProfile({ ...userProfile, avatarId: preset.id });
    } catch {
      // Silent — UI stays unchanged if save fails
    } finally {
      setSaving(false);
      setPickerVisible(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_BAR_CONTENT_HEIGHT + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Profile</Text>
        </View>

        {/* ── Avatar + identity ──────────────────────────────────────────── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.8}
            style={styles.avatarWrap}
          >
            <AvatarCircle
              avatarId={avatarId}
              size={96}
              borderColor={colors.primary}
              borderWidth={2.5}
            />
            {/* Change badge */}
            <View style={[styles.changeBadge, { backgroundColor: colors.primary }]}>
              <Edit3 color="#FFF" size={11} />
            </View>
          </TouchableOpacity>

          <Text style={[styles.displayName, { color: colors.text }]}>{username}</Text>
          {email ? (
            <Text style={[styles.email, { color: colors.textSecondary }]}>{email}</Text>
          ) : null}
          {userProfile?.fitnessLevel ? (
            <View style={[styles.levelBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.levelBadgeText, { color: colors.primary }]}>
                {userProfile.fitnessLevel}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Profile details card ───────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>PROFILE DETAILS</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {DETAIL_ROWS.map((row, index) => (
            <React.Fragment key={row.key}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {row.format(userProfile?.[row.key], userProfile)}
                </Text>
              </View>
              {index < DETAIL_ROWS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Edit button */}
        <TouchableOpacity
          style={[styles.editBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.75}
        >
          <Edit3 color={colors.textSecondary} size={16} />
          <Text style={[styles.editBtnText, { color: colors.textSecondary }]}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Avatar picker modal ─────────────────────────────────────────── */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setPickerVisible(false)}
      >
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: colors.background }]}>
          {/* Modal header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Avatar</Text>
            <TouchableOpacity
              onPress={() => setPickerVisible(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X color={colors.text} size={22} />
            </TouchableOpacity>
          </View>

          {saving ? (
            <View style={styles.savingWrap}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              {/* Male section */}
              <Text style={[styles.genderLabel, { color: colors.primary }]}>MALE</Text>
              <View style={styles.avatarGrid}>
                {AVATAR_PRESETS.filter((a) => a.gender === 'male').map((preset) => {
                  const selected = preset.id === avatarId;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetCell,
                        selected && { borderColor: colors.primary, borderWidth: 2.5, borderRadius: 18 },
                      ]}
                      onPress={() => handleSelectAvatar(preset)}
                      activeOpacity={0.75}
                    >
                      <AvatarCircle
                        avatarId={preset.id}
                        size={64}
                        borderColor={selected ? colors.primary : 'transparent'}
                        borderWidth={selected ? 2.5 : 0}
                      />
                      <Text style={[styles.presetName, { color: colors.textSecondary }]}>
                        {preset.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Female section */}
              <Text style={[styles.genderLabel, { color: colors.primary, marginTop: 24 }]}>FEMALE</Text>
              <View style={styles.avatarGrid}>
                {AVATAR_PRESETS.filter((a) => a.gender === 'female').map((preset) => {
                  const selected = preset.id === avatarId;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetCell,
                        selected && { borderColor: colors.primary, borderWidth: 2.5, borderRadius: 18 },
                      ]}
                      onPress={() => handleSelectAvatar(preset)}
                      activeOpacity={0.75}
                    >
                      <AvatarCircle
                        avatarId={preset.id}
                        size={64}
                        borderColor={selected ? colors.primary : 'transparent'}
                        borderWidth={selected ? 2.5 : 0}
                      />
                      <Text style={[styles.presetName, { color: colors.textSecondary }]}>
                        {preset.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20 },

  pageHeader: { paddingTop: 16, paddingBottom: 8 },
  pageTitle:  { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },

  // Avatar section
  avatarSection: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  avatarWrap:    { position: 'relative', marginBottom: 4 },
  avatarCircle:  { alignItems: 'center', justifyContent: 'center' },
  changeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  email:       { fontSize: 14, fontWeight: '400' },
  levelBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },
  levelBadgeText: { fontSize: 13, fontWeight: '600' },

  // Details card
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailLabel: { fontSize: 15, fontWeight: '400' },
  detailValue: { fontSize: 15, fontWeight: '600' },
  divider:     { height: StyleSheet.hairlineWidth },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 8,
  },
  editBtnText: { fontSize: 15, fontWeight: '500' },

  // Modal
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  savingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  pickerScroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  genderLabel:  {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  presetCell: {
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  presetName: { fontSize: 11, fontWeight: '500' },
});
