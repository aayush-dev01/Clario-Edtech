import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSessionsForTutor } from '../services/sessionService';
import { getPendingRequestsForTutor } from '../services/sessionService';
import { getUserById } from '../services/userService';

export default function TutorDashboard({ user, userProfile }) {
  const [sessions, setSessions] = useState([]);
  const [pending, setPending] = useState([]);
  const [studentNames, setStudentNames] = useState({});

  useEffect(() => {
    if (user?.uid) {
      getSessionsForTutor(user.uid).then(setSessions);
      getPendingRequestsForTutor(user.uid).then(setPending);
    }
  }, [user?.uid]);

  useEffect(() => {
    const ids = [...new Set([...sessions.map((s) => s.studentId), ...pending.map((p) => p.studentId)])];
    ids.forEach(async (sid) => {
      const u = await getUserById(sid);
      if (u) setStudentNames((prev) => ({ ...prev, [sid]: u.displayName }));
    });
  }, [sessions, pending]);

  const upcoming = sessions.filter((s) => s.status === 'accepted' || s.status === 'in_progress');

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Tutor Dashboard</h1>
        <p className="text-white/70 mb-8">Welcome, {userProfile?.displayName || 'Tutor'}. Manage your sessions.</p>

        {(userProfile?.skills || []).length > 0 && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Your Skills</h2>
            <div className="flex flex-wrap gap-3">
              {(userProfile.skills || []).map((s) => {
                const name = typeof s === 'string' ? s : (s.name || s.skill || s);
                const rate = typeof s === 'object' && s.rate != null ? s.rate : null;
                const slots = typeof s === 'object' && s.timingSlots ? s.timingSlots : [];
                return (
                  <div
                    key={name}
                    className="px-4 py-3 rounded-lg bg-cyan/10 border border-cyan/20"
                  >
                    <span className="text-white font-medium">{name}</span>
                    {rate != null && rate > 0 && (
                      <span className="ml-2 text-teal">₹{rate}/session</span>
                    )}
                    {slots.length > 0 && (
                      <p className="text-white/60 text-xs mt-1">{slots.join(', ')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-coral/10 rounded-xl p-6 border border-coral/30">
            <h2 className="text-lg font-semibold text-white mb-4">Pending Requests ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="text-white/60">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {pending.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-white font-medium">{p.skill}</p>
                      <p className="text-white/60 text-sm">{studentNames[p.studentId] || 'Student'}</p>
                    </div>
                    <Link
                      to={`/tutor/requests`}
                      className="px-3 py-1 rounded-lg bg-coral/20 text-coral text-sm hover:bg-coral/30"
                    >
                      Review
                    </Link>
                  </div>
                ))}
                {pending.length > 3 && (
                  <Link to="/tutor/requests" className="text-cyan hover:underline">View all →</Link>
                )}
              </div>
            )}
          </div>

          <div className="bg-cyan/10 rounded-xl p-6 border border-cyan/30">
            <h2 className="text-lg font-semibold text-white mb-4">Upcoming Sessions</h2>
            {upcoming.length === 0 ? (
              <p className="text-white/60">No upcoming sessions.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((s) => (
                  <div key={s.id} className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-white font-medium">{s.skill}</p>
                      <p className="text-white/60 text-sm">{studentNames[s.studentId] || 'Student'}</p>
                    </div>
                    <Link
                      to={`/session/lobby/${s.id}`}
                      className="px-3 py-1 rounded-lg bg-cyan/20 text-cyan text-sm hover:bg-cyan/30"
                    >
                      Join
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Link to="/tutor/requests" className="px-6 py-3 rounded-xl bg-coral/20 text-coral font-semibold hover:bg-coral/30 transition-colors">
            View Requests
          </Link>
          <Link to="/tutor/profile" className="px-6 py-3 rounded-xl bg-cyan text-navy font-semibold hover:bg-teal transition-colors">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
