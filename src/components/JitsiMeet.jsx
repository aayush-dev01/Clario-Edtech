import { useEffect, useRef, useState } from 'react';

function sanitizeRoomName(name) {
  return (name || '').replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 100) || 'ClarioRoom';
}

export default function JitsiMeet({ roomName, userDisplayName, onEnd }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !roomName) return;

    setLoading(true);
    setError(null);
    const safeRoom = sanitizeRoomName(roomName);

    const initJitsi = () => {
      if (typeof window.JitsiMeetExternalAPI === 'undefined') {
        setTimeout(initJitsi, 200);
        return;
      }

      try {
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: safeRoom,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'hangup',
              'chat',
              'settings',
            ],
          },
          userInfo: {
            displayName: userDisplayName || 'Participant',
          },
        });

        api.addEventListener('videoConferenceLeft', () => {
          onEnd?.();
        });

        api.addEventListener('videoConferenceJoined', () => {
          setLoading(false);
          setError(null);
        });

        apiRef.current = api;
      } catch (err) {
        setError('Failed to start video call. Please try again.');
        setLoading(false);
      }
    };

    initJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, userDisplayName, onEnd]);

  return (
    <div className="w-full min-h-[400px] h-[70vh] rounded-xl overflow-hidden bg-navy relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-navy z-10">
          <p className="text-cyan">Connecting to video call...</p>
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded bg-coral/20 text-coral text-sm z-20">
          {error}
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
