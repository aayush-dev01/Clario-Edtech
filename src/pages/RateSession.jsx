import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    getSessionById(sessionId).then((s) => {
      setSession(s);
      if (s?.tutorId) {
        getUserById(s.tutorId).then(setTutor);
      }
    });
  }, [sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid || !session?.tutorId || rating === 0) return;
    await addRating(sessionId, user.uid, session.tutorId, rating, review);
    setSubmitted(true);
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="min-h-screen px-6 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white/5 rounded-xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-2">Rate this Session</h1>
          <p className="text-white/60 mb-6">{session?.skill} with {tutor?.displayName || 'Tutor'}</p>

          {submitted ? (
            <p className="text-teal text-center">Thanks for rating! Redirecting...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm mb-2">Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      className={`w-12 h-12 rounded-lg font-semibold transition-colors ${
                        rating >= r ? 'bg-cyan text-navy' : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Review (optional)</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-navy border border-white/20 text-white placeholder-white/40 focus:border-cyan focus:outline-none"
                  placeholder="How was the session?"
                />
              </div>
              <button
                type="submit"
                disabled={rating === 0}
                className="w-full py-3 rounded-lg bg-teal text-navy font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50"
              >
                Submit Rating
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
