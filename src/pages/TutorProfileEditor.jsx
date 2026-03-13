import { useEffect, useState } from 'react';
import { updateUser } from '../services/userService';
import { AVAILABLE_SKILLS, TIMING_OPTIONS, normalizeSkill, getSkillName } from '../utils/skills';

export default function TutorProfileEditor({ user, userProfile, onProfileUpdate }) {
  const [displayName, setDisplayName] = useState('');
  const [skills, setSkills] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [rate, setRate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setSkills((userProfile.skills || []).map(normalizeSkill));
    }
  }, [userProfile]);

  const toggleSlot = (slot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const addSkill = (skillName) => {
    const name = (skillName || customInput.trim()).trim();
    if (!name) return;
    const rateNum = parseInt(rate, 10) || 0;
    const exists = skills.some((s) => getSkillName(s).toLowerCase() === name.toLowerCase());
    if (exists) return;
    setSkills((prev) => [...prev, { name, rate: rateNum, timingSlots: [...selectedSlots] }]);
    setCustomInput('');
    setRate('');
    setSelectedSlots([]);
  };

  const removeSkill = (skill) => {
    const name = getSkillName(skill);
    setSkills((prev) => prev.filter((s) => getSkillName(s) !== name));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setLoading(true);
    setSaved(false);
    try {
      await updateUser(user.uid, { displayName, skills });
      onProfileUpdate?.();
      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
        <p className="text-white/70 mb-8">Update your display name and skills you can teach.</p>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Add a skill</label>
            <p className="text-white/60 text-xs mb-3">Choose skill, set rate (₹) and timing slots</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {AVAILABLE_SKILLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Custom skill name..."
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-cyan focus:outline-none"
              />
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="₹ Rate"
                min="0"
                className="w-28 px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-cyan focus:outline-none"
              />
              <button
                type="button"
                onClick={() => addSkill()}
                className="px-4 py-2 rounded-lg bg-teal/20 text-teal hover:bg-teal/30 transition-colors whitespace-nowrap"
              >
                Add
              </button>
            </div>
            <div className="mb-3">
              <p className="text-white/60 text-xs mb-2">Timing slots (select before adding)</p>
              <div className="flex flex-wrap gap-2">
                {TIMING_OPTIONS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedSlots.includes(slot)
                        ? 'bg-cyan/30 text-cyan'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            {skills.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-white/70 text-sm">Your skills</p>
                {skills.map((s) => (
                  <div
                    key={getSkillName(s)}
                    className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-cyan/10 border border-cyan/20"
                  >
                    <div>
                      <span className="text-white font-medium">{getSkillName(s)}</span>
                      {s.rate > 0 && (
                        <span className="ml-2 text-teal">₹{s.rate}/session</span>
                      )}
                      {s.timingSlots?.length > 0 && (
                        <p className="text-white/60 text-xs mt-1">
                          {s.timingSlots.join(', ')}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="text-coral hover:text-coral/80"
                      aria-label={`Remove ${getSkillName(s)}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {saved && <p className="text-teal">Profile saved!</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-cyan text-navy font-semibold hover:bg-teal transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
