import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, PrimaryButton, StatusBadge } from '../components/AppShell';
import { getRatingsForTutor } from '../services/ratingService';
import { createSessionRequest } from '../services/sessionService';
import { getUserById } from '../services/userService';

function getSkillName(skill) {
  return typeof skill === 'string' ? skill : skill?.name || skill?.skill || '';
}

export default function TutorProfile({ user }) {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [skill, setSkill] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    getUserById(tutorId).then(setTutor);
    getRatingsForTutor(tutorId).then(setRatings);
  }, [tutorId]);

  const handleRequest = async (event) => {
    event.preventDefault();
    if (!user || !skill) return;
    setLoading(true);
    try {
      await createSessionRequest(user.uid, tutorId, skill, message);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (!tutor) {
    return (
      <PageShell className="flex items-center">
        <GlassPanel className="mx-auto max-w-lg text-center">
          <p className="text-white/70">Loading tutor profile...</p>
        </GlassPanel>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <button onClick={() => navigate(-1)} className="mb-6 text-sm uppercase tracking-[0.28em] text-cyan/74">
        Back
      </button>

      <PageHero
        eyebrow="Tutor profile"
        title={tutor.displayName}
        description="Review teaching skills, rates, and recent feedback before sending a request that creates a shared session record."
        aside={<StatusBadge tone="teal">{ratings?.count ? `★ ${ratings.average} / 5` : 'New tutor'}</StatusBadge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <GlassPanel>
          <p className="text-white/52">{tutor.email}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {(tutor.skills || []).map((entry) => {
              const name = getSkillName(entry);
              const rate = typeof entry === 'object' && entry.rate ? entry.rate : null;
              const slots = typeof entry === 'object' && entry.timingSlots ? entry.timingSlots : [];
              return (
                <div key={name} className="rounded-[1.3rem] border border-cyan/18 bg-cyan/10 px-4 py-3">
                  <p className="font-medium text-white">{name}</p>
                  {rate != null && rate > 0 ? <p className="mt-1 text-sm text-teal">Rs {rate} / session</p> : null}
                  {slots.length > 0 ? <p className="mt-2 text-xs text-white/58">{slots.join(', ')}</p> : null}
                </div>
              );
            })}
          </div>
        </GlassPanel>

        {user && user.uid !== tutorId ? (
          <GlassPanel>
            <h2 className="text-xl font-semibold text-white">Request a session</h2>
            {sent ? (
              <p className="mt-4 text-teal">Request sent. The tutor will see it in their realtime requests queue.</p>
            ) : (
              <form onSubmit={handleRequest} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white/76">Skill to learn</label>
                  <select
                    value={skill}
                    onChange={(event) => setSkill(event.target.value)}
                    required
                    className="w-full rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan"
                  >
                    <option value="">Select a skill</option>
                    {(tutor.skills || []).map((entry) => {
                      const name = getSkillName(entry);
                      const rate = typeof entry === 'object' && entry.rate ? entry.rate : null;
                      return (
                        <option key={name} value={name}>
                          {name}
                          {rate != null && rate > 0 ? ` - Rs ${rate}/session` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/76">Message</label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={4}
                    className="w-full rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-white placeholder-white/32 outline-none transition focus:border-cyan"
                    placeholder="What do you want to focus on?"
                  />
                </div>
                <PrimaryButton type="submit" disabled={loading} className="w-full">
                  {loading ? 'Sending request...' : 'Send request'}
                </PrimaryButton>
              </form>
            )}
          </GlassPanel>
        ) : null}
      </div>
    </PageShell>
  );
}
