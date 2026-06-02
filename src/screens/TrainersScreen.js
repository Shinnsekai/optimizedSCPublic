import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users } from 'lucide-react-native';
import { getThemeColors } from '../constants/theme';
import { useStore } from '../store';
import { TAB_BAR_CONTENT_HEIGHT } from '../components/BottomTabBar';

export default function TrainersScreen() {
  const { theme } = useStore();
  const colors = getThemeColors(theme);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View
        style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Trainers</Text>
        </View>

        {/* Center content */}
        <View style={[styles.centerContent, { paddingBottom: TAB_BAR_CONTENT_HEIGHT + 40 }]}>
          {/* Icon ring */}
          <View
            style={[
              styles.iconRing,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[styles.iconRingInner, { borderColor: `${colors.primary}40` }]}
            >
              <Users color={colors.primary} size={48} strokeWidth={1.4} />
            </View>
          </View>

          {/* Beta badge */}
          <View
            style={[
              styles.betaBadge,
              { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}40` },
            ]}
          >
            <View style={[styles.betaDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.betaBadgeText, { color: colors.primary }]}>
              Beta Testing
            </Text>
          </View>

          <Text style={[styles.heading, { color: colors.text }]}>
            Meet Your Trainers
          </Text>

          <Text style={[styles.body, { color: colors.textSecondary }]}>
            Our trainers feature is currently in beta testing and will be
            revealed at a future launch. Stay tuned for expert-led programmes,
            personalised coaching, and guided workout plans.
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.footnote, { color: colors.textSecondary }]}>
            Something big is coming.
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 20,
  },
  iconRing: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconRingInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  betaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  betaDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  betaBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.85,
  },
  divider: {
    width: 48,
    height: 1,
    borderRadius: 999,
    marginVertical: 4,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
});
