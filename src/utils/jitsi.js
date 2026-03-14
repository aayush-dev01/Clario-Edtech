export function sanitizeJitsiRoomName(name) {
  return (name || '').replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 100) || 'ClarioRoom';
}

export function getJitsiMeetingUrl(roomName, userDisplayName = 'Participant') {
  const safeRoom = sanitizeJitsiRoomName(roomName);
  const params = new URLSearchParams({
    'config.prejoinPageEnabled': 'false',
    'config.disableDeepLinking': 'true',
    'userInfo.displayName': userDisplayName,
  });

  return `https://meet.jit.si/${safeRoom}#${params.toString()}`;
}
