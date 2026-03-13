import { useEffect, useState } from 'react';
import { getPendingRequestsForTutor } from '../services/sessionService';
import { acceptSession, rejectSession } from '../services/sessionService';
import { getUserById } from '../services/userService';

export default function TutorRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [studentNames, setStudentNames] = useState({});
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      getPendingRequestsForTutor(user.uid).then(setRequests);
    }
  }, [user?.uid]);

  useEffect(() => {
    requests.forEach(async (r) => {
      const u = await getUserById(r.studentId);
      if (u) setStudentNames((prev) => ({ ...prev, [r.studentId]: u.displayName }));
    });
  }, [requests]);

  const handleAccept = async (id) => {
    setActioning(id);
    try {
      await acceptSession(id, null, `ClarioSession${id}`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id) => {
    setActioning(id);
    try {
      await rejectSession(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Session Requests</h1>
        <p className="text-white/70 mb-8">Accept or reject session requests from students.</p>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-12 text-center border border-white/10">
              <p className="text-white/70">No pending requests.</p>
            </div>
          ) : (
            requests.map((r) => (
              <div
                key={r.id}
                className="bg-white/5 rounded-xl p-6 border border-white/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{r.skill}</h3>
                    <p className="text-white/60">{studentNames[r.studentId] || 'Student'}</p>
                    {r.message && (
                      <p className="text-white/80 text-sm mt-2 italic">&quot;{r.message}&quot;</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(r.id)}
                    disabled={actioning === r.id}
                    className="flex-1 py-2 rounded-lg bg-teal text-navy font-medium hover:bg-teal/90 transition-colors disabled:opacity-50"
                  >
                    {actioning === r.id ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    disabled={actioning === r.id}
                    className="flex-1 py-2 rounded-lg bg-coral/20 text-coral font-medium hover:bg-coral/30 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
