import { getUsers, setUsers, getCurrentUser, setCurrentUser, generateId } from './localStore';

export async function register(email, password, displayName, role = 'student') {
  const users = getUsers();
  const existing = Object.values(users).find((u) => u.email === email);
  if (existing) throw new Error('Email already registered');
  const uid = generateId();
  const user = { uid, email, displayName, role };
  const profile = {
    id: uid,
    email,
    password,
    displayName,
    role,
    skills: role === 'tutor' ? [] : [],
    createdAt: new Date().toISOString(),
  };
  users[uid] = profile;
  setUsers(users);
  setCurrentUser({ ...user });
  window.dispatchEvent(new CustomEvent('clario:authchange'));
  return user;
}

export async function login(email, password) {
  const users = getUsers();
  const profile = Object.values(users).find((u) => u.email === email);
  if (!profile || profile.password !== password) throw new Error('Invalid email or password');
  const user = { uid: profile.id, email: profile.email, displayName: profile.displayName };
  setCurrentUser(user);
  window.dispatchEvent(new CustomEvent('clario:authchange'));
  return user;
}

export async function signOut() {
  setCurrentUser(null);
  window.dispatchEvent(new CustomEvent('clario:authchange'));
}

export function onAuthChange(callback) {
  const notify = () => callback(getCurrentUser());
  notify();
  window.addEventListener('clario:authchange', notify);
  return () => window.removeEventListener('clario:authchange', notify);
}

export async function getUserProfile(uid) {
  const users = getUsers();
  const profile = users[uid] || null;
  if (!profile) return null;
  const { password: _, ...safe } = profile;
  return { id: profile.id, ...safe };
}
