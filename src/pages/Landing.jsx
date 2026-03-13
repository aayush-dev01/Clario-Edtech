import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <nav className="px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-cyan">Clario</span>
        <div className="flex gap-4">
          <Link to="/login" className="text-white/90 hover:text-cyan transition-colors">Login</Link>
          <Link to="/register" className="px-4 py-2 rounded-lg bg-cyan/20 text-cyan hover:bg-cyan/30 transition-colors">Sign Up</Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Learn from your <span className="text-cyan">peers</span>
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mb-8">
          Clario connects students within your campus. Discover skills, book sessions, and learn from fellow students—peer-to-peer.
        </p>
        <div className="flex gap-4">
          <Link
            to="/register"
            className="px-8 py-4 rounded-xl bg-cyan text-navy font-semibold hover:bg-teal transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl border border-cyan/50 text-cyan hover:bg-cyan/10 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-16 max-w-5xl mx-auto">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-white mb-2">Discover Skills</h3>
          <p className="text-white/70">Browse skills available in your college community.</p>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-3">📅</div>
          <h3 className="text-lg font-semibold text-white mb-2">Book Sessions</h3>
          <p className="text-white/70">Connect with tutors and schedule learning sessions.</p>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-3">🎥</div>
          <h3 className="text-lg font-semibold text-white mb-2">Live Learning</h3>
          <p className="text-white/70">Join video calls and learn in real-time.</p>
        </div>
      </div>
    </div>
  );
}
