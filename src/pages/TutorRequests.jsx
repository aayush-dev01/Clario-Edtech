import { useEffect, useState } from 'react';
import { GlassPanel, PageHero, PageShell, PrimaryButton, SecondaryButton, StatusBadge } from '../components/AppShell';
import { acceptSession, rejectSession, subscribePendingRequestsForTutor } from '../services/sessionService';
import { getUserById } from '../services/userService';

export default function TutorRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [studentNames, setStudentNames] = useState({});
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    if (!user?.uid) return undefined;
    return subscribePendingRequestsForTutor(user.uid, setRequests);
  }, [user?.uid]);

  useEffect(() => {
    requests.forEach(async (request) => {
      if (studentNames[request.studentId]) return;
      const profile = await getUserById(request.studentId);
      if (profile) {
        setStudentNames((current) => ({ ...current, [request.studentId]: profile.displayName }));
      }
    });
  }, [requests, studentNames]);

  const handleAccept = async (id) => {
    setActioning(id);
    try {
      await acceptSession(id, null, `ClarioSession${id}`);
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id) => {
    setActioning(id);
    try {
      await rejectSession(id);
    } finally {
      setActioning(null);
    }
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Request queue"
        title="Review incoming session requests"
        description="Accepting a request provisions the shared session state immediately so both participants can join from separate devices."
        aside={<StatusBadge tone="coral">{requests.length} pending</StatusBadge>}
      />

      <div className="space-y-5">
        {requests.length === 0 ? (
          <GlassPanel className="py-16 text-center">
            <p className="text-lg text-white/70">No pending requests.</p>
          </GlassPanel>
        ) : (
          requests.map((request) => (
            <GlassPanel key={request.id} className="border-white/12">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold text-white">{request.skill}</h3>
                    <StatusBadge tone="coral">pending</StatusBadge>
                  </div>
                  <p className="mt-2 text-white/58">{studentNames[request.studentId] || 'Student'}</p>
                  {request.message ? (
                    <p className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm italic leading-7 text-white/72">
                      "{request.message}"
                    </p>
                  ) : null}
                </div>

                <div className="flex gap-3">
                  <PrimaryButton onClick={() => handleAccept(request.id)} disabled={actioning === request.id}>
                    {actioning === request.id ? 'Accepting...' : 'Accept'}
                  </PrimaryButton>
                  <SecondaryButton onClick={() => handleReject(request.id)} disabled={actioning === request.id} className="border-coral/20 bg-coral/12 text-coral hover:bg-coral/18">
                    Reject
                  </SecondaryButton>
                </div>
              </div>
            </GlassPanel>
          ))
        )}
      </div>
    </PageShell>
  );
}
