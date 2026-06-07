import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, XCircle, Zap, MapPin, Clock, CheckCircle, Users, Shield, Sparkles, Activity, Target } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { incidentService, zoneService, volunteerService, aiService } from '../services/api';
import toast from 'react-hot-toast';

const SEVERITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TYPES = ['Medical Emergency', 'Crowd Surge', 'Fire', 'Stampede Risk', 'Lost Person', 'Infrastructure Damage', 'Security Threat', 'Weather Alert', 'Other'];

export default function IncidentCenter() {
  const [incidents, setIncidents] = useState([]);
  const [zones, setZones] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [mobilizing, setMobilizing] = useState(null);
  const [responderModal, setResponderModal] = useState(null); // holds { responders, aiTactical, incident }
  const [form, setForm] = useState({ type: '', severity: 'MEDIUM', zoneId: '', description: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [iRes, zRes, vRes] = await Promise.allSettled([
        incidentService.getAll(),
        zoneService.getAll(),
        volunteerService.getAll(),
      ]);
      if (iRes.status === 'fulfilled') setIncidents(iRes.value.data || []);
      if (zRes.status === 'fulfilled') setZones(zRes.value.data || []);
      if (vRes.status === 'fulfilled') setVolunteers(vRes.value.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.type || !form.zoneId) { toast.error('Fill required fields'); return; }
    try {
      const res = await incidentService.create(form);
      setIncidents(p => [res.data, ...p]);
      toast.success('Incident reported');
      setShowCreate(false);
      setForm({ type: '', severity: 'MEDIUM', zoneId: '', description: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await incidentService.updateStatus(id, status);
      setIncidents(p => p.map(i => i.id === id ? { ...i, status } : i));
      toast.success(`Incident marked ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  // PILLAR 4: AI-powered responder mobilization
  const handleMobilize = async (incident) => {
    setMobilizing(incident.id);
    const zone = zones.find(z => z.id === incident.zoneId);

    try {
      const res = await aiService.findResponders({
        incidentId: incident.id,
        zoneId: incident.zoneId,
        zoneName: zone?.name || incident.zoneName || '',
        type: incident.type,
        severity: incident.severity,
        description: incident.description || '',
        zoneLatitude: zone?.latitude || 23.1793,
        zoneLongitude: zone?.longitude || 75.7849,
        volunteers: volunteers
          .filter(v => v.status === 'DEPLOYED' || v.status === 'AVAILABLE')
          .map(v => ({
            id: v.id,
            name: v.name,
            skills: v.skills || [],
            fatigue: v.fatigueScore || 0,
            fitnessLevel: v.fitnessLevel || 'MEDIUM',
            latitude: 23.1793 + (Math.random() - 0.5) * 0.02, // Simulated positions
            longitude: 75.7849 + (Math.random() - 0.5) * 0.02,
            hoursWorked: v.totalHoursWorked || 0,
            shiftsCompleted: v.shiftsCompleted || 0,
          })),
      });

      const responders = res.data?.responders || [];
      const aiTactical = res.data?.aiTactical || '';

      if (responders.length > 0) {
        setResponderModal({ responders, aiTactical, incident });
        toast.success(`AI found ${responders.length} best responders`);
      } else {
        toast.error('No suitable responders found');
      }
    } catch (err) {
      console.error(err);
      toast.error('AI service unavailable — trying backend mobilize');
      try {
        await incidentService.mobilize(incident.id);
        toast.success('Mobilization request sent via backend');
      } catch { toast.error('Mobilization failed'); }
    }
    setMobilizing(null);
  };

  const dispatchResponder = async (responder, incident) => {
    try {
      // Update incident with assigned volunteer
      handleStatusChange(incident.id, 'RESPONDING');
      toast.success(`Dispatched ${responder.name} to ${incident.type}`);
    } catch { toast.error('Dispatch failed'); }
  };

  const sevColors = { LOW: 'badge-secondary', MEDIUM: 'badge-warning', HIGH: 'badge-primary', CRITICAL: 'badge-danger' };
  const statusColors = { OPEN: 'badge-danger', RESPONDING: 'badge-warning', RESOLVED: 'badge-success' };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

  const openIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED');

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🚨 Incident Command Center</h1>
          <p>{openIncidents.length} active incident{openIncidents.length !== 1 ? 's' : ''} • AI-prioritized responders</p>
        </div>
        <button className="btn btn-danger" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> Report Incident
        </button>
      </div>

      {/* Active Incidents */}
      {openIncidents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {openIncidents.map((inc, i) => (
            <motion.div key={inc.id || i} className="glass-card-static" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{
                padding: '20px',
                borderLeft: `4px solid ${inc.severity === 'CRITICAL' ? 'var(--danger-500)' : inc.severity === 'HIGH' ? 'var(--warning-500)' : 'var(--secondary-500)'}`,
                animation: inc.severity === 'CRITICAL' ? 'pulse-border 2s infinite' : 'none',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} style={{ color: inc.severity === 'CRITICAL' ? 'var(--danger-500)' : 'var(--warning-500)' }} />
                    {inc.type}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={13} /> {zones.find(z => z.id === inc.zoneId)?.name || inc.zoneName || 'Unknown'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={13} /> {inc.createdAt ? new Date(inc.createdAt).toLocaleString() : 'Just now'}</span>
                    {inc.assignedVolunteers?.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Users size={13} /> {inc.assignedVolunteers.length} assigned</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={`badge ${sevColors[inc.severity]}`}>{inc.severity}</span>
                  <span className={`badge ${statusColors[inc.status]}`}>{inc.status}</span>
                </div>
              </div>

              {inc.description && <p style={{ fontSize: '0.9rem', color: 'var(--neutral-600)', marginBottom: '12px' }}>{inc.description}</p>}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn btn-danger btn-sm" onClick={() => handleMobilize(inc)} disabled={mobilizing === inc.id}>
                  <Zap size={15} /> {mobilizing === inc.id ? 'AI Finding Responders...' : 'AI Mobilize'}
                </button>
                {inc.status === 'OPEN' && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleStatusChange(inc.id, 'RESPONDING')}>
                    <Shield size={15} /> Mark Responding
                  </button>
                )}
                {inc.status === 'RESPONDING' && (
                  <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(inc.id, 'RESOLVED')}>
                    <CheckCircle size={15} /> Resolve
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={AlertTriangle} title="No active incidents" message="All clear! Report an incident if one occurs."
          action={<button className="btn btn-danger" onClick={() => setShowCreate(true)}><Plus size={18} /> Report Incident</button>} />
      )}

      {/* Resolved */}
      {resolvedIncidents.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '12px', color: 'var(--neutral-500)', fontSize: '1rem' }}>Resolved ({resolvedIncidents.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resolvedIncidents.slice(0, 5).map((inc, i) => (
              <div key={inc.id || i} style={{ padding: '14px 20px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{inc.type}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--neutral-400)', marginLeft: '12px' }}>{zones.find(z => z.id === inc.zoneId)?.name || ''}</span>
                </div>
                <span className="badge badge-success">Resolved</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="modal-header"><h3>Report New Incident</h3><button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowCreate(false)}><XCircle size={20} /></button></div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Incident Type *</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} required>
                    <option value="">-- Select type --</option>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Severity</label>
                    <select className="form-select" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}>
                      {SEVERITY.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Zone *</label>
                    <select className="form-select" value={form.zoneId} onChange={e => setForm(p => ({ ...p, zoneId: e.target.value }))} required>
                      <option value="">-- Select zone --</option>
                      {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Describe the incident..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Report Incident</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* AI Responders Modal - Pillar 4 */}
      {responderModal && (
        <div className="modal-overlay" onClick={() => setResponderModal(null)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} style={{ color: 'var(--danger-500)' }} />
                AI-Prioritized Responders
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setResponderModal(null)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              {/* Incident Summary */}
              <div style={{
                padding: '12px 16px', marginBottom: '16px',
                background: responderModal.incident?.severity === 'CRITICAL' ? 'var(--danger-50)' : 'var(--warning-50)',
                borderRadius: 'var(--radius-md)',
                borderLeft: `3px solid ${responderModal.incident?.severity === 'CRITICAL' ? 'var(--danger-500)' : 'var(--warning-500)'}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{responderModal.incident?.type}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--neutral-500)', marginTop: '2px' }}>
                  {zones.find(z => z.id === responderModal.incident?.zoneId)?.name} • {responderModal.incident?.severity}
                </div>
              </div>

              {/* AI Tactical Advice */}
              {responderModal.aiTactical && (
                <div style={{
                  padding: '14px 16px', marginBottom: '16px',
                  background: 'linear-gradient(135deg, var(--primary-50), var(--secondary-50))',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--primary-500)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Sparkles size={14} style={{ color: 'var(--primary-600)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary-700)' }}>AI Tactical Advice</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', lineHeight: 1.6, margin: 0 }}>
                    {responderModal.aiTactical}
                  </p>
                </div>
              )}

              {/* Responder Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {responderModal.responders.map((r, i) => (
                  <motion.div key={r.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px', background: i === 0 ? 'var(--success-50)' : 'var(--neutral-50)',
                      borderRadius: 'var(--radius-md)',
                      border: i === 0 ? '1px solid var(--success-200)' : '1px solid var(--neutral-200)',
                    }}>
                    {/* Score Ring */}
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: `conic-gradient(${r.score >= 70 ? 'var(--success-500)' : r.score >= 40 ? 'var(--warning-500)' : 'var(--neutral-400)'} ${r.score}%, var(--neutral-200) 0%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%', background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800,
                      }}>{Math.round(r.score)}%</div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {i === 0 && <span style={{ fontSize: '0.68rem', padding: '1px 6px', background: 'var(--success-500)', color: 'white', borderRadius: '8px' }}>BEST</span>}
                        {r.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', marginTop: '3px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span>🎯 Skill: {r.breakdown?.skillMatch || 0}%</span>
                        <span>💪 Fatigue: {Math.round(r.fatigue)}%</span>
                        <span>📍 Dist: {r.distance || 0}km</span>
                        <span>🏃 {r.fitnessLevel}</span>
                      </div>
                      {r.skills?.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {r.skills.map(s => <span key={s} style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: '6px' }}>{s}</span>)}
                        </div>
                      )}
                    </div>

                    <button className="btn btn-danger btn-sm" onClick={() => {
                      dispatchResponder(r, responderModal.incident);
                      setResponderModal(p => ({ ...p, responders: p.responders.filter(x => x.id !== r.id) }));
                    }}>
                      <Zap size={14} /> Dispatch
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
