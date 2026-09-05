import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Flame, Building2, Compass, ShieldAlert, ChevronRight, Users } from 'lucide-react';

export const ALL_LOCATIONS = [
  // ==========================================
  // 1. VISAKHAPATNAM MUNICIPAL WARDS (GVMC)
  // ==========================================
  { name: 'Gajuwaka', subtext: 'South Zone · GVMC Ward 01', state: 'Andhra Pradesh', latitude: 17.690, longitude: 83.200, category: 'wards', isWard: true, wardId: 'VIZ-01', riskTag: 'EXTREME', population: 72000, populationFormatted: '72,000', density: '8,500/km²', exposure: 'Industrial & port labor, metal fabrication' },
  { name: 'Madhurawada', subtext: 'North Zone · GVMC Ward 02', state: 'Andhra Pradesh', latitude: 17.820, longitude: 83.350, category: 'wards', isWard: true, wardId: 'VIZ-02', riskTag: 'HIGH', population: 54000, populationFormatted: '54,000', density: '4,200/km²', exposure: 'IT parks & high-rise construction' },
  { name: 'Anakapalle', subtext: 'West Zone · GVMC Ward 03', state: 'Andhra Pradesh', latitude: 17.695, longitude: 83.000, category: 'wards', isWard: true, wardId: 'VIZ-03', riskTag: 'VERY HIGH', population: 65000, populationFormatted: '65,000', density: '4,900/km²', exposure: 'Agricultural workers, open jaggery markets' },
  { name: 'Bheemunipatnam', subtext: 'Coastal East Zone · GVMC Ward 04', state: 'Andhra Pradesh', latitude: 17.895, longitude: 83.450, category: 'wards', isWard: true, wardId: 'VIZ-04', riskTag: 'HIGH', population: 38000, populationFormatted: '38,000', density: '3,100/km²', exposure: 'Artisanal fishermen & coastal salt pans' },
  { name: 'MVP Colony', subtext: 'Central Urban Zone · GVMC Ward 05', state: 'Andhra Pradesh', latitude: 17.745, longitude: 83.330, category: 'wards', isWard: true, wardId: 'VIZ-05', riskTag: 'MODERATE', population: 48000, populationFormatted: '48,000', density: '9,200/km²', exposure: 'Commercial center, high elderly ratio' },
  { name: 'Jagadamba Junction', subtext: 'Commercial Corridor · GVMC Ward 06', state: 'Andhra Pradesh', latitude: 17.715, longitude: 83.300, category: 'wards', isWard: true, wardId: 'VIZ-06', riskTag: 'VERY HIGH', population: 59000, populationFormatted: '59,000', density: '12,800/km²', exposure: 'Asphalt radiation, transit pedestrian volume' },
  { name: 'Dwaraka Nagar', subtext: 'Transit Hub · GVMC Ward 07', state: 'Andhra Pradesh', latitude: 17.733, longitude: 83.310, category: 'wards', isWard: true, wardId: 'VIZ-07', riskTag: 'HIGH', population: 61000, populationFormatted: '61,000', density: '11,500/km²', exposure: 'Intercity bus terminus, auto operators' },
  { name: 'Rushikonda', subtext: 'IT Corridor · GVMC Ward 08', state: 'Andhra Pradesh', latitude: 17.790, longitude: 83.385, category: 'wards', isWard: true, wardId: 'VIZ-08', riskTag: 'MODERATE', population: 32000, populationFormatted: '32,000', density: '2,900/km²', exposure: 'IT SEZ & campus marine microclimate' },
  { name: 'Simhachalam', subtext: 'North-West Valley · GVMC Ward 09', state: 'Andhra Pradesh', latitude: 17.775, longitude: 83.250, category: 'wards', isWard: true, wardId: 'VIZ-09', riskTag: 'HIGH', population: 46000, populationFormatted: '46,000', density: '4,600/km²', exposure: 'Valley heat entrapment, temple footfall' },
  { name: 'Pendurthi', subtext: 'West Agricultural Belt · GVMC Ward 10', state: 'Andhra Pradesh', latitude: 17.825, longitude: 83.190, category: 'wards', isWard: true, wardId: 'VIZ-10', riskTag: 'VERY HIGH', population: 58000, populationFormatted: '58,000', density: '3,800/km²', exposure: 'Field laborers, brick kilns, logistics' },
  { name: 'Gopalapatnam', subtext: 'Airport & Transit · GVMC Ward 11', state: 'Andhra Pradesh', latitude: 17.750, longitude: 83.220, category: 'wards', isWard: true, wardId: 'VIZ-11', riskTag: 'HIGH', population: 52000, populationFormatted: '52,000', density: '6,700/km²', exposure: 'Railway junction & tarmac heat radiation' },
  { name: 'Kurmannapalem', subtext: 'Steel Plant Gateway · GVMC Ward 12', state: 'Andhra Pradesh', latitude: 17.670, longitude: 83.150, category: 'wards', isWard: true, wardId: 'VIZ-12', riskTag: 'EXTREME', population: 44000, populationFormatted: '44,000', density: '5,200/km²', exposure: 'Steel mill radiant heat, industrial trucking' },
  { name: 'Maharanipeta', subtext: 'Coastal Medical Hub · GVMC Ward 13', state: 'Andhra Pradesh', latitude: 17.708, longitude: 83.310, category: 'wards', isWard: true, wardId: 'VIZ-13', riskTag: 'MODERATE', population: 43000, populationFormatted: '43,000', density: '10,500/km²', exposure: 'King George Hospital outpatients & coastal humidity' },
  { name: 'Kancharapalem', subtext: 'Railway Workshop Belt · GVMC Ward 14', state: 'Andhra Pradesh', latitude: 17.733, longitude: 83.275, category: 'wards', isWard: true, wardId: 'VIZ-14', riskTag: 'VERY HIGH', population: 49000, populationFormatted: '49,000', density: '11,200/km²', exposure: 'Dense tenements, corrugated tin roofs' },
  { name: 'Marripalem', subtext: 'Residential-Industrial · GVMC Ward 15', state: 'Andhra Pradesh', latitude: 17.750, longitude: 83.255, category: 'wards', isWard: true, wardId: 'VIZ-15', riskTag: 'HIGH', population: 51000, populationFormatted: '51,000', density: '8,900/km²', exposure: 'Highway warehousing & metal fabrication' },

  // ==========================================
  // 2. MUMBAI MUNICIPAL WARDS (BMC / MCGM)
  // ==========================================
  { name: 'Dharavi & G/North Ward', subtext: 'Mumbai Municipal Ward G/North', state: 'Maharashtra', latitude: 19.040, longitude: 72.857, category: 'wards', isWard: true, wardId: 'MUM-GN', riskTag: 'EXTREME', population: 599000, populationFormatted: '599,000', density: '66,000/km²', exposure: 'Dense informal settlements, leather/plastic workshops' },
  { name: 'Andheri West & K/West Ward', subtext: 'Mumbai Municipal Ward K/West', state: 'Maharashtra', latitude: 19.120, longitude: 72.830, category: 'wards', isWard: true, wardId: 'MUM-KW', riskTag: 'VERY HIGH', population: 749000, populationFormatted: '749,000', density: '31,000/km²', exposure: 'Suburban transit nexus & high commercial density' },
  { name: 'Colaba-Fort & A Ward', subtext: 'Mumbai Municipal Ward A', state: 'Maharashtra', latitude: 18.922, longitude: 72.834, category: 'wards', isWard: true, wardId: 'MUM-A', riskTag: 'HIGH', population: 185000, populationFormatted: '185,000', density: '15,000/km²', exposure: 'Heritage commercial & marine humidity stress' },
  { name: 'Bandra West & H/West Ward', subtext: 'Mumbai Municipal Ward H/West', state: 'Maharashtra', latitude: 19.055, longitude: 72.830, category: 'wards', isWard: true, wardId: 'MUM-HW', riskTag: 'HIGH', population: 337000, populationFormatted: '337,000', density: '29,000/km²', exposure: 'High density coastal residential & retail hubs' },
  { name: 'Kurla & L Ward', subtext: 'Mumbai Municipal Ward L', state: 'Maharashtra', latitude: 19.072, longitude: 72.880, category: 'wards', isWard: true, wardId: 'MUM-L', riskTag: 'EXTREME', population: 902000, populationFormatted: '902,000', density: '57,000/km²', exposure: 'Mithi river basin, railway freight, dense tenements' },
  { name: 'Malabar Hill & D Ward', subtext: 'Mumbai Municipal Ward D', state: 'Maharashtra', latitude: 18.960, longitude: 72.810, category: 'wards', isWard: true, wardId: 'MUM-D', riskTag: 'MODERATE', population: 346000, populationFormatted: '346,000', density: '43,000/km²', exposure: 'High elderly demographics & coastal sea breeze' },

  // ==========================================
  // 3. DELHI MUNICIPAL WARDS (MCD / NDMC)
  // ==========================================
  { name: 'Chandni Chowk & Old Delhi', subtext: 'Delhi Municipal Ward 74', state: 'Delhi', latitude: 28.650, longitude: 77.230, category: 'wards', isWard: true, wardId: 'DEL-CC', riskTag: 'EXTREME', population: 210000, populationFormatted: '210,000', density: '38,000/km²', exposure: 'Narrow alleys, dense masonry heat retention, vendors' },
  { name: 'Connaught Place & Central Ward', subtext: 'NDMC Municipal Ward 01', state: 'Delhi', latitude: 28.632, longitude: 77.219, category: 'wards', isWard: true, wardId: 'DEL-CP', riskTag: 'VERY HIGH', population: 145000, populationFormatted: '145,000', density: '7,500/km²', exposure: 'Mass transit exchange, concrete heat traps' },
  { name: 'Rohini Municipal Zone', subtext: 'North-West Delhi Ward', state: 'Delhi', latitude: 28.715, longitude: 77.100, category: 'wards', isWard: true, wardId: 'DEL-ROH', riskTag: 'VERY HIGH', population: 860000, populationFormatted: '860,000', density: '28,000/km²', exposure: 'High residential density & low tree cover index' },
  { name: 'Dwarka Municipal Zone', subtext: 'South-West Delhi Sub-City', state: 'Delhi', latitude: 28.580, longitude: 77.050, category: 'wards', isWard: true, wardId: 'DEL-DWA', riskTag: 'VERY HIGH', population: 620000, populationFormatted: '620,000', density: '19,000/km²', exposure: 'Apartment complexes & open asphalt expressways' },
  { name: 'Okhla Industrial Ward', subtext: 'South-East Delhi Industrial Zone', state: 'Delhi', latitude: 28.530, longitude: 77.280, category: 'wards', isWard: true, wardId: 'DEL-OKH', riskTag: 'EXTREME', population: 380000, populationFormatted: '380,000', density: '32,000/km²', exposure: 'Heavy manufacturing, metal sheds, warehouse labor' },

  // ==========================================
  // 4. BENGALURU MUNICIPAL WARDS (BBMP)
  // ==========================================
  { name: 'Whitefield & Mahadevapura', subtext: 'BBMP Ward 84', state: 'Karnataka', latitude: 12.970, longitude: 77.750, category: 'wards', isWard: true, wardId: 'BLR-WF', riskTag: 'HIGH', population: 142000, populationFormatted: '142,000', density: '8,200/km²', exposure: 'High construction activity, tech parks, outdoor staff' },
  { name: 'Indiranagar & Ward 112', subtext: 'BBMP East Zone Ward 112', state: 'Karnataka', latitude: 12.978, longitude: 77.640, category: 'wards', isWard: true, wardId: 'BLR-IN', riskTag: 'MODERATE', population: 68000, populationFormatted: '68,000', density: '14,000/km²', exposure: 'Commercial retail avenues, pedestrian transit' },
  { name: 'Jayanagar & Ward 153', subtext: 'BBMP South Zone Ward 153', state: 'Karnataka', latitude: 12.930, longitude: 77.580, category: 'wards', isWard: true, wardId: 'BLR-JN', riskTag: 'MODERATE', population: 74000, populationFormatted: '74,000', density: '16,000/km²', exposure: 'Planned residential blocks with elderly demographics' },
  { name: 'Koramangala & Ward 151', subtext: 'BBMP South-East Ward 151', state: 'Karnataka', latitude: 12.935, longitude: 77.625, category: 'wards', isWard: true, wardId: 'BLR-KM', riskTag: 'MODERATE', population: 82000, populationFormatted: '82,000', density: '18,000/km²', exposure: 'Commercial start-up hub & dense food delivery fleet' },

  // ==========================================
  // 5. HYDERABAD MUNICIPAL WARDS (GHMC)
  // ==========================================
  { name: 'Charminar & Old City Ward', subtext: 'GHMC South Zone', state: 'Telangana', latitude: 17.361, longitude: 78.474, category: 'wards', isWard: true, wardId: 'HYD-CH', riskTag: 'EXTREME', population: 240000, populationFormatted: '240,000', density: '42,000/km²', exposure: 'High market pedestrian density, hawkers, narrow lanes' },
  { name: 'Hitec City & Serilingampally', subtext: 'GHMC West Zone', state: 'Telangana', latitude: 17.447, longitude: 78.376, category: 'wards', isWard: true, wardId: 'HYD-HC', riskTag: 'HIGH', population: 310000, populationFormatted: '310,000', density: '12,500/km²', exposure: 'Glass facade radiant heat, outdoor security guards' },
  { name: 'Banjara Hills & Khairatabad', subtext: 'GHMC Central Zone', state: 'Telangana', latitude: 17.415, longitude: 78.448, category: 'wards', isWard: true, wardId: 'HYD-BH', riskTag: 'HIGH', population: 180000, populationFormatted: '180,000', density: '15,000/km²', exposure: 'Commercial hospital corridor & hilly terrain' },

  // ==========================================
  // 6. CHENNAI MUNICIPAL WARDS (GCC)
  // ==========================================
  { name: 'Teynampet & Zone 09', subtext: 'GCC Central Ward Zone 09', state: 'Tamil Nadu', latitude: 13.040, longitude: 80.250, category: 'wards', isWard: true, wardId: 'CHE-TN', riskTag: 'VERY HIGH', population: 480000, populationFormatted: '480,000', density: '27,000/km²', exposure: 'Heavy arterial traffic & extreme tropical humidity' },
  { name: 'Royapuram & Zone 05', subtext: 'GCC North Port Ward Zone 05', state: 'Tamil Nadu', latitude: 13.110, longitude: 80.295, category: 'wards', isWard: true, wardId: 'CHE-RP', riskTag: 'EXTREME', population: 520000, populationFormatted: '520,000', density: '39,000/km²', exposure: 'Port manual labor, fish markets, salt air coupling' },

  // ==========================================
  // 7. KOLKATA & AHMEDABAD WARDS
  // ==========================================
  { name: 'BBD Bagh & Central Ward', subtext: 'KMC Ward 45', state: 'West Bengal', latitude: 22.571, longitude: 88.351, category: 'wards', isWard: true, wardId: 'KOL-BBD', riskTag: 'VERY HIGH', population: 85000, populationFormatted: '85,000', density: '34,000/km²', exposure: 'Colonial masonry heat trapping, extreme wet bulb stress' },
  { name: 'Navrangpura & West Ward', subtext: 'AMC West Zone', state: 'Gujarat', latitude: 23.036, longitude: 72.561, category: 'wards', isWard: true, wardId: 'AHM-NV', riskTag: 'EXTREME', population: 145000, populationFormatted: '145,000', density: '18,000/km²', exposure: 'Concrete heat retention, high daytime heatwaves' },

  // ==========================================
  // 8. HEAT HOTSPOTS & ARID EPICENTERS
  // ==========================================
  { name: 'Phalodi', subtext: 'Thar Desert (Record 51.0°C)', state: 'Rajasthan', latitude: 27.1311, longitude: 72.3644, category: 'hotspots', riskTag: 'EXTREME', population: 58000, populationFormatted: '58,000', density: '1,800/km²', exposure: 'Desert open grazing & rural manual labor' },
  { name: 'Churu', subtext: 'Desert Swings & Intense Heatwaves', state: 'Rajasthan', latitude: 28.2900, longitude: 74.9600, category: 'hotspots', riskTag: 'EXTREME', population: 120000, populationFormatted: '120,000', density: '2,400/km²', exposure: 'Extreme diurnal fluctuations, sand radiation' },
  { name: 'Barmer', subtext: 'Arid Thar Border Heat Basin', state: 'Rajasthan', latitude: 25.7521, longitude: 71.3967, category: 'hotspots', riskTag: 'EXTREME', population: 100000, populationFormatted: '100,000', density: '1,900/km²', exposure: 'Refinery construction & arid border belt' },
  { name: 'Jaisalmer', subtext: 'Extreme Arid Desert Expanse', state: 'Rajasthan', latitude: 26.9157, longitude: 70.9083, category: 'hotspots', riskTag: 'VERY HIGH', population: 65000, populationFormatted: '65,000', density: '1,200/km²', exposure: 'Yellow sandstone heat absorption, desert tourism' },
  { name: 'Banda', subtext: 'Bundelkhand Drought & Heat Core', state: 'Uttar Pradesh', latitude: 25.4800, longitude: 80.3400, category: 'hotspots', riskTag: 'EXTREME', population: 154000, populationFormatted: '154,000', density: '3,200/km²', exposure: 'Severe water scarcity, agricultural laborers' },
  { name: 'Rentachintala', subtext: 'Historic Palnadu Heat Cauldron', state: 'Andhra Pradesh', latitude: 16.5500, longitude: 79.5500, category: 'hotspots', riskTag: 'EXTREME', population: 18000, populationFormatted: '18,000', density: '950/km²', exposure: 'Inland rock plateau basin with trapped heat' },
  { name: 'Ramagundam', subtext: 'Godavari Thermal & Coal Basin', state: 'Telangana', latitude: 18.7562, longitude: 79.5139, category: 'hotspots', riskTag: 'EXTREME', population: 250000, populationFormatted: '250,000', density: '4,100/km²', exposure: 'Open-cast coal extraction & mega thermal power plants' },
  { name: 'Chandrapur', subtext: 'Vidarbha Industrial & Coal Belt', state: 'Maharashtra', latitude: 19.9615, longitude: 79.2961, category: 'hotspots', riskTag: 'EXTREME', population: 320000, populationFormatted: '320,000', density: '5,400/km²', exposure: 'Ferro-alloy smelting, coal dust, high night temperatures' },
  { name: 'Titlagarh', subtext: 'Legendary "Tatapani" Heat Cauldron', state: 'Odisha', latitude: 20.3000, longitude: 83.1500, category: 'hotspots', riskTag: 'EXTREME', population: 38000, populationFormatted: '38,000', density: '1,700/km²', exposure: 'Rocky granite hills causing extreme radiative reflection' },
  { name: 'Balangir', subtext: 'Western Odisha Dry Heat Belt', state: 'Odisha', latitude: 20.7100, longitude: 83.4800, category: 'hotspots', riskTag: 'VERY HIGH', population: 110000, populationFormatted: '110,000', density: '2,800/km²', exposure: 'Drought-prone agrarian population' },
  { name: 'Angul', subtext: 'Industrial Smelting & Thermal Belt', state: 'Odisha', latitude: 20.8400, longitude: 85.1500, category: 'hotspots', riskTag: 'VERY HIGH', population: 95000, populationFormatted: '95,000', density: '3,100/km²', exposure: 'Aluminum smelters & coal mining belt' },
  { name: 'Medininagar (Daltonganj)', subtext: 'Palamu Drought & Heat Plateau', state: 'Jharkhand', latitude: 24.0384, longitude: 84.0700, category: 'hotspots', riskTag: 'VERY HIGH', population: 125000, populationFormatted: '125,000', density: '2,600/km²', exposure: 'Rocky plateau arid heat trapping' },
  { name: 'Nandyal', subtext: 'Rayalaseema Dry Basin', state: 'Andhra Pradesh', latitude: 15.4889, longitude: 78.4836, category: 'hotspots', riskTag: 'VERY HIGH', population: 210000, populationFormatted: '210,000', density: '4,900/km²', exposure: 'Intense sun exposure for rural cotton & chili farmers' },
  { name: 'Wardha', subtext: 'Cotton Belt Extreme Thermal Stress', state: 'Maharashtra', latitude: 20.7453, longitude: 78.6022, category: 'hotspots', riskTag: 'VERY HIGH', population: 130000, populationFormatted: '130,000', density: '3,600/km²', exposure: 'Vidarbha agrarian thermal exhaustion' },

  // ==========================================
  // 9. METROS & MAJOR INDIAN CITIES
  // ==========================================
  { name: 'New Delhi', subtext: 'National Capital Region', state: 'Delhi', latitude: 28.6139, longitude: 77.2090, category: 'metros', riskTag: 'VERY HIGH', population: 33000000, populationFormatted: '33 Million', density: '11,300/km²', exposure: 'Dense concrete sprawl, massive traffic heat emissions' },
  { name: 'Mumbai', subtext: 'Financial Capital · Coastal Humidity', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, category: 'metros', riskTag: 'HIGH', population: 12500000, populationFormatted: '12.5 Million', density: '20,000/km²', exposure: 'Extreme tropical humidity, commuter crowds, slums' },
  { name: 'Bengaluru', subtext: 'Tech Capital · Deccan Plateau', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, category: 'metros', riskTag: 'MODERATE', population: 13200000, populationFormatted: '13.2 Million', density: '4,400/km²', exposure: 'High urbanization & dwindling green lakes cover' },
  { name: 'Kolkata', subtext: 'East Metro · High Wet Bulb Coupling', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639, category: 'metros', riskTag: 'VERY HIGH', population: 15300000, populationFormatted: '15.3 Million', density: '24,000/km²', exposure: 'High relative humidity, intense thermal wet-bulb index' },
  { name: 'Hyderabad', subtext: 'Telangana Capital & Cyberabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867, category: 'metros', riskTag: 'HIGH', population: 10800000, populationFormatted: '10.8 Million', density: '18,500/km²', exposure: 'Rapid peripheral expansion, rock landscape heat' },
  { name: 'Chennai', subtext: 'Coastal Coromandel Metro', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, category: 'metros', riskTag: 'VERY HIGH', population: 11500000, populationFormatted: '11.5 Million', density: '26,000/km²', exposure: 'High sea-surface temperature, prolonged humidity' },
  { name: 'Ahmedabad', subtext: 'Sabarmati Urban Heat Island', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714, category: 'metros', riskTag: 'EXTREME', population: 8600000, populationFormatted: '8.6 Million', density: '12,000/km²', exposure: 'Pioneering heat action plan zone, intense summers' },
  { name: 'Pune', subtext: 'Western Maharashtra Metro', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567, category: 'metros', riskTag: 'MODERATE', population: 7200000, populationFormatted: '7.2 Million', density: '9,400/km²', exposure: 'Automotive & IT corridor heat islands' },
  { name: 'Jaipur', subtext: 'Pink City Arid Urban Hub', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873, category: 'metros', riskTag: 'VERY HIGH', population: 4100000, populationFormatted: '4.1 Million', density: '6,400/km²', exposure: 'High solar radiant flux, open market streets' },
  { name: 'Lucknow', subtext: 'Avadh Urban Basin', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462, category: 'metros', riskTag: 'VERY HIGH', population: 3800000, populationFormatted: '3.8 Million', density: '7,100/km²', exposure: 'Gangetic plain summer heat trapping' },
  { name: 'Patna', subtext: 'Gangetic Floodplain Urban Hub', state: 'Bihar', latitude: 25.5941, longitude: 85.1376, category: 'metros', riskTag: 'VERY HIGH', population: 2500000, populationFormatted: '2.5 Million', density: '18,200/km²', exposure: 'High humidity, riverbank reflection, outdoor hawkers' },
  { name: 'Visakhapatnam (City Center)', subtext: 'Metropolitan Area', state: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185, category: 'metros', riskTag: 'HIGH', population: 2350000, populationFormatted: '2.35 Million', density: '3,400/km²', exposure: 'Port city marine air, industrial expansion' },
  { name: 'Vijayawada', subtext: 'Krishna River Basin Hub', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.6480, category: 'metros', riskTag: 'VERY HIGH', population: 1500000, populationFormatted: '1.5 Million', density: '16,000/km²', exposure: 'Surrounded by hills creating a heat pocket' },
  { name: 'Surat', subtext: 'Textile & Diamond Hub', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311, category: 'metros', riskTag: 'HIGH', population: 7500000, populationFormatted: '7.5 Million', density: '15,000/km²', exposure: 'Dense textile mills & industrial labor force' },
  { name: 'Nagpur', subtext: 'Zero Mile Vidarbha Heat Center', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882, category: 'hotspots', riskTag: 'VERY HIGH', population: 2900000, populationFormatted: '2.9 Million', density: '11,000/km²', exposure: 'Central India heat hub with temperatures > 45°C' },

  // ==========================================
  // 10. REMOTE & ARID OUTPOSTS
  // ==========================================
  { name: 'Leh', subtext: 'High Altitude Cold Desert & Extreme UV', state: 'Ladakh', latitude: 34.1526, longitude: 77.5771, category: 'remote', riskTag: 'MODERATE', population: 31000, populationFormatted: '31,000', density: '340/km²', exposure: 'Thin atmosphere, extreme UV radiation index' },
  { name: 'Kargil', subtext: 'Suru River High Valley', state: 'Ladakh', latitude: 34.5539, longitude: 76.1349, category: 'remote', riskTag: 'LOW', population: 16000, populationFormatted: '16,000', density: '290/km²', exposure: 'High-altitude cold mountain terrain' },
  { name: 'Cherrapunji', subtext: 'Extreme Humidity Thermal Stress', state: 'Meghalaya', latitude: 25.2986, longitude: 91.7330, category: 'remote', riskTag: 'HIGH', population: 14000, populationFormatted: '14,000', density: '420/km²', exposure: 'Near 100% humidity saturation, impaired sweat cooling' },
  { name: 'Bhuj (Kutch)', subtext: 'Great Rann of Kutch Salt Desert', state: 'Gujarat', latitude: 23.2420, longitude: 69.6669, category: 'remote', riskTag: 'EXTREME', population: 210000, populationFormatted: '210,000', density: '2,100/km²', exposure: 'White salt flats reflecting intense solar radiation' },
  { name: 'Port Blair', subtext: 'Bay of Bengal Tropical Marine', state: 'Andaman and Nicobar Islands', latitude: 11.6234, longitude: 92.7265, category: 'remote', riskTag: 'VERY HIGH', population: 108000, populationFormatted: '108,000', density: '3,500/km²', exposure: 'High dew point, sustained night thermal load' },
  { name: 'Kavaratti', subtext: 'Coral Atoll Marine Microclimate', state: 'Lakshadweep', latitude: 10.5667, longitude: 72.6417, category: 'remote', riskTag: 'HIGH', population: 11200, populationFormatted: '11,200', density: '3,100/km²', exposure: 'Isolated marine coral island microclimate' },
  { name: 'Rameswaram', subtext: 'Pamban Island Coastal Tip', state: 'Tamil Nadu', latitude: 9.2876, longitude: 79.3129, category: 'remote', riskTag: 'HIGH', population: 45000, populationFormatted: '45,000', density: '2,800/km²', exposure: 'Pilgrim pedestrian exposure & maritime humidity' },
  { name: 'Kanyakumari', subtext: 'Southernmost Cape', state: 'Tamil Nadu', latitude: 8.0883, longitude: 77.5385, category: 'remote', riskTag: 'MODERATE', population: 30000, populationFormatted: '30,000', density: '3,000/km²', exposure: 'Tri-sea convergence high ocean humidity' },
  { name: 'Shimla', subtext: 'Lower Himalayas Ridge', state: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734, category: 'remote', riskTag: 'LOW', population: 170000, populationFormatted: '170,000', density: '4,800/km²', exposure: 'Steep hill walking exertion under mountain sun' },
  { name: 'Srinagar', subtext: 'Kashmir Valley', state: 'Jammu & Kashmir', latitude: 34.0837, longitude: 74.7973, category: 'remote', riskTag: 'LOW', population: 1200000, populationFormatted: '1.2 Million', density: '4,100/km²', exposure: 'Valley basin microclimate' },
];

export const LocationSearch = ({ onSelectLocation, selectedLocation, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef(null);

  const filteredLocations = ALL_LOCATIONS.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    if (!matchesCategory) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q) ||
      (item.subtext && item.subtext.toLowerCase().includes(q)) ||
      (item.exposure && item.exposure.toLowerCase().includes(q))
    );
  }).slice(0, 12);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    if (onSelectLocation) {
      onSelectLocation(item);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % Math.max(1, filteredLocations.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + filteredLocations.length) % Math.max(1, filteredLocations.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredLocations[highlightIndex]) {
        handleSelect(filteredLocations[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'EXTREME': return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      case 'VERY HIGH': return 'bg-rose-950/80 text-rose-300 border-rose-500/40';
      case 'HIGH': return 'bg-orange-950/80 text-orange-300 border-orange-500/40';
      case 'MODERATE': return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      default: return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div ref={containerRef} className={`relative z-30 ${className}`}>
      {/* Search Bar Input Container */}
      <div className="glass-panel p-2.5 rounded-2xl border border-slate-800 shadow-xl bg-slate-950/90 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 px-2.5 py-1">
          <Search className="h-4 w-4 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search Indian wards, cities, remote regions with population (e.g. Dharavi, Gajuwaka, Phalodi, Whitefield, Delhi)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 px-2 pt-2.5 border-t border-slate-800/80 overflow-x-auto text-[11px] font-mono no-scrollbar">
          {[
            { id: 'all', label: 'All India', icon: Compass },
            { id: 'wards', label: 'Municipal Wards (India)', icon: Building2 },
            { id: 'hotspots', label: 'Heat Hotspots', icon: Flame },
            { id: 'metros', label: 'Metros & Cities', icon: MapPin },
            { id: 'remote', label: 'Remote & Arid', icon: ShieldAlert },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setCategory(id);
                setIsOpen(true);
                setHighlightIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                category === id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Access Badges Underneath Search with Population Indicator */}
      <div className="flex items-center gap-2 mt-2 px-1 text-[11px] text-slate-400 overflow-x-auto no-scrollbar">
        <span className="font-mono uppercase tracking-wider text-[10px] text-slate-500">Popular:</span>
        {[
          { name: 'Gajuwaka Ward (72k)', item: ALL_LOCATIONS[0] },
          { name: 'Dharavi Ward (599k)', item: ALL_LOCATIONS.find((l) => l.name.includes('Dharavi')) },
          { name: 'Chandni Chowk (210k)', item: ALL_LOCATIONS.find((l) => l.name.includes('Chandni Chowk')) },
          { name: 'Whitefield (142k)', item: ALL_LOCATIONS.find((l) => l.name.includes('Whitefield')) },
          { name: 'Phalodi 51°C (58k)', item: ALL_LOCATIONS.find((l) => l.name === 'Phalodi') },
          { name: 'Ramagundam (250k)', item: ALL_LOCATIONS.find((l) => l.name === 'Ramagundam') },
          { name: 'New Delhi (33M)', item: ALL_LOCATIONS.find((l) => l.name === 'New Delhi') },
        ].filter(Boolean).map(({ name, item }) => (
          <button
            key={name}
            type="button"
            onClick={() => handleSelect(item)}
            className="px-2.5 py-0.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 whitespace-nowrap transition flex items-center gap-1"
          >
            <span>{name}</span>
          </button>
        ))}
      </div>

      {/* Autocomplete Dropdown List with Population Metrics */}
      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-dark-950/95 border border-slate-800/90 shadow-2xl backdrop-blur-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="p-2 space-y-1.5">
            {filteredLocations.map((loc, idx) => (
              <button
                key={`${loc.name}-${loc.state}-${idx}`}
                type="button"
                onClick={() => handleSelect(loc)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition ${
                  highlightIndex === idx
                    ? 'bg-slate-850 border border-cyan-500/40 text-white shadow-md'
                    : 'hover:bg-slate-900/60 text-slate-300 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 mt-0.5">
                    {loc.isWard ? <Building2 className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">{loc.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {loc.state}
                      </span>
                      {loc.isWard && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                          Ward
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{loc.subtext}</p>
                    {loc.exposure && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 italic">
                        {loc.exposure}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {/* Population Display Tag */}
                  {loc.populationFormatted && (
                    <div className="flex items-center gap-1 text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                      <Users className="h-3 w-3 text-cyan-400" />
                      <span>{loc.populationFormatted} pop</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {loc.riskTag && (
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${getRiskColor(loc.riskTag)}`}>
                        {loc.riskTag}
                      </span>
                    )}
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
