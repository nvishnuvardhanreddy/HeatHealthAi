import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { RiskBadge } from '../components/StatusBadge';
import { MapPin, Navigation, Crosshair, Filter, Search } from 'lucide-react';
import { THEME, getRiskColor } from '../theme';

// Fix Leaflet marker icon asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom glowing target pin with primary amber
const activeLocationIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(245, 169, 0, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #F5A900; border: 3px solid #F5F0E8; box-shadow: 0 0 14px #F5A900;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export const RiskMap = ({ geojsonData, userLocation, locationDetails, selectedWard, onSelectWard }) => {
  const [map, setMap] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

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

  const styleFeature = (feature) => {
    const props = feature.properties || {};
    const riskLevel = (props.risk_level || 'LOW').toUpperCase();
    const color = getRiskColor(riskLevel);
    const isSelected = selectedWard && selectedWard.ward_id === props.ward_id;
    const isVisible = activeFilter === 'ALL' || activeFilter === riskLevel;

    return {
      fillColor: color,
      weight: isSelected ? 3 : 1.5,
      opacity: isVisible ? 1 : 0.2,
      color: isSelected ? '#FFD34D' : '#4F3100',
      dashArray: isSelected ? '4' : '',
      fillOpacity: isVisible ? (isSelected ? 0.75 : 0.45) : 0.08,
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
          color: '#FFD34D',
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
    <div className="mission-card p-4 relative flex flex-col h-[540px] border border-[#4F3100]">
      {/* Header bar with controls */}
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#161311] border border-[#4F3100] text-[#F5A900]">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#F5A900] font-bold">
              SPATIAL BIOMETEOROLOGICAL VISUALIZER
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#F5F0E8] flex items-center gap-2">
              India Heat Stress GIS Map
              {userLocation && (
                <span className="text-xs font-mono font-normal text-[#A59F95]">
                  [{userLocation.latitude.toFixed(3)}, {userLocation.longitude.toFixed(3)}]
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* 13. Map Legend & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Legend Chips with optional filter */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono bg-[#100E0D] px-2.5 py-1.5 rounded-xl border border-[#4F3100] shadow-sm">
            {[
              { id: 'ALL', label: 'All', col: '#A59F95' },
              { id: 'LOW', label: 'Low', col: '#16C784' },
              { id: 'MODERATE', label: 'Mod', col: '#F0B400' },
              { id: 'HIGH', label: 'High', col: '#FF7518' },
              { id: 'VERY HIGH', label: 'V.High', col: '#EF4444' },
              { id: 'EXTREME', label: 'Extreme', col: '#7C3AED' },
            ].map(({ id, label, col }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveFilter(id)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition ${
                  activeFilter === id
                    ? 'bg-[#1C1714] font-bold text-[#F5F0E8] ring-1 ring-[#F5A900]'
                    : 'text-[#A59F95] hover:text-[#F5F0E8]'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetToIndia}
            className="btn-secondary text-[11px] font-mono py-1 px-2.5 flex items-center gap-1"
            title="Zoom out to pan India view"
          >
            <Crosshair className="h-3 w-3 text-[#F5A900]" />
            Pan India
          </button>
        </div>
      </div>

      {/* Leaflet Dark Container */}
      <div className="flex-1 rounded-xl overflow-hidden relative border border-[#4F3100] shadow-inner">
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
                  <div className="p-3 text-xs font-sans text-[#F5F0E8] min-w-[200px]">
                    <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-[#4F3100]">
                      <span className="font-extrabold text-sm text-[#FFD34D]">
                        {locationDetails?.city || userLocation.ward || 'Selected Place'}
                      </span>
                      {locationDetails?.risk_level && (
                        <RiskBadge risk={locationDetails.risk_level} size="xs" />
                      )}
                    </div>
                    <div className="text-[11px] space-y-1 text-[#A59F95] font-mono">
                      <div>Lat: {userLocation.latitude.toFixed(4)}</div>
                      <div>Lon: {userLocation.longitude.toFixed(4)}</div>
                      {locationDetails?.htsi !== undefined && (
                        <div className="font-bold text-[#F5F0E8] mt-1 pt-1 border-t border-[#4F3100]">
                          HTSI Score: <span className="text-[#FF9F3D]">{Number(locationDetails.htsi).toFixed(1)} / 100</span>
                        </div>
                      )}
                      {locationDetails?.temperature !== undefined && (
                        <div>Temp: {locationDetails.temperature}°C · RH: {locationDetails.humidity}%</div>
                      )}
                      {locationDetails?.populationFormatted && (
                        <div className="text-[#FFD34D] font-semibold pt-1 border-t border-[#4F3100] flex items-center justify-between gap-1">
                          <span>Population:</span>
                          <span className="text-[#F5F0E8]">{locationDetails.populationFormatted}</span>
                        </div>
                      )}
                      {locationDetails?.density && (
                        <div className="text-[10px] text-[#706A62]">
                          Density: {locationDetails.density}
                        </div>
                      )}
                      {locationDetails?.exposure && (
                        <div className="text-[10px] text-[#A59F95] font-sans italic pt-0.5">
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
                pathOptions={{ color: '#F5A900', fillColor: '#F5A900', fillOpacity: 0.15, weight: 1.5 }}
              />
            </>
          )}
        </MapContainer>

        {/* Floating Selected Ward Overlay Panel */}
        {selectedWard && (
          <div className="absolute bottom-4 left-4 z-[400] max-w-sm mission-card p-4 bg-[#14110F] border border-[#F5A900] shadow-2xl rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-extrabold text-sm text-[#F5F0E8]">{selectedWard.name}</h4>
                <span className="text-[10px] font-mono text-[#FFD34D]">{selectedWard.zone || 'Municipal Ward'}</span>
              </div>
              <RiskBadge risk={selectedWard.risk_level} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-2.5">
              <div className="p-1.5 rounded-lg bg-[#100E0D] border border-[#4F3100]">
                <span className="text-[#A59F95]">HTSI Stress:</span>
                <span className="ml-1 font-bold text-[#F5F0E8]">{selectedWard.htsi || 87.2}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#100E0D] border border-[#4F3100]">
                <span className="text-[#A59F95]">Vulnerability:</span>
                <span className="ml-1 font-bold text-[#F5F0E8]">{selectedWard.vulnerability_score || 78}/100</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#100E0D] border border-[#4F3100]">
                <span className="text-[#A59F95]">Population:</span>
                <span className="ml-1 font-bold text-[#F5F0E8]">{selectedWard.population?.toLocaleString() || '72,000'}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#100E0D] border border-[#4F3100]">
                <span className="text-[#A59F95]">Density:</span>
                <span className="ml-1 font-bold text-[#F5F0E8]">{selectedWard.population_density?.toLocaleString() || '8,500'}/km²</span>
              </div>
            </div>

            {selectedWard.primary_exposure && (
              <p className="text-[11px] text-[#A59F95] mb-2 leading-relaxed">
                <strong className="text-[#F5F0E8]">Exposure Profile:</strong> {selectedWard.primary_exposure}
              </p>
            )}

            <div className="pt-2 border-t border-[#4F3100] flex items-center justify-between text-[10px] text-[#FFD34D] font-medium font-mono">
              <span>Ward polygon selected</span>
              <button
                type="button"
                onClick={() => onSelectWard && onSelectWard(null)}
                className="text-[#A59F95] hover:text-[#F5F0E8] underline"
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
