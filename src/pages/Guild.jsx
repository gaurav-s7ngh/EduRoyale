import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import '../styles/guild.css';

export default function Guild() {
  const { user } = useAuth();
  
  // Database States
  const [guilds, setGuilds] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [myGuildDetails, setMyGuildDetails] = useState(null);
  const [myGuildMembers, setMyGuildMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all available guilds
      const { data: guildData } = await supabase.from('guilds').select('*').order('total_elo', { ascending: false });
      if (guildData) setGuilds(guildData);

      // 2. Fetch current user
      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) {
          setMyProfile(profileData);
          
          // 3. If they are IN a guild, fetch the rich dashboard data!
          if (profileData.guild_name && profileData.guild_name !== 'UNASSIGNED') {
            // Get the guild's stats
            const { data: gDetails } = await supabase.from('guilds').eq('name', profileData.guild_name).single();
            if (gDetails) setMyGuildDetails(gDetails);
            
            // Get the active roster (all users in this guild)
            const { data: members } = await supabase.from('profiles')
              .select('username, elo, wins')
              .eq('guild_name', profileData.guild_name)
              .order('elo', { ascending: false });
            if (members) setMyGuildMembers(members);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching guild data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // --- ACTIONS ---
  const handleJoinGuild = async (guildName) => {
    if (!user) return alert("Please login to join an Academic House!");
    const { error } = await supabase.from('profiles').update({ guild_name: guildName }).eq('id', user.id);
    if (!error) {
      const targetGuild = guilds.find(g => g.name === guildName);
      if (targetGuild) {
         await supabase.from('guilds').update({ member_count: targetGuild.member_count + 1, total_elo: targetGuild.total_elo + (myProfile?.elo || 1000) }).eq('name', guildName);
      }
      fetchData();
    }
  };

  const handleLeaveGuild = async () => {
    if (!user || !myProfile) return;
    const oldGuildName = myProfile.guild_name;
    const { error } = await supabase.from('profiles').update({ guild_name: 'UNASSIGNED' }).eq('id', user.id);
    if (!error) {
      const targetGuild = guilds.find(g => g.name === oldGuildName);
      if (targetGuild && targetGuild.member_count > 0) {
         await supabase.from('guilds').update({ member_count: targetGuild.member_count - 1, total_elo: targetGuild.total_elo - (myProfile.elo || 1000) }).eq('name', oldGuildName);
      }
      fetchData();
    }
  };

  const handleCreateGuild = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to establish a House.");
    if (!newGuildName.trim()) return;

    const formattedName = newGuildName.toUpperCase().replace(/\s+/g, '_');
    const { error: insertError } = await supabase.from('guilds').insert([{
      name: formattedName,
      description: newGuildDesc || 'A newly established academic house.',
      total_elo: myProfile.elo || 1000,
      member_count: 1
    }]);

    if (insertError) return alert("Error creating guild. That name might already exist!");
    await supabase.from('profiles').update({ guild_name: formattedName }).eq('id', user.id);
    setNewGuildName(''); setNewGuildDesc(''); fetchData();
  };

  if (loading) return <div style={{ color: 'var(--white)', padding: '100px', textAlign: 'center', fontFamily: '"Press Start 2P", monospace' }}>ACCESSING GUILD NETWORK...</div>;

  const currentGuildName = myProfile?.guild_name || 'UNASSIGNED';

  // ==========================================
  // VIEW 1: USER IS IN A GUILD (RICH DASHBOARD)
  // ==========================================
  if (currentGuildName !== 'UNASSIGNED' && myGuildDetails) {
    // Calculate dynamic Level and XP based on their total ELO
    const level = Math.floor(myGuildDetails.total_elo / 5000) + 1;
    const currentXp = myGuildDetails.total_elo % 5000;
    const xpPercentage = (currentXp / 5000) * 100;

    // Mock subject strengths (until we build a DB table for this)
    const subjectStrengths = { "Physics": 1650, "Computer Science": 1400, "Mathematics": 1100 };

    return (
      <div className="max-w-6xl mx-auto p-8 pt-12 min-h-screen text-white">
        
        {/* TOP BANNER (GuildHeader logic) */}
        <div className="bg-gray-900 border-4 border-pink-500 p-6 shadow-[8px_8px_0px_#831843] mb-8 relative">
          <button onClick={handleLeaveGuild} className="absolute top-4 right-4 px-btn px-btn-r text-[10px]">LEAVE HOUSE</button>
          
          <div className="flex justify-between items-start mb-4 pr-32">
            <div>
              <div className="font-pixel text-[10px] text-pink-400 mb-2">▶ ACADEMIC HOUSE</div>
              <h1 className="font-pixel text-3xl text-white drop-shadow-[3px_3px_0_#000]">
                {myGuildDetails.name}
              </h1>
              <p className="text-gray-400 mt-2 font-terminal text-xl">{myGuildDetails.description}</p>
            </div>
            <div className="text-center bg-black/50 border-2 border-gray-700 p-3">
              <div className="font-pixel text-[10px] text-gray-400 mb-1">TOTAL HOUSE ELO</div>
              <div className="font-pixel text-xl text-yellow-400">{myGuildDetails.total_elo}</div>
            </div>
          </div>

          {/* Level & XP Bar */}
          <div className="flex items-center gap-4">
            <div className="font-pixel text-lg text-pink-400 bg-pink-500/20 px-4 py-2 border border-pink-500">
              LVL {level}
            </div>
            <div className="flex-1">
              <div className="flex justify-between font-pixel text-[10px] text-gray-400 mb-2">
                <span>XP: {currentXp} / 5000</span>
                <span>NEXT PERK: CUSTOM ARENA</span>
              </div>
              <div className="h-4 bg-black border-2 border-gray-700 w-full relative">
                <div className="absolute top-0 left-0 h-full bg-pink-500 shadow-[inset_-3px_0_0_rgba(0,0,0,0.3)] transition-all duration-500" style={{ width: `${xpPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT COLUMN: Strengths (GuildSkillDashboard logic) */}
          <div className="bg-gray-900 border-2 border-blue-500 p-6 shadow-[4px_4px_0px_#1e3a8a]">
            <h2 className="font-pixel text-blue-400 text-sm mb-6 border-b-2 border-gray-700 pb-2">
              📊 DOMAIN STRENGTHS
            </h2>
            <div className="flex flex-col gap-6">
              {Object.entries(subjectStrengths).map(([subjectName, rating]) => (
                <div key={subjectName}>
                  <div className="flex justify-between font-pixel text-[12px] mb-2">
                    <span className="text-white uppercase">{subjectName}</span>
                    <span className="text-blue-400">{rating} RATING</span>
                  </div>
                  <div className="h-6 bg-black/50 border-2 border-gray-700 w-full relative p-1">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min((rating / 2000) * 100, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Roster */}
          <div className="bg-gray-900 border-2 border-yellow-500 p-6 shadow-[4px_4px_0px_#854d0e]">
            <h2 className="font-pixel text-yellow-400 text-sm mb-6 border-b-2 border-gray-700 pb-2">
              👥 ACTIVE ROSTER ({myGuildMembers.length}/50)
            </h2>
            <div className="flex flex-col gap-4 font-terminal text-2xl text-gray-300 h-[300px] overflow-y-auto pr-2">
              {myGuildMembers.map((member, index) => {
                // Highest ELO is deemed the "Leader"
                const role = index === 0 ? 'Leader' : index < 3 ? 'Strategist' : 'Member';
                const isMe = member.username === myProfile.username;
                
                return (
                  <div key={index} className={`flex justify-between items-center bg-black/40 p-3 border ${isMe ? 'border-green-500' : 'border-gray-700'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{role === 'Leader' ? '👑' : '👤'}</span>
                      <div>
                        <div className="text-white">{member.username || 'ANONYMOUS'} {isMe && '(YOU)'}</div>
                        <div className="text-sm text-yellow-500 font-pixel text-[8px] mt-1">{role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-pixel text-[12px]">{member.elo} ELO</div>
                      <div className="text-gray-500 font-pixel text-[8px] mt-1">{member.wins} WINS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: USER IS NOT IN A GUILD (JOIN/CREATE)
  // ==========================================
  return (
    <div className="page-wrap">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div className="chip chip-p">🛡️ ACADEMIC HOUSES</div>
        <h1 style={{ color: 'var(--purple)', textShadow: '3px 3px 0 var(--pud)', marginTop: '12px' }}>GUILD REGISTRY</h1>
        <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Pledge allegiance to a house, pool your ELO, and dominate the global leaderboards.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        
        {/* GUILD LIST */}
        <div style={{ flex: 2 }}>
          <h2 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: 'var(--yellow)', marginBottom: '16px' }}>ESTABLISHED HOUSES</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {guilds.map(guild => (
              <div key={guild.id} style={{ background: 'rgba(0,0,0,0.4)', border: '2px solid var(--border)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: 'var(--white)' }}>{guild.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>{guild.description}</div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--yellow)' }}>🏆 {guild.total_elo} ELO</span>
                    <span style={{ color: 'var(--blue)' }}>👥 {guild.member_count} MEMBERS</span>
                  </div>
                </div>
                <button onClick={() => handleJoinGuild(guild.name)} className="px-btn px-btn-b">PLEDGE ▶</button>
              </div>
            ))}
          </div>
        </div>

        {/* CREATE GUILD FORM */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: 'var(--pink)', marginBottom: '16px' }}>FOUND A HOUSE</h2>
          <form onSubmit={handleCreateGuild} style={{ background: 'var(--card)', border: '3px solid var(--pink)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--muted)', fontSize: '12px', fontFamily: '"Press Start 2P", monospace', marginBottom: '8px' }}>HOUSE NAME</label>
              <input type="text" value={newGuildName} onChange={(e) => setNewGuildName(e.target.value)} maxLength={20} style={{ width: '100%', background: 'rgba(0,0,0,0.6)', border: '2px solid var(--border)', color: 'var(--white)', padding: '12px', fontFamily: '"VT323", monospace', fontSize: '20px', outline: 'none' }} placeholder="e.g. QUANTUM_GHOSTS" />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--muted)', fontSize: '12px', fontFamily: '"Press Start 2P", monospace', marginBottom: '8px' }}>MANIFESTO (DESC)</label>
              <textarea value={newGuildDesc} onChange={(e) => setNewGuildDesc(e.target.value)} maxLength={60} style={{ width: '100%', background: 'rgba(0,0,0,0.6)', border: '2px solid var(--border)', color: 'var(--white)', padding: '12px', fontFamily: '"VT323", monospace', fontSize: '20px', outline: 'none', resize: 'none', height: '80px' }} placeholder="Declare your house's purpose..." />
            </div>
            <button type="submit" className="px-btn px-btn-r" style={{ justifyContent: 'center' }} disabled={!newGuildName}>
              INITIALIZE PROTOCOL
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}