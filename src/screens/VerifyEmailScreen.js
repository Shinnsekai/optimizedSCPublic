import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getThemeColors } from '../constants/theme';
import AnimatedStatusTick from '../components/AnimatedStatusTick';
import { logoutUser, refreshCurrentUser, resendVerificationEmail } from '../services/authService';
import { getUserProfile, resolveAppUser } from '../services/userProfileService';
import { useStore } from '../store';

export default function VerifyEmailScreen({ navigation }) {
  const colors = getThemeColors('dark');
  const {
    pendingVerification,
    clearPendingVerification,
    setTrainingDataReady,
    setUser,
    setUserProfile,
  } = useStore();
  const [checking, setChecking] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const checkingRef = useRef(false);
  const completedRef = useRef(false);

  const pendingEmail = pendingVerification?.email || '';

  const finalizeVerification = async (firebaseUser) => {
    const [resolvedUser, profile] = await Promise.all([
      resolveAppUser(firebaseUser),
      getUserProfile(firebaseUser.uid),
    ]);
    completedRef.current = true;
    setCompleted(true);
    setError('');
    setNotice('Email verified. Signing you in now...');

    setTimeout(() => {
      clearPendingVerification();
      setUserProfile(profile ?? null);
      setTrainingDataReady(false);
      setUser(resolvedUser);
    }, 900);
  };

  const checkVerificationStatus = async (showPendingPrompt = false, showSpinner = false) => {
    if (checkingRef.current || completedRef.current) {
      return;
    }

    checkingRef.current = true;
    if (showSpinner) setChecking(true);
    setError('');

    try {
      const currentUser = await refreshCurrentUser();

      if (!currentUser) {
        clearPendingVerification();
        navigation.replace('Login', { mode: 'signUp' });
        return;
      }

      if (currentUser.emailVerified) {
        await finalizeVerification(currentUser);
      } else if (showPendingPrompt) {
        setError('Your email has not been verified yet. Please click the link in your inbox first.');
      }
    } catch (statusError) {
      setError(statusError?.message || 'Unable to refresh your verification status right now.');
    } finally {
      checkingRef.current = false;
      if (showSpinner) setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setError('');
    const { error: resendError, notice: resendNotice } = await resendVerificationEmail();

    if (resendError) {
      setError(resendError);
      return;
    }

    if (resendNotice) {
      setNotice(resendNotice);
    }
  };

  const handleUseAnotherEmail = async () => {
    await logoutUser();
    clearPendingVerification();
    navigation.replace('Login', { mode: 'signUp' });
  };

  useEffect(() => {
    checkVerificationStatus();

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkVerificationStatus();
      }
    });

    const intervalId = setInterval(checkVerificationStatus, 4000);

    return () => {
      appStateSubscription.remove();
      clearInterval(intervalId);
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <AnimatedStatusTick completed={completed} colors={colors} />

          <Text style={[styles.bodyText, { color: colors.text }]}>
            {pendingEmail
              ? `We sent a verification link to ${pendingEmail}.`
              : 'We sent a verification link to your inbox.'}
          </Text>

          <Text style={[styles.supportText, { color: colors.textSecondary }]}>
            Open the email and click the verification link. This page will{' '}
            <Text style={{ color: colors.text, fontWeight: '700' }}>automatically advance</Text>{' '}
            once your email is verified — no action needed here.
          </Text>

          {notice ? (
            <Text style={[styles.supportText, { color: colors.success }]}>{notice}</Text>
          ) : null}

          {error ? <Text style={[styles.feedback, { color: colors.danger }]}>{error}</Text> : null}

          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            If this page doesn't advance on its own after you've verified, tap the button below.
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => checkVerificationStatus(true, true)}
            disabled={checking || completed}
          >
            {checking ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {completed ? 'Verified ✓' : 'Verify'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleResendEmail} disabled={checking || completed}>
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Resend Verification Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleUseAnotherEmail} disabled={checking}>
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Use Another Email</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 14,
  },
  bodyText: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    textAlign: 'center',
    maxWidth: 320,
  },
  supportText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  feedback: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 300,
    marginTop: 4,
  },
  primaryButton: {
    marginTop: 12,
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
