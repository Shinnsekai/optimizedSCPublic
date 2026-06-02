const KG_TO_LBS = 2.20462;

const roundWeight = (value) => String(Math.round(value));

export function convertWeightValue(value, fromUnit, toUnit) {
  const trimmedValue = String(value ?? '').trim();

  if (!trimmedValue || fromUnit === toUnit) {
    return trimmedValue;
  }

  const numericValue = Number(trimmedValue);

  if (!Number.isFinite(numericValue)) {
    return trimmedValue;
  }

  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return roundWeight(numericValue * KG_TO_LBS);
  }

  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return roundWeight(numericValue / KG_TO_LBS);
  }

  return trimmedValue;
}

const convertSets = (sets, fromUnit, toUnit) =>
  (Array.isArray(sets) ? sets : []).map((set) => ({
    ...set,
    weight: convertWeightValue(set?.weight, fromUnit, toUnit),
  }));

const convertExercises = (exercises, fromUnit, toUnit) =>
  (Array.isArray(exercises) ? exercises : []).map((exercise) => ({
    ...exercise,
    sets: convertSets(exercise?.sets, fromUnit, toUnit),
  }));

export function convertRoutineWeights(routine, fromUnit, toUnit) {
  return {
    ...routine,
    exercises: convertExercises(routine?.exercises, fromUnit, toUnit),
  };
}

export function convertWorkoutWeights(workout, fromUnit, toUnit) {
  return {
    ...workout,
    exercises: convertExercises(workout?.exercises, fromUnit, toUnit),
  };
}

export function convertTrainingDataWeights({ routines, workouts, fromUnit, toUnit }) {
  if (fromUnit === toUnit) {
    return {
      routines: Array.isArray(routines) ? routines : [],
      workouts: Array.isArray(workouts) ? workouts : [],
    };
  }

  return {
    routines: (Array.isArray(routines) ? routines : []).map((routine) =>
      convertRoutineWeights(routine, fromUnit, toUnit)
    ),
    workouts: (Array.isArray(workouts) ? workouts : []).map((workout) =>
      convertWorkoutWeights(workout, fromUnit, toUnit)
    ),
  };
}
