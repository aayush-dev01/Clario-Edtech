import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, StatusBadge } from '../components/AppShell';
import { subscribeSessionsForStudent } from '../services/sessionService';
import { getUserById } from '../services/userService';

function statusTone(status) {
  if (status === 'completed') return 'teal';
  if (status === 'accepted' || status === 'in_progress') return 'cyan';
  if (status === 'rejected') return 'coral';
  return 'default';
}

export default function MySessions({ user }) {
  const [sessions, setSessions] = useState([]);
  const [tutorNames, setTutorNames] = useState({});

  useEffect(() => {
    if (!user?.uid) return undefined;
    return subscribeSessionsForStudent(user.uid, setSessions);
  }, [user?.uid]);

  useEffect(() => {
    const ids = [...new Set(sessions.map((session) => session.tutorId))];
    ids.forEach(async (tutorId) => {
      if (tutorNames[tutorId]) return;
      const tutor = await getUserById(tutorId);
      if (tutor) {
        setTutorNames((current) => ({ ...current, [tutorId]: tutor.displayName }));
      }
    });
  }, [sessions, tutorNames]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Session archive"
        title="All your sessions in one place"
        description="Track request status, reopen live lobbies, and rate completed sessions without losing context."
        aside={<StatusBadge tone="cyan">{sessions.length} total sessions</StatusBadge>}
      />

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <GlassPanel className="py-16 text-center">
            <p className="text-lg text-white/70">No sessions yet.</p>
            <Link to="/find-skills" className="mt-4 inline-flex text-cyan hover:text-white">
              Find a tutor
            </Link>
          </GlassPanel>
        ) : (
          sessions.map((session) => (
            <GlassPanel key={session.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-white">{session.skill}</h3>
                    <StatusBadge tone={statusTone(session.status)}>{session.status.replace('_', ' ')}</StatusBadge>
                  </div>
                  <p className="mt-2 text-white/58">Tutor: {tutorNames[session.tutorId] || 'Loading...'}</p>
                </div>
                <div className="flex gap-3">
                  {(session.status === 'accepted' || session.status === 'in_progress') && (
                    <Link
                      to={`/session/lobby/${session.id}`}
                      className="rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-navy transition hover:bg-[#8df3ff]"
                    >
                      Join session
                    </Link>
                  )}
                  {session.status === 'completed' && (
                    <Link
                      to={`/session/rate/${session.id}`}
                      className="rounded-full border border-teal/20 bg-teal/12 px-4 py-2 text-sm font-medium text-teal transition hover:bg-teal/18"
                    >
                      Rate session
                    </Link>
                  )}
                </div>
              </div>
            </GlassPanel>
          ))
        )}
      </div>
    </PageShell>
  );
}
