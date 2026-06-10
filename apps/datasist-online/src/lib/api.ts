const API_BASE = import.meta.env.VITE_API_URL || "https://data.aliasist.com";

export interface DataCenter {
  id: number;
  name: string;
  company: string;
  lat: number;
  lng: number;
  capacityMW: number;
  status: string;
  country: string;
  intensity?: number;
}

export async function fetchFacilities(): Promise<DataCenter[]> {
  try {
    const res = await fetch(`${API_BASE}/api/data-centers`);
    if (!res.ok) throw new Error("Failed to fetch facilities");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchGridSnapshot(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/grid/snapshot`);
    if (!res.ok) throw new Error("Failed to fetch grid snapshot");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchCables(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/infrastructure/cables`);
    if (!res.ok) throw new Error("Failed to fetch cables");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchIXPs(): Promise<any[]> {
  try {
    // Using Infrapedia raw mirror for IXPs
    const res = await fetch("https://raw.githubusercontent.com/infrapedia/api-infrapedia/master/public/map/ixps.json");
    if (!res.ok) throw new Error("Failed to fetch IXPs");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchWaterRisk(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/api/risk/water-stress`);
    if (!res.ok) throw new Error("Failed to fetch water stress data");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}
