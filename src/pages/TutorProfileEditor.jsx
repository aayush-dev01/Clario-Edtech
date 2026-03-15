import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, PrimaryButton, StatusBadge } from '../components/AppShell';
import { updateUser } from '../services/userService';
import { AVAILABLE_SKILLS, TIMING_OPTIONS, normalizeSkill, getSkillName } from '../utils/skills';

export default function TutorProfileEditor({ user, userProfile, onProfileUpdate }) {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [rate, setRate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [skillAdded, setSkillAdded] = useState('');

  useEffect(() => {
    if (!userProfile) return;
    setSkills((userProfile.skills || []).map(normalizeSkill));
  }, [userProfile]);

  const toggleSlot = (slot) => {
    setSelectedSlots((current) => (current.includes(slot) ? current.filter((entry) => entry !== slot) : [...current, slot]));
  };

  const addSkill = (skillName) => {
    setError('');
    setSaved(false);
    setSkillAdded('');
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
    setSkillAdded(`${name} added to your profile draft.`);
    window.setTimeout(() => setSkillAdded(''), 2500);
  };

  const buildDraftSkill = () => {
    const name = customInput.trim();
    const parsedRate = parseInt(rate, 10);

    if (!name && !rate && selectedSlots.length === 0) {
      return null;
    }

    if (!name) {
      throw new Error('Choose or enter a skill before saving.');
    }
    if (Number.isNaN(parsedRate) || parsedRate <= 0) {
      throw new Error('Enter a valid per-session rate before saving.');
    }
    if (selectedSlots.length === 0) {
      throw new Error('Select at least one timing slot before saving.');
    }
    if (skills.some((skill) => getSkillName(skill).toLowerCase() === name.toLowerCase())) {
      throw new Error('That skill is already in your profile.');
    }

    return { name, rate: parsedRate, timingSlots: [...selectedSlots] };
  };

  const choosePresetSkill = (skillName) => {
    setSaved(false);
    setError('');
    setSkillAdded('');
    setCustomInput(skillName);
  };

  const removeSkill = (skill) => {
    const name = getSkillName(skill);
    setSaved(false);
    setSkillAdded('');
    setSkills((current) => current.filter((entry) => getSkillName(entry) !== name));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user?.uid) return;
    setError('');
    setLoading(true);
    setSaved(false);
    try {
      const draftSkill = buildDraftSkill();
      const nextSkills = draftSkill ? [...skills, draftSkill] : skills;

      if (nextSkills.length === 0) {
        throw new Error('Add at least one skill before saving your tutor profile.');
      }
      const updatedProfile = await Promise.race([
        updateUser(user.uid, { skills: nextSkills }),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error('Saving is taking too long. Check your Firebase connection or permissions and try again.')), 8000);
        }),
      ]);
      setSkills(nextSkills);
      setCustomInput('');
      setRate('');
      setSelectedSlots([]);
      await onProfileUpdate?.(updatedProfile);
      setSaved(true);
      setSkillAdded('');
      window.setTimeout(() => navigate('/tutor/dashboard'), 1200);
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
        description="Manage your teaching skills, rates, and availability so students can request sessions with clear expectations."
        aside={<StatusBadge tone="cyan">{skills.length} skills listed</StatusBadge>}
      />

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <GlassPanel>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">Tutor name</p>
          <div className="mt-3 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-lg font-medium text-white">{userProfile?.displayName || user?.displayName || user?.email}</p>
            <p className="mt-1 text-sm text-white/55">Your account name is used automatically across the app.</p>
          </div>

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
                setError('');
                setSkillAdded('');
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
                setError('');
                setSkillAdded('');
                setRate(event.target.value);
              }}
              onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addSkill())}
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

          {skillAdded ? (
            <div className="mt-5 rounded-[1.2rem] border border-cyan/20 bg-cyan/12 px-4 py-3 text-sm font-medium text-cyan">
              {skillAdded}
            </div>
          ) : null}

          {saved ? (
            <div className="mt-5 rounded-[1.2rem] border border-teal/20 bg-teal/12 px-4 py-3 text-sm font-medium text-teal">
              Profile saved successfully. Redirecting to dashboard...
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
