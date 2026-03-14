import { Link, useNavigate } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, StatusBadge } from '../components/AppShell';
import { signOut } from '../services/authService';

export default function Settings({ userProfile }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  return (
    <PageShell>
      <PageHero
        eyebrow="Account profile"
        title="Manage your profile"
        description="Core account identity and session settings are managed here."
        aside={<StatusBadge tone="cyan">{userProfile?.role || 'account'}</StatusBadge>}
      />

      <GlassPanel className="max-w-3xl">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">Display name</p>
            <p className="mt-2 text-lg text-white">{userProfile?.displayName || '-'}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">Email</p>
            <p className="mt-2 text-lg text-white">{userProfile?.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">Role</p>
            <p className="mt-2 text-lg capitalize text-white">{userProfile?.role || '-'}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-6">
          {userProfile?.role === 'tutor' ? (
            <Link
              to="/tutor/profile"
              className="inline-flex rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-navy transition hover:bg-[#8df3ff]"
            >
              Edit tutor profile
            </Link>
          ) : null}
          <button
            onClick={handleSignOut}
            className="inline-flex rounded-full border border-coral/20 bg-coral/10 px-4 py-2 text-sm font-semibold text-coral transition hover:bg-coral/20 hover:shadow-[0_0_15px_rgba(255,94,94,0.15)]"
          >
            Sign Out
          </button>
        </div>
      </GlassPanel>
    </PageShell>
  );
}
