import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Trophy, ChevronDown, ChevronUp, TrendingUp, ChevronRight } from 'lucide-react-native';
import { getThemeColors } from '../constants/theme';
import { useStore } from '../store';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import { TAB_BAR_CONTENT_HEIGHT } from '../components/BottomTabBar';
import {
  buildWeeklyBuckets,
  buildPeriodBuckets,
  buildPersonalBests,
  calculateStreaks,
} from '../utils/workoutStats';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 40;   // 20px horizontal padding each side
const BAR_CHART_H = 130;
const LINE_CHART_H = 150;

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

function formatVolume(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return Math.round(v).toString();
}

function formatDuration(ms) {
  const min = Math.round(ms / 60000);
  if (min >= 60) return `${(min / 60).toFixed(1)}h`;
  return `${min}m`;
}

function SectionHeader({ title, colors }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.primary }]}>{title}</Text>
  );
}

export default function ProgressionScreen({ navigation }) {
  const { theme, workouts, unit, userProfile } = useStore();
  const colors = getThemeColors(theme);

  const bodyWeight = userProfile?.bodyweight || 70;
  const [allTimeExpanded, setAllTimeExpanded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');

  // ── Mount animation ────────────────────────────────────────────────────────
  const mountAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1,
      duration: 480,
      useNativeDriver: true,
    }).start();
  }, []);

  // ─── Weekly buckets (last 8 weeks) ────────────────────────────────────────
  const weeklyBuckets = useMemo(
    () => buildWeeklyBuckets(workouts, bodyWeight, 8),
    [workouts, bodyWeight]
  );

  const volumeBarData = weeklyBuckets.map((w) => ({
    label: w.label,
    value: Math.round(w.volume),
    highlight: w.isCurrent,
  }));

  const durationBarData = weeklyBuckets.map((w) => ({
    label: w.label,
    value: Math.round(w.durationMs / 60000), // minutes
    highlight: w.isCurrent,
  }));

  const thisWeek = weeklyBuckets[weeklyBuckets.length - 1];
  const lastWeek = weeklyBuckets[weeklyBuckets.length - 2];
  const volumeChange =
    lastWeek?.volume > 0
      ? Math.round(((thisWeek?.volume - lastWeek?.volume) / lastWeek?.volume) * 100)
      : null;

  // ─── Streaks ───────────────────────────────────────────────────────────────
  const { currentStreak, bestStreak } = useMemo(
    () => calculateStreaks(workouts),
    [workouts]
  );

  // ─── Personal bests ───────────────────────────────────────────────────────
  const personalBests = useMemo(
    () => buildPersonalBests(workouts, 12),
    [workouts]
  );

  // ─── All-time charts ───────────────────────────────────────────────────────
  const allTimeData = useMemo(
    () => buildPeriodBuckets(workouts, selectedPeriod, bodyWeight),
    [workouts, selectedPeriod, bodyWeight]
  );

  const allTimeVolumeData = allTimeData.map((d) => ({
    label: d.label,
    value: Math.round(d.volume),
  }));

  const allTimeDurationData = allTimeData.map((d) => ({
    label: d.label,
    value: Math.round(d.durationMs / 60000),
  }));

  const allTimeCountData = allTimeData.map((d) => ({
    label: d.label,
    value: d.count,
  }));

  const hasWorkouts = workouts.length > 0;

  const animStyle = {
    opacity: mountAnim,
    transform: [{ translateY: mountAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[{ flex: 1 }, animStyle]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_BAR_CONTENT_HEIGHT + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Progress</Text>
        </View>

        {/* ── Stats tiles ──────────────────────────────────────────────────── */}
        <View style={styles.statRow}>
          {[
            { Icon: Flame,      color: '#F59E0B',      value: currentStreak,  label: 'Day Streak'  },
            { Icon: Trophy,     color: '#F59E0B',      value: bestStreak,     label: 'Best Streak' },
            { Icon: TrendingUp, color: colors.primary, value: workouts.length, label: 'Sessions'   },
          ].map(({ Icon, color, value, label }) => (
            <View
              key={label}
              style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Icon color={color} size={18} />
              <Text style={[styles.statTileNum, { color }]}>{value}</Text>
              <Text style={[styles.statTileLabel, { color: colors.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Weekly Volume ────────────────────────────────────────────────── */}
        <SectionHeader title="WEEKLY VOLUME" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardTopRow}>
            <View>
              <Text style={[styles.cardMetric, { color: colors.text }]}>
                {formatVolume(thisWeek?.volume || 0)}{' '}
                <Text style={[styles.cardUnit, { color: colors.textSecondary }]}>{unit}</Text>
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                This week
              </Text>
            </View>
            {volumeChange !== null ? (
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      volumeChange >= 0
                        ? `${colors.success}22`
                        : `${colors.danger}22`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.changeBadgeText,
                    { color: volumeChange >= 0 ? colors.success : colors.danger },
                  ]}
                >
                  {volumeChange >= 0 ? '+' : ''}
                  {volumeChange}% vs last week
                </Text>
              </View>
            ) : null}
          </View>

          {hasWorkouts ? (
            <BarChart
              data={volumeBarData}
              width={CHART_WIDTH - 32}
              height={BAR_CHART_H}
              barColor={colors.primary}
              labelColor={colors.textSecondary}
            />
          ) : (
            <Text style={[styles.emptyChart, { color: colors.textSecondary }]}>
              Log your first workout to see volume trends.
            </Text>
          )}
        </View>

        {/* ── Weekly Duration ──────────────────────────────────────────────── */}
        <SectionHeader title="WORKOUT DURATION" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardTopRow}>
            <View>
              <Text style={[styles.cardMetric, { color: colors.text }]}>
                {formatDuration(thisWeek?.durationMs || 0)}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                This week
              </Text>
            </View>
          </View>

          {hasWorkouts ? (
            <BarChart
              data={durationBarData}
              width={CHART_WIDTH - 32}
              height={BAR_CHART_H}
              barColor="#8B5CF6"
              labelColor={colors.textSecondary}
            />
          ) : (
            <Text style={[styles.emptyChart, { color: colors.textSecondary }]}>
              No workout data yet.
            </Text>
          )}
        </View>

        {/* ── Personal Records ─────────────────────────────────────────────── */}
        {personalBests.length > 0 ? (
          <>
            <SectionHeader title="PERSONAL RECORDS" colors={colors} />

            {/* Preview — always show top 3 */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {personalBests.slice(0, 3).map((pb, index) => (
                <React.Fragment key={pb.name}>
                  <View style={styles.pbRow}>
                    {/* Rank number */}
                    <View style={[styles.pbRankBadge, { backgroundColor: `${colors.primary}18` }]}>
                      <Text style={[styles.pbRankText, { color: colors.primary }]}>
                        {index + 1}
                      </Text>
                    </View>

                    {/* Exercise name + session count */}
                    <View style={styles.pbLeft}>
                      <Text style={[styles.pbName, { color: colors.text }]} numberOfLines={1}>
                        {pb.name}
                      </Text>
                      <Text style={[styles.pbMeta, { color: colors.textSecondary }]}>
                        {pb.count} {pb.count === 1 ? 'session' : 'sessions'}
                      </Text>
                    </View>

                    {/* Best lift */}
                    <View style={styles.pbRight}>
                      <Text style={[styles.pbWeight, { color: colors.primary }]}>
                        {pb.weight}
                        <Text style={[styles.pbUnit, { color: colors.textSecondary }]}> {unit}</Text>
                      </Text>
                      <Text style={[styles.pbReps, { color: colors.textSecondary }]}>
                        × {pb.reps} reps
                      </Text>
                    </View>
                  </View>
                  {index < Math.min(personalBests.length, 3) - 1 && (
                    <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* View all button — only when there is more than one exercise */}
            {personalBests.length > 1 ? (
              <TouchableOpacity
                style={[styles.viewAllBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate('PersonalRecords', { personalBests })}
                activeOpacity={0.75}
              >
                <Trophy color={colors.primary} size={16} />
                <Text style={[styles.viewAllText, { color: colors.text }]}>
                  View Personal Records
                </Text>
                <ChevronRight color={colors.textSecondary} size={16} />
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}

        {/* ── All-Time Progressions (collapsible) ──────────────────────────── */}
        <TouchableOpacity
          style={[styles.allTimeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setAllTimeExpanded((v) => !v)}
          activeOpacity={0.75}
        >
          <Text style={[styles.allTimeToggleText, { color: colors.text }]}>
            All-Time Progressions
          </Text>
          {allTimeExpanded ? (
            <ChevronUp color={colors.textSecondary} size={18} />
          ) : (
            <ChevronDown color={colors.textSecondary} size={18} />
          )}
        </TouchableOpacity>

        {allTimeExpanded ? (
          <View style={styles.allTimeContent}>
            {/* Period selector */}
            <View style={styles.periodRow}>
              {PERIODS.map((p) => {
                const active = selectedPeriod === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.periodPill,
                      {
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedPeriod(p)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.periodPillText,
                        { color: active ? '#FFF' : colors.textSecondary },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {allTimeVolumeData.length >= 2 ? (
              <>
                {/* Volume line chart */}
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>Volume ({unit})</Text>
                  <LineChart
                    data={allTimeVolumeData}
                    width={CHART_WIDTH - 32}
                    height={LINE_CHART_H}
                    lineColor={colors.primary}
                    labelColor={colors.textSecondary}
                  />
                </View>

                {/* Duration line chart */}
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>Duration (min)</Text>
                  <LineChart
                    data={allTimeDurationData}
                    width={CHART_WIDTH - 32}
                    height={LINE_CHART_H}
                    lineColor="#8B5CF6"
                    labelColor={colors.textSecondary}
                  />
                </View>

                {/* Sessions count line chart */}
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>Sessions</Text>
                  <LineChart
                    data={allTimeCountData}
                    width={CHART_WIDTH - 32}
                    height={LINE_CHART_H}
                    lineColor="#10B981"
                    labelColor={colors.textSecondary}
                  />
                </View>
              </>
            ) : (
              <Text style={[styles.emptyChart, { color: colors.textSecondary, marginTop: 12 }]}>
                Log more workouts to unlock all-time charts.
              </Text>
            )}
          </View>
        ) : null}
      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  pageHeader: { paddingTop: 20, paddingBottom: 16 },
  pageTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 32,
    marginBottom: 12,
    marginLeft: 2,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
  },

  // Stats tiles (replaces old streak card)
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  statTileNum: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 36,
  },
  statTileLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
  },

  // Metric row inside card
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardMetric: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  cardUnit: { fontSize: 16, fontWeight: '400' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  changeBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  changeBadgeText: { fontSize: 12, fontWeight: '600' },

  emptyChart: { fontSize: 14, textAlign: 'center', paddingVertical: 24, opacity: 0.7 },

  // Personal records
  pbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  pbRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pbRankText: { fontSize: 13, fontWeight: '800' },
  pbLeft: { flex: 1 },
  pbName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  pbMeta: { fontSize: 11 },
  pbRight: { alignItems: 'flex-end', flexShrink: 0 },
  pbWeight: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  pbUnit: { fontSize: 12, fontWeight: '400' },
  pbReps: { fontSize: 11, marginTop: 2 },
  rowDivider: { height: StyleSheet.hairlineWidth },

  // View all button
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  viewAllText: { flex: 1, fontSize: 14, fontWeight: '600' },

  // All-time toggle button
  allTimeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 32,
  },
  allTimeToggleText: { fontSize: 16, fontWeight: '700' },

  allTimeContent: { marginTop: 16 },

  // Period pills
  periodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  periodPill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  periodPillText: { fontSize: 13, fontWeight: '500' },

  chartTitle: { fontSize: 13, fontWeight: '600', marginBottom: 14, opacity: 0.8 },
});
