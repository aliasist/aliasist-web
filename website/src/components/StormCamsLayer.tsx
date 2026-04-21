import React, { useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { StormCam } from '../types/storm';

export default function StormCamsLayer({ map, onSelectCam }:
  { map: maplibregl.Map | null; onSelectCam: (cam: StormCam) => void }) {
  const [cams, setCams] = useState<StormCam[]>([]);
  useEffect(() => {
    let mounted = true;
    fetch('/api/storm-cams')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setCams(data.cameras || []);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!map) return;
    const markers: maplibregl.Marker[] = [];

    cams.forEach((cam) => {
      const el = document.createElement('div');
      el.className = 'w-6 h-6 rounded-full border-2 border-electric bg-black/80 flex items-center justify-center text-xs text-electric';
      el.style.cursor = 'pointer';
      el.innerHTML = '📷';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([cam.longitude, cam.latitude])
        .addTo(map);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectCam(cam);
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [map, cams, onSelectCam]);

  return null;
}
