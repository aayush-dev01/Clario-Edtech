import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSessionsForStudent } from '../services/sessionService';
import SkillMap from '../components/SkillMap';

export default function StudentDashboard({ user, userProfile }) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      getSessionsForStudent(user.uid).then(setSessions);
    }
  }, [user?.uid]);

  const upcoming = sessions.filter((s) => s.status === 'accepted' || s.status === 'in_progress');
  const recent = sessions.filter((s) => s.status === 'completed').slice(0, 3);

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {userProfile?.displayName || 'Student'}!</h1>
        <p className="text-white/70 mb-8">Discover and learn skills from your peers.</p>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Skill Map</h2>
          <SkillMap onSkillSelect={(skill) => navigate(`/find-skills?skill=${encodeURIComponent(skill)}`)} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Upcoming Sessions</h2>
            {upcoming.length === 0 ? (
              <p className="text-white/60">No upcoming sessions. <Link to="/find-skills" className="text-cyan hover:underline">Find a tutor</Link></p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((s) => (
                  <div key={s.id} className="flex justify-between items-center py-2 border-b border-white/10">
                    <div>
                      <p className="text-white font-medium">{s.skill}</p>
                      <p className="text-white/60 text-sm">{s.status}</p>
                    </div>
                    <Link
                      to={`/session/lobby/${s.id}`}
                      className="px-3 py-1 rounded-lg bg-cyan/20 text-cyan text-sm hover:bg-cyan/30"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Sessions</h2>
            {recent.length === 0 ? (
              <p className="text-white/60">No past sessions yet.</p>
            ) : (
              <div className="space-y-3">
                {recent.map((s) => (
                  <div key={s.id} className="flex justify-between items-center py-2 border-b border-white/10">
                    <div>
                      <p className="text-white font-medium">{s.skill}</p>
                      <p className="text-white/60 text-sm">Completed</p>
                    </div>
                    <Link
                      to={`/session/rate/${s.id}`}
                      className="px-3 py-1 rounded-lg bg-teal/20 text-teal text-sm hover:bg-teal/30"
                    >
                      Rate
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/find-skills" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan text-navy font-semibold hover:bg-teal transition-colors">
            Find Skills →
          </Link>
        </div>
      </div>
    </div>
  );
}
