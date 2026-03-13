import { Link } from 'react-router-dom';

export default function Settings({ userProfile }) {
  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/70 mb-8">Manage your account.</p>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
          <div>
            <p className="text-white/60 text-sm">Display Name</p>
            <p className="text-white">{userProfile?.displayName || '-'}</p>
          </div>
          <div>
            <p className="text-white/60 text-sm">Email</p>
            <p className="text-white">{userProfile?.email || '-'}</p>
          </div>
          <div>
            <p className="text-white/60 text-sm">Role</p>
            <p className="text-white capitalize">{userProfile?.role || '-'}</p>
          </div>
          {userProfile?.role === 'tutor' && (
            <Link
              to="/tutor/profile"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-cyan/20 text-cyan hover:bg-cyan/30 transition-colors"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
