import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, displayName, role);
      navigate(role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-block text-cyan font-bold text-xl mb-8 hover:text-teal">← Clario</Link>
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-6">Create Account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-navy border border-white/20 text-white placeholder-white/40 focus:border-cyan focus:outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-navy border border-white/20 text-white placeholder-white/40 focus:border-cyan focus:outline-none"
                placeholder="you@college.edu"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-navy border border-white/20 text-white placeholder-white/40 focus:border-cyan focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">I want to</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-navy border border-white/20 text-white focus:border-cyan focus:outline-none"
              >
                <option value="student">Learn from others</option>
                <option value="tutor">Teach others</option>
              </select>
            </div>
            {error && <p className="text-coral text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-cyan text-navy font-semibold hover:bg-teal transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-6 text-white/70 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan hover:text-teal">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
