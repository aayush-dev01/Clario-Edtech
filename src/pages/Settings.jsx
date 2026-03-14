import { Link } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, StatusBadge } from '../components/AppShell';

export default function Settings({ userProfile }) {
  return (
    <PageShell>
      <PageHero
        eyebrow="Account settings"
        title="Manage your profile"
        description="Core account identity is now backed by Firebase Auth and Firestore, so your data follows you across devices."
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

        {userProfile?.role === 'tutor' ? (
          <Link
            to="/tutor/profile"
            className="mt-8 inline-flex rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-navy transition hover:bg-[#8df3ff]"
          >
            Edit tutor profile
          </Link>
        ) : null}
      </GlassPanel>
    </PageShell>
  );
}
