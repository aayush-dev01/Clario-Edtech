import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById } from '../services/sessionService';
import { startSession } from '../services/sessionService';
import { getUserById } from '../services/userService';

export default function SessionLobby({ user, userProfile }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    getSessionById(sessionId).then(setSession);
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    const otherId = user?.uid === session.studentId ? session.tutorId : session.studentId;
    getUserById(otherId).then(setOtherUser);
  }, [session, user?.uid]);

  const canJoin = session && (session.status === 'accepted' || session.status === 'in_progress');
  const isTutor = user?.uid === session?.tutorId;

  const handleJoin = async () => {
    if (!canJoin) return;
    if (isTutor && session.status === 'accepted') {
      await startSession(sessionId);
    }
    navigate(`/session/room/${sessionId}`);
  };

  if (!session) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen px-6 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white/5 rounded-xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-6">Session Lobby</h1>
          <p className="text-white/80 mb-2">Skill: <span className="text-cyan">{session.skill}</span></p>
          <p className="text-white/60 mb-6">With: {otherUser?.displayName || 'Loading...'}</p>
          <p className="text-white/60 mb-6">Status: <span className="text-teal">{session.status}</span></p>

          {canJoin ? (
            <>
              <button
                onClick={handleJoin}
                className="w-full py-4 rounded-xl bg-cyan text-navy font-semibold hover:bg-teal transition-colors mb-4"
              >
                Join Video Call
              </button>
              <p className="text-white/50 text-xs text-center">
                Both you and your peer can join from different devices. Just open the session and click Join.
              </p>
            </>
          ) : (
            <p className="text-white/60 text-center">Waiting for session to be accepted...</p>
          )}
        </div>
      </div>
    </div>
  );
}
