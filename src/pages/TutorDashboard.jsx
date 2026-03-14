import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, PrimaryButton, StatusBadge } from '../components/AppShell';
import { subscribePendingRequestsForTutor, subscribeSessionsForTutor } from '../services/sessionService';
import { getUserById } from '../services/userService';

export default function TutorDashboard({ user, userProfile }) {
  const [sessions, setSessions] = useState([]);
  const [pending, setPending] = useState([]);
  const [studentNames, setStudentNames] = useState({});

  useEffect(() => {
    if (!user?.uid) return undefined;
    const unsubSessions = subscribeSessionsForTutor(user.uid, setSessions);
    const unsubPending = subscribePendingRequestsForTutor(user.uid, setPending);
    return () => {
      unsubSessions();
      unsubPending();
    };
  }, [user?.uid]);

  useEffect(() => {
    const ids = [...new Set([...sessions.map((session) => session.studentId), ...pending.map((request) => request.studentId)])];
    ids.forEach(async (studentId) => {
      if (studentNames[studentId]) return;
      const profile = await getUserById(studentId);
      if (profile) {
        setStudentNames((current) => ({ ...current, [studentId]: profile.displayName }));
      }
    });
  }, [pending, sessions, studentNames]);

  const upcoming = sessions.filter((session) => session.status === 'accepted' || session.status === 'in_progress');
  const greetingName = userProfile?.displayName || user?.displayName || user?.email || 'Tutor';

  return (
    <PageShell>
      <PageHero
        eyebrow="Tutor workspace"
        title={`Teach with momentum, ${greetingName}`}
        description="Review incoming requests, manage your teaching calendar, and move sessions into live rooms that sync across devices."
        actions={
          <>
            <Link to="/tutor/profile">
              <PrimaryButton type="button">Edit profile</PrimaryButton>
            </Link>
            <StatusBadge tone="coral">{pending.length} pending requests</StatusBadge>
          </>
        }
      />

      {(userProfile?.skills || []).length > 0 && (
        <GlassPanel className="mb-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Your teaching stack</h2>
            <StatusBadge tone="cyan">{userProfile.skills.length} skills live</StatusBadge>
          </div>
          <div className="flex flex-wrap gap-3">
            {(userProfile.skills || []).map((skill) => {
              const name = typeof skill === 'string' ? skill : skill?.name || skill?.skill || skill;
              const rate = typeof skill === 'object' && skill.rate != null ? skill.rate : null;
              const slots = typeof skill === 'object' && skill.timingSlots ? skill.timingSlots : [];
              return (
                <div key={name} className="rounded-[1.3rem] border border-cyan/18 bg-cyan/10 px-4 py-3">
                  <p className="font-medium text-white">{name}</p>
                  {rate != null && rate > 0 ? <p className="mt-1 text-sm text-teal">Rs {rate} / session</p> : null}
                  {slots.length > 0 ? <p className="mt-2 text-xs text-white/55">{slots.join(', ')}</p> : null}
                </div>
              );
            })}
          </div>
        </GlassPanel>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel className="border-coral/18">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Pending requests</h2>
            <StatusBadge tone="coral">{pending.length} waiting</StatusBadge>
          </div>
          {pending.length === 0 ? (
            <p className="text-white/62">No pending requests right now.</p>
          ) : (
            <div className="space-y-4">
              {pending.slice(0, 4).map((request) => (
                <div key={request.id} className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-lg font-semibold text-white">{request.skill}</p>
                  <p className="mt-1 text-sm text-white/55">{studentNames[request.studentId] || 'Student'}</p>
                  <Link to="/tutor/requests" className="mt-4 inline-flex rounded-full border border-coral/20 bg-coral/12 px-4 py-2 text-sm font-medium text-coral transition hover:bg-coral/18">
                    Review request
                  </Link>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

        <GlassPanel>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Upcoming sessions</h2>
            <StatusBadge tone="cyan">{upcoming.length} scheduled</StatusBadge>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-white/62">No upcoming sessions yet.</p>
          ) : (
            <div className="space-y-4">
              {upcoming.map((session) => (
                <div key={session.id} className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{session.skill}</p>
                      <p className="mt-1 text-sm text-white/55">{studentNames[session.studentId] || 'Student'}</p>
                    </div>
                    <Link to={`/session/lobby/${session.id}`} className="rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-navy transition hover:bg-[#8df3ff]">
                      Open session
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>
    </PageShell>
  );
}
