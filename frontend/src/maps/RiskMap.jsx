import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { RiskBadge } from '../components/StatusBadge';
import { MapPin, AlertTriangle, Users, HeartPulse, Wind, Navigation, Crosshair } from 'lucide-react';

// Fix Leaflet marker icon asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom glowing target pin with amber warmth
const activeLocationIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(245, 158, 11, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #F59E0B; border: 3px solid #FFFBEB; box-shadow: 0 0 14px #F59E0B;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export const RiskMap = ({ geojsonData, userLocation, locationDetails, selectedWard, onSelectWard }) => {
  const [map, setMap] = useState(null);

  const defaultCenter = [20.5937, 78.9629]; // India center
  const initialCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [17.6868, 83.2185];
  const initialZoom = userLocation ? 11 : 5;

  // Fly to new coordinates whenever userLocation or selectedWard changes
  useEffect(() => {
    if (!map || !userLocation) return;
    const targetLat = selectedWard?.centroid ? selectedWard.centroid[0] : userLocation.latitude;
    const targetLon = selectedWard?.centroid ? selectedWard.centroid[1] : userLocation.longitude;
    const isCloseToVizag = Math.abs(targetLat - 17.6868) < 0.6 && Math.abs(targetLon - 83.2185) < 0.6;
    const targetZoom = selectedWard ? 13 : isCloseToVizag ? 12 : 10;

    map.flyTo([targetLat, targetLon], targetZoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [map, userLocation?.latitude, userLocation?.longitude, selectedWard?.ward_id]);

  const getRiskColor = (htsi, riskLevel) => {
    const risk = (riskLevel || '').toUpperCase();
    if (risk === 'EXTREME' || htsi >= 80) return '#A855F7'; // purple
    if (risk === 'VERY HIGH' || htsi >= 60) return '#EF4444'; // red
    if (risk === 'HIGH' || htsi >= 40) return '#F97316'; // orange
    if (risk === 'MODERATE' || htsi >= 20) return '#FBBF24'; // yellow
    return '#10B981'; // emerald green
  };

  const styleFeature = (feature) => {
    const props = feature.properties || {};
    const color = getRiskColor(props.htsi, props.risk_level);
    const isSelected = selectedWard && selectedWard.ward_id === props.ward_id;

    return {
      fillColor: color,
      weight: isSelected ? 3 : 1.5,
      opacity: 1,
      color: isSelected ? '#FFFBEB' : '#1C1917',
      dashArray: isSelected ? '4' : '',
      fillOpacity: isSelected ? 0.70 : 0.45,
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
          color: '#FBBF24',
          fillOpacity: 0.65,
        });
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle(styleFeature(feature));
      },
    });
  };

  const resetToIndia = () => {
    if (map) {
      map.flyTo(defaultCenter, 5, { duration: 1.0 });
    }
  };

  return (
    <div className="glass-panel p-4 relative flex flex-col h-[540px] border border-stone-800">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 shadow-sm">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Spatial Biometeorological Visualizer</span>
            <h3 className="text-sm sm:text-base font-bold text-cream-50 flex items-center gap-2">
              India Heat Stress GIS Map
              {userLocation && (
                <span className="text-xs font-mono font-normal text-stone-400">
                  [{userLocation.latitude.toFixed(3)}, {userLocation.longitude.toFixed(3)}]
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Legend & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800 shadow-sm">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Low</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span>Mod</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>V.High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Extreme</span>
          </div>

          <button
            type="button"
            onClick={resetToIndia}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/30 text-stone-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition shadow-sm"
            title="Zoom out to whole India view"
          >
            <Crosshair className="h-3 w-3 text-amber-400" />
            Pan India
          </button>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="flex-1 rounded-2xl overflow-hidden relative border border-stone-800/80 shadow-inner">
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
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

          {/* Selected Location Target Marker & Circle */}
          {userLocation && (
            <>
              <Marker position={[userLocation.latitude, userLocation.longitude]} icon={activeLocationIcon}>
                <Popup>
                  <div className="p-2.5 text-xs font-sans text-stone-200 min-w-[190px]">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-extrabold text-sm text-amber-400">
                        {locationDetails?.city || userLocation.ward || 'Selected Place'}
                      </span>
                      {locationDetails?.risk_level && (
                        <RiskBadge risk={locationDetails.risk_level} size="sm" />
                      )}
                    </div>
                    <div className="text-[11px] space-y-1 text-stone-300 font-mono">
                      <div>Lat: {userLocation.latitude.toFixed(4)}</div>
                      <div>Lon: {userLocation.longitude.toFixed(4)}</div>
                      {locationDetails?.htsi !== undefined && (
                        <div className="font-bold text-cream-100 mt-1 pt-1 border-t border-stone-700">
                          HTSI Score: <span className="text-orange-400">{Number(locationDetails.htsi).toFixed(1)} / 100</span>
                        </div>
                      )}
                      {locationDetails?.temperature !== undefined && (
                        <div>Temp: {locationDetails.temperature}°C · RH: {locationDetails.humidity}%</div>
                      )}
                      {locationDetails?.populationFormatted && (
                        <div className="text-amber-300 font-semibold pt-1 border-t border-stone-700 flex items-center justify-between gap-1">
                          <span>Population:</span>
                          <span className="text-cream-50">{locationDetails.populationFormatted}</span>
                        </div>
                      )}
                      {locationDetails?.density && (
                        <div className="text-[10px] text-stone-400">
                          Density: {locationDetails.density}
                        </div>
                      )}
                      {locationDetails?.exposure && (
                        <div className="text-[10px] text-stone-400 font-sans italic pt-0.5">
                          {locationDetails.exposure}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={800}
                pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.15, weight: 1.5 }}
              />
            </>
          )}
        </MapContainer>

        {/* Floating Selected Ward Overlay Panel */}
        {selectedWard && (
          <div className="absolute bottom-4 left-4 z-[400] max-w-sm glass-panel p-4 bg-stone-950/95 border border-amber-500/30 shadow-2xl rounded-2xl backdrop-blur-xl ring-1 ring-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-extrabold text-sm text-cream-50">{selectedWard.name}</h4>
                <span className="text-[10px] font-mono text-amber-400">{selectedWard.zone || 'Municipal Ward'}</span>
              </div>
              <RiskBadge risk={selectedWard.risk_level} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-2.5">
              <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-stone-400">HTSI Stress:</span>
                <span className="ml-1 font-bold text-cream-100">{selectedWard.htsi || 87.2}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-stone-400">Vulnerability:</span>
                <span className="ml-1 font-bold text-cream-100">{selectedWard.vulnerability_score || 78}/100</span>
              </div>
              <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-stone-400">Population:</span>
                <span className="ml-1 font-bold text-cream-100">{selectedWard.population?.toLocaleString() || '72,000'}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-stone-400">Density:</span>
                <span className="ml-1 font-bold text-cream-100">{selectedWard.population_density?.toLocaleString() || '8,500'}/km²</span>
              </div>
            </div>

            {selectedWard.primary_exposure && (
              <p className="text-[11px] text-stone-400 mb-2 leading-relaxed">
                <strong className="text-stone-300">Exposure Profile:</strong> {selectedWard.primary_exposure}
              </p>
            )}

            <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] text-amber-400 font-medium">
              <span>Ward polygon selected</span>
              <button
                type="button"
                onClick={() => onSelectWard && onSelectWard(null)}
                className="text-stone-400 hover:text-cream-200 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
