import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/api';
import { Eye, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Phone, Heart, Calendar as CalendarIcon, MapPin, User, Languages, Briefcase, Sparkles, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const getRegistrationErrorMessage = (err) => {
  if (err.code === 'ECONNABORTED') {
    return 'Registration is taking too long. Please try again in a moment.';
  }
  if (!err.response) {
    return 'Cannot reach the server right now. Please check your connection and try again.';
  }
  return err.response.data?.message || 'Registration failed. Please try again.';
};

const SKILLS = [
  'First Aid', 'Medical Care', 'Crowd Management', 'Navigation & Guides',
  'Translation', 'Tech Support', 'Logistics', 'Communication',
  'Cooking & Food Distribution', 'Sanitation', 'Security',
  'Water Distribution', 'Child Care', 'Elder Care', 'Traffic Management',
  'Event Coordination', 'Photography', 'Social Media',
];

const LANGUAGES = [
  'Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi',
  'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Odia',
];

const ZONES = [
  'Sangam Nose', 'Dashashwamedh Ghat', 'Arail Ghat', 'Nagvasuki Ghat',
  'Ram Ghat', 'Sector 1 - Medical', 'Sector 2 - Transit', 'Sector 3 - Camps',
  'Sector 4 - Food Court', 'Sector 5 - Parking', 'Main Entry Gate', 'River Bank Zone',
];

const FITNESS_LEVELS = [
  { value: 'HIGH', label: 'High', desc: 'Can handle physically demanding tasks' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Moderate physical activity' },
  { value: 'LOW', label: 'Low', desc: 'Prefer less strenuous tasks' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiTagLoading, setAiTagLoading] = useState(false);
  const [aiTagSource, setAiTagSource] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    emergencyContact: '',
    address: '',
    // Step 2: Skills
    skills: [],
    languages: [],
    fitnessLevel: 'MEDIUM',
    experience: '',
    // Step 3: Availability
    availableFrom: '',
    availableTo: '',
    shiftPreference: 'ANY',
    preferredZones: [],
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
  };

  const validateStep = () => {
    setError('');
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
          setError('Please fill in all required fields');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        return true;
      case 2:
        if (formData.skills.length === 0) {
          setError('Please select at least one skill');
          return false;
        }
        if (formData.languages.length === 0) {
          setError('Please select at least one language');
          return false;
        }
        return true;
      case 3:
        if (!formData.availableFrom || !formData.availableTo) {
          setError('Please select your availability dates');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'VOLUNTEER',
        phone: formData.phone.trim(),
        age: parseInt(formData.age) || null,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
        skills: formData.skills,
        languages: formData.languages,
        fitnessLevel: formData.fitnessLevel,
        experience: formData.experience,
        availableFrom: formData.availableFrom,
        availableTo: formData.availableTo,
        shiftPreference: formData.shiftPreference,
        preferredZones: formData.preferredZones,
      };

      await register(payload);
      toast.success('Registration successful! Welcome to SevaDrishti');
      navigate('/volunteer/portal');
    } catch (err) {
      const message = getRegistrationErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Personal Info', 'Skills & Languages', 'Availability', 'Review'];

  return (
    <div className="page-wrapper" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px 20px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card-static"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '40px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <Logo />
          </Link>
          <h3 style={{ marginTop: '12px', fontSize: '1.3rem' }}>Volunteer Registration</h3>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {stepLabels.map((label, i) => (
            <div key={i} className="progress-step">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div className={`step-circle ${
                  i + 1 === step ? 'active' : i + 1 < step ? 'completed' : ''
                }`}>
                  {i + 1 < step ? <CheckCircle size={18} /> : i + 1}
                </div>
                <span className={`step-label ${
                  i + 1 === step ? 'active' : i + 1 < step ? 'completed' : ''
                }`}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`step-connector ${i + 1 < step ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'var(--danger-50)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              color: 'var(--danger-600)',
              fontSize: '0.88rem',
            }}
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Your age"
                      value={formData.age}
                      onChange={(e) => updateField('age', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 XXXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Emergency phone"
                      value={formData.emergencyContact}
                      onChange={(e) => updateField('emergencyContact', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Your current address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    style={{ minHeight: '70px' }}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Skills & Languages */}
            {step === 2 && (
              <div>
                <div className="form-group">
                  <label className="form-label">Select Your Skills * (choose all that apply)</label>
                  <div className="form-checkbox-group" style={{ marginTop: '8px' }}>
                    {SKILLS.map((skill) => (
                      <span
                        key={skill}
                        className={`chip ${formData.skills.includes(skill) ? 'active' : ''}`}
                        onClick={() => toggleArrayItem('skills', skill)}
                      >
                        {formData.skills.includes(skill) && <CheckCircle size={14} />}
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Languages Spoken * (choose all that apply)</label>
                  <div className="form-checkbox-group" style={{ marginTop: '8px' }}>
                    {LANGUAGES.map((lang) => (
                      <span
                        key={lang}
                        className={`chip chip-primary ${formData.languages.includes(lang) ? 'active' : ''}`}
                        onClick={() => toggleArrayItem('languages', lang)}
                      >
                        {formData.languages.includes(lang) && <CheckCircle size={14} />}
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Fitness Level</label>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    {FITNESS_LEVELS.map((level) => (
                      <div
                        key={level.value}
                        onClick={() => updateField('fitnessLevel', level.value)}
                        style={{
                          flex: 1,
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${formData.fitnessLevel === level.value ? 'var(--secondary-500)' : 'var(--neutral-200)'}`,
                          background: formData.fitnessLevel === level.value ? 'var(--secondary-50)' : 'white',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--neutral-800)' }}>
                          {level.label}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', marginTop: '4px' }}>
                          {level.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Previous Volunteer Experience</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe any previous volunteering experience... e.g. 'I worked as a medical volunteer during floods and managed crowd at temple events'"
                    value={formData.experience}
                    onChange={(e) => updateField('experience', e.target.value)}
                    style={{ minHeight: '80px' }}
                  />
                  {formData.experience.length > 15 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '8px' }}
                      disabled={aiTagLoading}
                      onClick={async () => {
                        setAiTagLoading(true);
                        try {
                          const res = await aiService.suggestTags({ text: formData.experience });
                          const tags = res.data?.tags || [];
                          if (tags.length > 0) {
                            const newSkills = [...new Set([...formData.skills, ...tags])];
                            updateField('skills', newSkills);
                            setAiTagSource(res.data?.source || 'ai');
                            toast.success(`AI suggested ${tags.length} skills: ${tags.join(', ')}`);
                          } else {
                            toast.error('No skills detected from your text');
                          }
                        } catch {
                          toast.error('AI service unavailable — select skills manually');
                        }
                        setAiTagLoading(false);
                      }}
                    >
                      {aiTagLoading ? <Loader size={14} className="spin" /> : <Sparkles size={14} />}
                      {aiTagLoading ? 'AI Analyzing...' : 'AI Auto-Tag My Skills'}
                    </button>
                  )}
                  {aiTagSource && (
                    <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--success-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={12} /> Skills auto-detected via {aiTagSource === 'gemini-ai' ? 'Gemini AI' : 'NLP engine'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {step === 3 && (
              <div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Available From *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.availableFrom}
                      onChange={(e) => updateField('availableFrom', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available To *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.availableTo}
                      onChange={(e) => updateField('availableTo', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Shift Preference</label>
                  <select
                    className="form-select"
                    value={formData.shiftPreference}
                    onChange={(e) => updateField('shiftPreference', e.target.value)}
                  >
                    <option value="ANY">Any Shift</option>
                    <option value="MORNING">Morning (6 AM - 2 PM)</option>
                    <option value="AFTERNOON">Afternoon (2 PM - 10 PM)</option>
                    <option value="NIGHT">Night (10 PM - 6 AM)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Zones (optional)</label>
                  <div className="form-checkbox-group" style={{ marginTop: '8px' }}>
                    {ZONES.map((zone) => (
                      <span
                        key={zone}
                        className={`chip ${formData.preferredZones.includes(zone) ? 'active' : ''}`}
                        onClick={() => toggleArrayItem('preferredZones', zone)}
                      >
                        {formData.preferredZones.includes(zone) && <CheckCircle size={14} />}
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div>
                <div className="glass-card-static" style={{ padding: '20px', marginBottom: '16px' }}>
                  <h5 style={{ color: 'var(--neutral-500)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} /> Personal Information
                  </h5>
                  <div className="grid-2" style={{ gap: '8px' }}>
                    <div><strong>Name:</strong> {formData.name}</div>
                    <div><strong>Email:</strong> {formData.email}</div>
                    <div><strong>Phone:</strong> {formData.phone}</div>
                    <div><strong>Age:</strong> {formData.age || 'N/A'}</div>
                  </div>
                </div>

                <div className="glass-card-static" style={{ padding: '20px', marginBottom: '16px' }}>
                  <h5 style={{ color: 'var(--neutral-500)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={18} /> Skills & Languages
                  </h5>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Skills: </strong>
                    {formData.skills.map((s) => (
                      <span key={s} className="badge badge-primary" style={{ marginRight: '4px', marginBottom: '4px' }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Languages: </strong>
                    {formData.languages.map((l) => (
                      <span key={l} className="badge badge-secondary" style={{ marginRight: '4px' }}>{l}</span>
                    ))}
                  </div>
                  <div><strong>Fitness:</strong> {formData.fitnessLevel}</div>
                </div>

                <div className="glass-card-static" style={{ padding: '20px' }}>
                  <h5 style={{ color: 'var(--neutral-500)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarIcon size={18} /> Availability
                  </h5>
                  <div className="grid-2" style={{ gap: '8px' }}>
                    <div><strong>From:</strong> {formData.availableFrom}</div>
                    <div><strong>To:</strong> {formData.availableTo}</div>
                    <div><strong>Shift:</strong> {formData.shiftPreference}</div>
                    <div><strong>Zones:</strong> {formData.preferredZones.length > 0 ? formData.preferredZones.join(', ') : 'Any'}</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--neutral-100)',
        }}>
          {step > 1 ? (
            <button className="btn btn-outline" onClick={prevStep}>
              <ArrowLeft size={18} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Next Step
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              className="btn btn-success btn-lg"
              onClick={handleSubmit}
              disabled={loading}
              id="register-submit"
            >
              {loading ? (
                <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              ) : (
                <>
                  <CheckCircle size={18} />
                  Complete Registration
                </>
              )}
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--neutral-400)', fontSize: '0.85rem' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
