import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, XCircle, Clock, Users, MapPin, CheckCircle } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { shiftService, volunteerService, zoneService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ShiftsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COORDINATOR';
  const [shifts, setShifts] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ volunteerId: '', zoneId: '', startTime: '', endTime: '', taskIntensity: 'MEDIUM' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const calls = [shiftService.getAll()];
      if (isAdmin) { calls.push(volunteerService.getAll(), zoneService.getAll()); }
      const results = await Promise.allSettled(calls);
      if (results[0].status === 'fulfilled') setShifts(results[0].value.data || []);
      if (isAdmin && results[1]?.status === 'fulfilled') setVolunteers(results[1].value.data || []);
      if (isAdmin && results[2]?.status === 'fulfilled') setZones(results[2].value.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
      };
      const res = await shiftService.create(payload);
      setShifts(p => [res.data, ...p]);
      toast.success('Shift created');
      setShowCreate(false);
      setForm({ volunteerId: '', zoneId: '', startTime: '', endTime: '', taskIntensity: 'MEDIUM' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shift');
    }
  };

  const statusBadge = (s) => {
    if (s === 'COMPLETED') return 'badge-success';
    if (s === 'ACTIVE') return 'badge-primary';
    if (s === 'UPCOMING') return 'badge-secondary';
    return 'badge-neutral';
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{isAdmin ? 'Shift Management' : 'My Shifts'}</h1>
          <p>{shifts.length} total shifts</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={18} /> Create Shift</button>}
      </div>

      {shifts.length > 0 ? (
        <motion.div className="glass-card-static" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Zone</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Intensity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s, i) => (
                  <tr key={s.id || i}>
                    <td style={{ fontWeight: 600 }}>{s.volunteerName || 'N/A'}</td>
                    <td><span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {s.zoneName || 'N/A'}</span></td>
                    <td>{s.startTime ? new Date(s.startTime).toLocaleString() : '-'}</td>
                    <td>{s.endTime ? new Date(s.endTime).toLocaleString() : '-'}</td>
                    <td><span className={`badge ${s.taskIntensity === 'HIGH' ? 'badge-danger' : s.taskIntensity === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}>{s.taskIntensity}</span></td>
                    <td><span className={`badge ${statusBadge(s.status)}`}>{s.status || 'UPCOMING'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <EmptyState icon={Calendar} title="No shifts yet" message={isAdmin ? 'Create shifts to schedule volunteers' : 'Your shifts will appear here once assigned'} />
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="modal-header"><h3>Create Shift</h3><button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowCreate(false)}><XCircle size={20} /></button></div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Volunteer</label>
                  <select className="form-select" value={form.volunteerId} onChange={e => setForm(p => ({ ...p, volunteerId: e.target.value }))} required>
                    <option value="">-- Select --</option>
                    {volunteers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Zone</label>
                  <select className="form-select" value={form.zoneId} onChange={e => setForm(p => ({ ...p, zoneId: e.target.value }))} required>
                    <option value="">-- Select --</option>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Start</label><input type="datetime-local" className="form-input" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">End</label><input type="datetime-local" className="form-input" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} required /></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Task Intensity</label>
                  <select className="form-select" value={form.taskIntensity} onChange={e => setForm(p => ({ ...p, taskIntensity: e.target.value }))}>
                    <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
