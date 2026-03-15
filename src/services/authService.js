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
const PENDING_ROLE_KEY = 'clario_pending_role';

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

function readPendingRole() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_ROLE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cachePendingRole(uid, role) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PENDING_ROLE_KEY, JSON.stringify({ uid, role }));
}

function clearPendingRole() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PENDING_ROLE_KEY);
}

export function getPendingRole(uid) {
  const pending = readPendingRole();
  if (!pending) return null;
  if (uid && pending.uid !== uid) return null;
  return pending.role || null;
}

function cacheProfile(profile) {
  if (typeof window === 'undefined' || !profile) return;
  window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  if (profile.id) {
    const pending = readPendingRole();
    if (pending?.uid === profile.id) {
      clearPendingRole();
    }
  }
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
  cachePendingRole(credential.user.uid, role);
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
  clearPendingRole();
  const profile = await getUserProfile(credential.user.uid);
  if (profile) {
    cacheProfile(profile);
  }
  return mapAuthUser(credential.user);
}

export async function signOut() {
  await firebaseSignOut(auth);
  clearCachedProfile();
  clearPendingRole();
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
    role: cached?.role || getPendingRole(uid) || null,
    skills: cached?.skills || [],
  };

  cacheProfile(fallbackProfile);
  return fallbackProfile;
}

export function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/user-not-found':
      return 'No account exists for this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return error?.message || 'Authentication failed.';
  }
}
