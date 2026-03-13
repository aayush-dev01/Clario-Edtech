import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById } from '../services/userService';
import { getRatingsForTutor } from '../services/ratingService';
import { createSessionRequest } from '../services/sessionService';

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

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!user || !skill) return;
    setLoading(true);
    try {
      await createSessionRequest(user.uid, tutorId, skill, message);
      setSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!tutor) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-cyan hover:text-teal mb-6">← Back</button>

        <div className="bg-white/5 rounded-xl p-8 border border-white/10 mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">{tutor.displayName}</h1>
          <p className="text-white/60 mb-4">{tutor.email}</p>
          {ratings && ratings.count > 0 && (
            <p className="text-teal mb-4">★ {ratings.average} ({ratings.count} reviews)</p>
          )}
          <div className="flex flex-wrap gap-2">
            {(tutor.skills || []).map((s) => {
              const name = typeof s === 'string' ? s : (s.name || s.skill || '');
              const rate = typeof s === 'object' && s.rate ? s.rate : null;
              const slots = typeof s === 'object' && s.timingSlots ? s.timingSlots : [];
              return (
                <div key={name} className="px-3 py-2 rounded-lg bg-cyan/20 text-cyan">
                  <span>{name}</span>
                  {rate != null && rate > 0 && <span className="ml-1 text-teal">₹{rate}/session</span>}
                  {slots.length > 0 && (
                    <p className="text-white/70 text-xs mt-1">{slots.join(', ')}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {user && user.uid !== tutorId && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Request a Session</h2>
            {sent ? (
              <p className="text-teal">Request sent! The tutor will respond soon.</p>
            ) : (
              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Skill to learn</label>
                  <select
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-navy border border-white/20 text-white focus:border-cyan focus:outline-none"
                  >
                    <option value="">Select a skill</option>
                    {(tutor.skills || []).map((s) => {
                    const name = typeof s === 'string' ? s : (s.name || s.skill || '');
                    const rate = typeof s === 'object' && s.rate ? s.rate : null;
                    return (
                      <option key={name} value={name}>
                        {name}{rate != null && rate > 0 ? ` - ₹${rate}/session` : ''}
                      </option>
                    );
                  })}
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Message (optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-navy border border-white/20 text-white placeholder-white/40 focus:border-cyan focus:outline-none"
                    placeholder="Tell the tutor what you'd like to focus on..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-cyan text-navy font-semibold hover:bg-teal transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
