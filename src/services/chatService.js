import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, serverTimestamp, storage } from './firebase';

function isPermissionDenied(error) {
  return error?.code === 'permission-denied' || error?.message?.toLowerCase().includes('permission');
}

const INLINE_ATTACHMENT_LIMIT = 700 * 1024;

function chatCollection(sessionId, fallback = false) {
  if (fallback) {
    return collection(db, 'sessions', sessionId, 'chat');
  }

  return collection(doc(collection(db, 'messages'), sessionId), 'chat');
}

function participantsCollection(sessionId, fallback = false) {
  if (fallback) {
    return collection(db, 'sessions', sessionId, 'participants');
  }

  return collection(doc(collection(db, 'messages'), sessionId), 'participants');
}

function participantDoc(sessionId, userId, fallback = false) {
  return doc(participantsCollection(sessionId, fallback), userId);
}

function mapMessage(docSnapshot) {
  return {
    id: docSnapshot.id,
    ...docSnapshot.data(),
  };
}

export function subscribeSessionMessages(sessionId, callback) {
  let unsubscribe = () => {};

  const subscribeToPath = (fallback = false) => {
    const messagesQuery = query(chatCollection(sessionId, fallback), orderBy('timestamp', 'asc'));

    unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        callback(snapshot.docs.map(mapMessage));
      },
      (error) => {
        if (!fallback && isPermissionDenied(error)) {
          subscribeToPath(true);
        }
      }
    );
  };

  subscribeToPath(false);
  return () => unsubscribe();
}

export async function sendSessionMessage(sessionId, message) {
  const payload = {
    senderId: message.senderId,
    senderName: message.senderName,
    text: message.text?.trim() || '',
    type: message.type || 'text',
    attachmentName: message.attachmentName || null,
    attachmentType: message.attachmentType || null,
    attachmentUrl: message.attachmentUrl || null,
    attachmentData: message.attachmentData || null,
    attachmentSize: message.attachmentSize || null,
    usedInlineFallback: Boolean(message.usedInlineFallback),
    timestamp: serverTimestamp(),
  };

  try {
    return await addDoc(chatCollection(sessionId), payload);
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;
    return addDoc(chatCollection(sessionId, true), payload);
  }
}

export function subscribeSessionParticipants(sessionId, callback) {
  let unsubscribe = () => {};

  const subscribeToPath = (fallback = false) => {
    unsubscribe = onSnapshot(
      participantsCollection(sessionId, fallback),
      (snapshot) => {
        callback(snapshot.docs.map(mapMessage));
      },
      (error) => {
        if (!fallback && isPermissionDenied(error)) {
          subscribeToPath(true);
        }
      }
    );
  };

  subscribeToPath(false);
  return () => unsubscribe();
}

export async function syncSessionParticipant(sessionId, participant) {
  const payload = {
    senderName: participant.senderName,
    isTyping: participant.isTyping || false,
    lastReadAt: participant.lastReadAt || null,
    updatedAt: serverTimestamp(),
  };

  try {
    return await setDoc(participantDoc(sessionId, participant.userId), payload, { merge: true });
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;
    return setDoc(participantDoc(sessionId, participant.userId, true), payload, { merge: true });
  }
}

export async function setSessionParticipantTyping(sessionId, userId, senderName, isTyping) {
  return syncSessionParticipant(sessionId, {
    userId,
    senderName,
    isTyping,
  });
}

export async function markSessionChatRead(sessionId, userId, senderName) {
  return syncSessionParticipant(sessionId, {
    userId,
    senderName,
    isTyping: false,
    lastReadAt: serverTimestamp(),
  });
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

async function createInlineAttachmentPayload(file) {
  if (file.size > INLINE_ATTACHMENT_LIMIT) {
    throw new Error('Attachment upload needs Firebase Storage rules deployed for files larger than 700 KB.');
  }

  return {
    attachmentName: file.name,
    attachmentType: file.type || 'application/octet-stream',
    attachmentData: await readFileAsDataUrl(file),
    attachmentSize: file.size,
    type: file.type?.startsWith('image/') ? 'image' : 'file',
    usedInlineFallback: true,
  };
}

export function uploadSessionAttachment(sessionId, file, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(
      storage,
      `sessionChats/${sessionId}/${Date.now()}-${sanitizeFileName(file.name)}`
    );

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (!onProgress) return;
        const progress = snapshot.totalBytes
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress(progress);
      },
      reject,
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            attachmentName: file.name,
            attachmentType: file.type || 'application/octet-stream',
            attachmentUrl: downloadUrl,
            attachmentData: null,
            attachmentSize: file.size,
            type: file.type?.startsWith('image/') ? 'image' : 'file',
            usedInlineFallback: false,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  }).catch(async (error) => {
    if (!isPermissionDenied(error)) {
      throw error;
    }

    if (onProgress) {
      onProgress(100);
    }

    return createInlineAttachmentPayload(file);
  });
}
