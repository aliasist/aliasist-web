import React, { useRef, useMemo, useState, useEffect, createContext, useContext } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sphere, Html, Line } from '@react-three/drei';
import type { DataCenter } from '../lib/api';
import { useUSGSEarthquakes } from '../lib/useUSGSEarthquakes';
import { useOpenSkyAircraft } from '../lib/useOpenSkyAircraft';
import { useISS } from '../lib/useISS';

// ── LAYER MANAGEMENT ─────────────────────────────────────────────────────────

interface Layers {
  dataCenters: boolean;
  cables: boolean;
  ixps: boolean;
  satellites: boolean;
  scanLine: boolean;
  riskMode: boolean;
  earthquakes: boolean;
  aircraft: boolean;
  iss: boolean;
}

const LayerContext = createContext<{ layers: Layers; setLayers: React.Dispatch<React.SetStateAction<Layers>> } | null>(null);

export const useLayers = () => {
  const context = useContext(LayerContext);
  if (!context) throw new Error('useLayers must be used within a LayerProvider');
  return context;
};

// ── GLOBE COMPONENT ──────────────────────────────────────────────────────────

const Globe = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([]);
  const [cables, setCables] = useState<any>(null);
  const [ixps, setIxps] = useState<any[]>([]);
  const [waterRisk, setWaterRisk] = useState<any[]>([]);
  const { layers } = useLayers();
  const { quakes } = useUSGSEarthquakes();
  const { aircraft } = useOpenSkyAircraft();
  const { iss: issPosition } = useISS();
  
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: layers.riskMode ? "#1a0505" : "#020808",
    roughness: 0.2,
    metalness: 0.9,
    transparent: true,
    opacity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  }), [layers.riskMode]);

  useEffect(() => {
    // Import dynamically to avoid circular dependency issues if api.ts is updated
    import('../lib/api').then(({ fetchFacilities, fetchCables, fetchIXPs, fetchWaterRisk }) => {
      Promise.all([fetchFacilities(), fetchCables(), fetchIXPs(), fetchWaterRisk()])
        .then(([dcData, cableData, ixData, riskData]) => {
          setDataCenters(dcData.filter((d: any) => d.lat && d.lng).slice(0, 150));
          setCables(cableData);
          setIxps(ixData.slice(0, 300));
          setWaterRisk(riskData);
        });
    });
  }, []);

  return (
    <group>
      {/* The Core Energy */}
      <Sphere args={[1.7, 32, 32]}>
        <meshBasicMaterial color={layers.riskMode ? "#ff2a2a" : "#00ffcc"} transparent opacity={0.03} />
      </Sphere>

      {/* Main Globe Body */}
      <mesh ref={globeRef} receiveShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Infrastructure Layers */}
      {layers.cables && cables && <SubmarineCables data={cables} isRiskMode={layers.riskMode} />}
      {layers.ixps && ixps.length > 0 && <IXPBeacons data={ixps} isRiskMode={layers.riskMode} />}
      {layers.dataCenters && dataCenters.map((dc) => (
        <Monolith key={dc.id} dc={dc} riskData={waterRisk.find(r => r.country === dc.country || r.iso_a3 === dc.country)} isRiskMode={layers.riskMode} />
      ))}
      {layers.satellites && <SatelliteShell count={1200} isRiskMode={layers.riskMode} />}
      {layers.scanLine && <ScanLine isRiskMode={layers.riskMode} />}
      {layers.earthquakes && <EarthquakeLayer quakes={quakes} />}
      {layers.aircraft && <AircraftLayer aircraft={aircraft} />}
      {layers.iss && issPosition && <ISSLayer position={issPosition} />}

      {/* Atmospheric Halo */}
      <Sphere args={[2.4, 64, 64]}>
        <meshPhongMaterial
          color={layers.riskMode ? "#ff2a2a" : "#10b981"}
          transparent
          opacity={0.01}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
};

const EarthquakeLayer = ({ quakes }: { quakes: any[] }) => {
  return (
    <group>
      {quakes.map((q) => {
        const lat = q.lat;
        const lon = q.lon;
        const r = 2.01;
        const phi = (lat * Math.PI) / 180;
        const theta = (lon * Math.PI) / 180;
        const pos: [number, number, number] = [
          r * Math.cos(phi) * Math.cos(theta),
          r * Math.sin(phi),
          -r * Math.cos(phi) * Math.sin(theta)
        ];
        
        // Size and color based on magnitude
        const size = Math.max(0.01, (q.magnitude - 2) * 0.015);
        const color = q.magnitude > 5 ? "#ff0000" : q.magnitude > 4 ? "#ffa500" : "#ffff00";

        return (
          <mesh key={q.id} position={pos}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
};

const AircraftLayer = ({ aircraft }: { aircraft: any[] }) => {
  return (
    <group>
      {aircraft.map((a) => {
        const lat = a.lat;
        const lon = a.lon;
        // Aircraft fly slightly above surface
        const r = 2.05 + (a.altitude / 100000); 
        const phi = (lat * Math.PI) / 180;
        const theta = (lon * Math.PI) / 180;
        const pos: [number, number, number] = [
          r * Math.cos(phi) * Math.cos(theta),
          r * Math.sin(phi),
          -r * Math.cos(phi) * Math.sin(theta)
        ];

        return (
          <mesh key={a.icao24} position={pos}>
            <boxGeometry args={[0.005, 0.005, 0.01]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

const ISSLayer = ({ position }: { position: { lat: number, lon: number } }) => {
  const r = 2.4; // ISS altitude
  const phi = (position.lat * Math.PI) / 180;
  const theta = (position.lon * Math.PI) / 180;
  const pos: [number, number, number] = [
    r * Math.cos(phi) * Math.cos(theta),
    r * Math.sin(phi),
    -r * Math.cos(phi) * Math.sin(theta)
  ];

  return (
    <group position={pos}>
      <mesh>
        <octahedronGeometry args={[0.03, 0]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={5} />
      </mesh>
      <Html distanceFactor={10} position={[0, 0.1, 0]}>
        <div className="px-2 py-1 bg-black/80 backdrop-blur-md border border-[#00ffcc]/40 rounded text-[8px] font-mono text-[#00ffcc] whitespace-nowrap uppercase tracking-widest font-black shadow-[0_0_20px_#00ffcc]">
          ISS // LIVE
        </div>
      </Html>
    </group>
  );
};

// ── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const SubmarineCables = ({ data, isRiskMode }: { data: any, isRiskMode?: boolean }) => {
  const cablePaths = useMemo(() => {
    if (!data || !data.features) return [];
    return data.features.slice(0, 350).map((feature: any) => {
      const coords = feature.geometry.coordinates;
      const type = feature.geometry.type;
      
      const getPoints = (lineCoords: [number, number][]) => {
        return lineCoords.map(([lng, lat]) => {
          const r = 2.005;
          const phi = (lat * Math.PI) / 180;
          const theta = (lng * Math.PI) / 180;
          return new THREE.Vector3(
            r * Math.cos(phi) * Math.cos(theta),
            r * Math.sin(phi),
            -r * Math.cos(phi) * Math.sin(theta)
          );
        });
      };

      if (type === "LineString") return [getPoints(coords)];
      if (type === "MultiLineString") return coords.map((c: any) => getPoints(c));
      return [];
    }).flat();
  }, [data]);

  return (
    <group>
      {cablePaths.map((path: any, i: number) => (
        <Line
          key={i}
          points={path}
          color={isRiskMode ? "#ff5555" : "#00f2ff"}
          lineWidth={0.3}
          transparent
          opacity={isRiskMode ? 0.05 : 0.15}
        />
      ))}
    </group>
  );
};

const IXPBeacons = ({ data, isRiskMode }: { data: any[], isRiskMode?: boolean }) => {
  return (
    <group>
      {data.map((ix, i) => {
        const lat = Number(ix.latitude);
        const lon = Number(ix.longitude);
        if (isNaN(lat) || isNaN(lon)) return null;
        
        const r = 2.01;
        const phi = (lat * Math.PI) / 180;
        const theta = (lon * Math.PI) / 180;
        const pos: [number, number, number] = [
          r * Math.cos(phi) * Math.cos(theta),
          r * Math.sin(phi),
          -r * Math.cos(phi) * Math.sin(theta)
        ];

        return (
          <mesh key={i} position={pos}>
            <octahedronGeometry args={[0.008, 0]} />
            <meshBasicMaterial color={isRiskMode ? "#ffaaaa" : "#ffffff"} transparent opacity={isRiskMode ? 0.2 : 0.6} />
          </mesh>
        );
      })}
    </group>
  );
};

const Monolith = ({ dc, riskData, isRiskMode }: { dc: DataCenter, riskData?: any, isRiskMode?: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { position, rotation } = useMemo(() => {
    const lat = (dc.lat * Math.PI) / 180;
    const lng = (dc.lng * Math.PI) / 180;
    const r = 2;
    const x = r * Math.cos(lat) * Math.cos(lng);
    const y = r * Math.sin(lat);
    const z = -r * Math.cos(lat) * Math.sin(lng);
    const vec = new THREE.Vector3(x, y, z).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);
    return { position: [x, y, z] as [number, number, number], rotation: new THREE.Euler().setFromQuaternion(quaternion) };
  }, [dc.lat, dc.lng]);

  const height = Math.max(0.06, (dc.capacityMW || 100) / 1200);
  
  // Risk Mode Styling
  const isHighRisk = isRiskMode && riskData && riskData.water_stress_score > 4.0;
  const intensity = dc.intensity || Math.random() * 800;
  
  let color = intensity > 600 ? "#ff2a2a" : intensity > 400 ? "#ffa500" : "#00ffcc";
  if (isRiskMode) {
    color = isHighRisk ? "#ff0000" : "#333333";
  }

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * (isHighRisk ? 5 : 2.5) + dc.id) + 1) / 2;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = (hovered ? 6 : 1) + pulse * (isHighRisk ? 4 : 2);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh 
        ref={meshRef} 
        position={[0, height / 2, 0]} 
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.02, height, 0.02]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={color} 
          emissiveIntensity={1}
          metalness={1}
          roughness={0}
        />
      </mesh>
      
      {isHighRisk && (
        <mesh position={[0, height, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.6} wireframe />
        </mesh>
      )}
      
      {hovered && (
        <Html distanceFactor={6} position={[0, height + 0.15, 0]}>
          <div className="flex flex-col items-center pointer-events-none select-none animate-in fade-in zoom-in duration-300">
            <div className={`px-4 py-2 bg-black/90 backdrop-blur-3xl border ${isHighRisk ? 'border-red-500 shadow-[0_0_50px_rgba(255,0,0,0.8)]' : 'border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]'} rounded-xl text-[10px] font-mono text-white flex gap-5 items-center whitespace-nowrap`}>
              <div className="flex flex-col">
                <span className={`${isHighRisk ? 'text-red-500' : 'text-[#00ffcc]'} font-black tracking-widest uppercase text-[8px]`}>{dc.company}</span>
                <span className="text-white font-bold text-xs">{dc.name}</span>
                <span className="text-white/30 text-[8px] uppercase tracking-wider mt-0.5">{dc.country}</span>
              </div>
              
              {isRiskMode && riskData && (
                <>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-white/40 uppercase text-[8px] tracking-widest">Water Risk</span>
                    <span className={`font-black text-xl leading-tight ${isHighRisk ? 'text-red-500 animate-pulse' : 'text-white'} tracking-tighter`}>
                      {riskData.water_stress_score.toFixed(1)} <span className={`text-[10px] ${isHighRisk ? 'text-red-400' : 'text-[#00ffcc]/60'}`}>/ 5.0</span>
                    </span>
                    <span className={`text-[8px] uppercase tracking-widest ${isHighRisk ? 'text-red-400 font-bold' : 'text-white/40'}`}>{riskData.water_stress_label}</span>
                  </div>
                </>
              )}
              
              {!isRiskMode && (
                <>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-white/40 uppercase text-[8px] tracking-widest">Load Factor</span>
                    <span className="font-black text-xl leading-tight text-white tracking-tighter">
                      {dc.capacityMW || '---'} <span className="text-[10px] text-[#00ffcc]/60">MW</span>
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className={`w-px h-10 bg-gradient-to-t from-transparent ${isHighRisk ? 'via-red-500/80 to-red-500/80' : 'via-[#00ffcc]/40 to-[#00ffcc]/40'}`} />
          </div>
        </Html>
      )}
    </group>
  );
};

const SatelliteShell = ({ count = 800, isRiskMode }: { count?: number, isRiskMode?: boolean }) => {
  const points = useMemo(() => {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.4 + Math.random() * 0.4;
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      pts[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pts[i * 3 + 2] = r * Math.cos(phi);
    }
    return pts;
  }, [count]);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ref.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color={isRiskMode ? "#ff5555" : "#ffffff"} size={0.015} transparent opacity={isRiskMode ? 0.1 : 0.3} sizeAttenuation />
    </points>
  );
};

const ScanLine = ({ isRiskMode }: { isRiskMode?: boolean }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.08, 64, 64]} />
      <meshBasicMaterial 
        color={isRiskMode ? "#ff0000" : "#00ffcc"} 
        transparent 
        opacity={isRiskMode ? 0.08 : 0.03} 
        wireframe
      />
    </mesh>
  );
};

export default Globe;
export { LayerContext };
