const API_BASE = "https://data.aliasist.com";

export function dataApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
