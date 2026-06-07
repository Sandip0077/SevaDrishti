import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, Plus, Eye, Edit2, Trash2,
  MapPin, Phone, Mail, CheckCircle, XCircle, Clock,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { volunteerService } from '../services/api';
import toast from 'react-hot-toast';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSkill, setFilterSkill] = useState('ALL');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await volunteerService.getAll();
      setVolunteers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch volunteers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this volunteer?')) return;
    try {
      await volunteerService.delete(id);
      setVolunteers((prev) => prev.filter((v) => v.id !== id));
      toast.success('Volunteer removed');
    } catch (err) {
      toast.error('Failed to remove volunteer');
    }
  };

  const filteredVolunteers = volunteers.filter((v) => {
    const matchSearch = !search ||
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.includes(search);
    const matchStatus = filterStatus === 'ALL' || v.status === filterStatus;
    const matchSkill = filterSkill === 'ALL' || v.skills?.includes(filterSkill);
    return matchSearch && matchStatus && matchSkill;
  });

  const allSkills = [...new Set(volunteers.flatMap((v) => v.skills || []))];

  const statusColors = {
    AVAILABLE: 'badge-success',
    DEPLOYED: 'badge-primary',
    OFF_DUTY: 'badge-neutral',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Volunteers</h1>
          <p>{volunteers.length} total volunteers registered</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        className="glass-card-static"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--neutral-400)',
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <select
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="DEPLOYED">Deployed</option>
          <option value="OFF_DUTY">Off Duty</option>
        </select>
        <select
          className="form-select"
          value={filterSkill}
          onChange={(e) => setFilterSkill(e.target.value)}
          style={{ width: '180px' }}
        >
          <option value="ALL">All Skills</option>
          {allSkills.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </motion.div>

      {/* Volunteers Table */}
      {filteredVolunteers.length > 0 ? (
        <motion.div
          className="glass-card-static"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Skills</th>
                  <th>Zone</th>
                  <th>Status</th>
                  <th>Fatigue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((v, i) => (
                  <motion.tr
                    key={v.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar avatar-sm" style={{
                          background: `hsl(${(i * 45) % 360}, 60%, 55%)`,
                          fontSize: '0.75rem',
                        }}>
                          {v.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{v.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>{v.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(v.skills || []).slice(0, 2).map((s) => (
                          <span key={s} className="badge badge-secondary">{s}</span>
                        ))}
                        {(v.skills || []).length > 2 && (
                          <span className="badge badge-neutral">+{v.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--neutral-600)' }}>
                      {v.currentZone || <span style={{ color: 'var(--neutral-400)' }}>Unassigned</span>}
                    </td>
                    <td>
                      <span className={`badge ${statusColors[v.status] || 'badge-neutral'}`}>
                        {v.status || 'NEW'}
                      </span>
                    </td>
                    <td>
                      <div className="fatigue-bar" style={{ width: '80px' }}>
                        <div
                          className={`fatigue-bar-fill ${
                            (v.fatigueScore || 0) > 70 ? 'high' :
                            (v.fatigueScore || 0) > 40 ? 'medium' : 'low'
                          }`}
                          style={{ width: `${v.fatigueScore || 0}%` }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                        {v.fatigueScore || 0}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setSelectedVolunteer(v)}
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleDelete(v.id)}
                          title="Remove"
                          style={{ color: 'var(--danger-500)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <EmptyState
          icon={Users}
          title="No volunteers found"
          message={search || filterStatus !== 'ALL' || filterSkill !== 'ALL'
            ? 'Try adjusting your search or filters'
            : 'Volunteers will appear here once they register'}
        />
      )}

      {/* Detail Modal */}
      {selectedVolunteer && (
        <div className="modal-overlay" onClick={() => setSelectedVolunteer(null)}>
          <motion.div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h3>Volunteer Details</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedVolunteer(null)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div className="avatar avatar-lg" style={{ background: 'var(--gradient-primary)' }}>
                  {selectedVolunteer.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h4>{selectedVolunteer.name}</h4>
                  <div style={{ display: 'flex', gap: '12px', color: 'var(--neutral-500)', fontSize: '0.88rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={14} /> {selectedVolunteer.email}
                    </span>
                    {selectedVolunteer.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} /> {selectedVolunteer.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Skills</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {(selectedVolunteer.skills || []).map((s) => (
                    <span key={s} className="badge badge-primary">{s}</span>
                  ))}
                  {(selectedVolunteer.skills || []).length === 0 && (
                    <span style={{ color: 'var(--neutral-400)', fontSize: '0.88rem' }}>No skills listed</span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Languages</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {(selectedVolunteer.languages || []).map((l) => (
                    <span key={l} className="badge badge-secondary">{l}</span>
                  ))}
                </div>
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Status</label>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge ${statusColors[selectedVolunteer.status] || 'badge-neutral'}`}>
                      {selectedVolunteer.status || 'NEW'}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Fitness</label>
                  <div style={{ marginTop: '4px', fontWeight: 500 }}>{selectedVolunteer.fitnessLevel || 'N/A'}</div>
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Current Zone</label>
                  <div style={{ marginTop: '4px', fontWeight: 500 }}>{selectedVolunteer.currentZone || 'Unassigned'}</div>
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Fatigue Score</label>
                  <div style={{ marginTop: '4px' }}>
                    <div className="fatigue-bar" style={{ width: '100%', marginBottom: '4px' }}>
                      <div
                        className={`fatigue-bar-fill ${
                          (selectedVolunteer.fatigueScore || 0) > 70 ? 'high' :
                          (selectedVolunteer.fatigueScore || 0) > 40 ? 'medium' : 'low'
                        }`}
                        style={{ width: `${selectedVolunteer.fatigueScore || 0}%` }}
                      />
                    </div>
                    <span style={{ fontSize: '0.82rem' }}>{selectedVolunteer.fatigueScore || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
