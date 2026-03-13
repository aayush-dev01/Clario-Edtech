import { getUsers, setUsers } from './localStore';

export async function getUserById(uid) {
  const users = getUsers();
  const profile = users[uid];
  if (!profile) return null;
  const { password: _, ...safe } = profile;
  return { id: profile.id, ...safe };
}

export async function updateUser(uid, data) {
  const users = getUsers();
  if (!users[uid]) return;
  users[uid] = { ...users[uid], ...data, updatedAt: new Date().toISOString() };
  setUsers(users);
}

function skillMatches(skills, skillName) {
  return (skills || []).some((s) => {
    const name = typeof s === 'string' ? s : (s.name || s.skill || '');
    return name.toLowerCase() === skillName.toLowerCase();
  });
}

export async function getTutorsBySkill(skill) {
  const users = getUsers();
  return Object.values(users)
    .filter((u) => u.role === 'tutor' && skillMatches(u.skills, skill))
    .map((u) => { const { password: _, ...safe } = u; return { id: u.id, ...safe }; });
}

export async function getAllTutors() {
  const users = getUsers();
  return Object.values(users)
    .filter((u) => u.role === 'tutor')
    .map((u) => { const { password: _, ...safe } = u; return { id: u.id, ...safe }; });
}

export async function addTutorSkill(uid, skill) {
  const users = getUsers();
  const user = users[uid];
  if (!user) return;
  const skills = user.skills || [];
  if (!skills.includes(skill)) {
    skills.push(skill);
    user.skills = skills;
    user.updatedAt = new Date().toISOString();
    setUsers(users);
  }
}

export async function removeTutorSkill(uid, skill) {
  const users = getUsers();
  const user = users[uid];
  if (!user) return;
  user.skills = (user.skills || []).filter((s) => s !== skill);
  user.updatedAt = new Date().toISOString();
  setUsers(users);
}
