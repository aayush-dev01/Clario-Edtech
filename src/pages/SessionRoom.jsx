import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById, completeSession } from '../services/sessionService';
import JitsiMeet from '../components/JitsiMeet';

export default function SessionRoom({ user }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    getSessionById(sessionId).then(setSession);
  }, [sessionId]);

  const handleEnd = async () => {
    await completeSession(sessionId);
    navigate(`/session/complete/${sessionId}`);
  };

  const joinLink = typeof window !== 'undefined' ? `${window.location.origin}/session/room/${sessionId}` : '';
  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  if (!session) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  const roomName = session.jitsiRoomId || `ClarioSession${sessionId}`;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-white">{session.skill} – Video Call</h1>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={copyJoinLink}
              className="px-4 py-2 rounded-lg bg-teal/20 text-teal hover:bg-teal/30 transition-colors text-sm flex items-center gap-2"
            >
              {linkCopied ? '✓ Copied!' : '📋 Copy join link'}
            </button>
            <button
              onClick={handleEnd}
              className="px-4 py-2 rounded-lg bg-coral/20 text-coral hover:bg-coral/30 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-4">
          Share the link above so your peer can join from another device. Both must be logged in.
        </p>
        <JitsiMeet
          roomName={roomName}
          userDisplayName={user?.displayName || user?.email}
          onEnd={handleEnd}
        />
      </div>
    </div>
  );
}
