import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getTutorsBySkill, getAllTutors } from '../services/userService';
import { getRatingsForTutor } from '../services/ratingService';
import SkillMap from '../components/SkillMap';

const ALL_SKILLS = ['React', 'Python', 'Public Speaking', 'Photography', 'UI Design'];

export default function FindSkills({ user }) {
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
    tutors.forEach((t) => {
      getRatingsForTutor(t.id).then((r) =>
        setRatings((prev) => ({ ...prev, [t.id]: r }))
      );
    });
  }, [tutors]);

  function getSkillName(s) {
  return typeof s === 'string' ? s : (s.name || s.skill || '');
}

  const filtered = tutors.filter(
    (t) =>
      !search ||
      t.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      (t.skills || []).some((s) => getSkillName(s).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Find Skills</h1>
        <p className="text-white/70 mb-8">Browse tutors by skill and book a session.</p>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">3D Skill Map</h2>
          <SkillMap onSkillSelect={setSelectedSkill} />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedSkill('')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !selectedSkill ? 'bg-cyan text-navy' : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            All
          </button>
          {ALL_SKILLS.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSkill(s)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedSkill === s ? 'bg-cyan text-navy' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search tutors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md mb-6 px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-cyan focus:outline-none"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{tutor.displayName}</h3>
                  <p className="text-white/60 text-sm">{tutor.email}</p>
                </div>
                {ratings[tutor.id] && (
                  <span className="px-2 py-1 rounded bg-teal/20 text-teal text-sm">
                    ★ {ratings[tutor.id].average}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(tutor.skills || []).map((s) => {
                  const name = getSkillName(s);
                  const rate = typeof s === 'object' && s.rate ? s.rate : null;
                  return (
                    <span key={name} className="px-2 py-1 rounded bg-cyan/20 text-cyan text-xs">
                      {name}{rate != null && rate > 0 ? ` ₹${rate}` : ''}
                    </span>
                  );
                })}
              </div>
              <Link
                to={`/tutor/${tutor.id}`}
                className="block w-full py-2 rounded-lg bg-cyan text-navy font-medium text-center hover:bg-teal transition-colors"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-white/60 text-center py-12">No tutors found for this skill.</p>
        )}
      </div>
    </div>
  );
}
