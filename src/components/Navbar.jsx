import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '../services/authService';

const navItems = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/find-skills', label: 'Find Skills' },
    { to: '/my-sessions', label: 'Sessions' },
  ],
  tutor: [
    { to: '/tutor/dashboard', label: 'Dashboard' },
    { to: '/tutor/requests', label: 'Requests' },
    { to: '/tutor/profile', label: 'Profile' },
  ],
};

export default function Navbar({ user, userProfile }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const links = userProfile?.role ? navItems[userProfile.role] || [] : [];

  return (
    <div className="sticky top-0 z-30 px-6 pt-6 md:px-10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/6 px-5 py-3 shadow-[0_24px_80px_rgba(4,10,20,0.28)] backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan/16 text-lg font-bold text-cyan shadow-[0_0_30px_rgba(0,229,255,0.18)]">
            C
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.34em] text-cyan/72">Clario</p>
            <p className="text-xs text-white/48">Campus skill exchange</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-4 py-2 text-sm text-white/78 transition hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/settings"
                className="rounded-full px-4 py-2 text-sm text-white/78 transition hover:bg-white/8 hover:text-white"
              >
                Settings
              </Link>
              <div className="hidden rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/76 md:block">
                {userProfile?.displayName || user?.displayName || user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-full border border-coral/20 bg-coral/12 px-4 py-2 text-sm font-medium text-coral transition hover:bg-coral/18"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm text-white/82 transition hover:bg-white/8 hover:text-white">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-cyan/30 bg-cyan px-5 py-2 text-sm font-semibold text-navy transition hover:bg-[#8df3ff]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
