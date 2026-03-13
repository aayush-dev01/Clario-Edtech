import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout({ user, userProfile }) {
  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Navbar user={user} userProfile={userProfile} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
