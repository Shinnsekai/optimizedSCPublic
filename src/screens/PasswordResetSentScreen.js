import React, { useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getThemeColors } from '../constants/theme';
import AnimatedStatusTick from '../components/AnimatedStatusTick';
import { sendPasswordReset } from '../services/authService';

export default function PasswordResetSentScreen({ route, navigation }) {
  const colors = getThemeColors('dark');
  const email = route.params?.email || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('A password reset link has been sent. Open it in your email app to continue.');

  const handleResend = async () => {
    if (!email) {
      return;
    }

    setLoading(true);
    setError('');

    const { error: resendError, notice: resendNotice } = await sendPasswordReset(email);

    if (resendError) {
      setError(resendError);
    } else if (resendNotice) {
      setNotice(resendNotice);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <AnimatedStatusTick completed={false} colors={colors} />

          <Text style={[styles.bodyText, { color: colors.text }]}>
            {email ? `Check ${email} for the reset link.` : 'Check your inbox for the reset link.'}
          </Text>
          <Text style={[styles.supportText, { color: colors.textSecondary }]}>{notice}</Text>

          {error ? <Text style={[styles.feedback, { color: colors.danger }]}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.replace('Login', { mode: 'signIn' })}
          >
            <Text style={styles.primaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleResend} disabled={loading || !email}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Resend Reset Link</Text>
            )}
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
    alignItems: 'center',
    paddingHorizontal: 24,
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
