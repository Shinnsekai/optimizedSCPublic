import React, { createContext, useContext, useEffect } from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createNavigationContainerRef,
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, Easing, TouchableOpacity, View } from 'react-native';
import { Moon, Settings, Sun } from 'lucide-react-native';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './src/config/firebase';
import { getThemeColors } from './src/constants/theme';
import SettingsModal from './src/components/SettingsModal';
import BottomTabBar from './src/components/BottomTabBar';
import { useStore } from './src/store';
import { getUserProfile, resolveAppUser } from './src/services/userProfileService';
import { subscribeToRoutineData, subscribeToWorkoutData } from './src/services/trainingDataService';

// ─── Screens ──────────────────────────────────────────────────────────────────
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import CreateRoutineScreen from './src/screens/CreateRoutineScreen';
import RoutineDetailScreen from './src/screens/RoutineDetailScreen';
import ActiveWorkoutScreen from './src/screens/ActiveWorkoutScreen';
import WorkoutDetailScreen from './src/screens/WorkoutDetailScreen';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import PasswordResetSentScreen from './src/screens/PasswordResetSentScreen';
import HelpScreen from './src/screens/HelpScreen';
import ContactUsScreen from './src/screens/ContactUsScreen';
import WorkoutStartIntroScreen from './src/screens/WorkoutStartIntroScreen';
import WorkoutCountdownScreen from './src/screens/WorkoutCountdownScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import ProgressionScreen from './src/screens/ProgressionScreen';
import PersonalRecordsScreen from './src/screens/PersonalRecordsScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TrainersScreen from './src/screens/TrainersScreen';
import StoreScreen from './src/screens/StoreScreen';

import './src/i18n';

// ─── Navigator instances (must be module-level) ────────────────────────────
const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

const navigationRef = createNavigationContainerRef();

// ─── Context: pass openSettings callback into nested navigators without prop drilling
export const SettingsOpenContext = createContext(() => {});

// ─── Standard transition config shared across all stack navigators ─────────
const buildTransitionConfig = (colors) => ({
  headerStyle: {
    backgroundColor: colors.background,
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerTitleContainerStyle: { marginTop: 25 },
  headerLeftContainerStyle:  { marginTop: 25 },
  headerTintColor: colors.text,
  headerBackTitleVisible: false,
  gestureEnabled: true,
  ...TransitionPresets.SlideFromRightIOS,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: { duration: 320, easing: Easing.out(Easing.poly(4)) },
    },
    close: {
      animation: 'timing',
      config: { duration: 240, easing: Easing.in(Easing.poly(4)) },
    },
  },
});

// ─── HomeTabStack: the stack nested inside the Home tab ────────────────────
function HomeTabStackNavigator() {
  const openSettings = useContext(SettingsOpenContext);
  const { theme, toggleTheme } = useStore();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  // Shrink header by 8px while keeping icons centred in the content area
  const compactStatusBarHeight = Math.max(insets.top - 8, 0);

  const HeaderRight = () => (
    <View style={{ marginRight: 15, marginTop: 25 }}>
      <TouchableOpacity onPress={openSettings}>
        <Settings color={colors.text} size={24} />
      </TouchableOpacity>
    </View>
  );

  const HeaderLeftMode = () => (
    <TouchableOpacity onPress={toggleTheme} style={{ marginLeft: 15, marginTop: 25 }}>
      {theme === 'dark' ? (
        <Sun color={colors.text} size={24} />
      ) : (
        <Moon color={colors.text} size={24} />
      )}
    </TouchableOpacity>
  );

  return (
    <HomeStack.Navigator screenOptions={{ ...buildTransitionConfig(colors), headerStatusBarHeight: compactStatusBarHeight, headerRight: () => <HeaderRight /> }}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '', headerLeft: () => <HeaderLeftMode />, headerLeftContainerStyle: { marginTop: 0 } }}
      />
      <HomeStack.Screen
        name="CreateRoutine"
        component={CreateRoutineScreen}
        options={{ title: 'New Routine' }}
      />
      <HomeStack.Screen
        name="RoutineDetail"
        component={RoutineDetailScreen}
        options={{ title: 'Routine Details' }}
      />
      <HomeStack.Screen
        name="WorkoutStartIntro"
        component={WorkoutStartIntroScreen}
        options={{ title: '', headerRight: () => null }}
      />
      <HomeStack.Screen
        name="WorkoutCountdown"
        component={WorkoutCountdownScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <HomeStack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{ title: 'Workout', gestureEnabled: false }}
      />
      <HomeStack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ title: 'Workout Summary' }}
      />
    </HomeStack.Navigator>
  );
}

// ─── Main Tab Navigator ─────────────────────────────────────────────────────
function MainTabsNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeTabStackNavigator} />
      <Tab.Screen name="Progression" component={ProgressionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Trainers" component={TrainersScreen} />
      <Tab.Screen name="Store" component={StoreScreen} />
    </Tab.Navigator>
  );
}

// ─── Root App ───────────────────────────────────────────────────────────────
export default function App() {
  const {
    theme,
    user,
    pendingVerification,
    activeWorkoutSession,
    userProfile,
    welcomePending,
    setUser,
    clearUser,
    setUserProfile,
    setPendingVerification,
    clearPendingVerification,
    setRoutines,
    setWorkouts,
    trainingDataReady,
    setTrainingDataReady,
  } = useStore();

  const [settingsVisible, setSettingsVisible] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true);
  const [navigationReady, setNavigationReady] = React.useState(false);

  const activeTheme = user ? theme : 'dark';
  const colors = getThemeColors(activeTheme);

  // ── Auth effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const syncAuthState = async () => {
        if (cancelled) return;

        if (currentUser) {
          const resolvedUser = await resolveAppUser(currentUser);
          if (cancelled) return;

          if (
            currentUser.providerData?.[0]?.providerId === 'password' &&
            !currentUser.emailVerified
          ) {
            clearUser();
            setUserProfile(undefined);
            setPendingVerification(resolvedUser);
            setInitializing(false);
            return;
          }

          // Fetch the body/fitness profile so we know if setup is complete
          const profile = await getUserProfile(currentUser.uid);
          if (cancelled) return;

          setUserProfile(profile ?? null);
          setTrainingDataReady(false);
          setUser(resolvedUser);
          setInitializing(false);
          return;
        }

        clearPendingVerification();
        clearUser();
        setUserProfile(undefined);
        setInitializing(false);
      };

      syncAuthState().catch((error) => {
        console.warn('Auth state sync failed:', error);
        clearPendingVerification();
        clearUser();
        setUserProfile(undefined);
        setInitializing(false);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [
    clearPendingVerification,
    clearUser,
    setPendingVerification,
    setTrainingDataReady,
    setUser,
    setUserProfile,
  ]);

  // ── Training data subscription ────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setRoutines([]);
      setWorkouts([]);
      setTrainingDataReady(true);
      return;
    }

    let routinesReady = false;
    let workoutsReady = false;

    const markReady = () => {
      if (routinesReady && workoutsReady) setTrainingDataReady(true);
    };

    const handleError = (error) => {
      console.warn('Training data subscription failed:', error);
      setTrainingDataReady(true);
    };

    const unsubscribeRoutines = subscribeToRoutineData(
      user,
      (routines) => {
        setRoutines(routines);
        routinesReady = true;
        markReady();
      },
      handleError
    );

    const unsubscribeWorkouts = subscribeToWorkoutData(
      user,
      (workouts) => {
        setWorkouts(workouts);
        workoutsReady = true;
        markReady();
      },
      handleError
    );

    // Safety valve: if Firestore subscriptions don't respond within 8 s
    // (e.g. offline, slow network), unblock the UI anyway.
    const safetyTimer = setTimeout(() => {
      setTrainingDataReady(true);
    }, 8000);

    return () => {
      clearTimeout(safetyTimer);
      unsubscribeRoutines();
      unsubscribeWorkouts();
    };
  }, [user, setRoutines, setWorkouts, setTrainingDataReady]);

  // ── Restore active workout session ────────────────────────────────────────
  useEffect(() => {
    if (!user || !activeWorkoutSession || !navigationReady || !navigationRef.isReady()) return;

    const currentRoute = navigationRef.getCurrentRoute()?.name;

    if (!['ActiveWorkout', 'WorkoutCountdown', 'WorkoutStartIntro'].includes(currentRoute || '')) {
      // Navigate to HomeTab and then to ActiveWorkout within it
      navigationRef.navigate('HomeTab', { screen: 'ActiveWorkout' });
    }
  }, [activeWorkoutSession, navigationReady, user]);

  // ── Loading states ────────────────────────────────────────────────────────
  const profileStillLoading = user && userProfile === undefined;

  // Only block rendering before the NavigationContainer has ever mounted.
  // Training-data loading is handled as an overlay so the NavigationContainer
  // is never unmounted after first mount (unmount→remount causes the white flash).
  if (initializing || profileStillLoading) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  // ── Navigation theme ──────────────────────────────────────────────────────
  const navigationTheme = {
    ...(activeTheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(activeTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  const handleSettingsNavigate = (screenName) => {
    setSettingsVisible(false);
    if (navigationRef.isReady()) {
      navigationRef.navigate(screenName);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SettingsOpenContext.Provider value={() => setSettingsVisible(true)}>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          theme={navigationTheme}
          onReady={() => setNavigationReady(true)}
        >
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              // ── Authenticated ──────────────────────────────────────────────
              !userProfile?.profileComplete ? (
                // Profile not yet set up — show setup screen
                <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
              ) : welcomePending ? (
                // One-time welcome animation after first profile setup
                <RootStack.Screen
                  name="Welcome"
                  component={WelcomeScreen}
                  options={{ animationEnabled: false, gestureEnabled: false }}
                />
              ) : (
                <>
                  <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
                  <RootStack.Screen
                    name="Help"
                    component={HelpScreen}
                    options={{
                      headerShown: true,
                      title: 'Help',
                      ...buildTransitionConfig(colors),
                    }}
                  />
                  <RootStack.Screen
                    name="ContactUs"
                    component={ContactUsScreen}
                    options={{
                      headerShown: true,
                      title: 'Contact Us',
                      ...buildTransitionConfig(colors),
                    }}
                  />
                  {/* Allow ProfileSetup to be revisited from Profile screen */}
                  <RootStack.Screen name="EditProfile" component={ProfileSetupScreen} />
                  {/* Personal Records full-page view */}
                  <RootStack.Screen name="PersonalRecords" component={PersonalRecordsScreen} />
                </>
              )
            ) : pendingVerification ? (
              // ── Email pending verification ─────────────────────────────────
              <>
                <RootStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
                <RootStack.Screen name="Login" component={LoginScreen} />
                <RootStack.Screen name="PasswordResetSent" component={PasswordResetSentScreen} />
              </>
            ) : (
              // ── Unauthenticated ────────────────────────────────────────────
              <>
                <RootStack.Screen name="Login" component={LoginScreen} />
                <RootStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
                <RootStack.Screen name="PasswordResetSent" component={PasswordResetSentScreen} />
              </>
            )}
          </RootStack.Navigator>

          <SettingsModal
            visible={settingsVisible}
            onClose={() => setSettingsVisible(false)}
            onNavigate={handleSettingsNavigate}
          />
        </NavigationContainer>

        {/* Training-data loading overlay — keeps NavigationContainer mounted
            so it never triggers the white-screen remount flash. */}
        {user && !trainingDataReady && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.background,
            }}
          >
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}
      </SafeAreaProvider>
    </SettingsOpenContext.Provider>
  );
}
