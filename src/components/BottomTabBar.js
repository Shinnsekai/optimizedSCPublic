import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, TrendingUp, User, Users, ShoppingBag } from 'lucide-react-native';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';

/** Height of the visible tab bar area (excluding safe-area bottom inset). */
export const TAB_BAR_CONTENT_HEIGHT = 58;

// Visual order: Trainers | Progress | Home (center) | Store | Profile
// routeIndex matches the Tab.Navigator registration order in App.js:
//   0 = HomeTab, 1 = Progression, 2 = Profile, 3 = Trainers, 4 = Store
const VISUAL_TABS = [
  { name: 'Trainers',    routeIndex: 3, label: 'Trainers', Icon: Users       },
  { name: 'Progression', routeIndex: 1, label: 'Progress', Icon: TrendingUp  },
  { name: 'HomeTab',     routeIndex: 0, label: 'Home',     Icon: Home        },
  { name: 'Store',       routeIndex: 4, label: 'Store',    Icon: ShoppingBag },
  { name: 'Profile',     routeIndex: 2, label: 'Profile',  Icon: User        },
];

// Screens that should hide the tab bar entirely.
const HIDDEN_DURING = new Set([
  'WorkoutStartIntro',
  'WorkoutCountdown',
  'ActiveWorkout',
  'CreateRoutine',
]);

function getActiveRouteName(navState) {
  if (!navState) return null;
  const route = navState.routes?.[navState.index ?? 0];
  if (!route) return null;
  if (route.state) return getActiveRouteName(route.state);
  return route.name ?? null;
}

export default function BottomTabBar({ state, navigation }) {
  const { theme } = useStore();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const scaleAnims = useRef(VISUAL_TABS.map(() => new Animated.Value(1))).current;

  const activeScreen = getActiveRouteName(state);
  if (HIDDEN_DURING.has(activeScreen)) return null;

  const tabBarBg = theme === 'dark' ? '#07111C' : '#ECEEF5';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tabBarBg,
          paddingBottom: insets.bottom,
          borderTopColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: theme === 'dark' ? 0.28 : 0.07,
          shadowRadius: 8,
          elevation: 12,
        },
      ]}
    >
      {VISUAL_TABS.map((tab, i) => {
        const isFocused = state.index === tab.routeIndex;
        const color = isFocused ? colors.primary : colors.textSecondary;

        const onPress = () => {
          Animated.sequence([
            Animated.timing(scaleAnims[i], {
              toValue: 0.78,
              duration: 75,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnims[i], {
              toValue: 1,
              useNativeDriver: true,
              speed: 280,
              bounciness: 14,
            }),
          ]).start();

          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[tab.routeIndex]?.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: tab.name, merge: true });
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={1}
          >
            <Animated.View
              style={[styles.tabContent, { transform: [{ scale: scaleAnims[i] }] }]}
            >
              <tab.Icon color={color} size={22} strokeWidth={isFocused ? 2.2 : 1.6} />
              <Text style={[styles.tabLabel, { color, fontWeight: isFocused ? '600' : '400' }]}>
                {tab.label}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_BAR_CONTENT_HEIGHT - 10,
  },
  tabContent: {
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
});
