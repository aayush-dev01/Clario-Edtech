import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '../services/authService';

export default function Navbar({ user, userProfile }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-navy border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-cyan hover:text-teal transition-colors">
        Clario
      </Link>
      <div className="flex items-center gap-6">
        {user ? (
          <>
            {userProfile?.role === 'student' && (
              <>
                <Link to="/student/dashboard" className="text-white/90 hover:text-cyan transition-colors">
                  Dashboard
                </Link>
                <Link to="/find-skills" className="text-white/90 hover:text-cyan transition-colors">
                  Find Skills
                </Link>
                <Link to="/my-sessions" className="text-white/90 hover:text-cyan transition-colors">
                  My Sessions
                </Link>
              </>
            )}
            {userProfile?.role === 'tutor' && (
              <>
                <Link to="/tutor/dashboard" className="text-white/90 hover:text-cyan transition-colors">
                  Dashboard
                </Link>
                <Link to="/tutor/requests" className="text-white/90 hover:text-cyan transition-colors">
                  Requests
                </Link>
                <Link to="/tutor/profile" className="text-white/90 hover:text-cyan transition-colors">
                  Profile
                </Link>
              </>
            )}
            <Link to="/settings" className="text-white/90 hover:text-cyan transition-colors">
              Settings
            </Link>
            <span className="text-white/70 text-sm">{userProfile?.displayName || user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg bg-coral/20 text-coral hover:bg-coral/30 transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-white/90 hover:text-cyan transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-cyan/20 text-cyan hover:bg-cyan/30 transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
