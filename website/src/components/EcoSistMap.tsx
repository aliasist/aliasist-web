import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { RadarData } from '../types/storm';
import StormCamsLayer from './StormCamsLayer';
import CameraPanel from './CameraPanel';
import type { StormCam } from '../types/storm';

const OKC = { lat: 35.4676, lng: -97.5164 };

export default function EcoSistMap({
  weatherHub,
  radarData,
  radarFrameIndex,
  setRadarFrameIndex,
  radarPlaying,
}: {
  weatherHub?: { lat?: number; lng?: number } | null;
  radarData?: RadarData | null;
  radarFrameIndex: number;
  setRadarFrameIndex: (i: number) => void;
  radarPlaying: boolean;
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedCam, setSelectedCam] = useState<StormCam | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const center = [(weatherHub?.lng ?? OKC.lng), (weatherHub?.lat ?? OKC.lat)];
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: center as [number, number],
      zoom: 6,
    });

    mapRef.current = map;
    map.on('load', () => setMapReady(true));

    return () => map.remove();
  }, []); // init once

  // Recenter on weatherHub changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !weatherHub) return;
    map.easeTo({ center: [weatherHub.lng ?? OKC.lng, weatherHub.lat ?? OKC.lat], zoom: 8 });
  }, [weatherHub]);

  // Radar layer management
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !radarData || radarData.frames.length === 0) return;
    const sourceId = 'radar-tiles';
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'raster',
        tiles: [radarData.frames[radarFrameIndex].tileUrl],
        tileSize: radarData.tileSize || 256,
      } as any);
      map.addLayer({ id: 'radar-layer', type: 'raster', source: sourceId, paint: { 'raster-opacity': 0.8 } });
    } else {
      const src = map.getSource(sourceId) as any;
      try {
        src.tiles = [radarData.frames[radarFrameIndex].tileUrl];
        if (typeof src.setTiles === 'function') src.setTiles([radarData.frames[radarFrameIndex].tileUrl]);
      } catch (e) {
        // ignore
      }
    }
  }, [mapReady, radarData, radarFrameIndex]);

  // Radar animation loop (advances frame index when playing)
  useEffect(() => {
    if (!radarPlaying || !radarData) return;
    let raf: number | null = null;
    let last = 0;
    const loop = (t: number) => {
      if (!last) last = t;
      if (t - last > 800) { // advance every 800ms
        setRadarFrameIndex((radarFrameIndex + 1) % radarData.frames.length);
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [radarPlaying, radarData, radarFrameIndex, setRadarFrameIndex]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[600px] rounded-md overflow-hidden" />

      {mapRef.current && (
        <StormCamsLayer map={mapRef.current} onSelectCam={(c) => setSelectedCam(c)} />
      )}

      <div className="absolute left-4 top-4 p-2 bg-background/70 border border-border/30 rounded text-xs">
        <div>Live Chase Map</div>
      </div>

      <CameraPanel cam={selectedCam} onClose={() => setSelectedCam(null)} />
    </div>
  );
}
