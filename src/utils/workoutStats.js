/**
 * Shared helpers for workout volume calculations and progression stats.
 * Used by WorkoutDetailScreen, ProgressionScreen, and any future analytics.
 */

// ─── Volume ──────────────────────────────────────────────────────────────────

/**
 * Returns the volume contribution of a single set.
 * If the set has weight, use weight × reps (standard tonnage).
 * If bodyweight exercise (weight = 0), use bodyWeight × reps so that
 * bodyweight sets are comparable in scale to loaded sets.
 */
export const getSetContribution = (set, bodyWeight = 70) => {
  const weight = Number(set.weight) || 0;
  const reps = Number(set.reps) || 0;

  if (weight > 0 && reps > 0) return weight * reps;
  if (reps > 0) return bodyWeight * reps;
  return set.completed ? bodyWeight : 0;
};

/**
 * Returns total volume for an entire workout.
 */
export const getWorkoutVolume = (workout, bodyWeight = 70) =>
  (workout.exercises || []).reduce(
    (sum, ex) =>
      sum + (ex.sets || []).reduce((s, set) => s + getSetContribution(set, bodyWeight), 0),
    0
  );

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns the Monday-aligned start of the ISO week that contains the given date.
 * (We use Sunday=0 as the week start to match JavaScript's getDay().)
 */
export const getWeekStart = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 = Sun
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const formatWeekBarLabel = (weekStart) => {
  return `${weekStart.getDate()} ${MONTH_SHORT[weekStart.getMonth()]}`;
};

export const formatMonthLabel = (date) => MONTH_SHORT[date.getMonth()];

// ─── Streak ───────────────────────────────────────────────────────────────────

/**
 * Returns { currentStreak, bestStreak } in days from an array of workouts.
 */
export const calculateStreaks = (workouts) => {
  if (!workouts || workouts.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const MS_DAY = 86400000;
  const today = new Date().setHours(0, 0, 0, 0);

  const uniqueDays = [
    ...new Set(workouts.map((w) => new Date(w.date).setHours(0, 0, 0, 0))),
  ].sort((a, b) => a - b);

  let bestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i] - uniqueDays[i - 1] === MS_DAY) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);

  // Current streak: walk backwards from today
  const sortedDesc = [...uniqueDays].sort((a, b) => b - a);
  let currentStreak = 0;

  if (sortedDesc[0] === today || sortedDesc[0] === today - MS_DAY) {
    currentStreak = 1;
    let check = sortedDesc[0];
    for (let i = 1; i < sortedDesc.length; i++) {
      if (check - sortedDesc[i] === MS_DAY) {
        currentStreak++;
        check = sortedDesc[i];
      } else {
        break;
      }
    }
  }

  return { currentStreak, bestStreak: uniqueDays.length > 0 ? bestStreak : 0 };
};

// ─── Weekly buckets ───────────────────────────────────────────────────────────

/**
 * Returns an array of the last `numWeeks` weeks, each with:
 *   { weekStart, label, volume, durationMs, count, isCurrent }
 */
export const buildWeeklyBuckets = (workouts, bodyWeight = 70, numWeeks = 8) => {
  const weekMap = {};

  (workouts || []).forEach((workout) => {
    const ws = getWeekStart(workout.date);
    const key = ws.getTime();
    if (!weekMap[key]) {
      weekMap[key] = { weekStart: ws, volume: 0, durationMs: 0, count: 0 };
    }
    weekMap[key].volume += getWorkoutVolume(workout, bodyWeight);
    weekMap[key].durationMs += workout.durationMs || 0;
    weekMap[key].count += 1;
  });

  const today = new Date();
  const currentWeekStart = getWeekStart(today.toISOString());
  const MS_WEEK = 7 * 24 * 3600000;
  const result = [];

  for (let i = numWeeks - 1; i >= 0; i--) {
    const ws = new Date(currentWeekStart.getTime() - i * MS_WEEK);
    const key = ws.getTime();
    const data = weekMap[key] || { weekStart: ws, volume: 0, durationMs: 0, count: 0 };
    result.push({
      ...data,
      weekStart: ws,
      label: i === 0 ? 'Now' : `${ws.getDate()} ${MONTH_SHORT[ws.getMonth()]}`,
      isCurrent: i === 0,
    });
  }

  return result;
};

// ─── All-time grouped data ────────────────────────────────────────────────────

/**
 * Groups workouts by the given period ('Daily' | 'Weekly' | 'Monthly' | 'Yearly').
 * Returns sorted array of { label, volume, durationMs, count }.
 */
export const buildPeriodBuckets = (workouts, period, bodyWeight = 70) => {
  const groups = {};

  (workouts || []).forEach((workout) => {
    const date = new Date(workout.date);
    let key, label;

    if (period === 'Daily') {
      key = workout.date.split('T')[0];
      label = `${date.getDate()}/${date.getMonth() + 1}`;
    } else if (period === 'Weekly') {
      const ws = getWeekStart(workout.date);
      key = ws.getTime().toString();
      label = `${ws.getDate()}/${ws.getMonth() + 1}`;
    } else if (period === 'Monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      label = `${MONTH_SHORT[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
    } else {
      key = date.getFullYear().toString();
      label = key;
    }

    if (!groups[key]) groups[key] = { label, volume: 0, durationMs: 0, count: 0 };
    groups[key].volume += getWorkoutVolume(workout, bodyWeight);
    groups[key].durationMs += workout.durationMs || 0;
    groups[key].count += 1;
  });

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data);
};

// ─── Personal bests ───────────────────────────────────────────────────────────

/**
 * Returns top personal bests sorted by how frequently the exercise was performed.
 * Each entry: { name, weight, reps, date, count }
 */
export const buildPersonalBests = (workouts, limit = 12) => {
  const bests = {};
  const counts = {};

  (workouts || []).forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      const name = exercise.name;
      counts[name] = (counts[name] || 0) + 1;

      (exercise.sets || []).forEach((set) => {
        const w = Number(set.weight) || 0;
        const r = Number(set.reps) || 0;
        if (w > 0) {
          if (!bests[name] || w > bests[name].weight) {
            bests[name] = { weight: w, reps: r, date: workout.date };
          }
        }
      });
    });
  });

  return Object.entries(bests)
    .map(([name, data]) => ({ name, ...data, count: counts[name] || 1 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};
