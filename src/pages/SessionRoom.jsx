import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, PrimaryButton, SecondaryButton, StatusBadge } from '../components/AppShell';
import DailyCall from '../components/DailyCall';
import { completeSession, subscribeSessionById } from '../services/sessionService';

export default function SessionRoom({ user, userProfile }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [dailyRoom, setDailyRoom] = useState(null);
  const [dailyError, setDailyError] = useState('');
  const [dailyLoading, setDailyLoading] = useState(true);

  useEffect(
    () =>
      subscribeSessionById(sessionId, (nextSession) => {
        setSession(nextSession);
        setResolved(true);
      }),
    [sessionId]
  );

  useEffect(() => {
    if (!session || !userProfile?.role) return undefined;

    const controller = new AbortController();

    const prepareRoom = async () => {
      setDailyLoading(true);
      setDailyError('');

      try {
        const response = await fetch('/api/daily-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userName: user?.displayName || userProfile?.name || user?.email || 'Participant',
            isOwner: userProfile.role === 'tutor',
          }),
          signal: controller.signal,
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to prepare the Daily room.');
        }

        setDailyRoom(payload);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setDailyError(error?.message || 'Failed to prepare the Daily room.');
      } finally {
        if (!controller.signal.aborted) {
          setDailyLoading(false);
        }
      }
    };

    prepareRoom();

    return () => controller.abort();
  }, [session, sessionId, user, userProfile]);

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
        description="This room is backed by a shared session record, so both participants can join the same Daily call from different devices."
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
          {dailyError ? (
            <GlassPanel className="flex min-h-[460px] items-center justify-center text-center">
              <div className="max-w-md">
                <p className="text-lg font-semibold text-white">Call setup failed</p>
                <p className="mt-3 leading-7 text-white/64">{dailyError}</p>
              </div>
            </GlassPanel>
          ) : dailyLoading || !dailyRoom ? (
            <GlassPanel className="flex min-h-[460px] items-center justify-center text-center">
              <div>
                <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-cyan/20 border-t-cyan" />
                <p className="mt-4 text-sm uppercase tracking-[0.28em] text-cyan/75">Preparing Daily room</p>
              </div>
            </GlassPanel>
          ) : (
            <DailyCall
              roomUrl={dailyRoom.roomUrl}
              token={dailyRoom.token}
              userDisplayName={user?.displayName || userProfile?.name || user?.email}
              onLeave={handleLeaveCall}
            />
          )}
        </div>

        <div className="space-y-6">
          <GlassPanel>
            <h2 className="text-xl font-semibold text-white">Room controls</h2>
            <p className="mt-3 leading-7 text-white/66">Share this session route with the other participant. Both users are issued a room token for the same Daily room, so they land in one live call.</p>
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

