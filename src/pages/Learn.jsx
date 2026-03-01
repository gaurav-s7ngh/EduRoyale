import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/learn.css';
import { MASCOT, MASCOT_ALT } from '../mascot';

// --- HARDCODED MODULE DATA ---
export const HARDCODED_MODULES = [
  { id: 'bs-magic', title: 'Binary Search Magic', description: 'Find elements in O(log n) time by halving the search space.', subject: 'dsa', difficulty: 'Intermediate', xp_reward: 200, is_locked: false },
  { id: 'bubble-sort', title: 'Bubble Sort: The Heavy Drop', description: 'Learn how elements bubble up to their correct positions through continuous swapping.', subject: 'dsa', difficulty: 'Beginner', xp_reward: 150, is_locked: false },
  { id: 'stacks-lifo', title: 'Stacks: The LIFO Cylinder', description: 'Master the Last-In-First-Out concept. Push to add, Pop to remove.', subject: 'dsa', difficulty: 'Beginner', xp_reward: 100, is_locked: false },
  { id: 'projectile-motion', title: 'Projectile Motion: The Cannon', description: 'Master the kinematics of 2D motion. Adjust the angle and fire!', subject: 'ph11', difficulty: 'Beginner', xp_reward: 150, is_locked: false },
  { id: 'titration-chem', title: 'Titration: The Color Shift', description: 'Drop by drop, find the exact equivalence point where acid neutralizes base.', subject: 'ch11', difficulty: 'Intermediate', xp_reward: 200, is_locked: false }
];

export default function Learn() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subjectId } = useParams(); // Catches 'dsa', 'ph11', etc.
  
  const [activeSubject, setActiveSubject] = useState('All');

  // Automatically switch tab if arriving via SubjectSelection URL (e.g. /learn/ph11)
  useEffect(() => {
    if (subjectId) {
      setActiveSubject(subjectId);
    }
  }, [subjectId]);

  // Filter modules based on the selected subject tab
  const filteredModules = activeSubject === 'All' 
    ? HARDCODED_MODULES 
    : HARDCODED_MODULES.filter(m => m.subject === activeSubject);

  // Get unique subjects for the tabs
  const subjects = ['All', ...new Set(HARDCODED_MODULES.map(m => m.subject))];

  const handleStartModule = (moduleId) => {
    if (!user) {
      alert("Please login to start a module and earn XP!");
      return;
    }
    // Route to the lesson page
    navigate(`/lesson/${moduleId}`);
  };

  return (
    <div className="page-wrap">
      
      {/* 3D NAV BACK BUTTON */}
      <button 
        onClick={() => navigate('/subject-selection')} 
        className="px-btn px-btn-o" 
        style={{ marginBottom: '24px', fontSize: '10px' }}
      >
        ◀ BACK TO SUBJECTS
      </button>

      <div className="page-header" style={{ marginBottom: '32px', position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <div className="chip chip-b">📖 KNOWLEDGE ARCHIVE</div>
          <h1 style={{ color: 'var(--blue)', textShadow: '3px 3px 0 var(--bd)', marginTop: '12px' }}>
            {subjectId ? `${subjectId.toUpperCase()} MODULES` : 'LEARNING MODULES'}
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Master concepts to increase your global ELO and unlock new battle arenas.</p>
        </div>
        <img src={MASCOT.study} alt={MASCOT_ALT} style={{
          width: 'clamp(130px, 14vw, 200px)',
          flexShrink: 0,
          filter: 'drop-shadow(0 0 24px rgba(162,89,255,0.5))',
          animation: 'mascot-float 3s ease-in-out infinite',
          marginTop: '-10px',
        }} draggable="false" />
      </div>

      {/* Subject Filter Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {subjects.map(subject => (
          <button 
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={`px-btn ${activeSubject === subject ? 'px-btn-b' : 'px-btn-o'}`}
          >
            {subject.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Module Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {filteredModules.length === 0 ? (
          <div style={{ color: 'var(--muted)' }}>No modules found for this subject.</div>
        ) : (
          filteredModules.map((mod) => (
            <div key={mod.id} style={{ 
              background: 'var(--card)', 
              border: `3px solid ${mod.is_locked ? 'var(--border)' : 'var(--blue)'}`,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              opacity: mod.is_locked ? 0.6 : 1
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="chip" style={{ 
                  color: mod.difficulty === 'Beginner' ? 'var(--green)' : mod.difficulty === 'Boss' ? 'var(--pink)' : 'var(--yellow)',
                  borderColor: mod.difficulty === 'Beginner' ? 'var(--green)' : mod.difficulty === 'Boss' ? 'var(--pink)' : 'var(--yellow)'
                }}>
                  {mod.difficulty ? mod.difficulty.toUpperCase() : 'STANDARD'}
                </span>
                <span style={{ color: 'var(--yellow)', fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>
                  +{mod.xp_reward} XP
                </span>
              </div>

              <h2 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: 'var(--white)', marginBottom: '8px', lineHeight: '1.4' }}>
                {mod.title}
              </h2>
              
              <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '24px', flex: 1 }}>
                {mod.description}
              </p>

              <button 
                className={`px-btn ${mod.is_locked ? 'px-btn-o' : 'px-btn-b'}`} 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleStartModule(mod.id)}
                disabled={mod.is_locked}
              >
                {mod.is_locked ? 'LOCKED' : 'INITIALIZE ▶'}
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}