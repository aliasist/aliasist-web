import React, { useEffect, useState } from 'react';
import type { StormCam } from '../types/storm';

export default function StormCamsAdmin() {
  const [token, setToken] = useState('');
  const [cams, setCams] = useState<StormCam[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<StormCam | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/storm-cams');
      const data = await res.json();
      setCams(data.cameras || []);
    } catch (e) {
      setError('Failed to load cameras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async (cam: Partial<StormCam>) => {
    setError(null);
    if (!token) return setError('Admin token required');
    try {
      const res = await fetch('/api/storm-cams', {
        method: cam.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(cam),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      await load();
      setEditing(null);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this camera?')) return;
    if (!token) return setError('Admin token required');
    try {
      const res = await fetch(`/api/storm-cams?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  return (
    <div className="p-4 bg-background/80 border border-border/30 rounded-md">
      <h3 className="font-mono text-electric uppercase text-sm">Storm Cams Admin</h3>
      <div className="mt-2 text-xs text-muted-foreground">Use an admin token to add or remove camera records. Token not stored.</div>

      <div className="mt-3 flex gap-2">
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Admin token" className="flex-1 px-2 py-1 bg-muted-900 border rounded" />
        <button onClick={() => { void load(); }} className="px-3 py-1 bg-electric text-black rounded">Reload</button>
      </div>

      {error && <div className="mt-2 text-xs text-destructive">{error}</div>}

      <div className="mt-3">
        <button onClick={() => setEditing({ id: '', name: '', latitude: 35.4676, longitude: -97.5164 })} className="px-3 py-1 bg-muted-800 border rounded text-xs">Add Camera</button>
      </div>

      <div className="mt-3 space-y-2 max-h-48 overflow-auto">
        {loading ? <div className="text-xs">Loading…</div> : cams.map(cam => (
          <div key={cam.id} className="p-2 bg-muted-900 border rounded flex items-center justify-between">
            <div className="text-xs">
              <div className="font-semibold">{cam.name}</div>
              <div className="text-[11px] text-muted-foreground">{cam.city}, {cam.state} • {cam.provider}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(cam)} className="text-xs px-2 py-1 bg-background border rounded">Edit</button>
              <button onClick={() => remove(cam.id)} className="text-xs px-2 py-1 bg-destructive text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-3 p-2 bg-muted-800 border rounded">
          <label className="text-xs">Name</label>
          <input className="w-full px-2 py-1 mt-1 mb-2 bg-background border rounded" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          <label className="text-xs">Provider</label>
          <input className="w-full px-2 py-1 mt-1 mb-2 bg-background border rounded" value={editing.provider || ''} onChange={(e) => setEditing({ ...editing, provider: e.target.value })} />
          <label className="text-xs">Embed URL</label>
          <input className="w-full px-2 py-1 mt-1 mb-2 bg-background border rounded" value={editing.embedUrl || ''} onChange={(e) => setEditing({ ...editing, embedUrl: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs">Latitude</label>
              <input className="w-full px-2 py-1 mt-1 bg-background border rounded" value={String(editing.latitude)} onChange={(e) => setEditing({ ...editing, latitude: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs">Longitude</label>
              <input className="w-full px-2 py-1 mt-1 bg-background border rounded" value={String(editing.longitude)} onChange={(e) => setEditing({ ...editing, longitude: Number(e.target.value) })} />
            </div>
          </div>
          <label className="text-xs mt-2">City</label>
          <input className="w-full px-2 py-1 mt-1 mb-2 bg-background border rounded" value={editing.city || ''} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
          <label className="text-xs">State</label>
          <input className="w-full px-2 py-1 mt-1 mb-2 bg-background border rounded" value={editing.state || ''} onChange={(e) => setEditing({ ...editing, state: e.target.value })} />

          <div className="flex gap-2 mt-2">
            <button onClick={() => save(editing)} className="px-3 py-1 bg-electric text-black rounded text-sm">Save</button>
            <button onClick={() => setEditing(null)} className="px-3 py-1 bg-background border rounded text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
