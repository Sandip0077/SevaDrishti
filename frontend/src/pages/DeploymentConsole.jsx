import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Users, MapPin, Brain, CheckCircle, XCircle, ArrowRight, RefreshCw, Zap, Activity, AlertTriangle, Info, BarChart3, Sparkles } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ZoneMap from '../components/ZoneMap';
import { zoneService, volunteerService, allocationService, aiService } from '../services/api';
import toast from 'react-hot-toast';

export default function DeploymentConsole() {
  const [zones, setZones] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [rebalanceData, setRebalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [rebalanceLoading, setRebalanceLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); // map | recommendations | rebalance
  const [assignModal, setAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ volunteerId: '', zoneId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [zRes, vRes] = await Promise.allSettled([
        zoneService.getAll(),
        volunteerService.getAll(),
      ]);
      if (zRes.status === 'fulfilled') setZones(zRes.value.data || []);
      if (vRes.status === 'fulfilled') setVolunteers(vRes.value.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getAiRecommendations = async () => {
    setAiLoading(true);
    try {
      const availableVols = volunteers.filter(v => v.status === 'AVAILABLE' || !v.currentZone);
      const res = await aiService.optimizeAllocation({
        zones: zones.map(z => ({
          id: z.id, name: z.name, type: z.type,
          required: z.requiredVolunteers, current: z.currentVolunteers || 0,
          latitude: z.latitude || 23.1793, longitude: z.longitude || 75.7849,
          crowdDensity: z.crowdDensity || 0,
        })),
        volunteers: availableVols.map(v => ({
          id: v.id, name: v.name, skills: v.skills || [],
          fatigue: v.fatigueScore || 0, zone: v.currentZone || '',
          fitnessLevel: v.fitnessLevel || 'MEDIUM',
          latitude: 23.1793, longitude: 75.7849,
          hoursWorked: v.totalHoursWorked || 0, shiftsCompleted: v.shiftsCompleted || 0,
        })),
      });
      setRecommendations(res.data?.recommendations || []);
      setAiSummary(res.data?.aiSummary || '');
      setActiveTab('recommendations');
      toast.success(`${res.data?.totalRecommendations || 0} AI recommendations generated!`);
    } catch (err) {
      console.error(err);
      toast.error('AI service unavailable — check if the AI service is running on port 8000');
    }
    setAiLoading(false);
  };

  const getRebalanceAnalysis = async () => {
    setRebalanceLoading(true);
    try {
      const res = await aiService.rebalanceZones({
        zones: zones.map(z => ({
          id: z.id, name: z.name, type: z.type,
          required: z.requiredVolunteers, current: z.currentVolunteers || 0,
          latitude: z.latitude || 23.1793, longitude: z.longitude || 75.7849,
        })),
        volunteers: volunteers.map(v => ({
          id: v.id, name: v.name, skills: v.skills || [],
          fatigue: v.fatigueScore || 0, zone: v.currentZone || '',
        })),
      });
      setRebalanceData(res.data);
      setActiveTab('rebalance');
      toast.success('Zone rebalance analysis complete');
    } catch {
      toast.error('AI service unavailable');
    }
    setRebalanceLoading(false);
  };

  const handleAssign = async () => {
    if (!assignData.volunteerId || !assignData.zoneId) {
      toast.error('Select both volunteer and zone'); return;
    }
    try {
      await allocationService.assign(assignData);
      toast.success('Volunteer assigned successfully');
      setAssignModal(false);
      setAssignData({ volunteerId: '', zoneId: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Assignment failed'); }
  };

  const approveRecommendation = async (rec) => {
    try {
      await allocationService.assign({
        volunteerId: rec.volunteerId, zoneId: rec.zoneId,
        aiRecommended: true, score: rec.score,
      });
      toast.success(`Assigned ${rec.volunteerName} → ${rec.zoneName}`);
      setRecommendations(prev => prev.filter(r => r.volunteerId !== rec.volunteerId));
      fetchData();
    } catch { toast.error('Assignment failed'); }
  };

  const availableCount = volunteers.filter(v => v.status === 'AVAILABLE' || !v.currentZone).length;
  const deployedCount = volunteers.filter(v => v.status === 'DEPLOYED').length;
  const criticalZones = zones.filter(z => z.requiredVolunteers > 0 && (z.currentVolunteers || 0) / z.requiredVolunteers < 0.5).length;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>🚀 Deployment Console</h1>
          <p>AI-powered volunteer allocation • Real-time geo-deployment</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={getRebalanceAnalysis} disabled={rebalanceLoading}>
            <RefreshCw size={16} className={rebalanceLoading ? 'spin' : ''} />
            {rebalanceLoading ? 'Analyzing...' : 'Rebalance'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={getAiRecommendations} disabled={aiLoading}>
            <Brain size={16} />
            {aiLoading ? 'AI Processing...' : 'AI Optimize'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setAssignModal(true)}>
            <Users size={16} /> Manual Assign
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Zones', value: zones.length, icon: MapPin, color: 'var(--secondary-500)' },
          { label: 'Available', value: availableCount, icon: Users, color: 'var(--success-500)' },
          { label: 'Deployed', value: deployedCount, icon: Activity, color: 'var(--primary-500)' },
          { label: 'Critical Zones', value: criticalZones, icon: AlertTriangle, color: 'var(--danger-500)' },
        ].map((s, i) => (
          <motion.div key={i} className="glass-card-static" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--neutral-100)', padding: '4px', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
        {[
          { key: 'map', label: 'Live Map', icon: MapPin },
          { key: 'recommendations', label: `AI Suggestions ${recommendations.length ? `(${recommendations.length})` : ''}`, icon: Sparkles },
          { key: 'rebalance', label: 'Rebalance', icon: RefreshCw },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: 'var(--radius-sm)',
              background: activeTab === tab.key ? 'white' : 'transparent',
              color: activeTab === tab.key ? 'var(--primary-600)' : 'var(--neutral-500)',
              fontWeight: activeTab === tab.key ? 600 : 400,
              fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {/* MAP TAB */}
        {activeTab === 'map' && (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <ZoneMap
                zones={zones}
                volunteers={volunteers}
                onZoneClick={setSelectedZone}
                style={{ height: '480px' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
                <div className="glass-card-static" style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '0.92rem', marginBottom: '12px' }}>Zone Status</h4>
                  {zones.length > 0 ? zones.map((zone, i) => {
                    const ratio = zone.requiredVolunteers > 0 ? (zone.currentVolunteers || 0) / zone.requiredVolunteers : 1;
                    return (
                      <div key={zone.id || i} style={{
                        padding: '10px', marginBottom: '6px',
                        background: selectedZone?.id === zone.id ? 'var(--primary-50)' : 'var(--neutral-50)',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        border: selectedZone?.id === zone.id ? '1px solid var(--primary-200)' : '1px solid transparent',
                      }} onClick={() => setSelectedZone(zone)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{zone.name}</span>
                          <span style={{ fontSize: '0.75rem', color: ratio >= 0.8 ? 'var(--success-600)' : ratio >= 0.5 ? 'var(--warning-600)' : 'var(--danger-600)', fontWeight: 600 }}>
                            {Math.round(ratio * 100)}%
                          </span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--neutral-200)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${Math.min(ratio * 100, 100)}%`,
                            background: ratio >= 0.8 ? 'var(--success-500)' : ratio >= 0.5 ? 'var(--warning-500)' : 'var(--danger-500)',
                            transition: 'width 0.5s',
                          }} />
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--neutral-400)', marginTop: '3px' }}>
                          {zone.currentVolunteers || 0}/{zone.requiredVolunteers || 0} • {zone.type}
                        </div>
                      </div>
                    );
                  }) : <div style={{ color: 'var(--neutral-400)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No zones created yet</div>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <motion.div key="recs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* AI Summary */}
            {aiSummary && (
              <div className="glass-card-static" style={{
                padding: '16px 20px', marginBottom: '16px',
                background: 'linear-gradient(135deg, var(--primary-50), var(--secondary-50))',
                borderLeft: '4px solid var(--primary-500)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary-600)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-700)' }}>AI Analysis</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--neutral-600)', lineHeight: 1.6, margin: 0 }}>{aiSummary}</p>
              </div>
            )}

            {recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recommendations.map((rec, i) => (
                  <motion.div key={i} className="glass-card-static" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: `conic-gradient(var(--primary-500) ${rec.score}%, var(--neutral-200) 0%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%', background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-600)',
                      }}>{rec.score}%</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {rec.volunteerName} <ArrowRight size={14} style={{ margin: '0 6px', color: 'var(--neutral-400)' }} />
                        <span style={{ color: 'var(--secondary-700)' }}>{rec.zoneName}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginTop: '3px' }}>
                        Skills: {rec.matchedSkills?.join(', ') || 'General'} • {rec.reasoning || ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-success btn-sm" onClick={() => approveRecommendation(rec)}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setRecommendations(p => p.filter((_, j) => j !== i))}>
                        <XCircle size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Brain} title="No recommendations yet"
                message="Click 'AI Optimize' to generate smart allocation suggestions"
                action={<button className="btn btn-secondary" onClick={getAiRecommendations} disabled={aiLoading}><Brain size={16} /> Generate Now</button>}
              />
            )}
          </motion.div>
        )}

        {/* REBALANCE TAB */}
        {activeTab === 'rebalance' && (
          <motion.div key="rebalance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {rebalanceData ? (
              <div>
                {/* AI Analysis */}
                {rebalanceData.aiAnalysis && (
                  <div className="glass-card-static" style={{
                    padding: '16px 20px', marginBottom: '16px',
                    background: 'linear-gradient(135deg, var(--warning-50), var(--primary-50))',
                    borderLeft: '4px solid var(--warning-500)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Sparkles size={16} style={{ color: 'var(--warning-600)' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--warning-700)' }}>AI Rebalance Analysis</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--neutral-600)', lineHeight: 1.6, margin: 0 }}>{rebalanceData.aiAnalysis}</p>
                  </div>
                )}

                {/* Alerts */}
                {rebalanceData.alerts?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    {rebalanceData.alerts.map((alert, i) => (
                      <div key={i} style={{
                        padding: '12px 16px', marginBottom: '6px',
                        background: alert.level === 'CRITICAL' ? 'var(--danger-50)' : 'var(--warning-50)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `3px solid ${alert.level === 'CRITICAL' ? 'var(--danger-500)' : 'var(--warning-500)'}`,
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.88rem', color: alert.level === 'CRITICAL' ? 'var(--danger-700)' : 'var(--warning-700)',
                      }}>
                        <AlertTriangle size={16} /> {alert.message}
                      </div>
                    ))}
                  </div>
                )}

                {/* Moves */}
                {rebalanceData.moves?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Suggested Transfers</h4>
                    {rebalanceData.moves.map((move, i) => (
                      <div key={i} className="glass-card-static" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className={`badge ${move.priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>{move.priority}</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600 }}>{move.fromZone}</span>
                          <ArrowRight size={14} style={{ margin: '0 8px', color: 'var(--neutral-400)' }} />
                          <span style={{ fontWeight: 600, color: 'var(--secondary-700)' }}>{move.toZone}</span>
                          <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginTop: '2px' }}>
                            Transfer {move.count} volunteer{move.count > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--success-600)', fontSize: '0.92rem' }}>
                    <CheckCircle size={24} style={{ marginBottom: '8px' }} /><br />
                    All zones are balanced! No transfers needed.
                  </div>
                )}

                {/* Summary */}
                <div className="grid-3" style={{ marginTop: '16px' }}>
                  {[
                    { label: 'Overstaffed', value: rebalanceData.summary?.overstaffedZones || 0, color: 'var(--warning-500)' },
                    { label: 'Understaffed', value: rebalanceData.summary?.understaffedZones || 0, color: 'var(--danger-500)' },
                    { label: 'Balanced', value: rebalanceData.summary?.balancedZones || 0, color: 'var(--success-500)' },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '14px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState icon={RefreshCw} title="No rebalance analysis"
                message="Click 'Rebalance' to analyze zone staffing and get AI-powered redistribution suggestions"
                action={<button className="btn btn-outline" onClick={getRebalanceAnalysis} disabled={rebalanceLoading}><RefreshCw size={16} /> Analyze Now</button>}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Assign Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="modal-header"><h3>Manual Assignment</h3><button className="btn btn-ghost btn-icon btn-sm" onClick={() => setAssignModal(false)}><XCircle size={20} /></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Volunteer</label>
                <select className="form-select" value={assignData.volunteerId} onChange={e => setAssignData(p => ({ ...p, volunteerId: e.target.value }))}>
                  <option value="">-- Select --</option>
                  {volunteers.filter(v => v.status === 'AVAILABLE' || !v.currentZone).map(v =>
                    <option key={v.id} value={v.id}>{v.name} ({v.skills?.slice(0, 2).join(', ') || 'General'})</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Zone</label>
                <select className="form-select" value={assignData.zoneId} onChange={e => setAssignData(p => ({ ...p, zoneId: e.target.value }))}>
                  <option value="">-- Select --</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.name} ({z.currentVolunteers || 0}/{z.requiredVolunteers || 0})</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setAssignModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign}>Assign</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
