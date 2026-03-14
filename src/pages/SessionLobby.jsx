import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, PrimaryButton, SecondaryButton, StatusBadge } from '../components/AppShell';
import { startSession, subscribeSessionById } from '../services/sessionService';
import { getUserById } from '../services/userService';

export default function SessionLobby({ user }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [copyState, setCopyState] = useState(false);
  const [resolved, setResolved] = useState(false);

  useEffect(
    () =>
      subscribeSessionById(sessionId, (nextSession) => {
        setSession(nextSession);
        setResolved(true);
      }),
    [sessionId]
  );

  useEffect(() => {
    if (!session || !user?.uid) return;
    const otherId = user.uid === session.studentId ? session.tutorId : session.studentId;
    getUserById(otherId).then(setOtherUser);
  }, [session, user?.uid]);

  const status = session?.status || 'pending';
  const canJoin = status === 'accepted' || status === 'in_progress';
  const isCompleted = status === 'completed';
  const isRejected = status === 'rejected';
  const isTutor = user?.uid === session?.tutorId;

  const joinLink = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/session/room/${sessionId}`;
  }, [sessionId]);

  const handleJoin = async () => {
    if (isCompleted) {
      navigate(isTutor ? '/tutor/dashboard' : `/session/complete/${sessionId}`);
      return;
    }

    if (isRejected || !canJoin) return;

    if (isTutor && session.status === 'accepted') {
      await startSession(sessionId);
    }
    navigate(`/session/room/${sessionId}`);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinLink);
    setCopyState(true);
    window.setTimeout(() => setCopyState(false), 1800);
  };

  if (!session && !resolved) {
    return (
      <PageShell className="flex items-center">
        <GlassPanel className="mx-auto max-w-lg text-center">
          <p className="text-white/70">Loading session lobby...</p>
        </GlassPanel>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell className="flex items-center">
        <GlassPanel className="mx-auto max-w-lg text-center">
          <p className="text-white/70">This session is unavailable or you do not have access to it.</p>
        </GlassPanel>
      </PageShell>
    );
  }

  const ctaLabel = isCompleted
    ? isTutor
      ? 'Back to dashboard'
      : 'View session summary'
    : canJoin
      ? 'Join video call'
      : isRejected
        ? 'Session unavailable'
        : 'Waiting for acceptance';

  const joinFlowDescription = isCompleted
    ? 'This session has already ended. Use the action on the right to return to the right post-session screen.'
    : isRejected
      ? 'This request was not accepted, so the live room is no longer available.'
      : 'Share the room link if needed. Once the session is accepted, both devices will open the same in-site WebRTC room.';

  return (
    <PageShell>
      <PageHero
        eyebrow="Session lobby"
        title={session.skill}
        description="This lobby reflects live session status. Once accepted, both participants can join the same room from separate devices."
        aside={<StatusBadge tone={canJoin ? 'cyan' : isCompleted ? 'teal' : 'default'}>{status.replace('_', ' ')}</StatusBadge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel>
          <h2 className="text-xl font-semibold text-white">Session details</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">With</p>
              <p className="mt-2 text-lg text-white">{otherUser?.displayName || otherUser?.name || 'Loading...'}</p>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">Join flow</p>
              <p className="mt-2 leading-7 text-white/66">{joinFlowDescription}</p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel>
          <h2 className="text-xl font-semibold text-white">Ready to connect</h2>
          <p className="mt-3 leading-7 text-white/66">When the session is accepted, the join button opens the live room immediately. If you are on a second device, use the shared link below.</p>

          <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-white/58">
            {joinLink}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryButton onClick={handleJoin} disabled={!canJoin && !isCompleted}>
              {ctaLabel}
            </PrimaryButton>
            <SecondaryButton onClick={handleCopy}>{copyState ? 'Link copied' : 'Copy join link'}</SecondaryButton>
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}

