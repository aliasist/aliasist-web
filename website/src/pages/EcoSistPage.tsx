import React, { useState } from 'react';
import EcoSistMap from '../components/EcoSistMap';
import StormCamsAdmin from '../components/StormCamsAdmin';

export default function EcoSistPage() {
  const [radarData, setRadarData] = useState(null);
  const [radarFrameIndex, setRadarFrameIndex] = useState(0);
  const [radarPlaying, setRadarPlaying] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // weatherHub would normally be loaded from /api/weather-hub
  const weatherHub = { lat: 35.4676, lng: -97.5164 };

  return (
    <main className="p-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">EcoSist — Oklahoma Storm Center</h1>
        <div className="flex gap-2">
          <button onClick={() => setRadarPlaying(!radarPlaying)} className="px-3 py-1 bg-electric text-black rounded">{radarPlaying ? 'Pause Radar' : 'Play Radar'}</button>
          <button onClick={() => setShowAdmin(!showAdmin)} className="px-3 py-1 bg-muted-800 border rounded">{showAdmin ? 'Close Admin' : 'Open Admin'}</button>
        </div>
      </header>

      <section>
        <EcoSistMap weatherHub={weatherHub} radarData={radarData} radarFrameIndex={radarFrameIndex} setRadarFrameIndex={setRadarFrameIndex} radarPlaying={radarPlaying} />
      </section>

      {showAdmin && (
        <section className="mt-4">
          <StormCamsAdmin />
        </section>
      )}

    </main>
  );
}
