
const RAWG_KEY = '0483913ae40d41f08200310c8b90395e';
const BASE     = 'https://api.rawg.io/api';


const cache = new Map<string, string>();


export async function fetchGameCover(titulo: string): Promise<string | null> {
  if (cache.has(titulo)) return cache.get(titulo)!;

  try {
    const res = await fetch(
      `${BASE}/games?key=${RAWG_KEY}&search=${encodeURIComponent(titulo)}&page_size=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const img = data.results?.[0]?.background_image ?? null;
    if (img) cache.set(titulo, img);
    return img;
  } catch {
    return null;
  }
}
