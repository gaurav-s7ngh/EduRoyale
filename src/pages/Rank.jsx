import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import '../styles/rank.css';

export default function Ranks() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRankData, setMyRankData] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        // Fetch top 10 users ordered by ELO
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('elo', { ascending: false })
          .limit(10);

        if (error) throw error;
        if (data) {
          setLeaderboard(data);
          
          // Find the current logged-in user's rank
          if (user) {
            const myIndex = data.findIndex(p => p.id === user.id);
            if (myIndex !== -1) {
              setMyRankData({ ...data[myIndex], rankPosition: myIndex + 1 });
            } else {
              // If they aren't in the top 10, fetch them individually
              const { data: myData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
              if (myData) setMyRankData({ ...myData, rankPosition: 'Unranked' });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [user]);

  const getRankClass = (rank) => {
    if (rank === 1) return "t-rank gold";
    if (rank === 2) return "t-rank silver";
    if (rank === 3) return "t-rank bronze";
    return "t-rank";
  };

  if (loading) return <div style={{ color: 'var(--white)', padding: '100px', textAlign: 'center', fontFamily: '"Press Start 2P", monospace' }}>SYNCING GLOBAL LEADERBOARDS...</div>;

  return (
    <div className="ranks-wrap">
      <div className="ranks-header">
        <h1>COMPETITIVE HUB</h1>
        <p>Global leaderboards, guild standings, and live match feeds.</p>
      </div>

      <div className="table-section">
        <div className="table-header">
          <span>🏆 GLOBAL TOP PLAYERS</span>
          <span style={{ color: 'var(--green)' }}>LIVE RANKINGS</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="rank-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th>PLAYER</th>
                <th>GUILD</th>
                <th>SOLVED</th>
                <th>WIN %</th>
                <th style={{ textAlign: 'right' }}>ELO RATING</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>No players found in database yet!</td></tr>
              ) : (
                leaderboard.map((p, index) => {
                  const rank = index + 1;
                  const winRate = p.matches > 0 ? Math.round((p.wins / p.matches) * 100) + '%' : '0%';
                  const isMe = user && user.id === p.id;

                  return (
                    <tr key={p.id} className={isMe ? 'is-me' : ''}>
                      <td className={getRankClass(rank)}>#{rank}</td>
                      <td>
                        <div className="t-player">
                          <span className="t-avatar">👾</span>
                          <div>
                            <div className="t-name">{p.username || 'ANONYMOUS'} {isMe && '(YOU)'}</div>
                            <div className="t-title">Ranked Player</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.guild_name ? <span className="t-house">{p.guild_name}</span> : <span className="t-title">-</span>}</td>
                      <td className="t-val">{p.wins || 0}</td>
                      <td className="t-val t-green">{winRate}</td>
                      <td className="t-elo" style={{ color: isMe ? 'var(--green)' : 'var(--white)' }}>{p.elo || 1000}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Keeping your other static tables (Top Guilds, Recent Matches) below for aesthetics until you build DB tables for those! */}
      <div className="table-grid" style={{ marginTop: '24px' }}>
        <div className="table-section" style={{ borderColor: 'var(--purple)' }}>
          <div className="table-header" style={{ color: 'var(--purple)' }}><span>🛡️ TOP ACADEMIC HOUSES</span></div>
          <div style={{ padding: '20px', color: 'var(--muted)' }}>System offline. Awaiting guild registration...</div>
        </div>
        <div className="table-section" style={{ borderColor: 'var(--pink)' }}>
          <div className="table-header" style={{ color: 'var(--pink)' }}><span>⚔️ LIVE MATCH FEED</span></div>
          <div style={{ padding: '20px', color: 'var(--muted)' }}>System offline. Awaiting battle telemetry...</div>
        </div>
      </div>
    </div>
  );
}