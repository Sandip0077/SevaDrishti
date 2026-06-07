import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, MapPin, AlertTriangle, Clock, TrendingUp, Activity } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import StatsCard from '../components/StatsCard';
import { dashboardService, zoneService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#F97316', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, zRes] = await Promise.allSettled([dashboardService.getStats(), zoneService.getAll()]);
        if (sRes.status === 'fulfilled') setStats(sRes.value.data);
        if (zRes.status === 'fulfilled') setZones(zRes.value.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const zoneTypeData = zones.reduce((acc, z) => {
    const existing = acc.find(a => a.name === z.type);
    if (existing) { existing.count++; existing.volunteers += (z.currentVolunteers || 0); }
    else acc.push({ name: z.type, count: 1, volunteers: z.currentVolunteers || 0 });
    return acc;
  }, []);

  const coverageData = zones.map(z => ({
    name: z.name?.length > 10 ? z.name.substring(0, 10) + '...' : z.name,
    coverage: z.requiredVolunteers ? Math.round(((z.currentVolunteers || 0) / z.requiredVolunteers) * 100) : 0,
  }));

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Operational insights and performance metrics</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <StatsCard icon={Users} label="Total Volunteers" value={stats?.totalVolunteers ?? 0} variant="primary" delay={0} />
        <StatsCard icon={MapPin} label="Zones" value={stats?.totalZones ?? zones.length} variant="secondary" delay={0.1} />
        <StatsCard icon={AlertTriangle} label="Incidents Resolved" value={stats?.resolvedIncidents ?? 0} variant="success" delay={0.2} />
        <StatsCard icon={Activity} label="Avg Fatigue" value={`${stats?.avgFatigueScore ?? 0}%`} variant="warning" delay={0.3} />
      </div>

      <div className="grid-2" style={{ marginBottom: '28px' }}>
        <motion.div className="glass-card-static" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ padding: '24px' }}>
          <h4 style={{ marginBottom: '20px' }}>Zone Coverage (%)</h4>
          {coverageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={coverageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                <Bar dataKey="coverage" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={BarChart3} title="No zone data" message="Add zones to see coverage" />}
        </motion.div>

        <motion.div className="glass-card-static" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ padding: '24px' }}>
          <h4 style={{ marginBottom: '20px' }}>Volunteers by Zone Type</h4>
          {zoneTypeData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="60%" height={240}>
                <PieChart>
                  <Pie data={zoneTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="volunteers">
                    {zoneTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {zoneTypeData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>{d.name}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, marginLeft: 'auto' }}>{d.volunteers}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyState icon={MapPin} title="No data" message="Zone data will appear here" />}
        </motion.div>
      </div>

      {/* Summary Table */}
      {zones.length > 0 && (
        <motion.div className="glass-card-static" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ padding: '24px' }}>
          <h4 style={{ marginBottom: '16px' }}>Zone Summary</h4>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Zone</th><th>Type</th><th>Current</th><th>Required</th><th>Coverage</th><th>Status</th></tr></thead>
              <tbody>
                {zones.map((z, i) => {
                  const cov = z.requiredVolunteers ? Math.round(((z.currentVolunteers || 0) / z.requiredVolunteers) * 100) : 0;
                  return (
                    <tr key={z.id || i}>
                      <td style={{ fontWeight: 600 }}>{z.name}</td>
                      <td>{z.type}</td>
                      <td>{z.currentVolunteers || 0}</td>
                      <td>{z.requiredVolunteers || 0}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="fatigue-bar" style={{ width: '60px' }}>
                            <div className={`fatigue-bar-fill ${cov >= 80 ? 'low' : cov >= 50 ? 'medium' : 'high'}`} style={{ width: `${Math.min(cov, 100)}%` }} />
                          </div>
                          <span style={{ fontSize: '0.82rem' }}>{cov}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${cov >= 80 ? 'badge-success' : cov >= 50 ? 'badge-warning' : 'badge-danger'}`}>{cov >= 80 ? 'Good' : cov >= 50 ? 'Low' : 'Critical'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
