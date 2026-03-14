import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, serverTimestamp } from './firebase';

const PROFILE_CACHE_KEY = 'clario_profile_cache';

function readCachedProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCachedProfile() {
  return readCachedProfile();
}

function cacheProfile(profile) {
  if (typeof window === 'undefined' || !profile) return;
  window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
}

function clearCachedProfile() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PROFILE_CACHE_KEY);
}

function mapAuthUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email,
  };
}

export async function register(email, password, displayName, role = 'student') {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const profile = {
    email,
    displayName,
    role,
    skills: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', credential.user.uid), profile);
  cacheProfile({ id: credential.user.uid, ...profile, createdAt: null, updatedAt: null });

  return mapAuthUser(auth.currentUser);
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);
  if (profile) {
    cacheProfile(profile);
  }
  return mapAuthUser(credential.user);
}

export async function signOut() {
  await firebaseSignOut(auth);
  clearCachedProfile();
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(mapAuthUser(user));
  });
}

export async function getUserProfile(uid) {
  if (!uid) return null;
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (snapshot.exists()) {
    const profile = { id: snapshot.id, ...snapshot.data() };
    cacheProfile(profile);
    return profile;
  }

  const cached = readCachedProfile();
  if (cached?.id === uid) return cached;

  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) return null;

  const fallbackProfile = {
    id: uid,
    email: currentUser.email,
    displayName: currentUser.displayName || currentUser.email,
    role: cached?.role || null,
    skills: cached?.skills || [],
  };

  cacheProfile(fallbackProfile);
  return fallbackProfile;
}
