import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react-native';
import { getThemeColors } from '../constants/theme';
import { loginWithEmail, registerWithEmail, sendPasswordReset } from '../services/authService';
import LegalPolicyModal from '../components/LegalPolicyModal';
import { LEGAL_POLICY_ACCEPTANCE_LABEL } from '../constants/legalPolicy';
import { isValidEmailFormat } from '../utils/emailValidation';
import { getUsernameValidationMessage } from '../utils/usernameValidation';

export default function LoginScreen({ navigation, route }) {
  const { t } = useTranslation();
  const colors = getThemeColors('dark');
  const [mode, setMode] = useState(route?.params?.mode === 'signIn' ? 'signIn' : 'signUp');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyVisible, setPolicyVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSignIn = mode === 'signIn';

  useEffect(() => {
    if (!route?.params?.mode) {
      return;
    }

    setMode(route.params.mode === 'signIn' ? 'signIn' : 'signUp');
    setError('');
    setNotice('');
  }, [route?.params?.mode]);

  const handleAuth = async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    Keyboard.dismiss();

    if (!trimmedEmail || !password) {
      setError('Enter both your email and password.');
      return;
    }

    if (!isValidEmailFormat(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!isSignIn) {
      const usernameError = getUsernameValidationMessage(trimmedUsername);

      if (usernameError) {
        setError(usernameError);
        return;
      }

      if (!policyAccepted) {
        setError('You must accept the Legal Policy before creating an account.');
        return;
      }
    }

    setLoading(true);
    setError('');
    setNotice('');

    const authResult = isSignIn
      ? await loginWithEmail(trimmedEmail, password)
      : await registerWithEmail(trimmedEmail, password, trimmedUsername);

    if (authResult.error) {
      setError(authResult.error);
      setLoading(false);
      return;
    }

    if (authResult.notice) {
      setNotice(authResult.notice);
    }

    setLoading(false);

    if (authResult.needsVerification) {
      navigation.replace('VerifyEmail');
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    Keyboard.dismiss();

    if (!trimmedEmail) {
      setError('Enter your email address first.');
      return;
    }

    if (!isValidEmailFormat(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    const { error: resetError } = await sendPasswordReset(trimmedEmail);

    if (resetError) {
      setError(resetError);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigation.navigate('PasswordResetSent', { email: trimmedEmail });
  };

  const switchMode = () => {
    setMode((currentMode) => (currentMode === 'signIn' ? 'signUp' : 'signIn'));
    setError('');
    setNotice('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isSignIn ? t('Welcome back') : t('Start Your Fitness Journey Today')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isSignIn
                ? t('Sign in to continue building your training.')
                : t('Create your account to save your progress, sync your data, and keep your training moving.')}
            </Text>
          </View>

          <View style={styles.form}>
            {!isSignIn ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder={t('Username')}
                placeholderTextColor={colors.textSecondary}
                keyboardAppearance="dark"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                returnKeyType="next"
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  if (error) setError('');
                  if (notice) setNotice('');
                }}
                onSubmitEditing={Keyboard.dismiss}
              />
            ) : null}

            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder={t('Email')}
              placeholderTextColor={colors.textSecondary}
              keyboardAppearance="dark"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              returnKeyType="next"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError('');
                if (notice) setNotice('');
              }}
              onSubmitEditing={Keyboard.dismiss}
            />

            <View style={[styles.passwordField, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder={t('Password')}
                placeholderTextColor={colors.textSecondary}
                keyboardAppearance="dark"
                secureTextEntry={!showPassword}
                textContentType={isSignIn ? 'password' : 'newPassword'}
                returnKeyType="done"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (error) setError('');
                  if (notice) setNotice('');
                }}
                onSubmitEditing={handleAuth}
              />
              <TouchableOpacity onPress={() => setShowPassword((currentValue) => !currentValue)} style={styles.passwordToggle}>
                {showPassword ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
              </TouchableOpacity>
            </View>

            {isSignIn ? (
              <TouchableOpacity style={styles.forgotPasswordLink} onPress={handleForgotPassword} disabled={loading}>
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>
            ) : null}

            {!isSignIn ? (
              <View style={[styles.policyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => setPolicyAccepted((currentValue) => !currentValue)} style={styles.policyToggle}>
                  {policyAccepted ? (
                    <CheckCircle2 color={colors.primary} size={22} />
                  ) : (
                    <Circle color={colors.textSecondary} size={22} />
                  )}
                </TouchableOpacity>
                <View style={styles.policyContent}>
                  <Text style={[styles.policyText, { color: colors.text }]}>{LEGAL_POLICY_ACCEPTANCE_LABEL}</Text>
                  <TouchableOpacity onPress={() => setPolicyVisible(true)}>
                    <Text style={[styles.policyLink, { color: colors.primary }]}>Read Legal Policy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {error ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            ) : null}

            {notice ? (
              <Text style={[styles.noticeText, { color: colors.primary }]}>{notice}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>{isSignIn ? t('Sign In') : t('Create Account')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.signInLink} onPress={switchMode} disabled={loading}>
              <Text style={[styles.signInText, { color: colors.textSecondary }]}>
                {isSignIn ? t("Don't have an account? ") : t('Already have an account? ')}
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                  {isSignIn ? t('Create one') : t('Sign in')}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <LegalPolicyModal
        visible={policyVisible}
        onClose={() => setPolicyVisible(false)}
        onConfirm={() => {
          setPolicyAccepted(true);
          setError('');
          setPolicyVisible(false);
        }}
        confirmLabel="Accept and Continue"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 12,
    lineHeight: 44,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.6,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  passwordField: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 6,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  policyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  policyContent: {
    flex: 1,
    gap: 6,
  },
  policyToggle: {
    paddingTop: 1,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  policyLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signInLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.78,
  },
  signInText: {
    fontSize: 14,
  },
});
