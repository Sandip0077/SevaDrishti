import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Plus, Edit2, Trash2, Users, XCircle,
  AlertTriangle, CheckCircle, TrendingUp,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { zoneService } from '../services/api';
import toast from 'react-hot-toast';

const ZONE_TYPES = ['GHAT', 'CAMP', 'MEDICAL', 'TRANSIT', 'FOOD_COURT', 'PARKING', 'ENTRY_GATE', 'OTHER'];

const initialZoneForm = {
  name: '',
  type: 'GHAT',
  latitude: '',
  longitude: '',
  requiredVolunteers: '',
  description: '',
};

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState(initialZoneForm);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await zoneService.getAll();
      setZones(res.data || []);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        requiredVolunteers: parseInt(formData.requiredVolunteers) || 0,
      };

      if (editingZone) {
        const res = await zoneService.update(editingZone.id, payload);
        setZones((prev) => prev.map((z) => z.id === editingZone.id ? res.data : z));
        toast.success('Zone updated successfully');
      } else {
        const res = await zoneService.create(payload);
        setZones((prev) => [...prev, res.data]);
        toast.success('Zone created successfully');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save zone');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this zone?')) return;
    try {
      await zoneService.delete(id);
      setZones((prev) => prev.filter((z) => z.id !== id));
      toast.success('Zone deleted');
    } catch (err) {
      toast.error('Failed to delete zone');
    }
  };

  const openEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name || '',
      type: zone.type || 'GHAT',
      latitude: zone.latitude?.toString() || '',
      longitude: zone.longitude?.toString() || '',
      requiredVolunteers: zone.requiredVolunteers?.toString() || '',
      description: zone.description || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingZone(null);
    setFormData(initialZoneForm);
  };

  const getZoneStatusInfo = (zone) => {
    const current = zone.currentVolunteers || 0;
    const required = zone.requiredVolunteers || 0;
    if (required === 0) return { status: 'optimal', label: 'No requirement set' };
    const ratio = current / required;
    if (ratio >= 0.9) return { status: 'optimal', label: 'Optimal' };
    if (ratio >= 0.5) return { status: 'understaffed', label: 'Understaffed' };
    return { status: 'understaffed', label: 'Critical' };
  };

  const typeColors = {
    GHAT: '#3B82F6',
    CAMP: '#22C55E',
    MEDICAL: '#EF4444',
    TRANSIT: '#F59E0B',
    FOOD_COURT: '#8B5CF6',
    PARKING: '#64748B',
    ENTRY_GATE: '#06B6D4',
    OTHER: '#94A3B8',
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
          <h1>Zones</h1>
          <p>Manage Mahakumbh operational zones</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Zone
        </button>
      </div>

      {zones.length > 0 ? (
        <div className="grid-3">
          {zones.map((zone, i) => {
            const statusInfo = getZoneStatusInfo(zone);
            return (
              <motion.div
                key={zone.id || i}
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ padding: '24px', cursor: 'default' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: `${typeColors[zone.type] || '#94A3B8'}15`,
                      color: typeColors[zone.type] || '#94A3B8',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '8px',
                    }}>
                      {zone.type}
                    </div>
                    <h4 style={{ fontSize: '1.1rem' }}>{zone.name}</h4>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(zone)}>
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => handleDelete(zone.id)}
                      style={{ color: 'var(--danger-500)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <span className={`zone-status ${statusInfo.status}`} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--neutral-500)' }}>{statusInfo.label}</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  padding: '12px',
                  background: 'var(--neutral-50)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', marginBottom: '2px' }}>Current</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--secondary-700)' }}>
                      {zone.currentVolunteers || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', marginBottom: '2px' }}>Required</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--neutral-700)' }}>
                      {zone.requiredVolunteers || 0}
                    </div>
                  </div>
                </div>

                {zone.description && (
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--neutral-500)',
                    marginTop: '12px',
                    lineHeight: 1.4,
                  }}>
                    {zone.description}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No zones configured"
          message="Create zones to start deploying volunteers"
          action={
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Create First Zone
            </button>
          }
        />
      )}

      {/* Zone Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <motion.div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h3>{editingZone ? 'Edit Zone' : 'Create New Zone'}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={closeModal}>
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Zone Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Ram Ghat, Ujjain"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                    >
                      {ZONE_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Required Volunteers</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g., 50"
                      value={formData.requiredVolunteers}
                      onChange={(e) => setFormData((p) => ({ ...p, requiredVolunteers: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 23.1793"
                      value={formData.latitude}
                      onChange={(e) => setFormData((p) => ({ ...p, latitude: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 75.7849"
                      value={formData.longitude}
                      onChange={(e) => setFormData((p) => ({ ...p, longitude: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Zone description..."
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingZone ? 'Update Zone' : 'Create Zone'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
