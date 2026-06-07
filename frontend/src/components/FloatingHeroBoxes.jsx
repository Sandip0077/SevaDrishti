import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Activity, ShieldAlert, CheckCircle2, Brain } from 'lucide-react';

export default function FloatingHeroBoxes() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Light Box: Core AI Features */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '10px',
          width: '290px',
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          zIndex: 1,
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--neutral-400)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Ujjain Mahakumbh 2028</span>
          <span style={{ color: 'var(--primary-600)', background: 'var(--primary-50)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>AI DRIVEN</span>
        </div>
        
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px', color: 'var(--neutral-800)' }}>
          Core AI Features
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--neutral-100)' }}>
            <div style={{ background: 'var(--primary-50)', padding: '6px', borderRadius: '8px', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-700)' }}>Smart Skill Matching</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--neutral-400)' }}>Optimizes roles by expertise</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--neutral-100)' }}>
            <div style={{ background: 'var(--secondary-50)', padding: '6px', borderRadius: '8px', color: 'var(--secondary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-700)' }}>Geo-Deployment</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--neutral-400)' }}>Real-time location & density tracking</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--success-50)', padding: '6px', borderRadius: '8px', color: 'var(--success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-700)' }}>Workload Balance</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--neutral-400)' }}>Fatigue monitoring & health tracking</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dark Box: AI Fatigue Alert */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '10px',
          width: '310px',
          background: '#0F172A',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 24px 50px rgba(0,0,0,0.2)',
          zIndex: 2,
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '12px' }}>
            <Activity size={20} color="#60A5FA" />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase' }}>
            AI Real-Time Insight
          </span>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', color: 'white' }}>
          Volunteer Reallocation
        </h3>

        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.6 }}>
          Crowd surge detected at <strong>Mahakal Temple</strong>. AI suggests redeploying 15 Medical and Crowd Management volunteers from Mangalnath immediately to prevent bottlenecks.
        </p>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button style={{ flex: 1, background: 'var(--gradient-brand)', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> Execute Action
          </button>
        </div>
      </motion.div>
      
      {/* Floating Elements Background Effect */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0, opacity: 0.5 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }} style={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }} style={{ position: 'absolute', bottom: '10%', right: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

    </div>
  );
}
