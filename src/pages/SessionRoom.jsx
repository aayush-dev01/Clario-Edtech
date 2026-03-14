import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, PrimaryButton, SecondaryButton, StatusBadge } from '../components/AppShell';
import JitsiMeet from '../components/JitsiMeet';
import { completeSession, subscribeSessionById } from '../services/sessionService';

export default function SessionRoom({ user }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [resolved, setResolved] = useState(false);

  useEffect(
    () =>
      subscribeSessionById(sessionId, (nextSession) => {
        setSession(nextSession);
        setResolved(true);
      }),
    [sessionId]
  );

  const handleEnd = async () => {
    await completeSession(sessionId);
    navigate(`/session/complete/${sessionId}`);
  };

  const handleLeaveCall = () => {
    navigate(`/session/lobby/${sessionId}`);
  };

  const joinLink = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/session/room/${sessionId}`;
  }, [sessionId]);

  const copyJoinLink = async () => {
    await navigator.clipboard.writeText(joinLink);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1800);
  };

  if (!session && !resolved) {
    return (
      <PageShell className="flex items-center">
        <GlassPanel className="mx-auto max-w-lg text-center">
          <p className="text-white/70">Loading live room...</p>
        </GlassPanel>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell className="flex items-center">
        <GlassPanel className="mx-auto max-w-lg text-center">
          <p className="text-white/70">This room is unavailable or you do not have access to it.</p>
        </GlassPanel>
      </PageShell>
    );
  }

  const roomName = session.jitsiRoomId || `ClarioSession${sessionId}`;

  return (
    <PageShell>
      <PageHero
        eyebrow="Live session"
        title={`${session.skill} video room`}
        description="This room is backed by a shared session record, so both participants can join from different devices using the same route or room link."
        actions={
          <>
            <PrimaryButton onClick={copyJoinLink}>{linkCopied ? 'Link copied' : 'Copy room link'}</PrimaryButton>
            <SecondaryButton onClick={handleEnd} className="border-coral/20 bg-coral/12 text-coral hover:bg-coral/18">
              End session
            </SecondaryButton>
          </>
        }
        aside={<StatusBadge tone={session.status === 'in_progress' ? 'teal' : 'cyan'}>{session.status.replace('_', ' ')}</StatusBadge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <JitsiMeet roomName={roomName} userDisplayName={user?.displayName || user?.email} onEnd={handleLeaveCall} />
        </div>

        <div className="space-y-6">
          <GlassPanel>
            <h2 className="text-xl font-semibold text-white">Room controls</h2>
            <p className="mt-3 leading-7 text-white/66">Share this route or room link with the other participant. Jitsi uses the same room id across devices, so both users land in one live call.</p>
            <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-white/58">
              {joinLink}
            </div>
          </GlassPanel>

          <GlassPanel>
            <h2 className="text-xl font-semibold text-white">Connection notes</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/62">
              <li>Allow camera and microphone permissions when prompted.</li>
              <li>Use headphones to avoid echo on laptops and phones.</li>
              <li>If one device joins late, they can still use the copied room link above.</li>
            </ul>
          </GlassPanel>
        </div>
      </div>
    </PageShell>
  );
}
