import { getSessions, setSessions, generateId } from './localStore';

export async function createSessionRequest(studentId, tutorId, skill, message = '') {
  const sessions = getSessions();
  const id = generateId();
  const session = {
    id,
    studentId,
    tutorId,
    skill,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
    scheduledAt: null,
    jitsiRoomId: null,
  };
  sessions[id] = session;
  setSessions(sessions);
  return session;
}

export async function acceptSession(sessionId, scheduledAt, jitsiRoomId) {
  const sessions = getSessions();
  const session = sessions[sessionId];
  if (!session) return;
  const safeRoomId = (jitsiRoomId || `ClarioSession${sessionId}`).replace(/[^a-zA-Z0-9-_]/g, '');
  session.status = 'accepted';
  session.scheduledAt = scheduledAt || new Date().toISOString();
  session.jitsiRoomId = safeRoomId;
  session.updatedAt = new Date().toISOString();
  setSessions(sessions);
}

export async function rejectSession(sessionId) {
  const sessions = getSessions();
  const session = sessions[sessionId];
  if (!session) return;
  session.status = 'rejected';
  session.updatedAt = new Date().toISOString();
  setSessions(sessions);
}

export async function startSession(sessionId) {
  const sessions = getSessions();
  const session = sessions[sessionId];
  if (!session) return;
  session.status = 'in_progress';
  session.startedAt = new Date().toISOString();
  session.updatedAt = new Date().toISOString();
  setSessions(sessions);
}

export async function completeSession(sessionId) {
  const sessions = getSessions();
  const session = sessions[sessionId];
  if (!session) return;
  session.status = 'completed';
  session.completedAt = new Date().toISOString();
  session.updatedAt = new Date().toISOString();
  setSessions(sessions);
}

export async function getSessionsForStudent(studentId) {
  const sessions = getSessions();
  return Object.values(sessions)
    .filter((s) => s.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getSessionsForTutor(tutorId) {
  const sessions = getSessions();
  return Object.values(sessions)
    .filter((s) => s.tutorId === tutorId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getSessionById(sessionId) {
  const sessions = getSessions();
  const session = sessions[sessionId];
  return session ? { id: session.id, ...session } : null;
}

export async function getPendingRequestsForTutor(tutorId) {
  const sessions = getSessions();
  return Object.values(sessions)
    .filter((s) => s.tutorId === tutorId && s.status === 'pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
