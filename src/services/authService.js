import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { registerUsernameForUser } from './userProfileService';

const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'That email is already in use.',
  'auth/invalid-credential': 'Your email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/missing-email': 'Enter your email address.',
  'auth/missing-password': 'Enter your password.',
  'auth/network-request-failed': 'Network error. Please try again.',
  'auth/requires-recent-login': 'For security, sign in again before deleting your account.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/user-token-expired': 'Your session expired. Sign in again and retry.',
  'auth/weak-password': 'Use a password with at least 6 characters.',
  'auth/user-not-found': 'No account was found for that email address.',
  'profile/username-taken': 'That username is already taken.',
  'profile/unavailable': 'Unable to save your profile right now.',
};

const getAuthErrorMessage = (error) => {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  return AUTH_ERROR_MESSAGES[error.code] || error.message || 'Something went wrong. Please try again.';
};

export const registerWithEmail = async (email, password, username) => {
  let createdUser = null;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    createdUser = userCredential.user;
    await registerUsernameForUser(userCredential.user, email, username);

    try {
      await sendEmailVerification(userCredential.user);
    } catch (error) {
      return {
        user: userCredential.user,
        error: null,
        notice: 'Your account is ready. Open the verification screen and resend the email if you do not see the first link.',
        needsVerification: true,
      };
    }

    return {
      user: userCredential.user,
      error: null,
      notice: 'Verification email sent. Open the link in your inbox to continue.',
      needsVerification: true,
    };
  } catch (error) {
    if (createdUser && ['profile/username-taken', 'profile/unavailable'].includes(error?.code)) {
      await deleteUser(createdUser).catch(() => {});
    }

    return { user: null, error: getAuthErrorMessage(error), notice: null, needsVerification: false };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
      await sendEmailVerification(userCredential.user).catch(() => {});
      return {
        user: userCredential.user,
        error: null,
        notice: 'Verify your email to continue. We sent a fresh verification link to your inbox.',
        needsVerification: true,
      };
    }

    return { user: userCredential.user, error: null, notice: null, needsVerification: false };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error), notice: null, needsVerification: false };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }
};

export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      error: null,
      notice: 'Password reset email sent. Once you finish the reset flow, your Firebase password will be updated automatically.',
    };
  } catch (error) {
    return { error: getAuthErrorMessage(error), notice: null };
  }
};

export const resendVerificationEmail = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return { error: 'No pending account was found.', notice: null };
  }

  try {
    await sendEmailVerification(currentUser);
    return { error: null, notice: 'A fresh verification email has been sent.' };
  } catch (error) {
    return { error: getAuthErrorMessage(error), notice: null };
  }
};

export const refreshCurrentUser = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return null;
  }

  await currentUser.reload();
  return auth.currentUser;
};

export const reauthenticateUser = async (password) => {
  const currentUser = auth.currentUser;

  if (!currentUser?.email) {
    return { error: 'No signed-in user found.' };
  }

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }
};

export const deleteCurrentUserAccount = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return { error: 'No signed-in user found.' };
  }

  try {
    await deleteUser(currentUser);
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error), requiresReauth: error.code === 'auth/requires-recent-login' };
  }
};
