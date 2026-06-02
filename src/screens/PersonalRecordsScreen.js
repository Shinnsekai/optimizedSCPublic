import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy } from 'lucide-react-native';
import { getThemeColors } from '../constants/theme';
import { useStore } from '../store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PAD = 20;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;

const RANK_COLORS = ['#F59E0B', '#A8B1C7', '#CD7F32']; // gold, silver, bronze

export default function PersonalRecordsScreen({ navigation, route }) {
  const { personalBests } = route.params;
  const { theme, unit } = useStore();
  const colors = getThemeColors(theme);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Records</Text>
        {/* Mirror spacer so title stays centred */}
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          All-time best set per exercise · ranked by frequency
        </Text>

        {personalBests.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────────────── */
          <View style={styles.emptyWrap}>
            <Trophy color={colors.border} size={52} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No records yet.{'\n'}Log a weighted set to start tracking your bests.
            </Text>
          </View>
        ) : (
          /* ── Card grid ────────────────────────────────────────────────── */
          <View style={styles.grid}>
            {personalBests.map((pb, index) => {
              const rankColor = RANK_COLORS[index] ?? colors.primary;
              const isTop3 = index < 3;

              return (
                <View
                  key={pb.name}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isTop3 ? rankColor : colors.border,
                      width: CARD_WIDTH,
                    },
                  ]}
                >
                  {/* Accent strip */}
                  <View style={[styles.cardAccent, { backgroundColor: isTop3 ? rankColor : colors.primary }]} />

                  {/* Rank badge for top 3 */}
                  {isTop3 ? (
                    <View style={[styles.rankBadge, { backgroundColor: `${rankColor}22` }]}>
                      <Trophy color={rankColor} size={11} />
                      <Text style={[styles.rankText, { color: rankColor }]}>
                        {'  '}#{index + 1}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.rankBadge, { backgroundColor: `${colors.primary}18` }]}>
                      <Text style={[styles.rankText, { color: colors.textSecondary }]}>
                        #{index + 1}
                      </Text>
                    </View>
                  )}

                  {/* Exercise name */}
                  <Text
                    style={[styles.cardName, { color: colors.text }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {pb.name}
                  </Text>

                  {/* Best weight */}
                  <View style={styles.weightRow}>
                    <Text style={[styles.cardWeight, { color: isTop3 ? rankColor : colors.primary }]}>
                      {pb.weight}
                    </Text>
                    <Text style={[styles.cardUnit, { color: colors.textSecondary }]}>
                      {' '}{unit}
                    </Text>
                  </View>

                  {/* Reps */}
                  <Text style={[styles.cardReps, { color: colors.text }]}>
                    × {pb.reps} reps
                  </Text>

                  {/* Divider */}
                  <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

                  {/* Session count */}
                  <Text style={[styles.cardSessions, { color: colors.textSecondary }]}>
                    {pb.count} {pb.count === 1 ? 'session' : 'sessions'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Scroll
  scroll: {
    paddingHorizontal: H_PAD,
    paddingTop: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.85,
  },

  // Empty state
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.75,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },

  // Card
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  cardAccent: {
    height: 3,
    marginHorizontal: -14,
    marginBottom: 12,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 8,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 10,
    minHeight: 36, // reserve 2 lines
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardWeight: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cardUnit: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardReps: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.85,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  cardSessions: {
    fontSize: 11,
    fontWeight: '500',
  },
});
