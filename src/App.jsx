import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthChange, getUserProfile, getCachedProfile } from './services/authService';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FindSkills from './pages/FindSkills';
import TutorProfile from './pages/TutorProfile';
import MySessions from './pages/MySessions';
import TutorDashboard from './pages/TutorDashboard';
import TutorRequests from './pages/TutorRequests';
import TutorProfileEditor from './pages/TutorProfileEditor';
import SessionLobby from './pages/SessionLobby';
import SessionRoom from './pages/SessionRoom';
import SessionComplete from './pages/SessionComplete';
import RateSession from './pages/RateSession';
import Settings from './pages/Settings';

function ProtectedRoute({ children, user, userProfile, requiredRole }) {
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && userProfile?.role && userProfile.role !== requiredRole) {
    return <Navigate to={userProfile.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileResolved, setProfileResolved] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange(async (authUser) => {
      const fallbackTimer = setTimeout(() => {
        setProfileResolved(true);
        setLoading(false);
      }, 5000);

      setUser(authUser);
      setProfileResolved(false);
      try {
        if (authUser) {
          const cachedProfile = getCachedProfile();
          if (cachedProfile?.id === authUser.uid) {
            setUserProfile(cachedProfile);
          }
          const profile = await getUserProfile(authUser.uid);
          if (profile) {
            setUserProfile(profile);
          }
        } else {
          setUserProfile(null);
        }
      } catch {
        const cachedProfile = getCachedProfile();
        setUserProfile(cachedProfile);
      } finally {
        clearTimeout(fallbackTimer);
        setProfileResolved(true);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  const resolvedRole = userProfile?.role || getCachedProfile()?.role || 'student';

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-cyan">Loading Clario...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user
              ? profileResolved
                ? <Navigate to={resolvedRole === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'} replace />
                : (
                  <div className="min-h-screen bg-navy flex items-center justify-center">
                    <p className="text-cyan">Restoring your workspace...</p>
                  </div>
                )
              : <Landing />
          }
        />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <Layout user={user} userProfile={userProfile} />
            </ProtectedRoute>
          }
        >
          <Route
            path="student/dashboard"
            element={
              <ProtectedRoute user={user} userProfile={userProfile} requiredRole="student">
                <StudentDashboard user={user} userProfile={userProfile} />
              </ProtectedRoute>
            }
          />
          <Route path="find-skills" element={<ProtectedRoute user={user} userProfile={userProfile}><FindSkills user={user} /></ProtectedRoute>} />
          <Route path="tutor/dashboard" element={<ProtectedRoute user={user} userProfile={userProfile} requiredRole="tutor"><TutorDashboard user={user} userProfile={userProfile} /></ProtectedRoute>} />
          <Route path="tutor/requests" element={<ProtectedRoute user={user} userProfile={userProfile} requiredRole="tutor"><TutorRequests user={user} /></ProtectedRoute>} />
          <Route path="tutor/profile" element={<ProtectedRoute user={user} userProfile={userProfile} requiredRole="tutor"><TutorProfileEditor user={user} userProfile={userProfile} onProfileUpdate={refreshProfile} /></ProtectedRoute>} />
          <Route path="tutor/:tutorId" element={<TutorProfile user={user} />} />
          <Route
            path="my-sessions"
            element={
              <ProtectedRoute user={user} userProfile={userProfile} requiredRole="student">
                <MySessions user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="session/lobby/:sessionId"
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <SessionLobby user={user} userProfile={userProfile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="session/room/:sessionId"
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <SessionRoom user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="session/complete/:sessionId" element={<ProtectedRoute user={user} userProfile={userProfile}><SessionComplete /></ProtectedRoute>} />
          <Route
            path="session/rate/:sessionId"
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <RateSession user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <Settings userProfile={userProfile} />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
