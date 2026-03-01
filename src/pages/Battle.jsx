import { useState, useEffect } from 'react';
import '../styles/battle.css';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Battle() {
  const { user } = useAuth(); 
  
  const [battleState, setBattleState] = useState('idle'); 
  const [countdownText, setCountdownText] = useState('');
  const [timeLeft, setTimeLeft] = useState(30); 
  const [p1Status, setP1Status] = useState('coding'); 
  const [p2Status, setP2Status] = useState('coding'); 
  
  // Dynamic Challenge State
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('// Loading challenge...');
  const [enemyCode, setEnemyCode] = useState('// Loading enemy trace...');

  const currentUser = user ? user.email.split('@')[0].toUpperCase() : 'GUEST_USER';

  const startMatchmaking = async () => {
    setBattleState('search');
    
    try {
      // FETCH A RANDOM CHALLENGE FROM SUPABASE
      const { data, error } = await supabase.from('challenges').select('*');
      if (!error && data && data.length > 0) {
        const randomChallenge = data[Math.floor(Math.random() * data.length)];
        setChallenge(randomChallenge);
        setCode(randomChallenge.starter_code);
        setEnemyCode(randomChallenge.enemy_code);
        setTimeLeft(randomChallenge.time_limit);
      }
    } catch (err) {
      console.error("Failed to load challenge:", err);
    }

    setTimeout(() => {
      setBattleState('vs');
      setTimeout(() => setBattleState('countdown'), 3000); 
    }, 2500); 
  };

  useEffect(() => {
    if (battleState === 'countdown') {
      let count = 3;
      setCountdownText(count.toString());
      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdownText(count.toString());
        } else if (count === 0) {
          setCountdownText('START!');
        } else {
          clearInterval(interval);
          setBattleState('live'); 
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [battleState]);

  useEffect(() => {
    let timer;
    if (battleState === 'live' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && battleState === 'live') {
      triggerFinish();
    }
    return () => clearInterval(timer);
  }, [battleState, timeLeft]);

  useEffect(() => {
    let opponentTimer;
    if (battleState === 'live' && p2Status === 'coding') {
      const randomFinishTime = Math.floor(Math.random() * 15000) + 10000;
      opponentTimer = setTimeout(() => setP2Status('submitted'), randomFinishTime);
    }
    return () => clearTimeout(opponentTimer);
  }, [battleState]);

  useEffect(() => {
    if (battleState === 'live' && p1Status === 'submitted' && p2Status === 'submitted') {
      triggerFinish();
    }
  }, [p1Status, p2Status, battleState]);

  const triggerFinish = async () => {
    setBattleState('finished');
    
    // IF THE USER WON (They submitted before the time ran out and the opponent)
    // You can refine this logic later to actually check if their code passed tests!
    if (user && p1Status === 'submitted' && timeLeft > 0) {
      try {
        const { data: currentStats } = await supabase
          .from('profiles')
          .select('wins, elo, matches')
          .eq('id', user.id)
          .single();
          
        if (currentStats) {
          await supabase
            .from('profiles')
            .update({ 
              wins: (currentStats.wins || 0) + 1,
              matches: (currentStats.matches || 0) + 1,
              elo: (currentStats.elo || 1000) + 25
            })
            .eq('id', user.id);
        }
      } catch (err) {
        console.error("Failed to update stats:", err);
      }
    }

    setTimeout(() => setBattleState('results'), 3000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="page-wrap">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div className="chip chip-r">⚔ RANKED ARENA</div>
        <h1 style={{ color: 'var(--pink)', textShadow: '3px 3px 0 var(--pd)', marginTop: '12px' }}>GLOBAL MATCHMAKING</h1>
      </div>

      <div className="b-arena">
        {/* IDLE STATE */}
        {battleState === 'idle' && (
          <div className="b-state-idle" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '24px', color: 'var(--white)', marginBottom: '16px' }}>READY TO ENTER THE ARENA?</div>
            <p style={{ fontSize: '18px', color: 'var(--muted)', marginBottom: '40px' }}>You will be matched against an opponent of similar ELO. First to solve wins.</p>
            <button onClick={startMatchmaking} className="px-btn px-btn-r" style={{ fontSize: '16px', padding: '16px 32px' }}>FIND MATCH ▶</button>
          </div>
        )}

        {/* SEARCH & VS & COUNTDOWN STATES (Same as before) */}
        {battleState === 'search' && (
          <div className="b-state-search" style={{ textAlign: 'center', padding: '80px 20px' }}><div className="radar" style={{ margin: '0 auto 30px' }}><div className="sweep"></div></div><div className="srch-text blink" style={{ fontFamily: '"Press Start 2P", monospace', color: 'var(--pink)' }}>SEARCHING QUEUE...</div></div>
        )}

        {battleState === 'vs' && (
           <div className="b-state-vs" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', padding: '60px 0' }}>
           <div className="b-char p1-side" style={{ textAlign: 'center' }}><div className="bc-av" style={{ fontSize: '64px', marginBottom: '16px', border: '4px solid var(--green)', padding: '20px', background: 'rgba(61,255,154,0.1)' }}>🤖</div><div className="bc-name" style={{ fontFamily: '"Press Start 2P", monospace', color: 'var(--green)', fontSize: '14px', marginBottom: '8px' }}>{currentUser}</div></div>
           <div className="vs-badge" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '32px', color: 'var(--yellow)', textShadow: '4px 4px 0 var(--yd)' }}>VS</div>
           <div className="b-char p2-side" style={{ textAlign: 'center' }}><div className="bc-av" style={{ fontSize: '64px', marginBottom: '16px', border: '4px solid var(--pink)', padding: '20px', background: 'rgba(255,60,172,0.1)' }}>💀</div><div className="bc-name" style={{ fontFamily: '"Press Start 2P", monospace', color: 'var(--pink)', fontSize: '14px', marginBottom: '8px' }}>NULL_POINTER</div></div>
         </div>
        )}

        {battleState === 'countdown' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}><div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: countdownText === 'START!' ? '72px' : '120px', color: countdownText === 'START!' ? 'var(--pink)' : 'var(--yellow)', textShadow: `8px 8px 0 ${countdownText === 'START!' ? 'var(--pd)' : 'var(--yd)'}`, animation: 'bounce 0.5s infinite alternate' }}>{countdownText}</div></div>
        )}

        {/* LIVE STATE WITH DYNAMIC CHALLENGE */}
        {battleState === 'live' && challenge && (
          <div className="b-state-live">
            <div className="live-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(0,0,0,0.5)', border: '2px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="chip chip-y">▶ {challenge.title.toUpperCase()}</span>
                <span style={{ color: 'var(--muted)', fontSize: '18px' }}>{challenge.description}</span>
              </div>
              <div style={{ color: timeLeft <= 10 ? 'var(--pink)' : 'var(--yellow)', fontFamily: '"Press Start 2P", monospace', fontSize: '14px', animation: timeLeft <= 10 ? 'blink 1s step-end infinite' : 'none' }}>
                ⏱ {formatTime(timeLeft)}
              </div>
            </div>

            <div className="live-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="live-col" style={{ position: 'relative' }}>
                <div className="lc-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>
                  <span style={{ color: 'var(--green)' }}>{currentUser}</span>
                  <span style={{ color: 'var(--muted)' }}>{p1Status === 'submitted' ? 'SUBMITTED' : 'CODING...'}</span>
                </div>
                <div className="b-editor" style={{ background: 'var(--card)', border: '3px solid var(--border)', height: '420px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {p1Status === 'submitted' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: 'var(--green)', fontFamily: '"Press Start 2P", monospace', fontSize: '12px', marginBottom: '16px' }}>CODE SUBMITTED!</div><div className="blink" style={{ color: 'var(--muted)', fontFamily: '"Press Start 2P", monospace', fontSize: '8px' }}>WAITING FOR OPPONENT...</div></div>}
                  <div style={{ padding: '8px 12px', borderBottom: '2px solid var(--border)', color: 'var(--muted)', fontSize: '16px', background: 'rgba(255,255,255,0.02)' }}>solution.py</div>
                  <textarea value={code} onChange={(e) => setCode(e.target.value)} disabled={p1Status === 'submitted'} style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--white)', padding: '16px', fontFamily: '"VT323", monospace', fontSize: '20px', resize: 'none', outline: 'none' }} spellCheck="false" />
                  <div style={{ padding: '12px', borderTop: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                    <button className="px-btn px-btn-o" disabled={p1Status === 'submitted'}>TEST CODE</button>
                    <button className="px-btn px-btn-g" onClick={() => setP1Status('submitted')} disabled={p1Status === 'submitted'}>{p1Status === 'submitted' ? 'WAITING' : 'SUBMIT ▶'}</button>
                  </div>
                </div>
              </div>

              <div className="live-col">
                <div className="lc-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>
                  <span style={{ color: 'var(--pink)' }}>NULL_POINTER</span>
                  <span style={{ color: p2Status === 'submitted' ? 'var(--pink)' : 'var(--muted)' }}>{p2Status === 'submitted' ? 'SUBMITTED' : 'CODING...'}</span>
                </div>
                <div className="b-trace" style={{ background: 'var(--card)', border: '3px solid var(--border)', height: '420px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '2px solid var(--border)', color: 'var(--pink)', fontSize: '16px', background: 'rgba(255,60,172,0.05)' }}>▶ ENEMY TRACE</div>
                  <div style={{ flex: 1, padding: '16px', fontFamily: '"VT323", monospace', fontSize: '18px', color: 'var(--muted)', overflowY: 'auto' }}>
                    <div>&gt; Compiling solution.cpp...</div><div>&gt; Compilation successful.</div>
                    {p2Status === 'submitted' ? <div style={{ color: 'var(--pink)', marginTop: '16px', fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>[!] ENEMY HAS SUBMITTED THEIR CODE.</div> : <><div style={{ color: 'var(--white)' }}>&gt; Test Case 1: <span style={{ color: 'var(--green)' }}>PASS</span> (0.01s)</div><div className="blink" style={{ marginTop: '16px', color: 'var(--pink)' }}>_</div></>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FINISHED, RESULTS, AND REVIEW PAGES */}
        {battleState === 'finished' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column' }}><div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '64px', color: 'var(--white)', textShadow: '6px 6px 0 rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.5)', animation: 'fight-pop 0.5s steps(4) both' }}>FINISHED!</div><div style={{ color: 'var(--muted)', marginTop: '20px', fontFamily: '"Press Start 2P", monospace', fontSize: '12px' }} className="blink">CALCULATING RESULTS...</div></div>
        )}

        {battleState === 'results' && (
          <div className="winner-summary show">
            <div className={`ws-banner ${p1Status === 'submitted' && timeLeft > 0 ? 'p1-wins' : ''}`}>
              {p1Status === 'submitted' && timeLeft > 0 ? `▶ VICTORY: ${currentUser} ◀` : `▶ DEFEAT: OUT OF TIME ◀`}
            </div>
            <div className="result-actions" style={{ marginTop: '24px' }}>
              <button className="px-btn px-btn-g" onClick={() => { setBattleState('idle'); setP1Status('coding'); setP2Status('coding'); }}>PLAY AGAIN</button>
              <button className="px-btn px-btn-o" onClick={() => setBattleState('review')}>REVIEW CODE</button>
            </div>
          </div>
        )}

        {battleState === 'review' && challenge && (
           <div className="review-state" style={{ padding: '10px 0' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <div>
               <h2 style={{ color: 'var(--blue)', fontFamily: '"Press Start 2P", monospace', fontSize: '16px', margin: '0 0 8px 0' }}>POST-MATCH CODE REVIEW</h2>
               <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>Analyze and compare implementations.</p>
             </div>
             <button className="px-btn px-btn-o" onClick={() => setBattleState('results')}>◀ BACK TO RESULTS</button>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
             <div style={{ background: 'var(--card)', border: '3px solid var(--green)', display: 'flex', flexDirection: 'column' }}>
               <div style={{ padding: '12px', borderBottom: '2px solid var(--green)', background: 'rgba(61,255,154,0.1)' }}>
                 <span style={{ color: 'var(--green)', fontFamily: '"Press Start 2P", monospace', fontSize: '12px' }}>{currentUser}</span>
               </div>
               <textarea disabled value={code} style={{ flex: 1, minHeight: '400px', background: 'transparent', border: 'none', color: 'var(--white)', padding: '16px', fontFamily: '"VT323", monospace', fontSize: '20px', resize: 'none' }} />
             </div>
             <div style={{ background: 'var(--card)', border: '3px solid var(--pink)', display: 'flex', flexDirection: 'column' }}>
               <div style={{ padding: '12px', borderBottom: '2px solid var(--pink)', background: 'rgba(255,60,172,0.1)' }}>
                 <span style={{ color: 'var(--pink)', fontFamily: '"Press Start 2P", monospace', fontSize: '12px' }}>ENEMY SOLUTION</span>
               </div>
               <textarea disabled value={enemyCode} style={{ flex: 1, minHeight: '400px', background: 'transparent', border: 'none', color: 'var(--muted)', padding: '16px', fontFamily: '"VT323", monospace', fontSize: '20px', resize: 'none' }} />
             </div>
           </div>
         </div>
        )}
      </div>
    </div>
  );
}