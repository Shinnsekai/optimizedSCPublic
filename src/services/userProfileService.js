import { doc, deleteDoc, getDoc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../config/firebase';

const USER_PROFILES_COLLECTION = 'user_profiles';
const USERNAMES_COLLECTION = 'usernames';

const buildFallbackUsername = (email) => {
  const trimmedEmail = String(email || '').trim();

  if (!trimmedEmail.includes('@')) {
    return 'Athlete';
  }

  return trimmedEmail.split('@')[0] || 'Athlete';
};

const buildAppUser = (firebaseUser, username) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: username || firebaseUser.displayName || buildFallbackUsername(firebaseUser.email),
  providerId: firebaseUser.providerData?.[0]?.providerId || 'password',
});

export const registerUsernameForUser = async (firebaseUser, email, username) => {
  if (!db || !firebaseUser?.uid) {
    throw Object.assign(new Error('Unable to save your profile right now.'), { code: 'profile/unavailable' });
  }

  const profileRef = doc(db, USER_PROFILES_COLLECTION, firebaseUser.uid);
  const usernameRef = doc(db, USERNAMES_COLLECTION, username);
  const createdAt = new Date().toISOString();

  await runTransaction(db, async (transaction) => {
    const existingUsername = await transaction.get(usernameRef);

    if (existingUsername.exists()) {
      throw Object.assign(new Error('That username is already taken.'), { code: 'profile/username-taken' });
    }

    transaction.set(usernameRef, {
      uid: firebaseUser.uid,
      email,
      username,
      createdAt,
    });

    transaction.set(profileRef, {
      uid: firebaseUser.uid,
      email,
      username,
      createdAt,
    });
  });

  await updateProfile(firebaseUser, { displayName: username });
};

export const syncUserProfile = async (firebaseUser) => {
  if (!db || !firebaseUser?.uid) {
    return null;
  }

  const username = firebaseUser.displayName || buildFallbackUsername(firebaseUser.email);

  await setDoc(
    doc(db, USER_PROFILES_COLLECTION, firebaseUser.uid),
    {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      username,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return username;
};

export const resolveAppUser = async (firebaseUser) => {
  if (!firebaseUser) {
    return null;
  }

  if (!db) {
    return buildAppUser(firebaseUser, firebaseUser.displayName);
  }

  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, firebaseUser.uid);
    const profileSnapshot = await getDoc(profileRef);
    const storedUsername = profileSnapshot.data()?.username;
    const username = storedUsername || firebaseUser.displayName || buildFallbackUsername(firebaseUser.email);

    if (!profileSnapshot.exists()) {
      await syncUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: username,
      }).catch(() => {});
    }

    return buildAppUser(firebaseUser, username);
  } catch (error) {
    return buildAppUser(firebaseUser, firebaseUser.displayName);
  }
};

/**
 * Fetches the full user profile document from Firestore.
 * Returns the document data, or null if it doesn't exist / can't be reached.
 */
export const getUserProfile = async (uid) => {
  if (!db || !uid) return null;

  try {
    const snapshot = await getDoc(doc(db, USER_PROFILES_COLLECTION, uid));
    return snapshot.exists() ? snapshot.data() : null;
  } catch {
    return null;
  }
};

/**
 * Saves the body/fitness profile fields and marks profileComplete = true.
 * Merges into the existing profile document so username etc. are preserved.
 */
export const saveBodyProfile = async (uid, profileData) => {
  if (!db || !uid) return;

  await setDoc(
    doc(db, USER_PROFILES_COLLECTION, uid),
    {
      ...profileData,
      profileComplete: true,
      profileUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

/**
 * Saves the user's chosen avatar ID to their profile document.
 * Merges so no other profile fields are affected.
 */
export const updateAvatarId = async (uid, avatarId) => {
  if (!db || !uid) return;
  await setDoc(
    doc(db, USER_PROFILES_COLLECTION, uid),
    { avatarId },
    { merge: true }
  );
};

export const deleteUserProfileRecords = async (firebaseUser) => {
  if (!db || !firebaseUser?.uid) {
    return;
  }

  const profileRef = doc(db, USER_PROFILES_COLLECTION, firebaseUser.uid);
  const profileSnapshot = await getDoc(profileRef);
  const username = profileSnapshot.data()?.username || firebaseUser.displayName;

  if (username) {
    await deleteDoc(doc(db, USERNAMES_COLLECTION, username));
  }

  await deleteDoc(profileRef);
};
