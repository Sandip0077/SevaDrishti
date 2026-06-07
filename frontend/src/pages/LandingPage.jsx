import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import FloatingHeroBoxes from '../components/FloatingHeroBoxes';
import {
  Eye, Users, MapPin, Brain, Shield, Zap, ArrowRight,
  BarChart3, AlertTriangle, Clock, CheckCircle2,
} from 'lucide-react';
import { dashboardService } from '../services/api';

function AnimatedCounter({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

const features = [
  {
    icon: Brain,
    title: 'AI Smart Matching',
    desc: 'Intelligent skill-to-role matching ensures every volunteer is deployed where they create maximum impact.',
    color: 'var(--primary-500)',
    bg: 'var(--primary-50)',
  },
  {
    icon: MapPin,
    title: 'Geo-Deployment',
    desc: 'Real-time interactive maps with heatmaps showing volunteer density vs. crowd demand across all zones.',
    color: 'var(--secondary-500)',
    bg: 'var(--secondary-50)',
  },
  {
    icon: BarChart3,
    title: 'Workload Optimization',
    desc: 'AI monitors fatigue levels, shift hours, and task intensity to prevent burnout and ensure fair distribution.',
    color: 'var(--success-500)',
    bg: 'var(--success-50)',
  },
  {
    icon: AlertTriangle,
    title: 'Incident Response',
    desc: 'One-click emergency mobilization finds the nearest qualified volunteers based on skill, proximity, and fatigue.',
    color: 'var(--danger-500)',
    bg: 'var(--danger-50)',
  },
];

const steps = [
  { icon: Users, title: 'Register', desc: 'Volunteers sign up with their skills, availability, and preferences' },
  { icon: Brain, title: 'AI Matches', desc: 'Our AI engine finds the optimal role and zone for each volunteer' },
  { icon: MapPin, title: 'Deploy', desc: 'Volunteers are assigned to zones with real-time tracking' },
  { icon: CheckCircle2, title: 'Optimize', desc: 'Continuous AI monitoring ensures balanced workload and quick response' },
];

export default function LandingPage() {
  const [stats, setStats] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res.data);
      } catch {
        // API not available — stats won't show, that's fine for public page
      }
    })();
  }, []);

  return (
    <div className="page-wrapper" style={{ background: 'var(--gradient-hero)' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ paddingTop: '120px', paddingBottom: '60px', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient Background Glows */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '-5%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '25%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />



        {/* Floating Margin Card Right */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
          className="hide-on-mobile"
          style={{
            position: 'absolute',
            right: '3%',
            top: '60%',
            background: 'white',
            padding: '12px 18px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 3,
          }}
        >
          <div style={{ background: 'var(--danger-50)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={16} color="var(--danger-500)" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--neutral-400)', fontWeight: 500 }}>Response Time</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--neutral-800)' }}>&lt; 3 Mins Avg</div>
          </div>
        </motion.div>

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', alignItems: 'center', gap: '40px', position: 'relative', zIndex: 2, maxWidth: '1440px', width: '92%' }}>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="badge badge-primary" style={{ marginBottom: '16px', background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '6px 12px', fontSize: '0.85rem' }}>
              ✨ Mahakumbh Innovation Hackathon 2028 • Ujjain
            </span>

            <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '20px' }}>
              <span style={{ display: 'block' }}>Right Volunteer.</span>
              <span style={{ display: 'block' }}>Right Place.</span>
              <span style={{
                display: 'block',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Right Time.
              </span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--neutral-500)',
              lineHeight: 1.7,
              marginBottom: '32px',
              maxWidth: '500px',
            }}>
              SevaDrishti orchestrates thousands of Mahakumbh volunteers with 
              AI-powered deployment, real-time tracking, and intelligent workload 
              optimization. Zero chaos.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Register as Volunteer
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Admin Login
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{ width: '100%' }}
          >
            <FloatingHeroBoxes />
          </motion.div>
        </div>

        {/* Floating Stats */}
        <div className="container" style={{ marginTop: '40px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
          >
            {[
              { label: 'Volunteers Managed', value: stats?.totalVolunteers || 0, suffix: '', color: 'var(--primary-600)' },
              { label: 'Active Zones', value: stats?.totalZones || 0, suffix: '', color: 'var(--secondary-600)' },
              { label: 'Incidents Resolved', value: stats?.resolvedIncidents || 0, suffix: '', color: 'var(--success-600)' },
              { label: 'Avg Response', value: stats?.avgFatigueScore || 0, suffix: '%', color: 'var(--warning-600)' },
            ].map((stat, i) => (
              <div key={i} className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: stat.color,
                }}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', fontWeight: 500, marginTop: '4px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h2 style={{ marginBottom: '12px' }}>
              4 AI-Powered <span style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Pillars</span>
            </h2>
            <p style={{ color: 'var(--neutral-500)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Every aspect of volunteer management enhanced by artificial intelligence
            </p>
          </motion.div>

          <div className="grid-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ padding: '32px 24px' }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  background: feature.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <feature.icon size={28} style={{ color: feature.color }} />
                </div>
                <h4 style={{ marginBottom: '10px' }}>{feature.title}</h4>
                <p style={{ color: 'var(--neutral-500)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h2 style={{ marginBottom: '12px' }}>
              How <span style={{
                background: 'var(--gradient-secondary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>It Works</span>
            </h2>
            <p style={{ color: 'var(--neutral-500)', fontSize: '1.1rem' }}>
              From registration to deployment in four simple steps
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            position: 'relative',
          }}>
            {/* Connection line */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '12.5%',
              right: '12.5%',
              height: '2px',
              background: 'linear-gradient(90deg, var(--primary-300), var(--secondary-300), var(--success-300), var(--primary-300))',
              zIndex: 0,
            }} />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'white',
                  border: '3px solid var(--primary-300)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: 'var(--shadow-md)',
                }}>
                  <step.icon size={32} style={{ color: 'var(--primary-600)' }} />
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '2px 12px',
                  background: 'var(--primary-100)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--primary-700)',
                  marginBottom: '8px',
                }}>
                  Step {i + 1}
                </div>
                <h4 style={{ marginBottom: '8px' }}>{step.title}</h4>
                <p style={{ color: 'var(--neutral-500)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ padding: '100px 0', background: 'rgba(255, 255, 255, 0.4)', position: 'relative', overflow: 'hidden' }}>
        {/* Soft Background Blur Blob */}
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '50px' }}
          >
            <span className="badge badge-secondary" style={{ marginBottom: '16px', background: 'var(--secondary-100)', color: 'var(--secondary-700)', padding: '6px 12px', fontSize: '0.82rem' }}>
              ✨ About SevaDrishti
            </span>

            <h2 style={{ fontSize: '2.8rem', lineHeight: 1.15, marginBottom: '24px', fontWeight: 800 }}>
              Orchestrating Service with <span style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>AI Precision</span>
            </h2>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--neutral-500)',
              lineHeight: 1.7,
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Developed specifically for massive cultural gathering sites like the <strong>Ujjain Mahakumbh 2028</strong>, SevaDrishti acts as the operational nervous system for volunteer deployment. We combine real-time mapping, natural language skill parsing, and intelligent workload protection algorithms to align volunteers with critical needs instantly, removing chaos and protecting workforce health.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }} className="grid-3">
            {[
              {
                title: 'Precision Resource Allocations',
                desc: 'Automatically parses skills, language fluencies, and location proximity to match volunteers to the most fitting operational zones.',
                color: 'var(--primary-600)',
                bg: 'var(--primary-50)'
              },
              {
                title: 'Workload & Fatigue Guardrail',
                desc: 'Tracks active shift hours and task intensity levels to automatically suggest rest cycles and balance volunteer wellbeing.',
                color: 'var(--success-600)',
                bg: 'var(--success-50)'
              },
              {
                title: 'Instant Tactical Mobilization',
                desc: 'Allows coordinators to mobilize responders instantly during incident alerts, querying coordinates to find the nearest personnel.',
                color: 'var(--danger-600)',
                bg: 'var(--danger-50)'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="glass-card"
                style={{
                  padding: '30px 24px',
                  borderRadius: '20px',
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: item.bg,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                }}>
                  {idx + 1}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--neutral-800)' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" style={{ padding: '80px 0 100px' }}>
        <div className="container">
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              padding: '60px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
            }}
          >
            <h2 style={{ marginBottom: '16px' }}>
              Ready to Transform Volunteer Management?
            </h2>
            <p style={{
              color: 'var(--neutral-500)',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto 32px',
            }}>
              Join SevaDrishti and be part of the most efficient volunteer 
              deployment system for Mahakumbh. AI-powered, real-time, and scalable.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Now
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Admin Console
                <Shield size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 0',
        borderTop: '1px solid var(--neutral-200)',
        background: 'rgba(255, 255, 255, 0.5)',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={18} style={{ color: 'var(--primary-600)' }} />
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--neutral-700)' }}>
              SevaDrishti
            </span>
          </div>
          <p style={{ color: 'var(--neutral-400)', fontSize: '0.85rem' }}>
            AI-Powered Vision for Volunteer Deployment • Mahakumbh 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
