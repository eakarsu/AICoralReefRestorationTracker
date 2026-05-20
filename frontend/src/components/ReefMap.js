import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { API_BASE, getToken } from '../services/api';

// Patch default icon (still useful in case <Marker> is added later).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SEVERITY_COLOR = {
  none:     '#9ca3af',
  low:      '#22c55e',
  medium:   '#facc15',
  high:     '#fb923c',
  critical: '#ef4444',
};

function radiusFor(pct) {
  const p = Number(pct) || 0;
  return Math.max(7, Math.min(22, 7 + Math.round(p / 6)));
}

export default function ReefMap() {
  const [sites, setSites] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/reef-map`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setSites(d.sites || []))
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div style={{ width: '100%', height: 480, borderRadius: 10, overflow: 'hidden', border: '1px solid #1e293b' }}>
      {err && <div style={{ color: '#fca5a5', padding: 8 }}>Map load error: {err}</div>}
      <MapContainer
        center={[10, 30]}
        zoom={2}
        scrollWheelZoom
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sites.map((s) => {
          const color = SEVERITY_COLOR[String(s.bleaching_severity || 'none').toLowerCase()] || SEVERITY_COLOR.none;
          return (
            <CircleMarker
              key={s.site_id}
              center={[s.lat, s.lng]}
              radius={radiusFor(s.bleached_pct)}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
                {s.site_id} · {s.bleaching_severity} · {s.bleached_pct}%
              </Tooltip>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{s.location}</div>
                  <div style={{ marginTop: 6, fontSize: 12 }}>
                    <div>Site ID: <strong>{s.site_id}</strong></div>
                    <div>Status: {s.status}</div>
                    <div>Depth: {s.depth_m} m · Area: {s.area_m2} m&sup2;</div>
                    <div>Bleaching: <strong style={{ color }}>{s.bleaching_severity}</strong> ({s.bleached_pct}%)</div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
