import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassPanel, PageShell, PrimaryButton } from '../components/AppShell';
import { getAuthErrorMessage, register } from '../services/authService';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, displayName, role);
      navigate(role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell className="flex items-center">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.34em] text-cyan/72">Create account</p>
          <h1 className="mt-4 text-5xl font-bold tracking-[-0.05em] text-white">Join Clario on a shared live backend.</h1>
          <p className="mt-5 text-lg leading-8 text-white/66">Accounts, session requests, and live-call room state now travel across devices instead of staying trapped in one browser.</p>
        </div>

        <GlassPanel className="mx-auto w-full max-w-md">
          <Link to="/" className="text-sm uppercase tracking-[0.28em] text-cyan/74">Back to Clario</Link>
          <h2 className="mt-4 text-2xl font-semibold text-white">Create your account</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/76">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                className="w-full rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-white placeholder-white/32 outline-none transition focus:border-cyan"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/76">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-white placeholder-white/32 outline-none transition focus:border-cyan"
                placeholder="you@college.edu"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/76">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="w-full rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-white placeholder-white/32 outline-none transition focus:border-cyan"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/76">I want to</label>
              <div className="relative grid grid-cols-2 rounded-[1.2rem] border border-white/12 bg-white/5 p-1">
                <div
                  className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-[1rem] bg-cyan transition duration-300 ${role === 'student' ? 'left-1' : 'left-[calc(50%+0.125rem)]'}`}
                />
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`relative z-10 rounded-[1rem] px-4 py-3 text-sm font-medium transition ${role === 'student' ? 'text-navy' : 'text-white/72'}`}
                >
                  Learn from others
                </button>
                <button
                  type="button"
                  onClick={() => setRole('tutor')}
                  className={`relative z-10 rounded-[1rem] px-4 py-3 text-sm font-medium transition ${role === 'tutor' ? 'text-navy' : 'text-white/72'}`}
                >
                  Teach others
                </button>
              </div>
            </div>

            {error ? <p className="text-sm text-coral">{error}</p> : null}
            <PrimaryButton type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account...' : 'Create account'}
            </PrimaryButton>
          </form>

          <p className="mt-6 text-center text-white/62">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan hover:text-white">
              Sign in
            </Link>
          </p>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
