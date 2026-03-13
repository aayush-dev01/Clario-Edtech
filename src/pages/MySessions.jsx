import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSessionsForStudent } from '../services/sessionService';
import { getUserById } from '../services/userService';

export default function MySessions({ user }) {
  const [sessions, setSessions] = useState([]);
  const [tutorNames, setTutorNames] = useState({});

  useEffect(() => {
    if (user?.uid) {
      getSessionsForStudent(user.uid).then(setSessions);
    }
  }, [user?.uid]);

  useEffect(() => {
    const ids = [...new Set(sessions.map((s) => s.tutorId))];
    ids.forEach(async (tid) => {
      const u = await getUserById(tid);
      if (u) setTutorNames((prev) => ({ ...prev, [tid]: u.displayName }));
    });
  }, [sessions]);

  const statusColor = (status) => {
    if (status === 'completed') return 'text-teal';
    if (status === 'accepted' || status === 'in_progress') return 'text-cyan';
    if (status === 'rejected') return 'text-coral';
    return 'text-white/70';
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">My Sessions</h1>
        <p className="text-white/70 mb-8">View and manage your learning sessions.</p>

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-12 text-center border border-white/10">
              <p className="text-white/70 mb-4">No sessions yet.</p>
              <Link to="/find-skills" className="text-cyan hover:text-teal font-medium">Find a tutor →</Link>
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{s.skill}</h3>
                  <p className="text-white/60">Tutor: {tutorNames[s.tutorId] || 'Loading...'}</p>
                  <p className={`text-sm ${statusColor(s.status)}`}>
                    {s.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {(s.status === 'accepted' || s.status === 'in_progress') && (
                    <Link
                      to={`/session/lobby/${s.id}`}
                      className="px-4 py-2 rounded-lg bg-cyan text-navy font-medium hover:bg-teal transition-colors"
                    >
                      Join Session
                    </Link>
                  )}
                  {s.status === 'completed' && (
                    <Link
                      to={`/session/rate/${s.id}`}
                      className="px-4 py-2 rounded-lg bg-teal/20 text-teal font-medium hover:bg-teal/30 transition-colors"
                    >
                      Rate Session
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
