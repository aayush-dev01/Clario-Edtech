import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthChange, getUserProfile } from './services/authService';
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

function ProtectedRoute({ children, user, requiredRole }) {
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && !children.props?.userProfile) return null;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (authUser) => {
      setUser(authUser);
      try {
        if (authUser) {
          const profile = await getUserProfile(authUser.uid);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch {
        setUserProfile(null);
      } finally {
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
        <Route path="/" element={user ? <Navigate to={userProfile?.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'} replace /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} userProfile={userProfile} />
            </ProtectedRoute>
          }
        >
          <Route
            path="student/dashboard"
            element={
              <ProtectedRoute user={user}>
                <StudentDashboard user={user} userProfile={userProfile} />
              </ProtectedRoute>
            }
          />
          <Route path="find-skills" element={<FindSkills user={user} />} />
          <Route path="tutor/dashboard" element={<ProtectedRoute user={user}><TutorDashboard user={user} userProfile={userProfile} /></ProtectedRoute>} />
          <Route path="tutor/requests" element={<ProtectedRoute user={user}><TutorRequests user={user} /></ProtectedRoute>} />
          <Route path="tutor/profile" element={<ProtectedRoute user={user}><TutorProfileEditor user={user} userProfile={userProfile} onProfileUpdate={refreshProfile} /></ProtectedRoute>} />
          <Route path="tutor/:tutorId" element={<TutorProfile user={user} />} />
          <Route
            path="my-sessions"
            element={
              <ProtectedRoute user={user}>
                <MySessions user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="session/lobby/:sessionId"
            element={
              <ProtectedRoute user={user}>
                <SessionLobby user={user} userProfile={userProfile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="session/room/:sessionId"
            element={
              <ProtectedRoute user={user}>
                <SessionRoom user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="session/complete/:sessionId" element={<ProtectedRoute user={user}><SessionComplete /></ProtectedRoute>} />
          <Route
            path="session/rate/:sessionId"
            element={
              <ProtectedRoute user={user}>
                <RateSession user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute user={user}>
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
