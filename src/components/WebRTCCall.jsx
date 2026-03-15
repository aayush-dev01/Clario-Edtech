import { useEffect, useRef, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { db, serverTimestamp } from '../services/firebase';

const rtcConfiguration = {
  iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }],
};

async function clearCollection(collectionRef) {
  const snapshot = await getDocs(collectionRef);
  await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
}

async function resetSignaling(sessionId) {
  const callDocRef = doc(db, 'sessions', sessionId, 'calls', 'demo');
  const offerCandidatesRef = collection(db, 'sessions', sessionId, 'calls', 'demo', 'offerCandidates');
  const answerCandidatesRef = collection(db, 'sessions', sessionId, 'calls', 'demo', 'answerCandidates');

  await Promise.all([clearCollection(offerCandidatesRef), clearCollection(answerCandidatesRef)]);
  await deleteDoc(callDocRef).catch(() => {});

  return { callDocRef, offerCandidatesRef, answerCandidatesRef };
}

export default function WebRTCCall({ sessionId, userId, isTutor, userDisplayName, onLeave }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const answerCreatedRef = useRef(false);
  const pendingCandidatesRef = useRef([]);
  const [status, setStatus] = useState('requesting-media');
  const [error, setError] = useState('');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  useEffect(() => {
    if (!sessionId || !userId) return undefined;

    let isCancelled = false;
    let unsubCall = () => {};
    let unsubCandidates = () => {};

    const flushPendingCandidates = async () => {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection?.remoteDescription) return;

      while (pendingCandidatesRef.current.length) {
        const nextCandidate = pendingCandidatesRef.current.shift();
        await peerConnection.addIceCandidate(nextCandidate).catch(() => {});
      }
    };

    const queueOrAddCandidate = async (candidateInit) => {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      const candidate = new RTCIceCandidate(candidateInit);
      if (peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(candidate).catch(() => {});
        return;
      }

      pendingCandidatesRef.current.push(candidate);
    };

    const setupCall = async () => {
      try {
        setStatus('requesting-media');
        setError('');
        answerCreatedRef.current = false;
        pendingCandidatesRef.current = [];

        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            facingMode: 'user',
            height: { ideal: 720 },
            width: { ideal: 1280 },
          },
        });

        if (isCancelled) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const remoteStream = new MediaStream();
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        const peerConnection = new RTCPeerConnection(rtcConfiguration);
        peerConnectionRef.current = peerConnection;

        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });

        peerConnection.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
          setStatus('connected');
        };

        peerConnection.oniceconnectionstatechange = () => {
          const state = peerConnection.iceConnectionState;
          if (state === 'failed' || state === 'disconnected') {
            setError('Peer connection failed. For demos, try the same Wi-Fi or mobile hotspot if networks are restrictive.');
            setStatus('error');
          } else if (state === 'checking' || state === 'connected' || state === 'completed') {
            setError('');
            setStatus(state === 'checking' ? 'connecting' : 'connected');
          }
        };

        let signalingRefs;
        if (isTutor) {
          signalingRefs = await resetSignaling(sessionId);
        } else {
          signalingRefs = {
            callDocRef: doc(db, 'sessions', sessionId, 'calls', 'demo'),
            offerCandidatesRef: collection(db, 'sessions', sessionId, 'calls', 'demo', 'offerCandidates'),
            answerCandidatesRef: collection(db, 'sessions', sessionId, 'calls', 'demo', 'answerCandidates'),
          };
        }

        const { callDocRef, offerCandidatesRef, answerCandidatesRef } = signalingRefs;

        if (isTutor) {
          peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
              await addDoc(offerCandidatesRef, event.candidate.toJSON());
            }
          };

          unsubCall = onSnapshot(callDocRef, async (snapshot) => {
            if (!snapshot.exists()) return;
            const data = snapshot.data();
            if (data?.answer && !peerConnection.currentRemoteDescription) {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
              await flushPendingCandidates();
              setStatus('connecting');
            }
          });

          unsubCandidates = onSnapshot(answerCandidatesRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                queueOrAddCandidate(change.doc.data());
              }
            });
          });

          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          await setDoc(callDocRef, {
            createdAt: serverTimestamp(),
            hostId: userId,
            hostName: userDisplayName || 'Tutor',
            offer: {
              sdp: offer.sdp,
              type: offer.type,
            },
            updatedAt: serverTimestamp(),
          });
          setStatus('waiting-peer');
          return;
        }

        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            await addDoc(answerCandidatesRef, event.candidate.toJSON());
          }
        };

        unsubCall = onSnapshot(callDocRef, async (snapshot) => {
          const data = snapshot.data();

          if (!snapshot.exists() || !data?.offer) {
            setStatus('waiting-peer');
            return;
          }

          if (!peerConnection.currentRemoteDescription) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            await flushPendingCandidates();
          }

          if (!answerCreatedRef.current) {
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            await setDoc(
              callDocRef,
              {
                answer: {
                  sdp: answer.sdp,
                  type: answer.type,
                },
                guestId: userId,
                guestName: userDisplayName || 'Student',
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
            answerCreatedRef.current = true;
            setStatus('connecting');
          }
        });

        unsubCandidates = onSnapshot(offerCandidatesRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              queueOrAddCandidate(change.doc.data());
            }
          });
        });
      } catch (setupError) {
        if (isCancelled) return;
        setError(setupError?.message || 'Unable to start the camera and microphone for this demo call.');
        setStatus('error');
      }
    };

    setupCall();

    return () => {
      isCancelled = true;
      unsubCall();
      unsubCandidates();

      if (peerConnectionRef.current) {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((track) => track.stop());
        remoteStreamRef.current = null;
      }
    };
  }, [isTutor, sessionId, userDisplayName, userId]);

  const toggleTracks = (kind) => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextEnabled = kind === 'audio' ? !isMicEnabled : !isCameraEnabled;
    stream.getTracks().forEach((track) => {
      if (track.kind === kind) {
        track.enabled = nextEnabled;
      }
    });

    if (kind === 'audio') {
      setIsMicEnabled(nextEnabled);
      return;
    }

    setIsCameraEnabled(nextEnabled);
  };

  const statusText = {
    'requesting-media': 'Requesting camera and microphone',
    'waiting-peer': isTutor ? 'Waiting for the student to join' : 'Waiting for the tutor to open the room',
    connecting: 'Connecting peer-to-peer',
    connected: 'Live demo call connected',
    error: 'Connection issue',
  };

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#06101e] shadow-[0_28px_80px_rgba(4,10,20,0.32)]">
        <div className="grid min-h-[520px] gap-4 p-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/60">
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full min-h-[360px] w-full object-cover" />
            {status !== 'connected' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#06101e]/78 backdrop-blur-md">
                <div className="text-center">
                  <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-cyan/20 border-t-cyan" />
                  <p className="mt-4 text-sm uppercase tracking-[0.28em] text-cyan/75">{statusText[status]}</p>
                </div>
              </div>
            ) : null}
            <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/72">
              Remote feed
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/70">
              <video ref={localVideoRef} autoPlay muted playsInline className="h-[250px] w-full object-cover" />
              <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/72">
                You
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">Call status</p>
              <p className="mt-3 text-lg font-semibold text-white">{statusText[status]}</p>
              <p className="mt-3 text-sm leading-7 text-white/62">
                This demo uses direct browser-to-browser WebRTC via Firestore signaling. If a strict network blocks peer traffic, try the same Wi-Fi or a hotspot.
              </p>

              {error ? (
                <div className="mt-4 rounded-[1.2rem] border border-coral/24 bg-coral/12 px-4 py-3 text-sm text-coral">
                  {error}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => toggleTracks('audio')}
                  className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-white/82 transition hover:border-cyan/30 hover:bg-white/10"
                >
                  {isMicEnabled ? 'Mute mic' : 'Unmute mic'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleTracks('video')}
                  className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-white/82 transition hover:border-cyan/30 hover:bg-white/10"
                >
                  {isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
                </button>
                <button
                  type="button"
                  onClick={onLeave}
                  className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-white/82 transition hover:border-cyan/30 hover:bg-white/10"
                >
                  Leave room
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
