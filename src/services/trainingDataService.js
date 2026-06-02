import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const ROUTINES_COLLECTION = 'saved_routines';
const WORKOUTS_COLLECTION = 'saved_workouts';

const canSyncUserData = (user) => Boolean(db && user?.uid);

const buildDocumentId = (user, recordId) => `${user.uid}_${recordId}`;

const buildOwnerPayload = (user) => ({
  uid: user.uid,
  email: user.email || null,
  displayName: user.displayName || null,
  providerId: user.providerId || null,
});

const mapSnapshot = (snapshot, sortField) =>
  snapshot.docs
    .map((entry) => ({
      ...entry.data(),
      id: entry.data().id || entry.id,
    }))
    .sort((a, b) => {
      const firstValue = a?.[sortField] ? new Date(a[sortField]).getTime() : 0;
      const secondValue = b?.[sortField] ? new Date(b[sortField]).getTime() : 0;
      return firstValue - secondValue;
    });

export const saveRoutineToDatabase = async (user, routine) => {
  if (!canSyncUserData(user) || !routine?.id) {
    return;
  }

  await setDoc(
    doc(collection(db, ROUTINES_COLLECTION), buildDocumentId(user, routine.id)),
    {
      ...routine,
      owner: buildOwnerPayload(user),
      syncedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const saveWorkoutToDatabase = async (user, workout) => {
  if (!canSyncUserData(user) || !workout?.id) {
    return;
  }

  await setDoc(
    doc(collection(db, WORKOUTS_COLLECTION), buildDocumentId(user, workout.id)),
    {
      ...workout,
      owner: buildOwnerPayload(user),
      syncedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const deleteRoutineFromDatabase = async (user, routineId) => {
  if (!canSyncUserData(user) || !routineId) {
    return;
  }

  await deleteDoc(doc(db, ROUTINES_COLLECTION, buildDocumentId(user, routineId)));
};

export const deleteWorkoutFromDatabase = async (user, workoutId) => {
  if (!canSyncUserData(user) || !workoutId) {
    return;
  }

  await deleteDoc(doc(db, WORKOUTS_COLLECTION, buildDocumentId(user, workoutId)));
};

export const subscribeToRoutineData = (user, onChange, onError) => {
  if (!canSyncUserData(user)) {
    onChange([]);
    return () => {};
  }

  const routineQuery = query(
    collection(db, ROUTINES_COLLECTION),
    where('owner.uid', '==', user.uid)
  );

  return onSnapshot(
    routineQuery,
    (snapshot) => onChange(mapSnapshot(snapshot, 'dateCreated')),
    onError
  );
};

export const subscribeToWorkoutData = (user, onChange, onError) => {
  if (!canSyncUserData(user)) {
    onChange([]);
    return () => {};
  }

  const workoutQuery = query(
    collection(db, WORKOUTS_COLLECTION),
    where('owner.uid', '==', user.uid)
  );

  return onSnapshot(
    workoutQuery,
    (snapshot) => onChange(mapSnapshot(snapshot, 'date')),
    onError
  );
};

const deleteUserCollectionDocs = async (user, collectionName) => {
  const snapshot = await getDocs(
    query(collection(db, collectionName), where('owner.uid', '==', user.uid))
  );

  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((entry) => batch.delete(entry.ref));
  await batch.commit();
};

export const deleteAllUserDataFromDatabase = async (user) => {
  if (!canSyncUserData(user)) {
    return;
  }

  await Promise.all([
    deleteUserCollectionDocs(user, ROUTINES_COLLECTION),
    deleteUserCollectionDocs(user, WORKOUTS_COLLECTION),
  ]);
};
