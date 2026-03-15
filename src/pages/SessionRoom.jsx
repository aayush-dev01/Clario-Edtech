import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, PrimaryButton, SecondaryButton, StatusBadge } from '../components/AppShell';
import SessionChat from '../components/SessionChat';
import WebRTCCall from '../components/WebRTCCall';
import { completeSession, subscribeSessionById } from '../services/sessionService';

export default function SessionRoom({ user, userProfile }) {
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
    if (userProfile?.role === 'tutor') {
      navigate('/tutor/dashboard');
      return;
    }
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

  return (
    <PageShell>
      <PageHero
        eyebrow="Live session"
        title={`${session.skill} video room`}
        description="This room uses direct browser-to-browser WebRTC for demos, so both participants can connect inside the site from separate devices."
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
          <WebRTCCall
            sessionId={sessionId}
            userId={user?.uid}
            isTutor={userProfile?.role === 'tutor'}
            userDisplayName={user?.displayName || userProfile?.name || user?.email}
            onLeave={handleLeaveCall}
          />
        </div>

        <div className="space-y-6">
          <SessionChat
            sessionId={sessionId}
            currentUser={{
              senderId: user?.uid,
              senderName: userProfile?.displayName || userProfile?.name || user?.displayName || user?.email,
              displayName: user?.displayName,
              email: user?.email,
            }}
          />

          <GlassPanel>
            <h2 className="text-xl font-semibold text-white">Room controls</h2>
            <p className="mt-3 leading-7 text-white/66">Share this session route with the other participant. The tutor creates the demo call offer, and the second device answers inside the same room page.</p>
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
              <li>This demo flow works best on open networks. If video does not connect, try the same Wi-Fi or a hotspot.</li>
            </ul>
          </GlassPanel>
        </div>
      </div>
    </PageShell>
  );
}
