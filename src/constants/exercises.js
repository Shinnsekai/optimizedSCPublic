const CANONICAL_EXERCISE_NAMES = [
  '45-Degree Hip Extension',
  'Ab Wheel Rollout',
  'Abductor Machine',
  'Adductor Machine',
  'Arnold Press',
  'Assisted Dip Machine',
  'Assisted Pull-Up Machine',
  'Back Extension Machine',
  'Barbell Bench Press',
  'Barbell Curl',
  'Barbell Front Squat',
  'Barbell Glute Bridge',
  'Barbell Good Morning',
  'Barbell Hack Squat',
  'Barbell Hip Thrust',
  'Barbell Overhead Press',
  'Barbell Rear Delt Row',
  'Barbell Row',
  'Barbell Shrug',
  'Bayesian Cable Curl',
  'Behind-the-Back Cable Lateral Raise',
  'Bent-Over Dumbbell Rear Delt Fly',
  'Belt Squat',
  'B-Stance Romanian Deadlift',
  'Body Saw',
  'Box Jump',
  'Broad Jump',
  'Bulgarian Split Squat',
  'Cable Adduction',
  'Cable Crunch',
  'Cable Curl (EZ Attachment)',
  'Cable External Rotation',
  'Cable Fly',
  'Cable Front Raise',
  'Cable Glute Kickback',
  'Cable Hammer Curl',
  'Cable High-to-Low Fly',
  'Cable Internal Rotation',
  'Cable Lateral Raise',
  'Cable Low-to-High Fly',
  'Cable Pressdown',
  'Cable Pronation',
  'Cable Pullover',
  'Cable Rear Delt Fly',
  'Cable Reverse Crunch',
  'Cable Reverse Wrist Curl',
  'Cable Supination',
  'Cable Upright Row',
  'Cable Wood Chop',
  'Cable Wrist Curl',
  'Cable Y-Raise',
  'Chest-Supported Dumbbell Row',
  'Chest-Supported T-Bar Row',
  'Chin-Up',
  'Close-Grip Barbell Bench Press',
  'Close-Grip Cable Lat Pulldown',
  'Close-Grip Push-Up',
  'Copenhagen Plank',
  'Conventional Deadlift',
  'Countermovement Jump',
  'Cross-Body Cable Lateral Raise',
  'Cross-Body Cable Triceps Extension',
  'Cuban Press',
  'Cyclist Squat',
  'Decline Barbell Bench Press',
  'Decline Dumbbell Bench Press',
  'Decline Sit-Up',
  'Dead Bug',
  'Dead-Stop Row',
  'Deficit Push-Up',
  'Deficit Romanian Deadlift',
  'Depth Jump',
  'Dip',
  'Donkey Calf Raise',
  'Dragon Flag',
  'Drop Jump',
  'Dumbbell Curl',
  'Dumbbell Front Raise',
  'Dumbbell Hammer Curl',
  'Dumbbell Lateral Raise',
  'Dumbbell Pronation',
  'Dumbbell Pullover',
  'Dumbbell Shrug',
  'Dumbbell Supination',
  'Dumbbell Wrist Curl',
  'EZ-Bar Curl',
  'EZ-Bar Skull Crusher',
  'Face Pull (Rope Cable)',
  'Finger Curl',
  'Flat Dumbbell Bench Press',
  'Floor Press',
  'Front Foot Elevated Split Squat',
  'Front Plate Raise',
  'Frog Pump',
  'Garhammer Raise',
  'Glute Bridge',
  'Glute-Ham Raise',
  'Hack Squat',
  'Hammer Strength Chest Press',
  'Hammer Strength High Row',
  'Hammer Curl (Rope Cable)',
  'Hammer Lever Pronation',
  'Hammer Lever Supination',
  'Hanging Knee Raise',
  'Hanging Leg Raise',
  'Heel-Elevated Goblet Squat',
  'Heel-Elevated Smith Machine Squat',
  'Hex Press',
  'High-Bar Back Squat',
  'Hollow Body Hold',
  'Incline Barbell Bench Press',
  'Incline Cable Curl',
  'Incline Cable Fly',
  'Incline Cable Press',
  'Incline Dumbbell Bench Press',
  'Incline Dumbbell Curl',
  'Incline Machine Chest Press',
  'JM Press',
  'Kelso Shrug',
  'Kneeling Cable Crunch',
  'Larsen Press',
  'Landmine Press',
  'Lateral Bound',
  'Leg Extension',
  'Leg Press',
  'Leg Press Calf Raise',
  'Lean-Away Cable Lateral Raise',
  'Lying Leg Curl',
  'Lying Leg Raise',
  'Lu Raise',
  'Machine Chest Press',
  'Machine Crunch',
  'Machine Dip',
  'Machine Lateral Raise',
  'Machine Lat Pulldown',
  'Machine Preacher Curl',
  'Machine Rear Delt Fly',
  'Machine Row',
  'Machine Shoulder Press',
  'Meadows Row',
  'Medicine Ball Chest Pass',
  'Medicine Ball Rotational Throw',
  'Neutral-Grip Cable Lat Pulldown',
  'Neutral-Grip Pull-Up',
  'Nordic Hamstring Curl',
  'One-Arm Cable Curl',
  'One-Arm Cable Row',
  'One-Arm Dumbbell Row',
  'Overhead Cable Triceps Extension',
  'Overhead Medicine Ball Slam',
  'Paused Barbell Bench Press',
  'Paused Front Squat',
  'Paused Romanian Deadlift',
  'Pallof Press',
  'Pec Deck Fly',
  'Pendlay Row',
  'Pendulum Squat',
  'Pistol Squat',
  'PJR Pullover',
  'Plate Pinch Hold',
  'Plyometric Push-Up',
  'Pogo Jump',
  'Preacher Curl',
  'Prone Incline Y-Raise',
  'Pull-Up',
  'Weighted Pull-Up',
  'Push-Up',
  'Rack Pull',
  'Rear Delt Cable Row',
  'Rear-Foot Elevated Split Squat',
  'Reverse Crunch',
  'Reverse Curl (EZ-Bar)',
  'Reverse Lunge',
  'Reverse Pec Deck',
  'Ring Push-Up',
  'Rolling Dumbbell Triceps Extension',
  'Roman Chair Leg Raise',
  'Romanian Deadlift',
  'Rope Pressdown',
  'RKC Plank',
  'Russian Twist',
  'Safety Bar Squat',
  'Seal Row',
  'Seated Calf Raise Machine',
  'Seated Cable Row',
  'Seated Dumbbell Lateral Raise',
  'Seated Dumbbell Shoulder Press',
  'Seated Leg Curl',
  'Seated Machine Dip',
  'Single-Arm Cable Lateral Raise',
  'Single-Arm Cable Pressdown',
  'Single-Arm Lat Pulldown',
  'Single-Leg Box Jump',
  'Single-Leg Calf Raise',
  'Single-Leg Hip Thrust',
  'Single-Leg Romanian Deadlift',
  'Single-Leg Smith Machine Hip Thrust',
  'Sissy Squat',
  'Skater Jump',
  'Smith Machine Flat Bench Press',
  'Smith Machine Hip Thrust',
  'Smith Machine Incline Bench Press',
  'Smith Machine Shoulder Press',
  'Smith Machine Split Squat',
  'Smith Machine Squat',
  'Snatch-Grip Romanian Deadlift',
  'Spider Curl',
  'Spoto Press',
  'Split Squat Jump',
  'Stability Ball Crunch',
  'Standing Calf Raise Machine',
  'Standing Dumbbell Shoulder Press',
  'Standing Single-Arm Cable Crunch',
  'Step-Up',
  'Stir-the-Pot',
  'Straight-Arm Cable Pulldown',
  'Stretch-Mediated Cable Fly',
  'Svend Press',
  'Swiss Ball Pike',
  'Tate Press',
  'Tibialis Raise',
  'Toes-to-Bar',
  'Trap Bar Deadlift',
  'TRX Pike',
  'Tuck Jump',
  'Upright Row (EZ-Bar)',
  'V-Up',
  'Walking Lunge',
  'Weighted Crunch',
  'Weighted Dip',
  'Weighted Plank',
  'Wide-Grip Cable Lat Pulldown',
  'Wide-Grip Pull-Up',
  'Wrist Roller',
  'Y-Raise (Dumbbell)',
  // ─── Cardio ──────────────────────────────────────────────────────────
  'Battle Ropes',
  'Elliptical Trainer',
  'HIIT Cardio',
  'Jump Rope',
  'Outdoor Cycling',
  'Outdoor Run',
  'Rowing Machine',
  'Sled Pull',
  'Sled Push',
  'Sprint Intervals',
  'Stair Climber',
  'Stationary Bike',
  'Swimming',
  'Treadmill Run',
  'Walking',
];

const EXTRA_EXERCISE_ALIASES = {
  'Barbell Bench Press': ['Bench Press', 'Bench Presses'],
  'Pull-Up': ['Pullup', 'Pullups', 'Pull Up', 'Pull Ups', 'Pull-Ups'],
  'Weighted Pull-Up': ['Weighted Pullup', 'Weighted Pullups', 'Weighted Pull Up', 'Weighted Pull Ups', 'Weighted Pull-Ups'],
  'Push-Up': ['Pushup', 'Pushups', 'Push Up', 'Push Ups', 'Push-Ups'],
  'Chin-Up': ['Chinup', 'Chinups', 'Chin Up', 'Chin Ups', 'Chin-Ups'],
  'Dip': ['Dips'],
  'Weighted Dip': ['Weighted Dips'],
  'EZ-Bar Skull Crusher': ['Skull Crusher (EZ-Bar)', 'Skull Crushers (EZ-Bar)', 'EZ-Bar Skull Crushers'],
  'Single-Arm Cable Pressdown': ['Single-Arm Cable Pushdown', 'Single Arm Cable Pressdown', 'Single Arm Cable Pushdown'],
  'Assisted Pull-Up Machine': ['Assisted Pullup Machine', 'Assisted Pull-Up', 'Assisted Pullup'],
  'Wide-Grip Pull-Up': ['Wide Grip Pull-Up', 'Wide Grip Pullup', 'Wide Grip Pullups', 'Wide-Grip Pullups'],
  'Neutral-Grip Pull-Up': ['Neutral Grip Pull-Up', 'Neutral Grip Pullup', 'Neutral Grip Pullups', 'Neutral-Grip Pullups'],
  'Close-Grip Barbell Bench Press': ['Close Grip Bench Press', 'Close-Grip Bench Press'],
  'Jump Rope': ['Skipping', 'Jump Ropes', 'Skipping Rope'],
  'Treadmill Run': ['Treadmill', 'Running (Treadmill)', 'Treadmill Running'],
  'Outdoor Run': ['Running', 'Jogging', 'Outdoor Running'],
  'Stationary Bike': ['Bike', 'Cycling (Stationary)', 'Spin Bike'],
  'Outdoor Cycling': ['Cycling', 'Biking', 'Road Cycling'],
  'Elliptical Trainer': ['Elliptical', 'Cross Trainer'],
  'Rowing Machine': ['Rowing', 'Rower', 'Erg', 'Ergometer'],
  'Stair Climber': ['Stairmaster', 'Stairs', 'Step Machine'],
  'Battle Ropes': ['Battle Rope'],
  'Sprint Intervals': ['Sprints', 'Sprint', 'Interval Sprints'],
  'HIIT Cardio': ['HIIT', 'High Intensity Interval Training'],
  'Sled Push': ['Prowler Push'],
  'Sled Pull': ['Prowler Pull'],
};

const MUSCLE_TO_BODY_PART = {
  chest: 'Chest',
  frontDelts: 'Shoulders',
  sideDelts: 'Shoulders',
  rearDelts: 'Shoulders',
  rotatorCuff: 'Shoulders',
  lats: 'Back',
  rhomboids: 'Back',
  upperBack: 'Back',
  traps: 'Back',
  spinalErectors: 'Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Abs',
  hipFlexors: 'Abs',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  adductors: 'Adductors',
  calves: 'Calves',
  tibialis: 'Calves',
  other: 'Other',
};

const PROFILE_MUSCLE_SPLITS = {
  ABS_FLEXION: { abs: 65, hipFlexors: 25, obliques: 10 },
  ABS_STABILITY: { abs: 55, obliques: 25, hipFlexors: 20 },
  ABS_ROTATION: { obliques: 55, abs: 30, hipFlexors: 15 },
  CORE_ROTATION_POWER: { obliques: 35, abs: 20, frontDelts: 10, chest: 10, quads: 10, glutes: 10, upperBack: 5 },
  ABS_POWER: { abs: 35, obliques: 20, lats: 15, frontDelts: 10, triceps: 10, glutes: 10 },
  CHEST_PRESS_HORIZONTAL: { chest: 55, triceps: 25, frontDelts: 20 },
  CHEST_PRESS_INCLINE: { chest: 50, frontDelts: 30, triceps: 20 },
  CHEST_PRESS_DECLINE: { chest: 60, triceps: 25, frontDelts: 15 },
  CLOSE_GRIP_PRESS: { triceps: 45, chest: 35, frontDelts: 20 },
  CHEST_FLY: { chest: 80, frontDelts: 20 },
  CHEST_FLY_LOWER: { chest: 85, frontDelts: 15 },
  CHEST_FLY_UPPER: { chest: 70, frontDelts: 30 },
  PUSH_UP: { chest: 50, triceps: 30, frontDelts: 20 },
  CLOSE_PUSH_UP: { triceps: 45, chest: 35, frontDelts: 20 },
  DIP_CHEST_BIAS: { chest: 45, triceps: 35, frontDelts: 20 },
  DIP_TRICEPS_BIAS: { triceps: 50, chest: 30, frontDelts: 20 },
  CHEST_POWER: { chest: 50, triceps: 20, frontDelts: 15, abs: 10, obliques: 5 },
  DUMBBELL_PULLOVER: { chest: 40, lats: 35, triceps: 15, frontDelts: 10 },
  LAT_ISO: { lats: 70, upperBack: 10, triceps: 10, forearms: 10 },
  VERTICAL_PULL: { lats: 45, upperBack: 20, biceps: 20, forearms: 15 },
  CHIN_UP: { lats: 35, biceps: 30, upperBack: 20, forearms: 15 },
  ROW: { lats: 30, upperBack: 35, rearDelts: 10, biceps: 15, forearms: 10 },
  REAR_DELT_ROW: { rearDelts: 35, upperBack: 30, lats: 15, biceps: 10, forearms: 10 },
  SHRUG: { traps: 80, forearms: 20 },
  DEADLIFT: { glutes: 25, hamstrings: 25, spinalErectors: 20, upperBack: 15, quads: 10, forearms: 5 },
  RACK_PULL: { spinalErectors: 25, traps: 25, upperBack: 20, glutes: 15, hamstrings: 10, forearms: 5 },
  TRAP_BAR_DEADLIFT: { quads: 30, glutes: 25, hamstrings: 20, spinalErectors: 15, upperBack: 5, forearms: 5 },
  SHOULDER_PRESS: { frontDelts: 45, sideDelts: 30, triceps: 25 },
  LANDMINE_PRESS: { frontDelts: 40, chest: 30, triceps: 30 },
  LATERAL_RAISE: { sideDelts: 85, traps: 15 },
  FRONT_RAISE: { frontDelts: 85, chest: 15 },
  REAR_DELT: { rearDelts: 70, upperBack: 20, traps: 10 },
  FACE_PULL: { rearDelts: 45, upperBack: 25, rotatorCuff: 20, traps: 10 },
  UPRIGHT_ROW: { sideDelts: 45, traps: 35, frontDelts: 20 },
  ROTATOR_CUFF: { rotatorCuff: 75, rearDelts: 25 },
  CUBAN_PRESS: { rotatorCuff: 35, sideDelts: 25, frontDelts: 20, rearDelts: 20 },
  Y_RAISE: { rearDelts: 25, sideDelts: 20, traps: 20, rotatorCuff: 15, upperBack: 20 },
  BICEPS_CURL: { biceps: 75, forearms: 25 },
  HAMMER_CURL: { biceps: 45, forearms: 55 },
  REVERSE_CURL: { forearms: 60, biceps: 40 },
  TRICEPS_EXTENSION: { triceps: 90, frontDelts: 10 },
  JM_PRESS: { triceps: 65, chest: 15, frontDelts: 20 },
  TATE_PRESS: { triceps: 85, chest: 15 },
  PJR_PULLOVER: { triceps: 60, lats: 20, chest: 20 },
  FOREARM_ISO: { forearms: 100 },
  ADDUCTOR_ISO: { adductors: 100 },
  ABDUCTOR_ISO: { glutes: 100 },
  HIP_EXTENSION: { glutes: 60, hamstrings: 25, spinalErectors: 15 },
  HIP_THRUST: { glutes: 70, hamstrings: 20, adductors: 10 },
  GLUTE_ISO: { glutes: 80, hamstrings: 20 },
  HINGE: { hamstrings: 45, glutes: 30, spinalErectors: 15, adductors: 10 },
  LEG_CURL: { hamstrings: 85, glutes: 15 },
  QUAD_SQUAT: { quads: 45, glutes: 30, adductors: 15, hamstrings: 10 },
  FRONT_SQUAT: { quads: 50, glutes: 25, adductors: 15, spinalErectors: 10 },
  HACK_SQUAT: { quads: 55, glutes: 25, adductors: 10, hamstrings: 10 },
  LEG_PRESS: { quads: 50, glutes: 30, adductors: 10, hamstrings: 10 },
  SPLIT_SQUAT: { quads: 40, glutes: 35, adductors: 15, hamstrings: 10 },
  LUNGE: { quads: 35, glutes: 35, adductors: 20, hamstrings: 10 },
  STEP_UP: { quads: 35, glutes: 35, hamstrings: 15, adductors: 15 },
  LEG_EXTENSION: { quads: 100 },
  LOWER_BODY_PLYO: { quads: 35, glutes: 30, calves: 20, hamstrings: 10, adductors: 5 },
  LATERAL_PLYO: { glutes: 40, quads: 25, calves: 20, hamstrings: 10, adductors: 5 },
  CALF_RAISE: { calves: 100 },
  TIBIALIS_RAISE: { tibialis: 100 },
  OTHER: { other: 100 },
};

const normalizeExerciseKey = (exerciseName) =>
  String(exerciseName ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const hasAnyMatch = (normalizedName, values) =>
  values.some((value) => normalizedName.includes(value));

const buildBodyPartBreakdown = (muscleBreakdown) => {
  const bodyPartBreakdown = {};

  Object.entries(muscleBreakdown).forEach(([muscle, percentage]) => {
    const bodyPart = MUSCLE_TO_BODY_PART[muscle] || 'Other';
    bodyPartBreakdown[bodyPart] = (bodyPartBreakdown[bodyPart] || 0) + percentage;
  });

  return bodyPartBreakdown;
};

const getTopBodyPart = (bodyPartBreakdown) =>
  Object.entries(bodyPartBreakdown)
    .sort((first, second) => second[1] - first[1])[0]?.[0] || 'Other';

const resolveProfileKey = (exerciseName) => {
  const normalizedName = normalizeExerciseKey(exerciseName);

  if (hasAnyMatch(normalizedName, ['machine dip', 'seated machine dip'])) {
    return 'DIP_TRICEPS_BIAS';
  }

  if (hasAnyMatch(normalizedName, ['jm press'])) {
    return 'JM_PRESS';
  }

  if (hasAnyMatch(normalizedName, ['tate press'])) {
    return 'TATE_PRESS';
  }

  if (hasAnyMatch(normalizedName, ['pjr pullover'])) {
    return 'PJR_PULLOVER';
  }

  if (hasAnyMatch(normalizedName, ['skull crusher', 'pressdown', 'pushdown', 'triceps extension', 'rolling dumbbell triceps extension'])) {
    return 'TRICEPS_EXTENSION';
  }

  if (hasAnyMatch(normalizedName, ['close grip barbell bench press'])) {
    return 'CLOSE_GRIP_PRESS';
  }

  if (hasAnyMatch(normalizedName, ['close grip push up'])) {
    return 'CLOSE_PUSH_UP';
  }

  if (hasAnyMatch(normalizedName, ['weighted dip', 'dip', 'assisted dip machine'])) {
    return 'DIP_CHEST_BIAS';
  }

  if (hasAnyMatch(normalizedName, ['incline barbell bench press', 'incline dumbbell bench press', 'incline machine chest press', 'smith machine incline bench press', 'incline cable press'])) {
    return 'CHEST_PRESS_INCLINE';
  }

  if (hasAnyMatch(normalizedName, ['decline barbell bench press', 'decline dumbbell bench press'])) {
    return 'CHEST_PRESS_DECLINE';
  }

  if (hasAnyMatch(normalizedName, ['barbell bench press', 'flat dumbbell bench press', 'floor press', 'hammer strength chest press', 'machine chest press', 'larsen press', 'spoto press', 'paused barbell bench press', 'smith machine flat bench press'])) {
    return 'CHEST_PRESS_HORIZONTAL';
  }

  if (hasAnyMatch(normalizedName, ['cable high to low fly'])) {
    return 'CHEST_FLY_LOWER';
  }

  if (hasAnyMatch(normalizedName, ['cable low to high fly', 'incline cable fly'])) {
    return 'CHEST_FLY_UPPER';
  }

  if (hasAnyMatch(normalizedName, ['cable fly', 'pec deck fly', 'stretch mediated cable fly', 'svend press', 'hex press'])) {
    return 'CHEST_FLY';
  }

  if (hasAnyMatch(normalizedName, ['medicine ball chest pass'])) {
    return 'CHEST_POWER';
  }

  if (hasAnyMatch(normalizedName, ['dumbbell pullover'])) {
    return 'DUMBBELL_PULLOVER';
  }

  if (hasAnyMatch(normalizedName, ['push up', 'deficit push up', 'ring push up', 'plyometric push up'])) {
    return 'PUSH_UP';
  }

  if (hasAnyMatch(normalizedName, ['weighted pull up', 'pull up', 'assisted pull up machine', 'machine lat pulldown', 'lat pulldown'])) {
    return 'VERTICAL_PULL';
  }

  if (hasAnyMatch(normalizedName, ['chin up'])) {
    return 'CHIN_UP';
  }

  if (hasAnyMatch(normalizedName, ['straight arm cable pulldown', 'cable pullover'])) {
    return 'LAT_ISO';
  }

  if (hasAnyMatch(normalizedName, ['barbell rear delt row', 'rear delt cable row'])) {
    return 'REAR_DELT_ROW';
  }

  if (hasAnyMatch(normalizedName, ['face pull'])) {
    return 'FACE_PULL';
  }

  if (hasAnyMatch(normalizedName, ['shrug', 'kelso shrug'])) {
    return 'SHRUG';
  }

  if (hasAnyMatch(normalizedName, ['upright row'])) {
    return 'UPRIGHT_ROW';
  }

  if (hasAnyMatch(normalizedName, ['row', 'high row'])) {
    return 'ROW';
  }

  if (hasAnyMatch(normalizedName, ['conventional deadlift'])) {
    return 'DEADLIFT';
  }

  if (hasAnyMatch(normalizedName, ['rack pull'])) {
    return 'RACK_PULL';
  }

  if (hasAnyMatch(normalizedName, ['trap bar deadlift'])) {
    return 'TRAP_BAR_DEADLIFT';
  }

  if (hasAnyMatch(normalizedName, ['arnold press', 'overhead press', 'shoulder press'])) {
    return 'SHOULDER_PRESS';
  }

  if (hasAnyMatch(normalizedName, ['landmine press'])) {
    return 'LANDMINE_PRESS';
  }

  if (hasAnyMatch(normalizedName, ['lateral raise'])) {
    return 'LATERAL_RAISE';
  }

  if (hasAnyMatch(normalizedName, ['front raise', 'front plate raise'])) {
    return 'FRONT_RAISE';
  }

  if (hasAnyMatch(normalizedName, ['rear delt fly', 'reverse pec deck'])) {
    return 'REAR_DELT';
  }

  if (hasAnyMatch(normalizedName, ['external rotation', 'internal rotation'])) {
    return 'ROTATOR_CUFF';
  }

  if (hasAnyMatch(normalizedName, ['cuban press'])) {
    return 'CUBAN_PRESS';
  }

  if (hasAnyMatch(normalizedName, ['y raise', 'lu raise'])) {
    return 'Y_RAISE';
  }

  if (hasAnyMatch(normalizedName, ['hammer curl'])) {
    return 'HAMMER_CURL';
  }

  if (hasAnyMatch(normalizedName, ['reverse curl'])) {
    return 'REVERSE_CURL';
  }

  if (hasAnyMatch(normalizedName, ['curl', 'preacher'])) {
    return 'BICEPS_CURL';
  }

  if (hasAnyMatch(normalizedName, ['pronation', 'supination', 'wrist curl', 'finger curl', 'plate pinch', 'wrist roller'])) {
    return 'FOREARM_ISO';
  }

  if (hasAnyMatch(normalizedName, ['adductor', 'adduction', 'copenhagen plank'])) {
    return 'ADDUCTOR_ISO';
  }

  if (hasAnyMatch(normalizedName, ['abductor machine'])) {
    return 'ABDUCTOR_ISO';
  }

  if (hasAnyMatch(normalizedName, ['cable glute kickback', 'frog pump'])) {
    return 'GLUTE_ISO';
  }

  if (hasAnyMatch(normalizedName, ['hip thrust', 'glute bridge'])) {
    return 'HIP_THRUST';
  }

  if (hasAnyMatch(normalizedName, ['45 degree hip extension', 'back extension machine'])) {
    return 'HIP_EXTENSION';
  }

  if (hasAnyMatch(normalizedName, ['leg curl', 'glute ham raise', 'nordic hamstring curl'])) {
    return 'LEG_CURL';
  }

  if (hasAnyMatch(normalizedName, ['romanian deadlift', 'good morning'])) {
    return 'HINGE';
  }

  if (hasAnyMatch(normalizedName, ['front squat'])) {
    return 'FRONT_SQUAT';
  }

  if (hasAnyMatch(normalizedName, ['calf raise', 'pogo jump'])) {
    return 'CALF_RAISE';
  }

  if (hasAnyMatch(normalizedName, ['tibialis raise'])) {
    return 'TIBIALIS_RAISE';
  }

  if (hasAnyMatch(normalizedName, ['hack squat', 'cyclist squat', 'pendulum squat', 'heel elevated goblet squat', 'heel elevated smith machine squat', 'sissy squat'])) {
    return 'HACK_SQUAT';
  }

  if (hasAnyMatch(normalizedName, ['belt squat', 'high bar back squat', 'safety bar squat', 'smith machine squat'])) {
    return 'QUAD_SQUAT';
  }

  if (hasAnyMatch(normalizedName, ['leg press'])) {
    return 'LEG_PRESS';
  }

  if (hasAnyMatch(normalizedName, ['bulgarian split squat', 'front foot elevated split squat', 'rear foot elevated split squat', 'smith machine split squat', 'pistol squat'])) {
    return 'SPLIT_SQUAT';
  }

  if (hasAnyMatch(normalizedName, ['reverse lunge', 'walking lunge'])) {
    return 'LUNGE';
  }

  if (hasAnyMatch(normalizedName, ['step up'])) {
    return 'STEP_UP';
  }

  if (hasAnyMatch(normalizedName, ['leg extension'])) {
    return 'LEG_EXTENSION';
  }

  if (hasAnyMatch(normalizedName, ['box jump', 'countermovement jump', 'depth jump', 'drop jump', 'single leg box jump', 'split squat jump', 'tuck jump'])) {
    return 'LOWER_BODY_PLYO';
  }

  if (hasAnyMatch(normalizedName, ['broad jump', 'lateral bound', 'skater jump'])) {
    return 'LATERAL_PLYO';
  }

  if (hasAnyMatch(normalizedName, ['medicine ball rotational throw'])) {
    return 'CORE_ROTATION_POWER';
  }

  if (hasAnyMatch(normalizedName, ['overhead medicine ball slam'])) {
    return 'ABS_POWER';
  }

  if (hasAnyMatch(normalizedName, ['wood chop', 'russian twist', 'pallof press'])) {
    return 'ABS_ROTATION';
  }

  if (hasAnyMatch(normalizedName, ['plank', 'body saw', 'hollow body hold', 'stir the pot'])) {
    return 'ABS_STABILITY';
  }

  if (hasAnyMatch(normalizedName, ['ab wheel', 'crunch', 'sit up', 'dead bug', 'dragon flag', 'garhammer', 'leg raise', 'knee raise', 'roman chair', 'captain s chair', 'v up', 'toes to bar', 'swiss ball pike', 'trx pike'])) {
    return 'ABS_FLEXION';
  }

  return 'OTHER';
};

const getExerciseMuscleBreakdown = (exerciseName) => {
  const profileKey = resolveProfileKey(exerciseName);
  return PROFILE_MUSCLE_SPLITS[profileKey] || { other: 100 };
};

const getExerciseBodyPartBreakdown = (exerciseName) =>
  buildBodyPartBreakdown(getExerciseMuscleBreakdown(exerciseName));

// ─── Fitness-level-aware body-part breakdown ──────────────────────────────────

/**
 * How much the PRIMARY muscle's percentage share shifts (in points) based on
 * the user's gym experience level.
 *
 * Rationale: beginners typically feel secondary/stabiliser muscles more than
 * the intended primary due to weak mind-muscle connection and form compensation.
 * Advanced and Elite lifters can maximally recruit the prime mover.
 *
 *   delta > 0  →  primary gets MORE credit  (advanced recruitment efficiency)
 *   delta < 0  →  primary gets LESS credit  (beginner compensation pattern)
 */
// Optimal values derived from 900-combination grid search against 25 EMG
// reference cases with gap-damping (RMSE = 2.14 pp).
// See test/formulaTest.js to re-run or re-tune.
const FITNESS_LEVEL_PRIMARY_DELTA = {
  Beginner: -10,
  Intermediate: 0,
  Advanced: 4,
  Elite: 10,
};

/**
 * Redistributes a muscle-breakdown object so the primary muscle gains or loses
 * `delta` percentage points, with the change spread proportionally across all
 * secondary muscles.  The result is normalised back to 100 %.
 */
const applyFitnessLevelAdjustment = (muscleBreakdown, fitnessLevel) => {
  const delta = FITNESS_LEVEL_PRIMARY_DELTA[fitnessLevel] ?? 0;
  if (delta === 0) return muscleBreakdown;

  const entries = Object.entries(muscleBreakdown);
  if (entries.length <= 1) return muscleBreakdown;

  // Identify the primary muscle (highest share) and the secondaries
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const [primaryKey, primaryPct] = sorted[0];
  const secondaries = sorted.slice(1);
  const secondaryTotal = secondaries.reduce((s, [, p]) => s + p, 0);

  // Gap-based damping: when the gap between primary and the next-largest muscle
  // is small (< 18 pp), the adjustment is reduced proportionally.
  // Rationale: in highly distributed movements (e.g. rows, deadlifts) no single
  // muscle dominates, so fitness-level recruitment shifts are less pronounced.
  // Fully restores at gap >= 18 pp (isolation exercises, single-joint movements).
  const gap = primaryPct - (sorted[1]?.[1] ?? 0);
  const dampingFactor = Math.min(1, Math.max(0, gap / 18));
  const dampedDelta = delta * dampingFactor;

  // Clamp new primary so it stays in a sensible range
  const rawNew = primaryPct + dampedDelta;
  const newPrimary = Math.min(97, Math.max(primaryPct * 0.6, rawNew));
  const actualDelta = newPrimary - primaryPct;

  if (Math.abs(actualDelta) < 0.5) return muscleBreakdown;

  // Spread the delta proportionally across secondaries
  const newSecondaryTotal = secondaryTotal - actualDelta;
  const adjusted = { [primaryKey]: newPrimary };
  secondaries.forEach(([k, v]) => {
    adjusted[k] = secondaryTotal > 0 ? (v / secondaryTotal) * newSecondaryTotal : v;
  });

  // Normalise to exactly 100 using integer rounding (last key absorbs error)
  const rawTotal = Object.values(adjusted).reduce((s, v) => s + v, 0);
  const keys = Object.keys(adjusted).sort((a, b) => adjusted[b] - adjusted[a]);
  const rounded = {};
  let remainder = 100;
  keys.slice(0, -1).forEach((k) => {
    const r = Math.round((adjusted[k] / rawTotal) * 100);
    rounded[k] = r;
    remainder -= r;
  });
  rounded[keys[keys.length - 1]] = Math.max(0, remainder);

  return rounded;
};

/**
 * Returns the body-part breakdown for an exercise, adjusted for the user's
 * fitness level.  Shifts primary-muscle credit up for advanced lifters and
 * down for beginners to reflect real-world recruitment patterns.
 *
 * Falls back to the standard breakdown when fitnessLevel is undefined.
 */
const getAdjustedBodyPartBreakdown = (exerciseName, fitnessLevel) => {
  const rawMuscles = getExerciseMuscleBreakdown(exerciseName);
  const adjusted = applyFitnessLevelAdjustment(rawMuscles, fitnessLevel);
  return buildBodyPartBreakdown(adjusted);
};

const EXERCISE_LIBRARY = CANONICAL_EXERCISE_NAMES.map((name) => {
  const muscles = getExerciseMuscleBreakdown(name);
  const bodyParts = buildBodyPartBreakdown(muscles);

  return {
    name,
    bodyPart: getTopBodyPart(bodyParts),
    muscles,
    bodyParts,
  };
});

const EXERCISE_OPTIONS = EXERCISE_LIBRARY.map((exercise) => exercise.name);

const EXERCISE_BODY_PART_MAP = EXERCISE_LIBRARY.reduce((lookup, exercise) => {
  lookup[normalizeExerciseKey(exercise.name)] = exercise.bodyPart;
  return lookup;
}, {});

const EXERCISE_CANONICAL_LOOKUP = EXERCISE_OPTIONS.reduce((lookup, exerciseName) => {
  lookup[normalizeExerciseKey(exerciseName)] = exerciseName;
  return lookup;
}, {});

const EXERCISE_ALIAS_LOOKUP = Object.entries(EXTRA_EXERCISE_ALIASES).reduce((lookup, [canonicalName, aliases]) => {
  aliases.forEach((alias) => {
    lookup[normalizeExerciseKey(alias)] = canonicalName;
  });
  return lookup;
}, {});

const EXERCISE_SEARCH_INDEX = EXERCISE_OPTIONS.map((exerciseName) => {
  const aliases = EXTRA_EXERCISE_ALIASES[exerciseName] || [];
  return {
    name: exerciseName,
    searchKeys: [exerciseName, ...aliases].map((value) => normalizeExerciseKey(value)),
  };
});

const getCanonicalExerciseName = (exerciseName) => {
  const normalizedName = normalizeExerciseKey(exerciseName);

  if (!normalizedName) {
    return '';
  }

  return EXERCISE_CANONICAL_LOOKUP[normalizedName] || EXERCISE_ALIAS_LOOKUP[normalizedName] || '';
};

const findMatchingExerciseOptions = (searchText) => {
  const normalizedSearch = normalizeExerciseKey(searchText);

  if (!normalizedSearch) {
    return EXERCISE_OPTIONS;
  }

  return EXERCISE_SEARCH_INDEX
    .filter((entry) => entry.searchKeys.some((searchKey) => searchKey.includes(normalizedSearch)))
    .map((entry) => entry.name);
};

const getPrimaryBodyPart = (exerciseName) =>
  getTopBodyPart(getExerciseBodyPartBreakdown(getCanonicalExerciseName(exerciseName) || exerciseName));

// ─── Cardio detection ─────────────────────────────────────────────────────────

const CARDIO_NORMALIZED_NAMES = new Set(
  [
    'Battle Ropes', 'Elliptical Trainer', 'HIIT Cardio', 'Jump Rope',
    'Outdoor Cycling', 'Outdoor Run', 'Rowing Machine', 'Sled Pull',
    'Sled Push', 'Sprint Intervals', 'Stair Climber', 'Stationary Bike',
    'Swimming', 'Treadmill Run', 'Walking',
  ].map(normalizeExerciseKey)
);

const isCardioExercise = (name) => {
  if (!name) return false;
  return CARDIO_NORMALIZED_NAMES.has(normalizeExerciseKey(name));
};

const EXERCISE_INVOLVEMENT_TABLE = EXERCISE_LIBRARY.map((exercise) => ({
  name: exercise.name,
  muscles: exercise.muscles,
  bodyParts: exercise.bodyParts,
}));

export {
  EXERCISE_BODY_PART_MAP,
  EXERCISE_INVOLVEMENT_TABLE,
  EXERCISE_LIBRARY,
  EXERCISE_OPTIONS,
  findMatchingExerciseOptions,
  getAdjustedBodyPartBreakdown,
  getCanonicalExerciseName,
  getExerciseBodyPartBreakdown,
  getExerciseMuscleBreakdown,
  getPrimaryBodyPart,
  isCardioExercise,
  normalizeExerciseKey,
};
