import { ScanEye } from 'lucide-react';

export default function Logo({ size = 'md' }) {
  const iconSize = size === 'lg' ? 32 : size === 'sm' ? 18 : 24;
  const boxSize = size === 'lg' ? '56px' : size === 'sm' ? '32px' : '44px';
  const fontSize = size === 'lg' ? '2.2rem' : size === 'sm' ? '1.2rem' : '1.6rem';
  const gap = size === 'sm' ? '8px' : '10px';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap, textDecoration: 'none' }}>
      <div style={{
        width: boxSize,
        height: boxSize,
        background: 'var(--gradient-brand)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: 'var(--shadow-glow-brand)'
      }}>
        <ScanEye size={iconSize} strokeWidth={2.5} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left', lineHeight: 1.15 }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize,
          fontWeight: 800,
          background: 'var(--gradient-brand)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em'
        }}>SevaDrishti</span>
        <span style={{ 
          fontSize: size === 'lg' ? '0.85rem' : size === 'sm' ? '0.52rem' : '0.68rem', 
          fontWeight: 700, 
          color: '#F59E0B', 
          marginTop: size === 'lg' ? '4px' : '2px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif'
        }}>
          Divine Service, Smart Vision
        </span>
      </div>
    </div>
  );
}
