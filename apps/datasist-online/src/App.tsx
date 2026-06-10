import { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import Globe, { LayerContext } from './components/Globe';
import { Globe as GlobeIcon, Database, AlertCircle, Radio, Cable, Plane, Navigation } from 'lucide-react';
import { useNOAASpaceWeather } from './lib/useNOAASpaceWeather';
import BrandSplashScreen from './components/brand/BrandSplashScreen';
import CowAbduction from './components/brand/CowAbduction';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showAbduction, setShowAbduction] = useState(false);
  const [layers, setLayers] = useState({
    dataCenters: true,
    cables: true,
    ixps: true,
    satellites: true,
    scanLine: true,
    riskMode: false,
    earthquakes: false,
    aircraft: false,
    iss: true,
  });

  const spaceWeather = useNOAASpaceWeather();
  const layerValue = useMemo(() => ({ layers, setLayers }), [layers]);

  return (
    <LayerContext.Provider value={layerValue}>
      <BrandSplashScreen onDismiss={() => setShowSplash(false)} />
      <CowAbduction open={showAbduction} onClose={() => setShowAbduction(false)} />
      
      {!showSplash && (
        <div className="h-screen w-full bg-[#050505] overflow-hidden relative font-sans selection:bg-emerald-500/30 animate-in fade-in duration-700">
          {/* ── HEADER OVERLAY ── */}
          <div className="absolute top-0 left-0 right-0 z-20 p-8 flex justify-between items-start pointer-events-none">
            <div className="pointer-events-auto group">
              <div className="flex items-center gap-4 mb-2">
                <button 
                  onClick={() => setShowAbduction(true)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 shadow-[0_0_30px_rgba(0,255,204,0.4)] group-hover:scale-110 active:scale-95 ${layers.riskMode ? 'bg-[#ff2a2a] shadow-[#ff2a2a]' : 'bg-[#00ffcc]'}`}
                >
                  <Database className="text-black w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-4xl font-black text-white tracking-[ -0.05em] uppercase italic leading-none">
                    DATA<span className={layers.riskMode ? "text-[#ff2a2a] transition-colors" : "text-[#00ffcc] transition-colors"}>SIST</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-[1px] w-6 ${layers.riskMode ? 'bg-[#ff2a2a]/40' : 'bg-[#00ffcc]/40'}`} />
                    <p className={`font-mono text-[9px] uppercase tracking-[0.4em] ${layers.riskMode ? 'text-[#ff2a2a]/80' : 'text-[#00ffcc]/60'}`}>
                      {layers.riskMode ? 'ENVIRONMENTAL RISK ASSESSMENT' : 'ULTIMATE INFRASTRUCTURE INTELLIGENCE'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          <div className="flex gap-4 pointer-events-auto">
            <div className="flex bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full p-1 shadow-2xl">
              {[
                { id: 'dataCenters', icon: Database, label: 'DC' },
                { id: 'cables', icon: Cable, label: 'CABLES' },
                { id: 'ixps', icon: GlobeIcon, label: 'IXP' },
                { id: 'satellites', icon: Radio, label: 'SAT' },
                { id: 'aircraft', icon: Plane, label: 'AIR' },
                { id: 'iss', icon: Navigation, label: 'ISS' },
                { id: 'earthquakes', icon: AlertCircle, label: 'QUAKE' },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setLayers(prev => ({ ...prev, [layer.id]: !prev[layer.id as keyof typeof prev] }))}
                  className={`px-4 py-2 rounded-full text-[9px] font-bold transition-all duration-300 flex items-center gap-2 tracking-widest ${
                    layers[layer.id as keyof typeof layers] 
                      ? (layers.riskMode ? 'bg-[#ff2a2a] text-black shadow-[0_0_15px_rgba(255,42,42,0.4)]' : 'bg-[#00ffcc] text-black shadow-[0_0_15px_rgba(0,255,204,0.4)]')
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <layer.icon className="w-3 h-3" />
                  {layer.label}
                </button>
              ))}
              <div className="w-px h-6 bg-white/20 mx-2 my-auto" />
              <button
                onClick={() => setLayers(prev => ({ ...prev, riskMode: !prev.riskMode }))}
                className={`px-4 py-2 rounded-full text-[9px] font-bold transition-all duration-300 flex items-center gap-2 tracking-widest ${
                  layers.riskMode 
                    ? 'bg-[#ff2a2a] text-white shadow-[0_0_20px_rgba(255,42,42,0.6)] animate-pulse' 
                    : 'text-[#ff2a2a]/60 hover:text-[#ff2a2a] border border-[#ff2a2a]/30'
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                RISK MODE
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM HUD ── */}
        <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end pointer-events-none">
          <div className="flex gap-6 pointer-events-auto">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-2xl w-56 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00ffcc] opacity-40" />
              <p className="text-white/30 text-[9px] font-mono uppercase tracking-[0.2em] mb-2">Global Grid Load</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tabular-nums">542.8</span>
                <span className="text-[10px] font-mono text-[#00ffcc] font-bold">GW</span>
              </div>
              <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00ffcc]/40 to-[#00ffcc] w-[72%] shadow-[0_0_10px_#00ffcc]" />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-2xl w-56 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-40" />
              <p className="text-white/30 text-[9px] font-mono uppercase tracking-[0.2em] mb-2">Avg. Grid Intensity</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tabular-nums">418</span>
                <span className="text-[10px] font-mono text-orange-400 font-bold">gCO2/kWh</span>
              </div>
              <p className="text-[8px] text-white/20 mt-3 font-mono uppercase tracking-widest leading-relaxed">
                Aggregated from <span className="text-white/40">Electricity Maps</span>
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-2xl w-56 shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full opacity-40 ${spaceWeather.kpIndex && spaceWeather.kpIndex > 4 ? 'bg-red-500' : 'bg-cyan-500'}`} />
              <p className="text-white/30 text-[9px] font-mono uppercase tracking-[0.2em] mb-2">Space Weather</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tabular-nums">{spaceWeather.kpIndex ?? '--'}</span>
                <span className="text-[10px] font-mono text-white/60 font-bold uppercase tracking-widest">{spaceWeather.kpLabel}</span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-[8px] text-white/20 font-mono uppercase tracking-widest">Solar Flux: <span className="text-white/40">{spaceWeather.solarFlux ?? '--'}</span></span>
                <div className={`w-1.5 h-1.5 rounded-full ${spaceWeather.kpIndex && spaceWeather.kpIndex > 4 ? 'bg-red-500 animate-ping' : 'bg-cyan-500'}`} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 pointer-events-auto">
            <div className="bg-[#00ffcc]/5 backdrop-blur-md border border-[#00ffcc]/10 px-4 py-2 rounded-lg">
              <p className="text-[10px] font-mono text-[#00ffcc]/60 uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffcc] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ffcc]"></span>
                </span>
                Live Infrastructure Feed: <span className="text-white font-bold italic">Synchronized</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── 3D CANVAS ── */}
        <div className="absolute inset-0 z-0">
          <Canvas shadows gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[0, 0, 5.5]} />
              <OrbitControls 
                enablePan={false}
                minDistance={3}
                maxDistance={12}
                autoRotate
                autoRotateSpeed={0.3}
                rotateSpeed={0.5}
              />
              
              <ambientLight intensity={0.4} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffcc" />
              
              <Globe />
              <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
            </Suspense>
          </Canvas>
        </div>

        {/* ── AMBIENT OVERLAYS ── */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(5,5,5,0.3)_70%,_rgba(5,5,5,1)_100%)]" />
        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20 blur-3xl opacity-50" />
      </div>
      )}
    </LayerContext.Provider>
  );
}

export default App;
