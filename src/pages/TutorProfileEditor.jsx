import { useEffect, useState } from 'react';
import { GlassPanel, PageHero, PageShell, PrimaryButton, StatusBadge } from '../components/AppShell';
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
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userProfile) return;
    setDisplayName(userProfile.displayName || '');
    setSkills((userProfile.skills || []).map(normalizeSkill));
  }, [userProfile]);

  const toggleSlot = (slot) => {
    setSelectedSlots((current) => (current.includes(slot) ? current.filter((entry) => entry !== slot) : [...current, slot]));
  };

  const addSkill = (skillName) => {
    setError('');
    setSaved(false);
    const name = (skillName || customInput.trim()).trim();
    if (!name) {
      setError('Choose or enter a skill before adding it.');
      return;
    }
    const parsedRate = parseInt(rate, 10);
    if (Number.isNaN(parsedRate) || parsedRate <= 0) {
      setError('Enter a valid per-session rate before adding a skill.');
      return;
    }
    if (selectedSlots.length === 0) {
      setError('Select at least one timing slot before adding a skill.');
      return;
    }
    const exists = skills.some((skill) => getSkillName(skill).toLowerCase() === name.toLowerCase());
    if (exists) {
      setError('That skill is already in your profile.');
      return;
    }
    setSkills((current) => [...current, { name, rate: parsedRate, timingSlots: [...selectedSlots] }]);
    setCustomInput('');
    setRate('');
    setSelectedSlots([]);
  };

  const choosePresetSkill = (skillName) => {
    setSaved(false);
    setCustomInput(skillName);
  };

  const removeSkill = (skill) => {
    const name = getSkillName(skill);
    setSkills((current) => current.filter((entry) => getSkillName(entry) !== name));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user?.uid) return;
    setError('');
    setLoading(true);
    setSaved(false);
    try {
      if (!displayName.trim()) {
        throw new Error('Display name is required.');
      }
      if (customInput.trim() || rate || selectedSlots.length > 0) {
        throw new Error('You have a skill draft in progress. Click "Add skill" before saving.');
      }
      if (skills.length === 0) {
        throw new Error('Add at least one skill before saving your tutor profile.');
      }
      await updateUser(user.uid, { displayName, skills });
      await onProfileUpdate?.();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Tutor profile editor"
        title="Shape your teaching presence"
        description="Keep your display name, skills, rates, and availability polished so students can request sessions with clear expectations."
        aside={<StatusBadge tone="cyan">{skills.length} skills listed</StatusBadge>}
      />

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <GlassPanel>
          <label className="mb-3 block text-sm text-white/76">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(event) => {
              setSaved(false);
              setDisplayName(event.target.value);
            }}
            required
            className="w-full rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan"
          />

          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">Timing slots</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TIMING_OPTIONS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setSaved(false);
                    toggleSlot(slot);
                  }}
                  className={`rounded-full px-4 py-2 text-sm transition ${selectedSlots.includes(slot) ? 'bg-cyan text-navy' : 'border border-white/10 bg-white/5 text-white/68 hover:bg-white/10'}`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">Add skills</p>
          <p className="mt-2 text-sm text-white/58">Choose a preset or type a custom skill, then set rate and timing before adding it.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {AVAILABLE_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => choosePresetSkill(skill)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  customInput === skill
                    ? 'border-cyan/30 bg-cyan text-navy'
                    : 'border-white/10 bg-white/5 text-white/68 hover:bg-white/10'
                }`}
              >
                + {skill}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_140px_auto]">
            <input
              type="text"
              value={customInput}
              onChange={(event) => {
                setSaved(false);
                setCustomInput(event.target.value);
              }}
              onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addSkill())}
              placeholder="Custom skill name"
              className="rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-white placeholder-white/32 outline-none transition focus:border-cyan"
            />
            <input
              type="number"
              value={rate}
              onChange={(event) => {
                setSaved(false);
                setRate(event.target.value);
              }}
              placeholder="Rate"
              min="0"
              className="rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-white placeholder-white/32 outline-none transition focus:border-cyan"
            />
            <button
              type="button"
              onClick={() => addSkill()}
              className="rounded-[1rem] border border-teal/20 bg-teal/12 px-4 py-3 font-medium text-teal transition hover:bg-teal/18"
            >
              Add skill
            </button>
          </div>

          <p className="mt-3 text-xs text-white/48">Both rate and timing are required for every skill.</p>

          {saved ? (
            <div className="mt-5 rounded-[1.2rem] border border-teal/20 bg-teal/12 px-4 py-3 text-sm font-medium text-teal">
              Profile saved successfully.
            </div>
          ) : null}

          {skills.length > 0 ? (
            <div className="mt-6 space-y-3">
              {skills.map((skill) => (
                <div key={getSkillName(skill)} className="flex items-start justify-between gap-4 rounded-[1.3rem] border border-cyan/18 bg-cyan/10 px-4 py-4">
                  <div>
                    <p className="font-medium text-white">{getSkillName(skill)}</p>
                    {skill.rate > 0 ? <p className="mt-1 text-sm text-teal">Rs {skill.rate} / session</p> : null}
                    {skill.timingSlots?.length > 0 ? <p className="mt-2 text-xs text-white/58">{skill.timingSlots.join(', ')}</p> : null}
                  </div>
                  <button type="button" onClick={() => removeSkill(skill)} className="text-sm text-coral transition hover:text-white">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex items-center gap-4">
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? 'Saving...' : saved ? 'Saved' : 'Save profile'}
            </PrimaryButton>
          </div>
          {error ? <p className="mt-4 text-sm text-coral">{error}</p> : null}
        </GlassPanel>
      </form>
    </PageShell>
  );
}
