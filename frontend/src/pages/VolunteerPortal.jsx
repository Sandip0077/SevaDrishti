import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { volunteerService, shiftService, aiService } from '../services/api';
import StatsCard from '../components/StatsCard';
import EmptyState from '../components/EmptyState';
import { User, Calendar, MapPin, Activity, Clock, Briefcase, Heart, CheckCircle, AlertCircle, Sparkles, TrendingDown, Battery, BatteryWarning, BatteryFull } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VolunteerPortal() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fatigueResult, setFatigueResult] = useState(null);
  const [fatigueLoading, setFatigueLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.allSettled([
        volunteerService.getMyProfile(),
        shiftService.getAll(),
      ]);
      if (pRes.status === 'fulfilled') setProfile(pRes.value.data);
      if (sRes.status === 'fulfilled') setShifts(sRes.value.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // PILLAR 3: AI fatigue prediction
  const predictFatigue = async () => {
    setFatigueLoading(true);
    try {
      const res = await aiService.predictFatigue({
        volunteerId: profile?.id || '',
        volunteerName: user?.name || '',
        hoursWorked: profile?.totalHoursWorked || 0,
        shiftsCompleted: profile?.shiftsCompleted || 0,
        taskIntensity: 'MEDIUM',
        restHours: 7, // Could be input from volunteer
        consecutiveDays: Math.max(1, profile?.shiftsCompleted || 1),
      });
      setFatigueResult(res.data);
      toast.success('Fatigue analysis complete');
    } catch {
      toast.error('AI fatigue prediction unavailable');
    }
    setFatigueLoading(false);
  };

  const completedShifts = shifts.filter(s => s.status === 'COMPLETED').length;
  const upcomingShifts = shifts.filter(s => s.status === 'UPCOMING' || s.status === 'ACTIVE');

  const fatigueScore = fatigueResult?.fatigueScore ?? profile?.fatigueScore ?? 0;
  const fatigueColor = fatigueScore > 70 ? 'var(--danger-500)' : fatigueScore > 40 ? 'var(--warning-500)' : 'var(--success-500)';
  const FatigueIcon = fatigueScore > 70 ? BatteryWarning : fatigueScore > 40 ? Battery : BatteryFull;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name || 'Volunteer'} 🙏</h1>
        <p>Your personal volunteer dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <StatsCard icon={MapPin} label="Current Zone" value={profile?.currentZone || 'Unassigned'} variant="secondary" delay={0} />
        <StatsCard icon={Calendar} label="Shifts Completed" value={profile?.shiftsCompleted || completedShifts} variant="success" delay={0.1} />
        <StatsCard icon={Clock} label="Hours Worked" value={profile?.totalHoursWorked || 0} variant="primary" delay={0.2} />
        <StatsCard icon={Activity} label="Fatigue Score" value={`${fatigueScore}%`} variant={fatigueScore > 60 ? 'danger' : 'success'} delay={0.3} />
      </div>

      <div className="grid-2">
        {/* Profile Card */}
        <motion.div className="glass-card-static" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ padding: '28px' }}>
          <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} style={{ color: 'var(--primary-500)' }} /> My Profile</h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div className="avatar avatar-lg" style={{ background: 'var(--gradient-primary)', fontSize: '1.4rem' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'V'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{user?.name}</h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--neutral-500)' }}>{user?.email}</div>
              <span className={`badge ${profile?.status === 'DEPLOYED' ? 'badge-primary' : profile?.status === 'AVAILABLE' ? 'badge-success' : 'badge-neutral'}`} style={{ marginTop: '6px' }}>
                {profile?.status || 'AVAILABLE'}
              </span>
            </div>
          </div>

          {profile && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--neutral-400)', fontWeight: 600 }}>Skills</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {(profile.skills || []).map(s => <span key={s} className="badge badge-primary">{s}</span>)}
                  {(profile.skills || []).length === 0 && <span style={{ color: 'var(--neutral-400)', fontSize: '0.88rem' }}>No skills added</span>}
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--neutral-400)', fontWeight: 600 }}>Languages</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {(profile.languages || []).map(l => <span key={l} className="badge badge-secondary">{l}</span>)}
                </div>
              </div>
              <div className="grid-2" style={{ gap: '10px' }}>
                <div><span style={{ fontSize: '0.82rem', color: 'var(--neutral-400)' }}>Fitness</span><div style={{ fontWeight: 600 }}>{profile.fitnessLevel || 'N/A'}</div></div>
                <div><span style={{ fontSize: '0.82rem', color: 'var(--neutral-400)' }}>Phone</span><div style={{ fontWeight: 600 }}>{profile.phone || user?.phone || 'N/A'}</div></div>
              </div>
            </>
          )}
          {!profile && (
            <div style={{ padding: '20px', background: 'var(--warning-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-600)', fontSize: '0.9rem' }}>
              <AlertCircle size={18} /> Profile not found. Contact admin.
            </div>
          )}
        </motion.div>

        {/* Right Column: Shifts + Fatigue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Upcoming Shifts */}
          <motion.div className="glass-card-static" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ padding: '24px' }}>
            <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={20} style={{ color: 'var(--secondary-500)' }} /> Upcoming Shifts</h4>
            {upcomingShifts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingShifts.slice(0, 3).map((s, i) => (
                  <div key={s.id || i} style={{ padding: '12px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${s.status === 'ACTIVE' ? 'var(--success-500)' : 'var(--secondary-500)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.zoneName || 'Zone'}</span>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>{s.status}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)' }}>
                      <Clock size={11} /> {s.startTime ? new Date(s.startTime).toLocaleString() : 'TBD'} • {s.taskIntensity || 'MEDIUM'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Calendar} title="No upcoming shifts" message="Your shifts will appear here" />
            )}
          </motion.div>

          {/* AI Fatigue Analysis - Pillar 3 */}
          <motion.div className="glass-card-static" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FatigueIcon size={20} style={{ color: fatigueColor }} /> Fatigue Monitor</h4>
              <button className="btn btn-outline btn-sm" onClick={predictFatigue} disabled={fatigueLoading}>
                <Sparkles size={14} /> {fatigueLoading ? 'Analyzing...' : 'AI Predict'}
              </button>
            </div>

            {/* Fatigue Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Current Level</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: fatigueColor }}>{fatigueScore}%</span>
              </div>
              <div style={{ height: '14px', background: 'var(--neutral-200)', borderRadius: '7px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fatigueScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: fatigueScore > 70
                      ? 'linear-gradient(90deg, var(--warning-500), var(--danger-500))'
                      : fatigueScore > 40
                      ? 'linear-gradient(90deg, var(--success-500), var(--warning-500))'
                      : 'linear-gradient(90deg, var(--success-400), var(--success-500))',
                    borderRadius: '7px',
                  }}
                />
              </div>
            </div>

            {/* AI Fatigue Breakdown */}
            {fatigueResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                {/* Risk Badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
                  padding: '10px 14px',
                  background: fatigueResult.riskLevel === 'CRITICAL' ? 'var(--danger-50)' : fatigueResult.riskLevel === 'HIGH' ? 'var(--warning-50)' : 'var(--success-50)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <span className={`badge ${fatigueResult.riskLevel === 'CRITICAL' || fatigueResult.riskLevel === 'HIGH' ? 'badge-danger' : fatigueResult.riskLevel === 'MODERATE' ? 'badge-warning' : 'badge-success'}`}>
                    {fatigueResult.riskLevel} RISK
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--neutral-600)' }}>{fatigueResult.suggestion}</span>
                </div>

                {/* Breakdown */}
                {fatigueResult.breakdown && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {[
                      { label: 'Work Fatigue', value: fatigueResult.breakdown.workFatigue, icon: '💼' },
                      { label: 'Shift Fatigue', value: fatigueResult.breakdown.shiftFatigue, icon: '📅' },
                      { label: 'Recovery Deficit', value: fatigueResult.breakdown.recoveryDeficit, icon: '😴' },
                      { label: 'Cumulative Stress', value: fatigueResult.breakdown.cumulativeStress, icon: '📈' },
                    ].map((b, i) => (
                      <div key={i} style={{ padding: '10px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem' }}>{b.icon}</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--neutral-800)' }}>{b.value}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--neutral-400)' }}>{b.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Personalized Advice */}
                {fatigueResult.aiAdvice && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'linear-gradient(135deg, var(--primary-50), var(--secondary-50))',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--primary-500)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Sparkles size={13} style={{ color: 'var(--primary-600)' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--primary-700)' }}>AI Wellness Advice</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--neutral-600)', lineHeight: 1.6, margin: 0 }}>
                      {fatigueResult.aiAdvice}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {!fatigueResult && (
              <div style={{ fontSize: '0.82rem', color: 'var(--neutral-400)', textAlign: 'center', padding: '8px' }}>
                {fatigueScore > 70 ? '⚠️ High fatigue — consider requesting a break' : fatigueScore > 40 ? '🔶 Moderate — pace yourself' : '✅ Low fatigue — you\'re in great shape'}
                <br /><span style={{ fontSize: '0.75rem' }}>Click "AI Predict" for detailed analysis</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
