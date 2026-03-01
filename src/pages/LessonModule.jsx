import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { HARDCODED_MODULES } from './Learn'; // Import our local data

export default function LessonModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [moduleData, setModuleData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // --- UNIFIED VISUALIZER STATE ---
  const [simStep, setSimStep] = useState(0);

  // Reset simulation step when changing slides
  useEffect(() => {
    setSimStep(0);
  }, [currentSlide]);

  // Load the hardcoded data on mount
  useEffect(() => {
    const foundModule = HARDCODED_MODULES.find(m => m.id === id);
    setModuleData(foundModule);
  }, [id]);

  // --- VISUALIZER DATA MAPS ---
  const bsArray = [2, 8, 15, 23, 42, 56, 71, 89, 95];
  const bsTarget = 23;
  const bsPhases = [
    { L: 0, R: 8, M: null, msg: "INITIALIZING SEARCH. Target is 23." },
    { L: 0, R: 8, M: 4, msg: "CALCULATING MIDPOINT. Index 4 is 42." },
    { L: 0, R: 3, M: 4, msg: "42 > 23. Target must be in the LEFT half. Adjusting Right Pointer." },
    { L: 0, R: 3, M: 1, msg: "NEW MIDPOINT. Index 1 is 8." },
    { L: 2, R: 3, M: 1, msg: "8 < 23. Target must be in the RIGHT half. Adjusting Left Pointer." },
    { L: 2, R: 3, M: 2, msg: "NEW MIDPOINT. Index 2 is 15." },
    { L: 3, R: 3, M: 2, msg: "15 < 23. Adjusting Left Pointer." },
    { L: 3, R: 3, M: 3, msg: "NEW MIDPOINT. Index 3 is 23." },
    { L: 3, R: 3, M: 3, msg: "TARGET ACQUIRED. Search complete in O(log n) time." }
  ];

  const bubblePhases = [
    { arr: [4, 2, 7, 1], active: [0, 1], sorted: [], msg: "COMPARING 4 & 2. 4 > 2, so we SWAP." },
    { arr: [2, 4, 7, 1], active: [1, 2], sorted: [], msg: "SWAP COMPLETE. COMPARING 4 & 7. 4 < 7. NO SWAP." },
    { arr: [2, 4, 7, 1], active: [2, 3], sorted: [], msg: "COMPARING 7 & 1. 7 > 1, so we SWAP." },
    { arr: [2, 4, 1, 7], active: [], sorted: [3], msg: "PASS 1 COMPLETE. The largest element (7) bubbled to the end!" }
  ];

  const stackPhases = [
    { stack: [], action: "IDLE", msg: "STACK INITIALIZED. It is currently empty." },
    { stack: [10], action: "PUSH(10)", msg: "PUSH: Added 10 to the TOP of the stack." },
    { stack: [10, 42], action: "PUSH(42)", msg: "PUSH: Added 42. It sits on top of 10." },
    { stack: [10, 42, 99], action: "PUSH(99)", msg: "PUSH: Added 99. Stack size is now 3." },
    { stack: [10, 42], action: "POP() -> 99", msg: "POP: Removed the TOP element (99). Last In, First Out!" },
    { stack: [10], action: "POP() -> 42", msg: "POP: Removed 42. Stack size is 1." }
  ];

  const physicsPhases = [
    { angle: 30, color: 'var(--blue)', msg: "ANGLE: 30°. Shallow angle. Fast, but hits the ground early.", dots: [ {x: 0, y: 0}, {x: 20, y: 30}, {x: 40, y: 40}, {x: 60, y: 30}, {x: 80, y: 0} ] },
    { angle: 45, color: 'var(--green)', msg: "ANGLE: 45°. THE GOLDEN ANGLE! Yields the maximum horizontal range.", dots: [ {x: 0, y: 0}, {x: 25, y: 50}, {x: 50, y: 75}, {x: 75, y: 50}, {x: 100, y: 0} ] },
    { angle: 60, color: 'var(--yellow)', msg: "ANGLE: 60°. Steeper angle. Goes much higher, but travels less distance.", dots: [ {x: 0, y: 0}, {x: 20, y: 60}, {x: 40, y: 100}, {x: 60, y: 60}, {x: 80, y: 0} ] }
  ];

  const chemPhases = [
    { drops: 0, ph: 2.0, color: 'rgba(255,255,255,0.05)', msg: "START: Pure Acid in the beaker. pH is very low (2.0)." },
    { drops: 5, ph: 4.5, color: 'rgba(255,255,255,0.05)', msg: "TITRATING: Added 5 drops of Base. pH is rising, but still clear." },
    { drops: 9, ph: 6.8, color: 'rgba(255,255,255,0.05)', msg: "APPROACHING NEUTRAL: One more drop might do it..." },
    { drops: 10, ph: 8.2, color: 'rgba(255,105,180,0.4)', msg: "EQUIVALENCE POINT! Phenolphthalein turns faint pink. Stop adding base!" },
    { drops: 15, ph: 11.5, color: 'rgba(255,20,147,0.9)', msg: "OVER-TITRATED: Too much base added. Solution is bright magenta. You failed." }
  ];

  // --- LESSON CONTENT DICTIONARY ---
  const lessonContent = {
    'Binary Search Magic': [
      { title: "THE O(N) PROBLEM", text: "Imagine looking for a word in a dictionary by reading every single page starting from the letter A. That is Linear Search O(n). It is slow, inefficient, and will get you killed in the Arena.", type: "theory" },
      { title: "THE LOGARITHMIC SOLUTION", text: "If the data is SORTED, we can do better. We open the book to the exact middle. Is our target word before or after this page? We immediately rip the book in half, throwing away the wrong side.", type: "theory" },
      { title: "HOLODECK SIMULATION", text: "Run the simulation on the right. Watch how the Left (L) and Right (R) pointers zero in on the target (23) by constantly recalculating the Midpoint (M).", type: "interactive_bs" }
    ],
    'Bubble Sort: The Heavy Drop': [
      { title: "THE BUBBLE CONCEPT", text: "Imagine bubbles rising to the surface of water. In Bubble Sort, the heaviest (largest) elements 'bubble' to the end of the array through a series of sequential swaps.", type: "theory" },
      { title: "COMPARE AND SWAP", text: "We iterate through the array, comparing adjacent elements. If the left element is larger than the right, we SWAP them. We repeat this until the array is fully sorted.", type: "theory" },
      { title: "HOLODECK SIMULATION", text: "Run the simulation to watch elements swap and the heaviest element (7) bubble to its final position.", type: "interactive_bubble" }
    ],
    'Stacks: The LIFO Cylinder': [
      { title: "LAST IN, FIRST OUT (LIFO)", text: "Think of a stack of plates in a cafeteria. You can only take the top plate, and you can only add a new plate to the top. This is the LIFO principle.", type: "theory" },
      { title: "PUSH AND POP", text: "Adding an item to the stack is called a PUSH. Removing the top item is called a POP. It is incredibly powerful for undo features and recursive algorithms.", type: "theory" },
      { title: "HOLODECK SIMULATION", text: "Observe the stack in action. Watch how items are pushed onto the top and popped off in reverse order.", type: "interactive_stack" }
    ],
    'Projectile Motion: The Cannon': [
      { title: "KINEMATICS IN 2D", text: "Projectile motion is just two 1D motions happening at the same time: Constant velocity horizontally, and constant acceleration (gravity) vertically.", type: "theory" },
      { title: "THE GOLDEN ANGLE", text: "In a vacuum, a 45-degree angle always yields the maximum horizontal range. Steeper angles give more air time, but less distance.", type: "theory" },
      { title: "HOLODECK SIMULATION", text: "Fire the cannon at different angles. Observe how the peak height and maximum range change on the grid.", type: "interactive_physics" }
    ],
    'Titration: The Color Shift': [
      { title: "ACID MEETS BASE", text: "Titration is a technique to determine the concentration of an unknown acid or base by neutralizing it with a known concentration.", type: "theory" },
      { title: "THE INDICATOR", text: "We use Phenolphthalein, a chemical indicator that is colorless in acids but turns pink in bases. We look for the faintest pink color to find the neutral point.", type: "theory" },
      { title: "HOLODECK SIMULATION", text: "Carefully add drops of base. Watch the pH meter and the color of the solution. Do not over-titrate!", type: "interactive_chem" }
    ]
  };

  const handleComplete = async () => {
    // Still updates the user profile ELO if they are logged in via Supabase
    if (user && moduleData) {
      const { data: profile } = await supabase.from('profiles').select('elo').eq('id', user.id).single();
      if (profile) {
        await supabase.from('profiles').update({ elo: profile.elo + moduleData.xp_reward }).eq('id', user.id);
      }
    }
    setIsCompleted(true);
  };

  if (!moduleData) return <div style={{ color: 'var(--pink)', padding: '100px', textAlign: 'center', fontFamily: '"Press Start 2P", monospace' }}>MODULE NOT FOUND.</div>;

  const slides = lessonContent[moduleData.title] || [
    { title: "SYSTEM ERROR", text: "Immersive content for this module is still under construction.", type: "theory" }
  ];
  const current = slides[currentSlide];

  return (
    <div className="page-wrap" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px' }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.8)', border: '2px solid var(--border)', padding: '16px', marginBottom: '24px' }}>
        <div>
          <span className="chip chip-b">▶ {moduleData.subject.toUpperCase()}</span>
          <h1 style={{ color: 'var(--white)', fontFamily: '"Press Start 2P", monospace', fontSize: '16px', marginTop: '12px' }}>{moduleData.title}</h1>
        </div>
        <button onClick={() => navigate(`/learn/${moduleData.subject}`)} className="px-btn px-btn-r">ABORT MISSION</button>
      </div>

      {isCompleted ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--card)', border: '4px solid var(--green)' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🏆</div>
          <h2 style={{ fontFamily: '"Press Start 2P", monospace', color: 'var(--green)', fontSize: '24px', marginBottom: '16px' }}>MODULE MASTERED</h2>
          <p style={{ color: 'var(--yellow)', fontFamily: '"Press Start 2P", monospace', marginBottom: '32px' }}>+{moduleData.xp_reward} ELO REWARDED</p>
          <button onClick={() => navigate(`/learn/${moduleData.subject}`)} className="px-btn px-btn-g">RETURN TO ARCHIVE</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, overflow: 'hidden' }}>
          
          {/* LEFT SCREEN: MISSION BRIEFING */}
          <div style={{ background: 'var(--card)', border: '3px solid var(--blue)', display: 'flex', flexDirection: 'column', padding: '32px' }}>
            <div style={{ color: 'var(--blue)', fontFamily: '"Press Start 2P", monospace', fontSize: '12px', marginBottom: '32px', borderBottom: '2px solid var(--blue)', paddingBottom: '16px' }}>
              SYSTEM BRIEFING // SLIDE {currentSlide + 1}/{slides.length}
            </div>
            
            <h2 style={{ color: 'var(--white)', fontFamily: '"Press Start 2P", monospace', fontSize: '20px', marginBottom: '24px', lineHeight: '1.5' }}>
              {current.title}
            </h2>
            
            <p style={{ color: 'var(--muted)', fontFamily: '"VT323", monospace', fontSize: '24px', lineHeight: '1.6', flex: 1 }}>
              {current.text}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', paddingTop: '24px' }}>
              <button 
                className="px-btn px-btn-o" 
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(prev => prev - 1)}
              >◀ PREV</button>
              
              {currentSlide === slides.length - 1 ? (
                <button className="px-btn px-btn-g" onClick={handleComplete}>COMPLETE ▶</button>
              ) : (
                <button className="px-btn px-btn-b" onClick={() => setCurrentSlide(prev => prev + 1)}>NEXT ▶</button>
              )}
            </div>
          </div>

          {/* RIGHT SCREEN: THE HOLODECK (VISUALIZER) */}
          <div style={{ background: '#020204', border: '3px solid var(--pink)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
            <div style={{ position: 'absolute', top: 12, left: 16, color: 'var(--pink)', fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>
              ▶ HOLODECK LIVE
            </div>

            {current.type === 'theory' && (
              <div style={{ opacity: 0.3, fontSize: '120px', animation: 'pulse 2s infinite' }}>⚙️</div>
            )}

            {/* --- VISUALIZER: BINARY SEARCH --- */}
            {current.type === 'interactive_bs' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
                  {bsArray.map((num, idx) => {
                    const isLeft = idx === bsPhases[simStep].L;
                    const isRight = idx === bsPhases[simStep].R;
                    const isMid = idx === bsPhases[simStep].M;
                    const isTarget = num === bsTarget && bsPhases[simStep].M === idx && simStep === bsPhases.length - 1;
                    const outOfBounds = idx < bsPhases[simStep].L || idx > bsPhases[simStep].R;

                    let bg = 'rgba(255,255,255,0.05)';
                    let border = '2px solid var(--border)';
                    if (isMid) { bg = 'rgba(255,60,172,0.2)'; border = '2px solid var(--pink)'; }
                    if (isTarget) { bg = 'rgba(61,255,154,0.2)'; border = '2px solid var(--green)'; }
                    
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, border: border, color: outOfBounds ? 'var(--border)' : 'var(--white)', fontFamily: '"Press Start 2P", monospace', fontSize: '12px', transition: 'all 0.3s' }}>{num}</div>
                        <div style={{ height: '24px', marginTop: '8px', fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: 'var(--yellow)' }}>
                          {isLeft && 'L '} {isRight && 'R '} {isMid && 'M'}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background: '#000', border: '2px solid var(--border)', width: '100%', padding: '16px', fontFamily: '"VT323", monospace', fontSize: '20px', color: 'var(--green)', minHeight: '80px', marginBottom: '24px' }}>&gt; {bsPhases[simStep].msg}</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button className="px-btn px-btn-o" onClick={() => setSimStep(0)}>RESET</button>
                  <button className="px-btn px-btn-p" disabled={simStep === bsPhases.length - 1} onClick={() => setSimStep(prev => prev + 1)}>STEP FORWARD ▶</button>
                </div>
              </div>
            )}

            {/* --- VISUALIZER: BUBBLE SORT --- */}
            {current.type === 'interactive_bubble' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
                  {bubblePhases[simStep].arr.map((num, idx) => {
                    const isActive = bubblePhases[simStep].active.includes(idx);
                    const isSorted = bubblePhases[simStep].sorted.includes(idx);
                    
                    let bg = 'rgba(255,255,255,0.05)';
                    let border = '2px solid var(--border)';
                    if (isActive) { bg = 'rgba(255,214,10,0.2)'; border = '2px solid var(--yellow)'; }
                    if (isSorted) { bg = 'rgba(61,255,154,0.2)'; border = '2px solid var(--green)'; }
                    
                    return (
                      <div key={idx} style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, border: border, color: 'var(--white)', fontFamily: '"Press Start 2P", monospace', fontSize: '16px', transition: 'all 0.3s' }}>
                        {num}
                      </div>
                    );
                  })}
                </div>
                <div style={{ background: '#000', border: '2px solid var(--border)', width: '100%', padding: '16px', fontFamily: '"VT323", monospace', fontSize: '20px', color: 'var(--yellow)', minHeight: '80px', marginBottom: '24px' }}>&gt; {bubblePhases[simStep].msg}</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button className="px-btn px-btn-o" onClick={() => setSimStep(0)}>RESET</button>
                  <button className="px-btn px-btn-p" disabled={simStep === bubblePhases.length - 1} onClick={() => setSimStep(prev => prev + 1)}>STEP FORWARD ▶</button>
                </div>
              </div>
            )}

            {/* --- VISUALIZER: STACK --- */}
            {current.type === 'interactive_stack' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', width: '120px', minHeight: '220px', borderLeft: '4px solid var(--blue)', borderRight: '4px solid var(--blue)', borderBottom: '4px solid var(--blue)', padding: '8px', marginBottom: '40px', background: 'rgba(60,172,255,0.05)' }}>
                  {stackPhases[simStep].stack.length === 0 && <span style={{color: 'var(--muted)', marginTop: 'auto', marginBottom: '8px', fontFamily: '"Press Start 2P", monospace', fontSize: '10px'}}>EMPTY</span>}
                  {stackPhases[simStep].stack.map((item, idx) => (
                    <div key={idx} style={{ width: '100%', padding: '16px 0', marginBottom: '8px', textAlign: 'center', background: idx === stackPhases[simStep].stack.length - 1 ? 'rgba(61,255,154,0.2)' : 'rgba(255,255,255,0.1)', border: idx === stackPhases[simStep].stack.length - 1 ? '2px solid var(--green)' : '2px solid var(--border)', color: 'var(--white)', fontFamily: '"Press Start 2P", monospace', transition: 'all 0.3s' }}>
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ background: '#000', border: '2px solid var(--border)', width: '100%', padding: '16px', fontFamily: '"VT323", monospace', fontSize: '20px', color: 'var(--blue)', minHeight: '80px', marginBottom: '24px' }}>&gt; {stackPhases[simStep].msg}</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button className="px-btn px-btn-o" onClick={() => setSimStep(0)}>RESET</button>
                  <button className="px-btn px-btn-p" disabled={simStep === stackPhases.length - 1} onClick={() => setSimStep(prev => prev + 1)}>STEP FORWARD ▶</button>
                </div>
              </div>
            )}

            {/* --- VISUALIZER: PHYSICS --- */}
            {current.type === 'interactive_physics' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%', height: '200px', borderLeft: '2px solid var(--border)', borderBottom: '2px solid var(--border)', marginBottom: '40px' }}>
                  <div style={{ position: 'absolute', bottom: -10, left: -20, fontSize: '24px' }}>💣</div>
                  {physicsPhases[simStep].dots.map((pos, idx) => (
                    <div key={idx} style={{ position: 'absolute', bottom: `${pos.y}%`, left: `${pos.x}%`, width: '12px', height: '12px', background: physicsPhases[simStep].color, borderRadius: '50%', boxShadow: `0 0 8px ${physicsPhases[simStep].color}`, transition: 'all 0.5s', opacity: idx === 0 ? 0 : 1 }} />
                  ))}
                </div>
                <div style={{ background: '#000', border: '2px solid var(--border)', width: '100%', padding: '16px', fontFamily: '"VT323", monospace', fontSize: '20px', color: physicsPhases[simStep].color, minHeight: '80px', marginBottom: '24px' }}>&gt; {physicsPhases[simStep].msg}</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button className="px-btn px-btn-o" onClick={() => setSimStep(0)}>RESET</button>
                  <button className="px-btn px-btn-p" disabled={simStep === physicsPhases.length - 1} onClick={() => setSimStep(prev => prev + 1)}>FIRE CANNON ▶</button>
                </div>
              </div>
            )}

            {/* --- VISUALIZER: CHEMISTRY --- */}
            {current.type === 'interactive_chem' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '40px' }}>
                  <div style={{ textAlign: 'center', fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: 'var(--white)' }}>
                    pH METER
                    <div style={{ marginTop: '8px', padding: '12px', background: '#000', border: '2px solid var(--border)', color: 'var(--green)', fontSize: '20px' }}>
                      {chemPhases[simStep].ph.toFixed(1)}
                    </div>
                  </div>
                  <div style={{ width: '100px', height: '140px', border: '4px solid var(--white)', borderTop: 'none', borderRadius: '0 0 16px 16px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '60%', background: chemPhases[simStep].color, transition: 'all 0.5s ease-in-out' }} />
                  </div>
                </div>
                <div style={{ background: '#000', border: '2px solid var(--border)', width: '100%', padding: '16px', fontFamily: '"VT323", monospace', fontSize: '20px', color: 'var(--pink)', minHeight: '80px', marginBottom: '24px' }}>&gt; {chemPhases[simStep].msg}</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button className="px-btn px-btn-o" onClick={() => setSimStep(0)}>RESET</button>
                  <button className="px-btn px-btn-p" disabled={simStep === chemPhases.length - 1} onClick={() => setSimStep(prev => prev + 1)}>+1 DROP BASE</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}