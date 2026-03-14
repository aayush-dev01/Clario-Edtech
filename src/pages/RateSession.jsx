import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, PrimaryButton } from '../components/AppShell';
import { addRating } from '../services/ratingService';
import { getSessionById } from '../services/sessionService';
import { getUserById } from '../services/userService';

export default function RateSession({ user }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getSessionById(sessionId).then((sessionData) => {
      setSession(sessionData);
      if (sessionData?.tutorId) {
        getUserById(sessionData.tutorId).then(setTutor);
      }
    });
  }, [sessionId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.uid || !session?.tutorId || rating === 0) return;
    await addRating(sessionId, user.uid, session.tutorId, rating, review);
    setSubmitted(true);
    window.setTimeout(() => navigate('/'), 1800);
  };

  return (
    <PageShell className="flex items-center">
      <div className="mx-auto w-full max-w-2xl">
        <PageHero
          eyebrow="Session feedback"
          title="Rate your session"
          description={`${session?.skill || 'Session'} with ${tutor?.displayName || 'your tutor'}`}
        />

        <GlassPanel>
          {submitted ? (
            <p className="text-center text-lg text-teal">Thanks for rating. Redirecting...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm text-white/76">Rating</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`h-14 w-14 rounded-2xl font-semibold transition ${rating >= value ? 'bg-cyan text-navy' : 'border border-white/12 bg-white/6 text-white/66 hover:bg-white/10'}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm text-white/76">Review</label>
                <textarea
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  rows={4}
                  className="w-full rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-white placeholder-white/32 outline-none transition focus:border-cyan"
                  placeholder="How did the session go?"
                />
              </div>

              <PrimaryButton type="submit" disabled={rating === 0} className="w-full">
                Submit rating
              </PrimaryButton>
            </form>
          )}
        </GlassPanel>
      </div>
    </PageShell>
  );
}
