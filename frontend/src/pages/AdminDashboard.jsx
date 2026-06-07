import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, MapPin, AlertTriangle, Activity, Clock, TrendingUp,
  UserCheck, UserX, Zap, RefreshCw, Plus, Sparkles,
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import EmptyState from '../components/EmptyState';
import ZoneMap from '../components/ZoneMap';
import { dashboardService, zoneService, volunteerService, incidentService, aiService } from '../services/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const COLORS = ['#F97316', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [zones, setZones] = useState([]);
  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiConnected, setAiConnected] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, zonesRes, volunteersRes, incidentsRes] = await Promise.allSettled([
        dashboardService.getStats(),
        zoneService.getAll(),
        volunteerService.getAll({ limit: 5, sort: '-createdAt' }),
        incidentService.getAll({ status: 'OPEN', limit: 5 }),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (zonesRes.status === 'fulfilled') setZones(zonesRes.value.data || []);
      if (volunteersRes.status === 'fulfilled') setRecentVolunteers(volunteersRes.value.data || []);
      if (incidentsRes.status === 'fulfilled') setIncidents(incidentsRes.value.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Check AI service
    aiService.health().then(() => setAiConnected(true)).catch(() => setAiConnected(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const totalVolunteers = stats?.totalVolunteers ?? 0;
  const activeVolunteers = stats?.activeVolunteers ?? 0;
  const totalZones = stats?.totalZones ?? zones.length;
  const openIncidents = stats?.openIncidents ?? incidents.length;
  const avgFatigue = stats?.avgFatigueScore ?? 0;

  // Build chart data from zones
  const zoneChartData = zones.map((z) => ({
    name: z.name?.length > 12 ? z.name.substring(0, 12) + '...' : z.name,
    current: z.currentVolunteers || 0,
    required: z.requiredVolunteers || 0,
  }));

  const statusData = [
    { name: 'Available', value: stats?.availableCount || 0 },
    { name: 'Deployed', value: stats?.deployedCount || 0 },
    { name: 'Off Duty', value: stats?.offDutyCount || 0 },
  ].filter((d) => d.value > 0);

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
          <h1>Dashboard</h1>
          <p>Real-time overview of volunteer operations</p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <StatsCard
          icon={Users}
          label="Total Volunteers"
          value={totalVolunteers}
          variant="primary"
          delay={0}
        />
        <StatsCard
          icon={UserCheck}
          label="Active Now"
          value={activeVolunteers}
          variant="success"
          delay={0.1}
        />
        <StatsCard
          icon={MapPin}
          label="Active Zones"
          value={totalZones}
          variant="secondary"
          delay={0.2}
        />
        <StatsCard
          icon={AlertTriangle}
          label="Open Incidents"
          value={openIncidents}
          variant={openIncidents > 0 ? 'danger' : 'success'}
          delay={0.3}
        />
      </div>

      {/* Live Map */}
      <div style={{ marginBottom: '28px' }}>
        <motion.div className="glass-card-static" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ padding: '24px' }}>
          <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} style={{ color: 'var(--secondary-500)' }} /> Live Zone Map
          </h4>
          {zones.length > 0 ? (
            <ZoneMap zones={zones} style={{ height: '350px' }} />
          ) : (
            <EmptyState icon={MapPin} title="No zones" message="Add zones to see the live map" />
          )}
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Zone Volunteer Distribution */}
        <motion.div
          className="glass-card-static"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ padding: '24px' }}
        >
          <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} style={{ color: 'var(--secondary-500)' }} />
            Zone Volunteer Distribution
          </h4>
          {zoneChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={zoneChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid var(--neutral-200)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Bar dataKey="current" name="Current" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="required" name="Required" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={MapPin}
              title="No zones configured"
              message="Add zones to see volunteer distribution"
            />
          )}
        </motion.div>

        {/* Volunteer Status Pie */}
        <motion.div
          className="glass-card-static"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ padding: '24px' }}
        >
          <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} style={{ color: 'var(--primary-500)' }} />
            Volunteer Status
          </h4>
          {statusData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="60%" height={240}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {statusData.map((entry, i) => (
                  <div key={entry.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: COLORS[i],
                    }} />
                    <span style={{ fontSize: '0.88rem', color: 'var(--neutral-600)' }}>{entry.name}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, marginLeft: 'auto' }}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No volunteer data"
              message="Volunteers will appear here once registered"
            />
          )}
        </motion.div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid-2">
        {/* Recent Volunteers */}
        <motion.div
          className="glass-card-static"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ padding: '24px' }}
        >
          <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} style={{ color: 'var(--primary-500)' }} />
            Recent Volunteers
          </h4>
          {recentVolunteers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentVolunteers.map((v, i) => (
                <div key={v.id || i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--neutral-50)',
                }}>
                  <div className="avatar" style={{
                    background: COLORS[i % COLORS.length],
                  }}>
                    {v.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{v.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
                      {v.skills?.slice(0, 2).join(', ') || 'No skills listed'}
                    </div>
                  </div>
                  <span className={`badge ${
                    v.status === 'AVAILABLE' ? 'badge-success' :
                    v.status === 'DEPLOYED' ? 'badge-primary' : 'badge-neutral'
                  }`}>
                    {v.status || 'NEW'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No volunteers yet"
              message="Volunteers will appear once they register"
            />
          )}
        </motion.div>

        {/* Active Incidents */}
        <motion.div
          className="glass-card-static"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ padding: '24px' }}
        >
          <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--danger-500)' }} />
            Active Incidents
          </h4>
          {incidents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {incidents.map((inc, i) => (
                <div key={inc.id || i} style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--neutral-50)',
                  borderLeft: `3px solid ${
                    inc.severity === 'CRITICAL' ? 'var(--danger-500)' :
                    inc.severity === 'HIGH' ? 'var(--warning-500)' : 'var(--info-500)'
                  }`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{inc.type || inc.title}</span>
                    <span className={`badge ${
                      inc.severity === 'CRITICAL' ? 'badge-danger' :
                      inc.severity === 'HIGH' ? 'badge-warning' : 'badge-secondary'
                    }`}>
                      {inc.severity || 'MEDIUM'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--neutral-500)', marginTop: '4px' }}>
                    Zone: {inc.zoneName || 'Unknown'} • {inc.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={AlertTriangle}
              title="No active incidents"
              message="All clear! No open incidents at this time."
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
