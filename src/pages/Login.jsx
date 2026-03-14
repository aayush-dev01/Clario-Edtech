import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassPanel, PageShell, PrimaryButton } from '../components/AppShell';
import { login } from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell className="flex items-center">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.34em] text-cyan/72">Sign in</p>
          <h1 className="mt-4 text-5xl font-bold tracking-[-0.05em] text-white">Reconnect with your learning network.</h1>
          <p className="mt-5 text-lg leading-8 text-white/66">Your account, tutor requests, and live session rooms now sync through Firebase so you can pick up from any device.</p>
        </div>

        <GlassPanel className="mx-auto w-full max-w-md">
          <Link to="/" className="text-sm uppercase tracking-[0.28em] text-cyan/74">Back to Clario</Link>
          <h2 className="mt-4 text-2xl font-semibold text-white">Welcome back</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                className="w-full rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-white placeholder-white/32 outline-none transition focus:border-cyan"
                placeholder="••••••••"
              />
            </div>
            {error ? <p className="text-sm text-coral">{error}</p> : null}
            <PrimaryButton type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </PrimaryButton>
          </form>
          <p className="mt-6 text-center text-white/62">
            Need an account?{' '}
            <Link to="/register" className="text-cyan hover:text-white">
              Sign up
            </Link>
          </p>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
