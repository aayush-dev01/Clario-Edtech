import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionLink = motion.create(Link);

const navItems = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/find-skills', label: 'Find Skills' },
    { to: '/my-sessions', label: 'Sessions' },
    { to: '/profile', label: 'Profile' }
  ],
  tutor: [
    { to: '/tutor/dashboard', label: 'Dashboard' },
    { to: '/tutor/requests', label: 'Requests' },
    { to: '/tutor/profile', label: 'Public Profile' },
    { to: '/profile', label: 'Account Settings' },
  ],
};

export default function Sidebar({ userProfile }) {
  const location = useLocation();

  const links = userProfile?.role ? navItems[userProfile.role] || [] : [];

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-white/6 shadow-[24px_0_80px_rgba(4,10,20,0.28)] backdrop-blur-xl"
    >
      {/* Brand Header */}
      <div className="flex h-20 items-center gap-3 px-6 pb-2 pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan/16 text-lg font-bold text-cyan shadow-[0_0_30px_rgba(0,229,255,0.18)]">
          C
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan/90">Clario</p>
          <p className="text-xs text-white/50">EdTech Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <motion.nav 
        initial="hidden" 
        animate="show" 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
        }}
        className="mt-8 flex flex-1 flex-col gap-2 px-4"
      >
        {links.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <motion.div key={item.to} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
              <MotionLink
                to={item.to}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan/10 text-cyan shadow-[inset_4px_0_0_rgba(0,229,255,1)]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </MotionLink>
            </motion.div>
          );
        })}
      </motion.nav>
    </motion.div>
  );
}
