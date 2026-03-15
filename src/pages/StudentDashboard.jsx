import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SkillMap from '../components/SkillMap';
import { GlassPanel, PageHero, PageShell, PrimaryButton, StatusBadge } from '../components/AppShell';
import { subscribeSessionsForStudent } from '../services/sessionService';

const MotionDiv = motion.div;

export default function StudentDashboard({ user, userProfile }) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!user?.uid) return undefined;
    return subscribeSessionsForStudent(user.uid, setSessions);
  }, [user?.uid]);

  const upcoming = sessions.filter((session) => session.status === 'accepted' || session.status === 'in_progress');
  const recent = sessions.filter((session) => session.status === 'completed').slice(0, 3);
  const greetingName = userProfile?.displayName || user?.displayName || user?.email || 'Student';

  return (
    <PageShell>
      <PageHero
        eyebrow="Student workspace"
        title={`Welcome back, ${greetingName}`}
        description="Track your upcoming sessions, discover new mentors, and move into live rooms with less friction."
        actions={
          <>
            <Link to="/find-skills">
              <PrimaryButton type="button">Explore tutors</PrimaryButton>
            </Link>
            <StatusBadge tone="cyan">{upcoming.length} active sessions</StatusBadge>
          </>
        }
      />

      <div className="mb-8">
        <GlassPanel className="overflow-hidden">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">Interactive discovery</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Skill map</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-white/58">Rotate, scan, and jump directly into a tutor search from the skills students are actively teaching.</p>
          </div>
          <SkillMap onSkillSelect={(skill) => navigate(`/find-skills?skill=${encodeURIComponent(skill)}`)} />
        </GlassPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Upcoming sessions</h2>
            <StatusBadge tone="cyan">{upcoming.length || 0} queued</StatusBadge>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-white/62">
              No upcoming sessions.{' '}
              <Link to="/find-skills" className="text-cyan hover:text-white">
                Find a tutor
              </Link>
            </p>
          ) : (
            <MotionDiv 
              initial="hidden" 
              animate="show" 
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="space-y-4"
            >
              {upcoming.map((session) => (
                <MotionDiv 
                  key={session.id} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                  className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{session.skill}</p>
                      <p className="mt-1 text-sm text-white/55">Session status updates sync across devices in real time.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge tone={session.status === 'in_progress' ? 'teal' : 'cyan'}>
                        {session.status.replace('_', ' ')}
                      </StatusBadge>
                      <Link to={`/session/lobby/${session.id}`} className="rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-navy transition hover:bg-[#8df3ff]">
                        Open lobby
                      </Link>
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </MotionDiv>
          )}
        </GlassPanel>

        <GlassPanel>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent sessions</h2>
            <StatusBadge tone="teal">{recent.length || 0} completed</StatusBadge>
          </div>
          {recent.length === 0 ? (
            <p className="text-white/62">No past sessions yet.</p>
          ) : (
            <MotionDiv 
              initial="hidden" 
              animate="show" 
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="space-y-4"
            >
              {recent.map((session) => (
                <MotionDiv 
                  key={session.id} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                  className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{session.skill}</p>
                      <p className="mt-1 text-sm text-white/55">Completed session, ready for feedback.</p>
                    </div>
                    <Link to={`/session/rate/${session.id}`} className="rounded-full border border-teal/20 bg-teal/12 px-4 py-2 text-sm font-medium text-teal transition hover:bg-teal/18">
                      Rate
                    </Link>
                  </div>
                </MotionDiv>
              ))}
            </MotionDiv>
          )}
        </GlassPanel>
      </div>
    </PageShell>
  );
}
