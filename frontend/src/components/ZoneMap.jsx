import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ZONE_COLORS = {
  GHAT: '#3B82F6',
  CAMP: '#22C55E',
  MEDICAL: '#EF4444',
  TRANSIT: '#F59E0B',
  FOOD_COURT: '#8B5CF6',
  PARKING: '#64748B',
  ENTRY_GATE: '#06B6D4',
  OTHER: '#94A3B8',
};

function createZoneIcon(type, current, required) {
  const color = ZONE_COLORS[type] || '#94A3B8';
  const ratio = required > 0 ? current / required : 1;
  const borderColor = ratio >= 0.8 ? '#22C55E' : ratio >= 0.5 ? '#F59E0B' : '#EF4444';

  return L.divIcon({
    className: 'custom-zone-marker',
    html: `<div style="
      width: 36px; height: 36px;
      background: ${color};
      border: 3px solid ${borderColor};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 11px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-family: 'Inter', sans-serif;
    ">${current}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Ujjain, Madhya Pradesh / Mahakumbh center coordinates
const MAHAKUMBH_CENTER = [23.1793, 75.7849];

function MapUpdater({ zones }) {
  const map = useMap();
  useEffect(() => {
    if (zones.length > 0) {
      const bounds = zones
        .filter(z => z.latitude && z.longitude)
        .map(z => [z.latitude, z.longitude]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
      }
    }
  }, [zones, map]);
  return null;
}

export default function ZoneMap({ zones = [], onZoneClick, style, volunteers = [] }) {
  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--neutral-200)',
      ...style,
    }}>
      <MapContainer
        center={MAHAKUMBH_CENTER}
        zoom={14}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater zones={zones} />

        {zones.map((zone) => {
          if (!zone.latitude || !zone.longitude) return null;
          const ratio = zone.requiredVolunteers > 0
            ? (zone.currentVolunteers || 0) / zone.requiredVolunteers
            : 1;
          const color = ZONE_COLORS[zone.type] || '#94A3B8';

          return (
            <div key={zone.id}>
              {/* Crowd density circle */}
              <Circle
                center={[zone.latitude, zone.longitude]}
                radius={200 + (zone.crowdDensity || 0) * 3}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.1,
                  weight: 1,
                }}
              />

              {/* Zone marker */}
              <Marker
                position={[zone.latitude, zone.longitude]}
                icon={createZoneIcon(zone.type, zone.currentVolunteers || 0, zone.requiredVolunteers || 0)}
                eventHandlers={{
                  click: () => onZoneClick && onZoneClick(zone),
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                      {zone.name}
                    </div>
                    <div style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: `${color}20`,
                      color: color,
                      marginBottom: '8px',
                    }}>
                      {zone.type}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Volunteers:</strong> {zone.currentVolunteers || 0} / {zone.requiredVolunteers || 0}
                      </div>
                      <div style={{
                        height: '6px',
                        background: '#E2E8F0',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        marginBottom: '4px',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(ratio * 100, 100)}%`,
                          background: ratio >= 0.8 ? '#22C55E' : ratio >= 0.5 ? '#F59E0B' : '#EF4444',
                          borderRadius: '3px',
                        }} />
                      </div>
                      <div>
                        <strong>Status:</strong>{' '}
                        <span style={{ color: ratio >= 0.8 ? '#16A34A' : ratio >= 0.5 ? '#D97706' : '#DC2626' }}>
                          {ratio >= 0.8 ? 'Optimal' : ratio >= 0.5 ? 'Understaffed' : 'Critical'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
