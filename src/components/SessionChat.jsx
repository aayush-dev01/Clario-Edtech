import { useEffect, useMemo, useRef, useState } from 'react';
import { GlassPanel, PrimaryButton, SecondaryButton } from './AppShell';
import {
  markSessionChatRead,
  sendSessionMessage,
  setSessionParticipantTyping,
  subscribeSessionMessages,
  subscribeSessionParticipants,
  syncSessionParticipant,
  uploadSessionAttachment,
} from '../services/chatService';

function ignorePromise(promise) {
  promise?.catch(() => {});
}

function formatMessageTime(timestamp) {
  if (!timestamp) return 'Sending...';

  const date =
    typeof timestamp?.toDate === 'function'
      ? timestamp.toDate()
      : new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);

  if (Number.isNaN(date.getTime())) return 'Sending...';

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatMessageDate(timestamp) {
  if (!timestamp) return 'Today';

  const date =
    typeof timestamp?.toDate === 'function'
      ? timestamp.toDate()
      : new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);

  if (Number.isNaN(date.getTime())) return 'Today';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function isSameDay(leftTimestamp, rightTimestamp) {
  if (!leftTimestamp || !rightTimestamp) return false;

  const leftDate =
    typeof leftTimestamp?.toDate === 'function'
      ? leftTimestamp.toDate()
      : new Date(leftTimestamp.seconds ? leftTimestamp.seconds * 1000 : leftTimestamp);
  const rightDate =
    typeof rightTimestamp?.toDate === 'function'
      ? rightTimestamp.toDate()
      : new Date(rightTimestamp.seconds ? rightTimestamp.seconds * 1000 : rightTimestamp);

  if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) return false;

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
}

export default function SessionChat({ sessionId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachmentNotice, setAttachmentNotice] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => subscribeSessionMessages(sessionId, setMessages), [sessionId]);
  useEffect(() => subscribeSessionParticipants(sessionId, setParticipants), [sessionId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const senderName = useMemo(
    () => currentUser?.senderName || currentUser?.displayName || currentUser?.email || 'Participant',
    [currentUser]
  );

  useEffect(() => {
    if (!currentUser?.senderId) return undefined;

    ignorePromise(syncSessionParticipant(sessionId, {
      userId: currentUser.senderId,
      senderName,
      isTyping: false,
    }));

    return () => {
      ignorePromise(setSessionParticipantTyping(sessionId, currentUser.senderId, senderName, false));
    };
  }, [currentUser?.senderId, senderName, sessionId]);

  const currentParticipant = useMemo(
    () => participants.find((participant) => participant.id === currentUser?.senderId) || null,
    [currentUser?.senderId, participants]
  );

  const unreadCount = useMemo(() => {
    const lastReadAt = currentParticipant?.lastReadAt;
    const lastReadTime =
      typeof lastReadAt?.toDate === 'function'
        ? lastReadAt.toDate().getTime()
        : lastReadAt?.seconds
          ? lastReadAt.seconds * 1000
          : 0;

    return messages.filter((message) => {
      if (message.senderId === currentUser?.senderId) return false;
      const messageTime =
        typeof message.timestamp?.toDate === 'function'
          ? message.timestamp.toDate().getTime()
          : message.timestamp?.seconds
            ? message.timestamp.seconds * 1000
            : 0;
      return messageTime > lastReadTime;
    }).length;
  }, [currentParticipant?.lastReadAt, currentUser?.senderId, messages]);

  const typingNames = useMemo(
    () =>
      participants
        .filter((participant) => participant.id !== currentUser?.senderId && participant.isTyping)
        .map((participant) => participant.senderName || 'Participant'),
    [currentUser?.senderId, participants]
  );

  useEffect(() => {
    if (!currentUser?.senderId || !unreadCount) return undefined;

    const syncReadState = () => {
      if (document.visibilityState !== 'visible') return;
      ignorePromise(markSessionChatRead(sessionId, currentUser.senderId, senderName));
    };

    syncReadState();
    window.addEventListener('focus', syncReadState);
    document.addEventListener('visibilitychange', syncReadState);

    return () => {
      window.removeEventListener('focus', syncReadState);
      document.removeEventListener('visibilitychange', syncReadState);
    };
  }, [currentUser?.senderId, senderName, sessionId, unreadCount]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);
    setUploadProgress(0);
  };

  const handleDraftChange = (event) => {
    const nextDraft = event.target.value;
    setDraft(nextDraft);

    if (!currentUser?.senderId) return;

    const isTyping = Boolean(nextDraft.trim());
    ignorePromise(setSessionParticipantTyping(sessionId, currentUser.senderId, senderName, isTyping));

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    if (!isTyping) return;

    typingTimeoutRef.current = window.setTimeout(() => {
      ignorePromise(setSessionParticipantTyping(sessionId, currentUser.senderId, senderName, false));
    }, 1200);
  };

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    },
    []
  );

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if ((!text && !selectedFile) || !currentUser?.senderId) return;

    setIsSending(true);
    setError('');

    try {
      let attachmentPayload = null;

      if (selectedFile) {
        setIsUploading(true);
        attachmentPayload = await uploadSessionAttachment(sessionId, selectedFile, setUploadProgress);
        if (attachmentPayload?.usedInlineFallback) {
          setAttachmentNotice('Storage upload was unavailable, so this file was sent using inline fallback mode.');
        } else {
          setAttachmentNotice('');
        }
      }

      await sendSessionMessage(sessionId, {
        senderId: currentUser.senderId,
        senderName,
        text,
        ...attachmentPayload,
      });
      setDraft('');
      setSelectedFile(null);
      setUploadProgress(0);
      ignorePromise(setSessionParticipantTyping(sessionId, currentUser.senderId, senderName, false));
      ignorePromise(markSessionChatRead(sessionId, currentUser.senderId, senderName));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (sendError) {
      setError(sendError?.message || 'Unable to send message right now.');
    } finally {
      setIsUploading(false);
      setIsSending(false);
    }
  };

  return (
    <GlassPanel className="relative z-20 flex h-[32rem] flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Session chat</h2>
          <p className="mt-2 text-sm leading-6 text-white/62">
            Messages sync instantly for the tutor and student in this room.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount ? (
            <span className="rounded-full border border-coral/20 bg-coral/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-coral">
              {unreadCount} unread
            </span>
          ) : null}
          <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan">
            Live
          </span>
        </div>
      </div>

      <div
        ref={listRef}
        className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-[1.4rem] border border-white/10 bg-slate-950/30 p-4"
      >
        {messages.length ? (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUser?.senderId;
            const showDateDivider =
              index === 0 || !isSameDay(message.timestamp, messages[index - 1]?.timestamp);
            const attachmentSource = message.attachmentUrl || message.attachmentData || null;

            return (
              <div key={message.id}>
                {showDateDivider ? (
                  <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/34">
                    <span className="h-px flex-1 bg-white/10" />
                    <span>{formatMessageDate(message.timestamp)}</span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                ) : null}

                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-[1.2rem] px-4 py-3 shadow-[0_16px_40px_rgba(4,10,20,0.18)] ${
                      isOwnMessage
                        ? 'bg-cyan text-navy'
                        : 'border border-white/10 bg-white/8 text-white'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-3 text-xs ${
                        isOwnMessage ? 'text-navy/70' : 'text-white/52'
                      }`}
                    >
                      <span className="font-semibold">{message.senderName || 'Participant'}</span>
                      <span>{formatMessageTime(message.timestamp)}</span>
                    </div>
                    {attachmentSource ? (
                      <div className="mt-3">
                        {message.type === 'image' ? (
                          <a href={attachmentSource} target="_blank" rel="noreferrer">
                            <img
                              src={attachmentSource}
                              alt={message.attachmentName || 'Shared image'}
                              className="max-h-60 rounded-2xl object-cover"
                            />
                          </a>
                        ) : (
                          <a
                            href={attachmentSource}
                            target="_blank"
                            rel="noreferrer"
                            download={message.attachmentName || 'attachment'}
              className={`inline-flex items-center rounded-xl border px-3 py-2 text-sm ${
                              isOwnMessage
                                ? 'border-navy/10 bg-white/30 text-navy'
                                : 'border-white/10 bg-slate-900/30 text-white/88'
                            }`}
                          >
                            {message.attachmentName || 'Open attachment'}
                          </a>
                        )}
                        {message.usedInlineFallback ? (
                          <p
                            className={`mt-2 text-xs ${
                              isOwnMessage ? 'text-navy/70' : 'text-white/50'
                            }`}
                          >
                            Sent using fallback mode because Firebase Storage was unavailable.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {message.text ? (
                      <p
                        className={`mt-2 whitespace-pre-wrap break-words text-sm leading-6 ${
                          isOwnMessage ? 'text-navy' : 'text-white/84'
                        }`}
                      >
                        {message.text}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-full items-center justify-center rounded-[1.2rem] border border-dashed border-white/10 text-center text-sm text-white/46">
            No messages yet. Start the conversation for this session.
          </div>
        )}
      </div>

      <div className="mt-3 min-h-6 text-sm text-white/52">
        {typingNames.length ? `${typingNames.join(', ')} ${typingNames.length > 1 ? 'are' : 'is'} typing...` : ''}
      </div>

      <form onSubmit={handleSend} className="mt-5">
        <label className="sr-only" htmlFor="session-chat-message">
          Type a message
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="session-chat-message"
            type="text"
            value={draft}
            onChange={handleDraftChange}
            placeholder="Type a message..."
            maxLength={1000}
            className="flex-1 rounded-[1.1rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan/40 focus:bg-white/10"
          />
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
              className="hidden"
            />
            <SecondaryButton type="button" onClick={() => fileInputRef.current?.click()}>
              Attach file
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isSending || (!draft.trim() && !selectedFile)}>
              {isUploading ? `Uploading ${uploadProgress}%` : isSending ? 'Sending...' : 'Send'}
            </PrimaryButton>
          </div>
        </div>
        {selectedFile ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/76">
            <span className="truncate">
              {selectedFile.name} ({Math.max(1, Math.round(selectedFile.size / 1024))} KB)
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setUploadProgress(0);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-white/54 transition hover:text-white"
            >
              Remove
            </button>
          </div>
        ) : null}
        {selectedFile && selectedFile.size > 700 * 1024 ? (
          <p className="mt-3 text-xs text-white/46">
            Files over 700 KB need Firebase Storage rules deployed before they can be sent.
          </p>
        ) : null}
        {attachmentNotice ? <p className="mt-3 text-xs text-amber-300">{attachmentNotice}</p> : null}
        {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
      </form>
    </GlassPanel>
  );
}
