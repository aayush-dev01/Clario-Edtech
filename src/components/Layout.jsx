import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout({ user, userProfile }) {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(0,229,255,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(111,124,255,0.18),_transparent_28%),linear-gradient(180deg,_#07111f,_#040a13)]" />
      <Navbar user={user} userProfile={userProfile} />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
