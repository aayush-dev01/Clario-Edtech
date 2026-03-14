import DailyIframe from '@daily-co/daily-js';
import { useEffect, useRef, useState } from 'react';

export default function DailyCall({ roomUrl, token, userDisplayName, onLeave }) {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current || !roomUrl || !token) return undefined;

    const frame = DailyIframe.createFrame(containerRef.current, {
      showLeaveButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
      },
    });

    frameRef.current = frame;

    frame.on('joined-meeting', () => {
      setStatus('connected');
      setError('');
    });

    frame.on('left-meeting', () => {
      onLeave?.();
    });

    frame.on('error', (event) => {
      setError(event?.errorMsg || 'Failed to connect to the Daily call.');
      setStatus('error');
    });

    frame
      .join({
        url: roomUrl,
        token,
        userName: userDisplayName || 'Participant',
      })
      .catch((joinError) => {
        setError(joinError?.message || 'Failed to join the Daily room.');
        setStatus('error');
      });

    return () => {
      if (frameRef.current) {
        frameRef.current.leave().catch(() => {});
        frameRef.current.destroy();
        frameRef.current = null;
      }
    };
  }, [roomUrl, token, userDisplayName, onLeave]);

  return (
    <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#06101e]">
      {status !== 'connected' && !error ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#06101e]/90 backdrop-blur-md">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-cyan/20 border-t-cyan" />
            <p className="mt-4 text-sm uppercase tracking-[0.28em] text-cyan/75">Connecting call</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-coral/30 bg-coral/15 px-4 py-2 text-sm text-coral backdrop-blur-md">
          {error}
        </div>
      ) : null}

      <div ref={containerRef} className="h-[72vh] min-h-[460px] w-full" />
    </div>
  );
}
