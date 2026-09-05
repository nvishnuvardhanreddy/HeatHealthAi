import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { RiskBadge } from '../components/StatusBadge';
import { MapPin, AlertTriangle, Users, HeartPulse, Wind } from 'lucide-react';

// Fix Leaflet marker icon asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// User GPS custom pin
const userIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #06B6D4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px #06B6D4;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export const RiskMap = ({ geojsonData, userLocation, selectedWard, onSelectWard }) => {
  const [map, setMap] = useState(null);

  const defaultCenter = [20.5937, 78.9629]; // India center
  const vizagCenter = [17.6868, 83.2185];
  // If ward GeoJSON is available (Vizag data), center on Vizag zoomed in.
  // Otherwise center on user location or India center, zoomed out.
  const center = geojsonData
    ? vizagCenter
    : userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : defaultCenter;
  const zoom = geojsonData ? 11 : userLocation ? 10 : 5;

  const getRiskColor = (htsi, riskLevel) => {
    const risk = (riskLevel || '').toUpperCase();
    if (risk === 'EXTREME' || htsi >= 80) return '#A855F7'; // purple
    if (risk === 'VERY HIGH' || htsi >= 60) return '#EF4444'; // red
    if (risk === 'HIGH' || htsi >= 40) return '#F97316'; // orange
    if (risk === 'MODERATE' || htsi >= 20) return '#FBBF24'; // yellow
    return '#10B981'; // green
  };

  const styleFeature = (feature) => {
    const props = feature.properties || {};
    const color = getRiskColor(props.htsi, props.risk_level);
    const isSelected = selectedWard && selectedWard.ward_id === props.ward_id;

    return {
      fillColor: color,
      weight: isSelected ? 3 : 1.5,
      opacity: 1,
      color: isSelected ? '#FFFFFF' : '#0F172A',
      dashArray: isSelected ? '4' : '',
      fillOpacity: isSelected ? 0.65 : 0.45,
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};

    layer.on({
      click: () => {
        if (onSelectWard) onSelectWard(props);
      },
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 3,
          color: '#38BDF8',
          fillOpacity: 0.6,
        });
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle(styleFeature(feature));
      },
    });
  };

  return (
    <div className="glass-panel p-4 relative flex flex-col h-[520px]">
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Spatial Thermal Risk Visualizer</span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            India Ward Heat Stress Map
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-mono bg-dark-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Low</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>Mod</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Very High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>Extreme</span>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="flex-1 rounded-xl overflow-hidden relative border border-slate-800">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          className="h-full w-full"
          ref={setMap}
        >
          {/* Dark CartoDB Base Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Ward GeoJSON Polygons */}
          {geojsonData && (
            <GeoJSON
              data={geojsonData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}

          {/* User Location Marker & Circle */}
          {userLocation && (
            <>
              <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                <Popup>
                  <div className="p-2 text-xs font-sans text-slate-200">
                    <p className="font-bold text-cyan-400 mb-1">Your Location (GPS)</p>
                    <p>Lat: {userLocation.latitude.toFixed(4)}</p>
                    <p>Lon: {userLocation.longitude.toFixed(4)}</p>
                    {userLocation.ward && <p className="mt-1 font-semibold text-white">Ward: {userLocation.ward}</p>}
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={600}
                pathOptions={{ color: '#06B6D4', fillColor: '#06B6D4', fillOpacity: 0.15, weight: 1 }}
              />
            </>
          )}
        </MapContainer>

        {!geojsonData && (
          <div className="absolute inset-x-4 top-4 z-[400] rounded-lg border border-amber-500/40 bg-slate-950/90 p-3 text-xs text-amber-200">
            📍 Live weather & heat risk calculated for your GPS location. Ward boundary polygons are only available for Visakhapatnam. Other Indian cities show heat risk via direct meteorological data.
          </div>
        )}

        {/* Floating Selected Ward Overlay Panel */}
        {selectedWard && (
          <div className="absolute bottom-4 left-4 z-[400] max-w-sm glass-panel p-4 bg-dark-950/90 border border-slate-700 shadow-2xl rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-extrabold text-sm text-white">{selectedWard.name}</h4>
              <RiskBadge risk={selectedWard.risk_level} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-2.5">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">HTSI Stress:</span>
                <span className="ml-1 font-bold text-white">{selectedWard.htsi || 87.2}</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Vulnerability:</span>
                <span className="ml-1 font-bold text-white">{selectedWard.vulnerability_score || 78}/100</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Population:</span>
                <span className="ml-1 font-bold text-white">{selectedWard.population?.toLocaleString() || '72,000'}</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Density:</span>
                <span className="ml-1 font-bold text-white">{selectedWard.population_density?.toLocaleString() || '8,500'}/km²</span>
              </div>
            </div>

            {selectedWard.primary_exposure && (
              <p className="text-[11px] text-slate-400 mb-2">
                <strong className="text-slate-300">Exposure Profile:</strong> {selectedWard.primary_exposure}
              </p>
            )}

            <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-400 font-medium">
              Click another ward polygon on map to inspect localized biometeorological profile.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
