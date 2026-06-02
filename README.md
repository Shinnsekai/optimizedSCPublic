# Optimized — Fitness Tracking App

A full-featured mobile fitness tracking application built with React Native and Expo. Designed for iOS and Android, Optimized lets users build custom workout routines, log sessions in real time, and analyse their progression over time — all backed by a live Firebase cloud database.

---

## Features

### Authentication & Onboarding
- Email/password sign-up and sign-in
- Email verification flow with auto-polling and app-state listener
- Password reset via email
- First-time profile setup (age, gender, bodyweight, height, fitness level) with unit toggle (kg/lbs, cm/ft·in)
- Username registration with transaction-based uniqueness check against Firestore
- One-time animated welcome screen on profile completion

### Workout Routines
- Create named routines with any number of exercises
- Two exercise types: **Strength** (weight × reps) and **Cardio** (duration)
- Full exercise library with search via `src/constants/exercises.js`
- Routine detail view with one-tap start or delete

### Active Workout Tracking
- Live session timer running in the background
- Per-set weight and rep logging with previous-session comparison visible inline
- Add or remove sets and exercises mid-session
- 3-second animated countdown before session starts
- Save or discard on finish

### Analytics & Progress
- **Streak tracker** — current and all-time best consecutive training days
- **8-week bar charts** — weekly volume (kg) and session duration
- **All-time line charts** — volume, duration, and session count with daily / weekly / monthly / yearly period selector
- **Personal Records** — full grid of all-time bests ranked by max weight, with gold/silver/bronze highlights for the top 3

### Workout History
- Workout detail view with 2×2 stats summary (total volume, duration, exercises, sets)
- Per-exercise set breakdown (strength vs cardio)
- Animated muscle activation breakdown with estimated percentage contribution by body part
- Long-press on home screen to delete any past workout

### Profile
- Editable profile card (age, gender, bodyweight, height, fitness level)
- 20 emoji avatar presets (organised by gender)
- Dark / light theme toggle persisted across sessions
- Language selector: English, Hindi, Marathi, Gujarati

### Additional Screens
- **Store** — subscription tier showcase (Plus / Pro / Elite) with animated stagger entrance
- **Trainers** — coming-soon beta screen
- **Help** — embedded YouTube walkthrough video link
- **Contact** — developer contact details

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 |
| Navigation | React Navigation 7 (Stack + Bottom Tabs) |
| State management | Zustand 5 with AsyncStorage persistence |
| Backend / Auth | Firebase 12 (Firestore + Firebase Auth) |
| Internationalisation | i18next + react-i18next |
| Charts | Custom SVG components (react-native-svg) |
| Icons | lucide-react-native |
| Animations | React Native Animated API + Expo Blur |
| Build / Distribution | EAS Build (Expo Application Services) |

---

## Project Structure

```
├── App.js                  # Root navigator, auth listener, theme provider
├── index.js                # Expo entry point
├── app.json                # Expo config
├── eas.json                # EAS build profiles (preview + production)
├── assets/                 # App icons and splash screen
└── src/
    ├── components/         # Shared UI components
    │   ├── AnimatedStatusTick.js
    │   ├── BarChart.js
    │   ├── BottomTabBar.js
    │   ├── HomeBackdrop.js
    │   ├── LegalPolicyModal.js
    │   ├── LineChart.js
    │   └── SettingsModal.js
    ├── config/
    │   └── firebase.js     # Firebase initialisation (env-var driven)
    ├── constants/
    │   ├── exercises.js    # Full exercise library
    │   ├── legalPolicy.js  # Terms & privacy policy text
    │   └── theme.js        # Dark / light colour tokens
    ├── i18n/
    │   └── index.js        # i18next setup + EN / HI / MR / GU translations
    ├── screens/            # One file per screen (20 screens total)
    ├── services/
    │   ├── authService.js          # Firebase Auth wrapper
    │   ├── trainingDataService.js  # Firestore routines + workouts CRUD
    │   └── userProfileService.js   # Profile + username management
    ├── store/
    │   └── index.js        # Zustand store (auth, routines, workouts, UI state)
    └── utils/
        ├── emailValidation.js
        ├── layoutAnimations.js
        ├── trainingValidation.js
        ├── unitConversion.js
        ├── usernameValidation.js
        └── workoutStats.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project with **Authentication** (Email/Password) and **Firestore** enabled

### Installation

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Expo automatically injects any variable prefixed with `EXPO_PUBLIC_` at build time — no extra packages required.

### Running the App

```bash
# Start the Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Building for Production (EAS)

```bash
# iOS production build
npm run build:ios

# iOS preview / TestFlight build
npm run build:ios:preview

# Submit to App Store
npm run submit:ios
```

---

## Developer

Built by **Maahir Gariba**
- Email: maahirgariba10@gmail.com
