const hasValue = (value) => String(value ?? '').trim().length > 0;

const normalizeSet = (set) => {
  if (set?.duration !== undefined) {
    return { ...set, duration: String(set.duration ?? '').trim() };
  }
  return {
    ...set,
    weight: String(set?.weight ?? '').trim(),
    reps: String(set?.reps ?? '').trim(),
  };
};

const sanitizeExercise = (exercise) => ({
  ...exercise,
  name: String(exercise?.name ?? '').trim(),
  sets: Array.isArray(exercise?.sets) ? exercise.sets.map(normalizeSet) : [],
});

export const prepareRoutineForSave = ({ name, exercises }) => {
  const trimmedName = String(name ?? '').trim();
  const sanitizedExercises = (Array.isArray(exercises) ? exercises : [])
    .map(sanitizeExercise)
    .filter((exercise) => hasValue(exercise.name) && exercise.sets.length > 0);

  if (!trimmedName) {
    return { isValid: false, message: 'Add a routine name before saving.' };
  }

  if (sanitizedExercises.length === 0) {
    return { isValid: false, message: 'Add at least one named exercise before saving the routine.' };
  }

  return {
    isValid: true,
    routine: {
      name: trimmedName,
      exercises: sanitizedExercises,
    },
  };
};

export const prepareWorkoutForSave = ({ name, exercises, comments }) => {
  const trimmedName = String(name ?? '').trim();
  const sanitizedExercises = (Array.isArray(exercises) ? exercises : [])
    .map(sanitizeExercise)
    .filter(
      (exercise) =>
        hasValue(exercise.name) &&
        exercise.sets.some(
          (set) =>
            hasValue(set.weight) ||
            hasValue(set.reps) ||
            Boolean(set.completed) ||
            hasValue(set.duration)
        )
    );

  if (!trimmedName) {
    return { isValid: false, message: 'Add a workout name before saving.' };
  }

  if (sanitizedExercises.length === 0) {
    return { isValid: false, message: 'Log at least one exercise set before saving the workout.' };
  }

  return {
    isValid: true,
    workout: {
      name: trimmedName,
      comments: String(comments ?? '').trim(),
      exercises: sanitizedExercises,
    },
  };
};
