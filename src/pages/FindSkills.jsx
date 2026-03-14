import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassPanel, PageHero, PageShell, StatusBadge } from '../components/AppShell';
import SkillMap from '../components/SkillMap';
import { getRatingsForTutor } from '../services/ratingService';
import { getAllTutors, getTutorsBySkill } from '../services/userService';

const ALL_SKILLS = ['React', 'Python', 'Public Speaking', 'Photography', 'UI Design'];

function getSkillName(skill) {
  return typeof skill === 'string' ? skill : skill?.name || skill?.skill || '';
}

export default function FindSkills() {
  const [searchParams] = useSearchParams();
  const initialSkill = searchParams.get('skill') || '';
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState('');
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    if (selectedSkill) {
      getTutorsBySkill(selectedSkill).then(setTutors);
    } else {
      getAllTutors().then(setTutors);
    }
  }, [selectedSkill]);

  useEffect(() => {
    tutors.forEach((tutor) => {
      getRatingsForTutor(tutor.id).then((rating) => {
        setRatings((current) => ({ ...current, [tutor.id]: rating }));
      });
    });
  }, [tutors]);

  const filtered = tutors.filter(
    (tutor) =>
      !search ||
      tutor.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      (tutor.skills || []).some((skill) => getSkillName(skill).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PageShell>
      <PageHero
        eyebrow="Tutor discovery"
        title="Find the right skill mentor"
        description="Search tutors by specialty, rating, and available teaching stack, then move directly into a request flow that works across devices."
        aside={<StatusBadge tone="cyan">{filtered.length} tutors visible</StatusBadge>}
      />

      <GlassPanel className="mb-6 overflow-hidden">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan/72">Spatial browse</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">3D skill map</h2>
          </div>
        </div>
        <SkillMap onSkillSelect={setSelectedSkill} />
      </GlassPanel>

      <GlassPanel className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedSkill('')}
              className={`rounded-full px-4 py-2 text-sm transition ${!selectedSkill ? 'bg-cyan text-navy' : 'border border-white/10 bg-white/5 text-white/72 hover:bg-white/10'}`}
            >
              All
            </button>
            {ALL_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => setSelectedSkill(skill)}
                className={`rounded-full px-4 py-2 text-sm transition ${selectedSkill === skill ? 'bg-cyan text-navy' : 'border border-white/10 bg-white/5 text-white/72 hover:bg-white/10'}`}
              >
                {skill}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search tutors or skills..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-md rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-cyan"
          />
        </div>
      </GlassPanel>

      <motion.div 
        initial="hidden" 
        animate="show" 
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {filtered.map((tutor) => (
          <motion.div 
            key={tutor.id} 
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 10 },
              show: { opacity: 1, scale: 1, y: 0 }
            }}
          >
            <GlassPanel className="premium-panel h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{tutor.displayName}</h3>
                <p className="mt-1 text-sm text-white/52">{tutor.email}</p>
              </div>
              <StatusBadge tone="teal">
                {ratings[tutor.id]?.count ? `★ ${ratings[tutor.id].average}` : 'new'}
              </StatusBadge>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(tutor.skills || []).map((skill) => {
                const name = getSkillName(skill);
                const rate = typeof skill === 'object' && skill.rate ? skill.rate : null;
                return (
                  <span key={name} className="rounded-full border border-cyan/18 bg-cyan/10 px-3 py-2 text-xs text-cyan">
                    {name}
                    {rate != null && rate > 0 ? ` · Rs ${rate}` : ''}
                  </span>
                );
              })}
            </div>

            <Link
              to={`/tutor/${tutor.id}`}
              className="mt-6 inline-flex rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-navy transition hover:bg-[#8df3ff]"
            >
              View profile
            </Link>
          </GlassPanel>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <GlassPanel className="mt-6 py-14 text-center">
          <p className="text-white/62">No tutors found for this skill.</p>
        </GlassPanel>
      ) : null}
    </PageShell>
  );
}
