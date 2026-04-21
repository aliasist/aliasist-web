import React from 'react';
import type { StormCam } from '../types/storm';

export default function CameraPanel({ cam, onClose }: { cam: StormCam | null; onClose: () => void }) {
  if (!cam) return null;
  return (
    <aside className="fixed right-4 top-16 w-96 bg-background/90 border border-border/30 rounded p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-mono text-electric text-sm uppercase">{cam.name}</h3>
          <p className="text-xs text-muted-foreground">{cam.city}, {cam.state} • {cam.provider}</p>
          <p className="text-xs text-muted-foreground mt-2">{cam.attribution}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
      </div>

      <div className="mt-3">
        {cam.embedUrl ? (
          <div className="aspect-video bg-black rounded overflow-hidden">
            <iframe title={cam.name} src={cam.embedUrl} className="w-full h-full" frameBorder={0} allowFullScreen />
          </div>
        ) : (
          <div className="h-56 bg-muted-800 flex items-center justify-center text-sm">No embed available</div>
        )}
      </div>

      <div className="mt-3 text-xs text-muted-foreground">Remember: Always follow NWS/NOAA guidance. Do not chase storms.</div>
    </aside>
  );
}
