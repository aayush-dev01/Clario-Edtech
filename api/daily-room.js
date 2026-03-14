/* global process */

const DAILY_API_BASE = 'https://api.daily.co/v1';

function getDailyApiKey() {
  return process.env.DAILY_API_KEY;
}

function getDailyDomain() {
  return process.env.DAILY_DOMAIN || process.env.VITE_DAILY_DOMAIN;
}

function getRoomName(sessionId) {
  return `clario-session-${String(sessionId || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64)}`;
}

async function dailyRequest(path, options = {}) {
  const response = await fetch(`${DAILY_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getDailyApiKey()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Daily API request failed with ${response.status}`);
  }

  return response.json();
}

async function ensureRoom(roomName) {
  try {
    return await dailyRequest(`/rooms/${roomName}`);
  } catch {
    return dailyRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          enable_prejoin_ui: false,
          enable_chat: true,
          enable_screenshare: true,
          eject_at_room_exp: true,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        },
      }),
    });
  }
}

async function createMeetingToken({ roomName, userName, isOwner }) {
  return dailyRequest('/meeting-tokens', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: Boolean(isOwner),
        user_name: userName || 'Participant',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        enable_prejoin_ui: false,
      },
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!getDailyApiKey()) {
    res.status(500).json({ error: 'Missing DAILY_API_KEY' });
    return;
  }

  if (!getDailyDomain()) {
    res.status(500).json({ error: 'Missing DAILY_DOMAIN or VITE_DAILY_DOMAIN' });
    return;
  }

  try {
    const { sessionId, userName, isOwner } = req.body || {};

    if (!sessionId) {
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }

    const roomName = getRoomName(sessionId);
    await ensureRoom(roomName);
    const tokenResponse = await createMeetingToken({ roomName, userName, isOwner });

    res.status(200).json({
      roomName,
      roomUrl: `https://${getDailyDomain()}/${roomName}`,
      token: tokenResponse.token,
    });
  } catch (error) {
    res.status(500).json({
      error: error?.message || 'Failed to provision Daily room',
    });
  }
}


