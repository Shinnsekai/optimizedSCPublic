import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deleteRoutineFromDatabase,
  deleteWorkoutFromDatabase,
  saveRoutineToDatabase,
  saveWorkoutToDatabase,
} from '../services/trainingDataService';
import { convertTrainingDataWeights } from '../utils/unitConversion';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      pendingVerification: null,
      activeWorkoutSession: null,
      trainingDataReady: true,
      // userProfile: undefined = not yet loaded, null = loaded but none exists
      userProfile: undefined,
      // welcomePending: true only on first login after profile setup
      welcomePending: false,
      setUserProfile: (userProfile) => set({ userProfile }),
      clearUserProfile: () => set({ userProfile: undefined }),
      setWelcomePending: (welcomePending) => set({ welcomePending }),
      setUser: (user) => set({ user, pendingVerification: null }),
      setPendingVerification: (pendingVerification) => set({ pendingVerification }),
      clearPendingVerification: () => set({ pendingVerification: null }),
      startWorkoutSession: (session) =>
        set({
          activeWorkoutSession: {
            sessionVersion: 1,
            startedAt: session?.startedAt || Date.now(),
            routine: session?.routine || null,
            workoutName: session?.workoutName || session?.routine?.name || 'Quick Workout',
            comments: session?.comments || '',
            exercises: session?.exercises || [],
          },
        }),
      updateWorkoutSession: (updates) =>
        set((state) => ({
          activeWorkoutSession: state.activeWorkoutSession
            ? {
                ...state.activeWorkoutSession,
                ...updates,
              }
            : state.activeWorkoutSession,
        })),
      clearWorkoutSession: () => set({ activeWorkoutSession: null }),
      clearUser: () =>
        set({
          user: null,
          pendingVerification: null,
          activeWorkoutSession: null,
          routines: [],
          workouts: [],
          trainingDataReady: true,
          userProfile: undefined,
          welcomePending: false,
        }),
      setTrainingDataReady: (trainingDataReady) => set({ trainingDataReady }),
      setRoutines: (routines) => set({ routines }),
      setWorkouts: (workouts) => set({ workouts }),
      
      routines: [],
      addRoutine: async (routine) => {
        const savedRoutine = { ...routine, id: routine.id || Date.now().toString() };
        set((state) => ({
          routines: [...state.routines, savedRoutine]
        }));

        try {
          await saveRoutineToDatabase(get().user, savedRoutine);
        } catch (error) {
          console.warn('Routine sync failed:', error);
        }

        return savedRoutine;
      },
      deleteRoutine: async (id) => {
        set((state) => ({
          routines: state.routines.filter(r => r.id !== id)
        }));

        try {
          await deleteRoutineFromDatabase(get().user, id);
        } catch (error) {
          console.warn('Routine delete sync failed:', error);
        }
      },
      
      workouts: [],
      addWorkout: async (workout) => {
        const savedWorkout = { ...workout, id: workout.id || Date.now().toString() };
        set((state) => ({
          workouts: [...state.workouts, savedWorkout]
        }));

        try {
          await saveWorkoutToDatabase(get().user, savedWorkout);
        } catch (error) {
          console.warn('Workout sync failed:', error);
        }

        return savedWorkout;
      },
      deleteWorkout: async (id) => {
        set((state) => ({
          workouts: state.workouts.filter(w => w.id !== id)
        }));

        try {
          await deleteWorkoutFromDatabase(get().user, id);
        } catch (error) {
          console.warn('Workout delete sync failed:', error);
        }
      },
      
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),

      unit: 'kg',
      setUnit: async (nextUnit) => {
        const currentUnit = get().unit;

        if (!nextUnit || currentUnit === nextUnit) {
          set({ unit: nextUnit || currentUnit });
          return;
        }

        const { routines, workouts } = convertTrainingDataWeights({
          routines: get().routines,
          workouts: get().workouts,
          fromUnit: currentUnit,
          toUnit: nextUnit,
        });

        set({
          unit: nextUnit,
          routines,
          workouts,
        });

        try {
          await Promise.all([
            ...routines.map((routine) => saveRoutineToDatabase(get().user, routine)),
            ...workouts.map((workout) => saveWorkoutToDatabase(get().user, workout)),
          ]);
        } catch (error) {
          console.warn('Unit conversion sync failed:', error);
        }
      },
    }),
    {
      name: 'optimized-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        unit: state.unit,
        activeWorkoutSession: state.activeWorkoutSession,
      }),
      migrate: (persistedState) => {
        const session = persistedState?.activeWorkoutSession;
        const hasValidSession =
          session?.sessionVersion === 1 &&
          Number.isFinite(session?.startedAt);

        return {
          theme: persistedState?.theme ?? 'dark',
          language: persistedState?.language ?? 'en',
          unit: persistedState?.unit ?? 'kg',
          activeWorkoutSession: hasValidSession ? session : null,
        };
      },
    }
  )
);
