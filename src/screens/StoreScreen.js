import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Shield, Crown } from 'lucide-react-native';
import { getThemeColors } from '../constants/theme';
import { useStore } from '../store';
import { TAB_BAR_CONTENT_HEIGHT } from '../components/BottomTabBar';

const { width: SCREEN_W } = Dimensions.get('window');

const TIERS = [
  {
    key: 'plus',
    label: 'Plus',
    Icon: Zap,
    accentLight: '#10B981',
    accentDark: '#10B981',
    tagline: 'Start your journey',
    perks: ['Advanced tracking', 'Workout history', 'Progress analytics'],
  },
  {
    key: 'pro',
    label: 'Pro',
    Icon: Shield,
    accentLight: '#2563EB',
    accentDark: '#3B82F6',
    tagline: 'Train like a pro',
    perks: ['Everything in Plus', 'Custom routines', 'Priority support'],
    featured: true,
  },
  {
    key: 'elite',
    label: 'Elite',
    Icon: Crown,
    accentLight: '#D97706',
    accentDark: '#F59E0B',
    tagline: 'Unlock your potential',
    perks: ['Everything in Pro', 'Trainer access', 'Exclusive content'],
  },
];

// ── Futuristic decorative backdrop ──────────────────────────────────────────
function FuturisticBackdrop({ theme }) {
  const isDark = theme === 'dark';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Large bottom-left glow */}
      <View
        style={[
          styles.glowOrb,
          {
            width: 280,
            height: 280,
            borderRadius: 140,
            bottom: TAB_BAR_CONTENT_HEIGHT + 20,
            left: -100,
            backgroundColor: isDark
              ? 'rgba(59, 130, 246, 0.07)'
              : 'rgba(37, 99, 235, 0.05)',
          },
        ]}
      />
      {/* Top-right violet orb */}
      <View
        style={[
          styles.glowOrb,
          {
            width: 220,
            height: 220,
            borderRadius: 110,
            top: 60,
            right: -70,
            backgroundColor: isDark
              ? 'rgba(139, 92, 246, 0.08)'
              : 'rgba(109, 40, 217, 0.04)',
          },
        ]}
      />
      {/* Mid amber accent */}
      <View
        style={[
          styles.glowOrb,
          {
            width: 140,
            height: 140,
            borderRadius: 70,
            top: '38%',
            right: 30,
            backgroundColor: isDark
              ? 'rgba(245, 158, 11, 0.06)'
              : 'rgba(217, 119, 6, 0.04)',
          },
        ]}
      />
      {/* Horizontal scan line */}
      <View
        style={[
          styles.scanLine,
          {
            top: '22%',
            backgroundColor: isDark
              ? 'rgba(59, 130, 246, 0.06)'
              : 'rgba(37, 99, 235, 0.04)',
          },
        ]}
      />
      <View
        style={[
          styles.scanLine,
          {
            top: '58%',
            backgroundColor: isDark
              ? 'rgba(139, 92, 246, 0.05)'
              : 'rgba(109, 40, 217, 0.03)',
          },
        ]}
      />
      {/* Corner accent — top-left */}
      <View
        style={[
          styles.cornerAccent,
          {
            top: 32,
            left: 20,
            borderTopColor: isDark
              ? 'rgba(59, 130, 246, 0.18)'
              : 'rgba(37, 99, 235, 0.14)',
            borderLeftColor: isDark
              ? 'rgba(59, 130, 246, 0.18)'
              : 'rgba(37, 99, 235, 0.14)',
          },
        ]}
      />
      {/* Corner accent — bottom-right */}
      <View
        style={[
          styles.cornerAccentBR,
          {
            bottom: TAB_BAR_CONTENT_HEIGHT + 48,
            right: 20,
            borderBottomColor: isDark
              ? 'rgba(245, 158, 11, 0.18)'
              : 'rgba(217, 119, 6, 0.14)',
            borderRightColor: isDark
              ? 'rgba(245, 158, 11, 0.18)'
              : 'rgba(217, 119, 6, 0.14)',
          },
        ]}
      />
    </View>
  );
}

// ── Pricing card ─────────────────────────────────────────────────────────────
function TierCard({ tier, colors, theme, index, animValue }) {
  const accent = theme === 'dark' ? tier.accentDark : tier.accentLight;
  const cardStyle = tier.featured
    ? [
        styles.card,
        styles.cardFeatured,
        {
          backgroundColor: colors.surface,
          borderColor: accent,
          shadowColor: accent,
        },
      ]
    : [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }];

  const animStyle = {
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [32 + index * 10, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={animStyle}>
      <View style={cardStyle}>
        {tier.featured && (
          <View style={[styles.featuredBanner, { backgroundColor: accent }]}>
            <Text style={styles.featuredBannerText}>MOST POPULAR</Text>
          </View>
        )}

        {/* Tier header */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: `${accent}18`, borderColor: `${accent}30` }]}>
            <tier.Icon color={accent} size={22} strokeWidth={1.8} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
            <Text style={[styles.tierTagline, { color: colors.textSecondary }]}>{tier.tagline}</Text>
          </View>
        </View>

        {/* Price placeholder */}
        <View style={[styles.pricePlaceholder, { borderColor: `${accent}25`, backgroundColor: `${accent}08` }]}>
          <Text style={[styles.priceText, { color: accent }]}>Pricing TBA</Text>
          <Text style={[styles.priceSubtext, { color: colors.textSecondary }]}>
            Further details will be revealed post launch
          </Text>
        </View>

        {/* Perks */}
        <View style={styles.perksContainer}>
          {tier.perks.map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <View style={[styles.perkDot, { backgroundColor: accent }]} />
              <Text style={[styles.perkText, { color: colors.textSecondary }]}>{perk}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function StoreScreen() {
  const { theme } = useStore();
  const colors = getThemeColors(theme);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(TIERS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 480,
      useNativeDriver: true,
    }).start();

    TIERS.forEach((_, i) => {
      Animated.timing(cardAnims[i], {
        toValue: 1,
        duration: 520,
        delay: 120 + i * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <FuturisticBackdrop theme={theme} />

      <Animated.View
        style={[
          styles.pageHeader,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>Store</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
          Choose your plan. Unlock your best.
        </Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: TAB_BAR_CONTENT_HEIGHT + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Pre-launch notice */}
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          }}
        >
          <View
            style={[
              styles.noticeBanner,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.noticeDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              Pricing and plan details will be fully revealed at launch.
            </Text>
          </View>
        </Animated.View>

        {/* Tier cards */}
        {TIERS.map((tier, i) => (
          <TierCard
            key={tier.key}
            tier={tier}
            colors={colors}
            theme={theme}
            index={i}
            animValue={cardAnims[i]}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Backdrop
  glowOrb: { position: 'absolute' },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  cornerAccent: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
  },
  cornerAccentBR: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
  },

  // Header
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },

  // Scroll
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 4,
    gap: 16,
  },

  // Notice banner
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  noticeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    flexShrink: 0,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },

  // Card
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 20,
  },
  cardFeatured: {
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  featuredBanner: {
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: 4,
  },
  featuredBannerText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },

  // Card header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: { flex: 1 },
  tierLabel: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tierTagline: {
    fontSize: 13,
    marginTop: 2,
  },

  // Price placeholder
  pricePlaceholder: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 4,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  priceSubtext: {
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.85,
  },

  // Perks
  perksContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  perkText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
