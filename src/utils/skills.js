export const AVAILABLE_SKILLS = ['React', 'Python', 'Public Speaking', 'Photography', 'UI Design'];

export const TIMING_OPTIONS = [
  '9-11 AM',
  '11 AM-1 PM',
  '2-4 PM',
  '4-6 PM',
  '6-8 PM',
  'Weekend mornings',
  'Weekend evenings',
  'Flexible',
];

export function normalizeSkill(s) {
  if (typeof s === 'string') return { name: s, rate: 0, timingSlots: [] };
  return {
    name: s.name || s.skill || '',
    rate: s.rate ?? 0,
    timingSlots: s.timingSlots || [],
  };
}

export function getSkillName(s) {
  return typeof s === 'string' ? s : (s.name || s.skill || '');
}
