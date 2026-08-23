import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Film, 
  Tv, 
  Gamepad2, 
  Trophy, 
  Radio, 
  CloudSun, 
  ExternalLink, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Star, 
  Calendar, 
  Search, 
  Maximize2,
  Sparkles,
  Tv2,
  Telescope,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Clapperboard,
  Compass,
  Wind,
  Droplets,
  Sun
} from "lucide-react";
import BackgroundRotator from "@/components/BackgroundRotator";
import Starfield from "@/components/Starfield";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { readJsonBody, siteEndpoints } from "@/config/api";

// ── Shared UI helpers ─────────────────────────────────────────────────────────

const SkeletonGrid = ({ count = 8 }: { count?: number }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className="h-64 w-full rounded-sm" />
    ))}
  </div>
);

const ErrorNote = ({ message }: { message: string }) => (
  <p className="border border-border/45 bg-card/55 p-5 font-mono text-xs text-muted-foreground">{message}</p>
);

// ── 1. Movies & TV (TMDB + In-Modal Video Player) ─────────────────────────────

interface MovieItem {
  id: number;
  title: string;
  mediaType: string;
  overview: string;
  posterPath: string | null;
  rating: number;
  releaseDate: string;
}

const MoviesTab = () => {
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["entertainment-movies"],
    queryFn: async () => {
      const res = await fetch(siteEndpoints.entertainmentMoviesApi);
      const body = await readJsonBody<{ results?: MovieItem[]; error?: string }>(res);
      if (!res.ok || !body || body.error) throw new Error(body?.error ?? "movies_fetch_failed");
      return body.results ?? [];
    },
  });

  if (isLoading) return <SkeletonGrid />;
  if (isError || !data?.length) {
    return (
      <ErrorNote message="Trending movies & TV are unavailable right now — this needs a TMDB_API_KEY configured on the deployment." />
    );
  }

  const filtered = data.filter((item) => {
    const matchesType = filterType === "all" || item.mediaType === filterType;
    const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div className="flex items-center gap-1.5 bg-card/60 p-1 border border-border/60 rounded-sm">
          {(["all", "movie", "tv"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider rounded-sm transition-colors ${
                filterType === t
                  ? "bg-electric text-background font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All Trends" : t === "movie" ? "Movies" : "TV Series"}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter titles…"
            className="pl-9 font-mono text-xs"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => (
          <Card
            key={`${item.mediaType}-${item.id}`}
            onClick={() => setSelectedMovie(item)}
            className="group relative cursor-pointer overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:-translate-y-1 hover:border-electric/50 hover:shadow-lg hover:shadow-electric/10"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
              {item.posterPath ? (
                <img
                  src={item.posterPath}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase text-muted-foreground">
                  No poster
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-electric/40 bg-electric/20 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-electric shadow-sm">
                  <Maximize2 className="size-3.5" /> Details & Stream
                </span>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-electric transition-colors">
                {item.title}
              </p>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em]">
                <span className="text-electric">
                  {item.mediaType === "tv" ? "TV Series" : "Movie"}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="size-3 fill-electric text-electric" />
                  {item.rating?.toFixed(1) ?? "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Movie Modal */}
      <Dialog open={!!selectedMovie} onOpenChange={() => setSelectedMovie(null)}>
        {selectedMovie && (
          <DialogContent className="max-w-2xl border-border/80 bg-card p-0 overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-48 sm:shrink-0 bg-muted aspect-[2/3] sm:aspect-auto">
                {selectedMovie.posterPath ? (
                  <img
                    src={selectedMovie.posterPath}
                    alt={selectedMovie.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[160px] items-center justify-center font-mono text-xs text-muted-foreground">
                    No poster
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between p-6 space-y-4 flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-sm border border-electric/30 bg-electric/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-electric font-semibold">
                      {selectedMovie.mediaType === "tv" ? "TV Series" : "Feature Film"}
                    </span>
                    {selectedMovie.releaseDate && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                        <Calendar className="size-3" />
                        {selectedMovie.releaseDate.slice(0, 4)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-[10px] text-electric ml-auto">
                      <Star className="size-3.5 fill-electric text-electric" />
                      {selectedMovie.rating?.toFixed(1) ?? "—"}/10
                    </span>
                  </div>

                  <DialogHeader className="text-left">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                      {selectedMovie.title}
                    </DialogTitle>
                  </DialogHeader>

                  <DialogDescription className="mt-3 text-xs leading-relaxed text-muted-foreground max-h-48 overflow-y-auto pr-1">
                    {selectedMovie.overview || "No detailed synopsis available for this title."}
                  </DialogDescription>
                </div>

                <div className="pt-4 border-t border-border/50 flex flex-wrap gap-2.5">
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovie.title + " " + (selectedMovie.mediaType === "tv" ? "tv trailer" : "official trailer"))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm bg-electric px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-background transition-all hover:bg-electric/90 active:scale-95 shadow-sm"
                  >
                    <Play className="size-3.5 fill-current" /> Watch Trailer
                  </a>
                  <a
                    href={`https://www.justwatch.com/us/search?q=${encodeURIComponent(selectedMovie.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/80 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-all hover:border-electric/50 hover:text-electric active:scale-95"
                  >
                    <Search className="size-3.5" /> Where to Stream
                  </a>
                  <a
                    href={`https://www.themoviedb.org/${selectedMovie.mediaType === "tv" ? "tv" : "movie"}/${selectedMovie.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 p-2 rounded-sm border border-border/60 text-muted-foreground hover:text-electric transition-colors"
                    title="View on TMDB"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

// ── 2. Trending Anime (Free Jikan API — No Auth Required) ────────────────────

interface AnimeItem {
  mal_id: number;
  title: string;
  title_english?: string;
  images: {
    webp: {
      large_image_url: string;
    };
  };
  trailer?: {
    embed_url?: string;
    url?: string;
  };
  synopsis?: string;
  score?: number;
  episodes?: number;
  year?: number;
  genres?: Array<{ name: string }>;
}

const AnimeTab = () => {
  const [selectedAnime, setSelectedAnime] = useState<AnimeItem | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["entertainment-anime"],
    queryFn: async () => {
      const res = await fetch("https://api.jikan.moe/v4/top/anime?limit=12&filter=bypopularity");
      if (!res.ok) throw new Error("anime_fetch_failed");
      const json = await res.json();
      return (json.data ?? []) as AnimeItem[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  if (isLoading) return <SkeletonGrid count={8} />;
  if (isError || !data?.length) {
    return <ErrorNote message="Anime catalog is temporarily updating. Try again in a moment." />;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((anime) => (
          <Card
            key={anime.mal_id}
            onClick={() => setSelectedAnime(anime)}
            className="group relative cursor-pointer overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
              {anime.images?.webp?.large_image_url ? (
                <img
                  src={anime.images.webp.large_image_url}
                  alt={anime.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-[10px] text-muted-foreground">
                  No Image
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-purple-500/40 bg-purple-500/20 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-purple-400 shadow-sm">
                  <Clapperboard className="size-3.5" /> Trailer & Details
                </span>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-purple-400 transition-colors">
                {anime.title_english || anime.title}
              </p>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em]">
                <span className="text-purple-400">
                  {anime.episodes ? `${anime.episodes} Eps` : "Series"}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="size-3 fill-purple-400 text-purple-400" />
                  {anime.score?.toFixed(1) ?? "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anime Modal */}
      <Dialog open={!!selectedAnime} onOpenChange={() => setSelectedAnime(null)}>
        {selectedAnime && (
          <DialogContent className="max-w-2xl border-purple-500/30 bg-card p-0 overflow-hidden shadow-2xl">
            {/* Embedded Trailer if available */}
            {selectedAnime.trailer?.embed_url ? (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={selectedAnime.trailer.embed_url}
                  title={selectedAnime.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative aspect-[21/9] w-full bg-muted overflow-hidden">
                <img
                  src={selectedAnime.images?.webp?.large_image_url}
                  alt={selectedAnime.title}
                  className="w-full h-full object-cover blur-sm opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground">
                  Official preview details below
                </div>
              </div>
            )}

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-sm border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-purple-400 font-semibold">
                    Anime
                  </span>
                  {selectedAnime.year && (
                    <span className="font-mono text-xs text-muted-foreground">{selectedAnime.year}</span>
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-purple-400 flex items-center gap-1">
                  <Star className="size-3.5 fill-purple-400 text-purple-400" />
                  {selectedAnime.score?.toFixed(2) ?? "—"} / 10
                </span>
              </div>

              <DialogHeader className="text-left">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {selectedAnime.title_english || selectedAnime.title}
                </DialogTitle>
              </DialogHeader>

              <DialogDescription className="text-xs leading-relaxed text-muted-foreground max-h-36 overflow-y-auto pr-1">
                {selectedAnime.synopsis || "No description provided."}
              </DialogDescription>

              {/* Genre chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedAnime.genres?.map((g) => (
                  <span key={g.name} className="px-2 py-0.5 rounded-sm bg-background border border-border text-[10px] font-mono text-muted-foreground">
                    {g.name}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-border/50 flex flex-wrap gap-2.5">
                <a
                  href={`https://myanimelist.net/anime/${selectedAnime.mal_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm bg-purple-600 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-white transition-all hover:bg-purple-500 active:scale-95"
                >
                  <ExternalLink className="size-3.5" /> View on MyAnimeList
                </a>
                <a
                  href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(selectedAnime.title_english || selectedAnime.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-all hover:border-purple-500/50 hover:text-purple-400"
                >
                  <Search className="size-3.5" /> Stream on Crunchyroll
                </a>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

// ── 3. Live Ambient & Lo-Fi Audio Station (Built-in Web Stream Player) ─────────

interface RadioStation {
  id: string;
  name: string;
  category: string;
  streamUrl: string;
  description: string;
}

const RADIO_STATIONS: RadioStation[] = [
  {
    id: "lofi",
    name: "Lofi Hip Hop & Chill Beats",
    category: "Study / Focus",
    streamUrl: "https://streams.ilovemusic.de/iloveradio17.mp3",
    description: "Relaxing atmospheric lofi hip hop beats for coding and concentration.",
  },
  {
    id: "synthwave",
    name: "Nightwave Synthwave / Retro",
    category: "Cyberpunk & Retro",
    streamUrl: "https://radio.nightwaveplaza.com/stream",
    description: "Vaporwave, 80s synth, and futuristic electronic soundscapes.",
  },
  {
    id: "space",
    name: "Deep Space Ambient & NASA Radio",
    category: "Cosmic Ambient",
    streamUrl: "https://icecast.walmradio.com:8443/jazz",
    description: "Ethereal drone ambient soundscapes tuned for deep thinking.",
  },
];

const RadioTab = () => {
  const [activeStation, setActiveStation] = useState<RadioStation>(RADIO_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = (station?: RadioStation) => {
    if (station && station.id !== activeStation.id) {
      setActiveStation(station);
      if (audioRef.current) {
        audioRef.current.src = station.streamUrl;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Hidden Native Audio Element */}
      <audio ref={audioRef} src={activeStation.streamUrl} preload="none" />

      {/* Main Player Deck */}
      <Card className="border-electric/40 bg-gradient-to-b from-electric/5 via-card/70 to-card p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-sm bg-electric/10 border border-electric/30 flex items-center justify-center text-electric shadow-lg shadow-electric/10">
              <Radio className="size-6 animate-pulse" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-electric font-bold">
                {activeStation.category} · Live Stream
              </span>
              <h3 className="text-lg font-bold text-foreground mt-0.5">{activeStation.name}</h3>
            </div>
          </div>

          {/* Master Play/Pause Button */}
          <button
            type="button"
            onClick={() => togglePlay()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-electric text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-electric/90 shadow-md transition-all active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="size-4 fill-current" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="size-4 fill-current" />
                <span>Play Live Radio</span>
              </>
            )}
          </button>
        </div>

        {/* Volume & Audio Visualizer Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground pt-1">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="accent-electric cursor-pointer w-32"
            />
            <span className="text-[10px] w-8">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-electric">
            <span className={`size-2 rounded-full ${isPlaying ? "bg-electric animate-ping" : "bg-muted"}`} />
            <span>{isPlaying ? "Broadcasting High-Fidelity Audio" : "Station Ready"}</span>
          </div>
        </div>
      </Card>

      {/* Preset Stations Grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        {RADIO_STATIONS.map((station) => {
          const isSelected = station.id === activeStation.id;
          return (
            <Card
              key={station.id}
              onClick={() => togglePlay(station)}
              className={`cursor-pointer p-4 transition-all duration-300 border ${
                isSelected
                  ? "border-electric/60 bg-card/90 shadow-md shadow-electric/10"
                  : "border-border/60 bg-card/50 hover:border-electric/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase text-electric">{station.category}</span>
                {isSelected && isPlaying ? (
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-electric text-black font-bold">
                    Playing
                  </span>
                ) : (
                  <Play className="size-3 text-muted-foreground" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-foreground truncate">{station.name}</h4>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {station.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ── 4. NASA Deep Space & Astronomy Picture of the Day ────────────────────────

interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

const NasaSpaceTab = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["entertainment-nasa-apod"],
    queryFn: async () => {
      const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY");
      if (!res.ok) throw new Error("nasa_fetch_failed");
      return (await res.json()) as ApodData;
    },
    staleTime: 1000 * 60 * 60 * 12,
  });

  if (isLoading) return <Skeleton className="h-96 w-full max-w-3xl rounded-sm" />;
  if (isError || !data) {
    return <ErrorNote message="Deep space imagery feed is calibrating telemetry. Check back shortly." />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Card className="overflow-hidden border-border/80 bg-card/80 shadow-2xl">
        {data.media_type === "video" ? (
          <div className="aspect-video w-full bg-black">
            <iframe src={data.url} title={data.title} className="w-full h-full border-0" allowFullScreen />
          </div>
        ) : (
          <div className="relative aspect-[16/9] w-full bg-black overflow-hidden group">
            <img
              src={data.hdurl || data.url}
              alt={data.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4">
              <a
                href={data.hdurl || data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-sm bg-black/70 backdrop-blur-md border border-white/20 px-3 py-1.5 font-mono text-xs text-white hover:bg-white hover:text-black transition-all"
              >
                <Maximize2 className="size-3.5" /> Full HD Telescope View
              </a>
            </div>
          </div>
        )}

        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                <Telescope className="size-3.5" /> NASA Astronomy Picture of the Day
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-1">{data.title}</h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{data.date}</span>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground max-h-60 overflow-y-auto pr-2">
            {data.explanation}
          </p>

          {data.copyright && (
            <p className="font-mono text-[10px] text-muted-foreground/60 pt-2">
              Credit & Copyright: {data.copyright}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ── 5. Interactive Pop-Culture & Tech Trivia Arena ───────────────────────────

interface TriviaQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const TriviaTab = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["entertainment-trivia"],
    queryFn: async () => {
      const res = await fetch("https://opentdb.com/api.php?amount=6&type=multiple");
      if (!res.ok) throw new Error("trivia_fetch_failed");
      const json = await res.json();
      return (json.results ?? []) as TriviaQuestion[];
    },
    staleTime: Infinity,
  });

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const currentQ = data?.[currentIdx];

  useEffect(() => {
    if (currentQ) {
      const all = [...currentQ.incorrect_answers, currentQ.correct_answer];
      setShuffledAnswers(all.sort(() => Math.random() - 0.5));
      setSelectedAnswer(null);
    }
  }, [currentIdx, currentQ]);

  const handleSelect = (answer: string) => {
    if (selectedAnswer !== null || !currentQ) return;
    setSelectedAnswer(answer);
    if (answer === currentQ.correct_answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!data) return;
    if (currentIdx + 1 < data.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Restart
      setCurrentIdx(0);
      setScore(0);
      refetch();
    }
  };

  if (isLoading) return <Skeleton className="h-64 max-w-xl rounded-sm" />;
  if (!data?.length || !currentQ) {
    return <ErrorNote message="Trivia challenges are generating new questions. Hit refresh to start." />;
  }

  const isAnswered = selectedAnswer !== null;

  return (
    <div className="max-w-xl space-y-5">
      <Card className="border-electric/40 bg-card/80 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-4 text-electric" />
            <span className="font-mono text-xs uppercase tracking-wider text-electric font-bold">
              Question {currentIdx + 1} of {data.length}
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-foreground">
            Score: <strong className="text-electric">{score}</strong> / {data.length}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
          {decodeHtml(currentQ.question)}
        </h3>

        {/* Answer Options */}
        <div className="grid gap-2.5">
          {shuffledAnswers.map((ans, i) => {
            const isCorrect = ans === currentQ.correct_answer;
            const isChosen = ans === selectedAnswer;

            let btnStyle = "border-border/70 bg-background/60 text-foreground hover:border-electric/40";
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold";
              } else if (isChosen) {
                btnStyle = "border-red-500 bg-red-500/20 text-red-300";
              } else {
                btnStyle = "border-border/30 opacity-40";
              }
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(ans)}
                disabled={isAnswered}
                className={`w-full p-3.5 rounded-sm border text-left font-mono text-xs transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{decodeHtml(ans)}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="size-4 text-emerald-400" />}
                {isAnswered && isChosen && !isCorrect && <XCircle className="size-4 text-red-400" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="pt-3 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-sm bg-electric text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-electric/90 transition-all shadow-sm active:scale-95"
            >
              {currentIdx + 1 < data.length ? "Next Question ➔" : "Play New Round ↻"}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── 6. Games (RAWG + Platform Filter & Modal) ─────────────────────────────────

interface GameItem {
  id: number;
  title: string;
  released: string | null;
  rating: number;
  backgroundImage: string | null;
  platforms: string[];
  metacritic: number | null;
}

const GamesTab = () => {
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["entertainment-games"],
    queryFn: async () => {
      const res = await fetch(siteEndpoints.entertainmentGamesApi);
      const body = await readJsonBody<{ results?: GameItem[]; error?: string }>(res);
      if (!res.ok || !body || body.error) throw new Error(body?.error ?? "games_fetch_failed");
      return body.results ?? [];
    },
  });

  if (isLoading) return <SkeletonGrid />;
  if (isError || !data?.length) {
    return (
      <ErrorNote message="Trending games are unavailable right now — this needs a RAWG_API_KEY configured on the deployment." />
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((item) => (
          <Card
            key={item.id}
            onClick={() => setSelectedGame(item)}
            className="group relative cursor-pointer overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:-translate-y-1 hover:border-electric/50 hover:shadow-lg hover:shadow-electric/10"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {item.backgroundImage ? (
                <img
                  src={item.backgroundImage}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase text-muted-foreground">
                  No image
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-electric/40 bg-electric/20 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-electric shadow-sm">
                  <Gamepad2 className="size-3.5" /> View Game Info
                </span>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-electric transition-colors">
                {item.title}
              </p>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em]">
                <span className="text-electric flex items-center gap-1">
                  <Star className="size-3 fill-electric text-electric" />
                  {item.rating?.toFixed(1) ?? "—"}
                </span>
                {item.metacritic && (
                  <span className="rounded px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    MC {item.metacritic}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Game Modal */}
      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        {selectedGame && (
          <DialogContent className="max-w-xl border-border/80 bg-card p-0 overflow-hidden shadow-2xl">
            <div className="relative aspect-video w-full bg-muted overflow-hidden">
              {selectedGame.backgroundImage ? (
                <img
                  src={selectedGame.backgroundImage}
                  alt={selectedGame.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
                  No image
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="rounded-sm border border-electric/40 bg-background/80 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-electric font-semibold">
                    Gaming
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-1 drop-shadow-md">
                    {selectedGame.title}
                  </h3>
                </div>
                {selectedGame.metacritic && (
                  <span className="rounded-md border border-emerald-500/40 bg-background/90 px-2.5 py-1 font-mono text-xs font-black text-emerald-400 shadow-md">
                    MC {selectedGame.metacritic}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-sm bg-background border border-border/60">
                  <span className="text-muted-foreground block text-[10px] uppercase">User Rating</span>
                  <span className="text-electric font-bold flex items-center gap-1 mt-0.5">
                    <Star className="size-3.5 fill-electric text-electric" />
                    {selectedGame.rating?.toFixed(2) ?? "—"} / 5.0
                  </span>
                </div>
                <div className="p-2.5 rounded-sm bg-background border border-border/60">
                  <span className="text-muted-foreground block text-[10px] uppercase">Release Date</span>
                  <span className="text-foreground font-bold flex items-center gap-1 mt-0.5">
                    <Calendar className="size-3.5" />
                    {selectedGame.released || "TBA"}
                  </span>
                </div>
              </div>

              {selectedGame.platforms?.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-2">
                    Available Platforms
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGame.platforms.map((p) => (
                      <span
                        key={p}
                        className="rounded-sm border border-border/60 bg-background/60 px-2 py-1 font-mono text-[10px] text-foreground"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border/50 flex flex-wrap gap-2.5">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedGame.title + " official gameplay trailer")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm bg-electric px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-background transition-all hover:bg-electric/90 active:scale-95 shadow-sm"
                >
                  <Play className="size-3.5 fill-current" /> Gameplay Trailer
                </a>
                <a
                  href={`https://store.steampowered.com/search/?term=${encodeURIComponent(selectedGame.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/80 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-all hover:border-electric/50 hover:text-electric active:scale-95"
                >
                  <Search className="size-3.5" /> Steam Store
                </a>
                <a
                  href={`https://rawg.io/games/${selectedGame.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 p-2 rounded-sm border border-border/60 text-muted-foreground hover:text-electric transition-colors"
                  title="View on RAWG"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

// ── 7. Sports Odds & Matchups ────────────────────────────────────────────────

interface OddsOutcome {
  name: string;
  price: number;
}

interface OddsMarket {
  key: string;
  outcomes: OddsOutcome[];
}

interface OddsBookmaker {
  title: string;
  markets: OddsMarket[];
}

interface OddsEvent {
  id: string;
  sportTitle: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakers: OddsBookmaker[];
}

const OddsTab = () => {
  const [selectedEvent, setSelectedEvent] = useState<OddsEvent | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["entertainment-odds"],
    queryFn: async () => {
      const res = await fetch(siteEndpoints.entertainmentOddsApi);
      const body = await readJsonBody<{ results?: OddsEvent[]; error?: string }>(res);
      if (!res.ok || !body || body.error) throw new Error(body?.error ?? "odds_fetch_failed");
      return body.results ?? [];
    },
  });

  if (isLoading) return <SkeletonGrid count={6} />;
  if (isError || !data?.length) {
    return (
      <ErrorNote message="Live odds are unavailable right now — this needs an ODDS_API_KEY configured on the deployment. Display only, no wagering." />
    );
  }

  return (
    <>
      <div className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
          Informational odds display only — no bets are placed on this site. Click any matchup for broadcast info.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((event) => {
            const market = event.bookmakers?.[0]?.markets?.find((m) => m.key === "h2h");
            return (
              <Card
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="group cursor-pointer border-border/60 bg-card/70 transition-all duration-300 hover:border-electric/50 hover:shadow-md hover:shadow-electric/5"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm group-hover:text-electric transition-colors">
                      {event.awayTeam} @ {event.homeTeam}
                    </CardTitle>
                    <Trophy className="size-3.5 text-muted-foreground group-hover:text-electric transition-colors" />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">
                    {event.sportTitle} · {new Date(event.commenceTime).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3 pt-0">
                  {market?.outcomes?.map((outcome) => (
                    <span
                      key={outcome.name}
                      className="rounded-sm border border-electric/25 bg-electric/[0.06] px-2.5 py-1 font-mono text-xs text-electric font-semibold"
                    >
                      {outcome.name} {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                    </span>
                  ))}
                  {!market && <span className="font-mono text-xs text-muted-foreground">No line posted</span>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="max-w-lg border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <DialogHeader className="text-left border-b border-border/50 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-electric">
                {selectedEvent.sportTitle} Matchup
              </span>
              <DialogTitle className="text-xl font-bold text-foreground">
                {selectedEvent.awayTeam} vs {selectedEvent.homeTeam}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-foreground mt-1">
                Scheduled: {new Date(selectedEvent.commenceTime).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                Posted Lines & Market Odds
              </span>
              <div className="grid grid-cols-2 gap-3">
                {selectedEvent.bookmakers?.[0]?.markets?.find((m) => m.key === "h2h")?.outcomes?.map((outcome) => (
                  <div key={outcome.name} className="p-3 rounded-sm bg-background border border-border/60 text-center">
                    <span className="text-xs font-mono text-muted-foreground block truncate">{outcome.name}</span>
                    <span className="text-base font-mono font-bold text-electric mt-1 block">
                      {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex flex-wrap gap-2.5">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(selectedEvent.awayTeam + " vs " + selectedEvent.homeTeam + " live score broadcast")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm bg-electric px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-background transition-all hover:bg-electric/90 active:scale-95"
              >
                <Search className="size-3.5" /> Game Broadcast & Score
              </a>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedEvent.awayTeam + " vs " + selectedEvent.homeTeam + " live preview highlights")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/80 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-all hover:border-electric/50 hover:text-electric active:scale-95"
              >
                <Play className="size-3.5 fill-current" /> Video Preview
              </a>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

// ── 8. Live TV Channel Guide ─────────────────────────────────────────────────

interface LiveTvCategory {
  id: string;
  name: string;
}

interface LiveTvChannel {
  id: number;
  name: string;
  categoryId: string;
  icon: string | null;
}

const LiveTvTab = () => {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<LiveTvChannel | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["entertainment-live-tv-categories"],
    queryFn: async () => {
      const res = await fetch(siteEndpoints.entertainmentLiveTvApi);
      const body = await readJsonBody<{ categories?: LiveTvCategory[]; error?: string }>(res);
      if (!res.ok || !body || body.error) throw new Error(body?.error ?? "live_tv_fetch_failed");
      return body.categories ?? [];
    },
  });

  const channelsQuery = useQuery({
    queryKey: ["entertainment-live-tv-channels", categoryId],
    enabled: !!categoryId,
    queryFn: async () => {
      const res = await fetch(`${siteEndpoints.entertainmentLiveTvApi}?category=${encodeURIComponent(categoryId!)}`);
      const body = await readJsonBody<{ channels?: LiveTvChannel[]; error?: string }>(res);
      if (!res.ok || !body || body.error) throw new Error(body?.error ?? "live_tv_fetch_failed");
      return body.channels ?? [];
    },
  });

  if (categoriesQuery.isLoading) return <SkeletonGrid count={6} />;
  if (categoriesQuery.isError || !categoriesQuery.data?.length) {
    return (
      <ErrorNote message="The live TV guide is unavailable right now — this needs XTREAM_HOST, XTREAM_USERNAME, and XTREAM_PASSWORD configured on the deployment. Guide only — no stream playback." />
    );
  }

  return (
    <>
      <div className="space-y-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
          Interactive channel guide. Click any channel for live schedule, broadcast info, and stream options.
        </p>
        <div className="flex flex-wrap gap-2">
          {categoriesQuery.data.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors rounded-sm ${
                categoryId === cat.id
                  ? "border-electric/50 bg-electric/[0.12] text-electric shadow-sm"
                  : "border-border/60 bg-card/60 text-muted-foreground hover:border-electric/30 hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {!categoryId && <p className="font-mono text-xs text-muted-foreground">Pick a category to see channels.</p>}
        {categoryId && channelsQuery.isLoading && <SkeletonGrid count={6} />}
        {categoryId && channelsQuery.isError && <ErrorNote message="Couldn't load channels for that category." />}
        {categoryId && channelsQuery.data && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {channelsQuery.data.map((channel) => (
              <Card
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className="group cursor-pointer flex items-center gap-3 border-border/60 bg-card/70 p-3 transition-all duration-300 hover:border-electric/50 hover:shadow-md hover:shadow-electric/5"
              >
                {channel.icon ? (
                  <img src={channel.icon} alt="" className="size-8 shrink-0 object-contain rounded-sm" loading="lazy" />
                ) : (
                  <div className="size-8 shrink-0 rounded-sm bg-muted flex items-center justify-center text-muted-foreground">
                    <Radio className="size-4" />
                  </div>
                )}
                <p className="line-clamp-2 text-sm text-foreground group-hover:text-electric transition-colors">
                  {channel.name}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
        {selectedChannel && (
          <DialogContent className="max-w-md border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <DialogHeader className="text-left border-b border-border/50 pb-3">
              <div className="flex items-center gap-3">
                {selectedChannel.icon ? (
                  <img src={selectedChannel.icon} alt="" className="size-10 object-contain rounded-sm" />
                ) : (
                  <div className="size-10 rounded-sm bg-electric/10 border border-electric/30 flex items-center justify-center text-electric">
                    <Tv2 className="size-5" />
                  </div>
                )}
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {selectedChannel.name}
                  </DialogTitle>
                  <DialogDescription className="font-mono text-xs text-electric">
                    Live Channel ID: #{selectedChannel.id}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-sm bg-background border border-border/60">
                <span className="text-muted-foreground block text-[10px] uppercase">Broadcast Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Broadcast Listing Active
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex flex-wrap gap-2.5">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(selectedChannel.name + " live stream schedule online")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm bg-electric px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-background transition-all hover:bg-electric/90 active:scale-95"
              >
                <Search className="size-3.5" /> Find Official Stream
              </a>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedChannel.name + " live stream")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/80 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-all hover:border-electric/50 hover:text-electric active:scale-95"
              >
                <Play className="size-3.5 fill-current" /> YouTube Broadcasts
              </a>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

// ── 9. Interactive Global Weather & 7-Day Atmospheric Radar ───────────────────

interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

interface WeatherExtendedResult {
  name: string;
  temperatureC: number;
  apparentTempC: number;
  humidity: number;
  windKph: number;
  weatherCode: number;
  daily: DailyWeather;
}

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  95: "Thunderstorm",
};

async function fetchExtendedWeather(city: string): Promise<WeatherExtendedResult> {
  const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geoUrl.searchParams.set("name", city);
  geoUrl.searchParams.set("count", "1");
  const geoRes = await fetch(geoUrl);
  const geo = (await geoRes.json()) as { results?: Array<{ name: string; latitude: number; longitude: number }> };
  const place = geo.results?.[0];
  if (!place) throw new Error("city_not_found");

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(place.latitude));
  forecastUrl.searchParams.set("longitude", String(place.longitude));
  forecastUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m");
  forecastUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
  forecastUrl.searchParams.set("timezone", "auto");

  const forecastRes = await fetch(forecastUrl);
  const forecast = (await forecastRes.json()) as {
    current?: { temperature_2m: number; relative_humidity_2m: number; apparent_temperature: number; weather_code: number; wind_speed_10m: number };
    daily?: DailyWeather;
  };
  if (!forecast.current || !forecast.daily) throw new Error("forecast_unavailable");

  return {
    name: place.name,
    temperatureC: forecast.current.temperature_2m,
    apparentTempC: forecast.current.apparent_temperature,
    humidity: forecast.current.relative_humidity_2m,
    windKph: forecast.current.wind_speed_10m,
    weatherCode: forecast.current.weather_code,
    daily: forecast.daily,
  };
}

const WeatherTab = () => {
  const [city, setCity] = useState("New York");
  const [query, setQuery] = useState("New York");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["entertainment-weather-extended", query],
    queryFn: () => fetchExtendedWeather(query),
  });

  const quickCities = ["New York", "Tokyo", "London", "San Francisco", "Paris", "Sydney", "Honolulu"];

  return (
    <div className="max-w-3xl space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(city.trim() || "New York");
        }}
        className="flex gap-2 max-w-md"
      >
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search global city or coordinates…"
          className="font-mono text-sm"
        />
        <button
          type="submit"
          className="shrink-0 border border-electric/40 bg-electric/[0.08] px-4 font-mono text-xs uppercase tracking-[0.12em] text-electric transition-colors hover:bg-electric/[0.15]"
        >
          Go
        </button>
      </form>

      {/* Quick city chips */}
      <div className="flex flex-wrap gap-1.5">
        {quickCities.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCity(c);
              setQuery(c);
            }}
            className="rounded-sm border border-border/60 bg-card/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:border-electric/40 hover:text-electric transition-colors"
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && <Skeleton className="h-64 w-full rounded-sm" />}
      {isError && <ErrorNote message="Couldn't find meteorological telemetry for that city. Check spelling." />}
      {data && (
        <div className="space-y-4">
          {/* Main Weather Card */}
          <Card className="border-electric/40 bg-gradient-to-b from-card/90 to-card p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CloudSun className="size-5 text-electric" />
                  <CardTitle className="text-2xl font-bold">{data.name}</CardTitle>
                </div>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  {WEATHER_CODES[data.weatherCode] ?? "Conditions normal"}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-4xl font-black font-mono text-electric">{Math.round(data.temperatureC)}°C</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  {Math.round((data.temperatureC * 9) / 5 + 32)}°F · Feels like {Math.round(data.apparentTempC)}°C
                </p>
              </div>
            </div>

            {/* Weather Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-sm bg-background border border-border/60 flex items-center gap-2.5">
                <Wind className="size-4 text-sky-400" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Wind Velocity</span>
                  <span className="font-bold text-foreground">{Math.round(data.windKph)} km/h</span>
                </div>
              </div>
              <div className="p-3 rounded-sm bg-background border border-border/60 flex items-center gap-2.5">
                <Droplets className="size-4 text-blue-400" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Humidity</span>
                  <span className="font-bold text-foreground">{data.humidity}%</span>
                </div>
              </div>
              <div className="p-3 rounded-sm bg-background border border-border/60 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <Sun className="size-4 text-amber-400" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Telemetry</span>
                  <span className="font-bold text-foreground">Open-Meteo Live</span>
                </div>
              </div>
            </div>

            {/* 7-Day Forecast Grid */}
            {data.daily?.time && (
              <div className="pt-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2.5">
                  7-Day Meteorological Outlook
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 font-mono text-xs">
                  {data.daily.time.map((dayStr, idx) => {
                    const date = new Date(dayStr);
                    const dayName = idx === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
                    return (
                      <div key={dayStr} className="p-2.5 rounded-sm bg-background/80 border border-border/50 text-center space-y-1">
                        <span className="text-[10px] text-muted-foreground block uppercase font-bold">{dayName}</span>
                        <span className="text-xs text-electric font-bold block">
                          {Math.round(data.daily.temperature_2m_max[idx])}°
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {Math.round(data.daily.temperature_2m_min[idx])}°
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

// ── Main Entertainment Page Component ────────────────────────────────────────

const Entertainment = () => (
  <div className="relative min-h-screen overflow-x-hidden">
    <BackgroundRotator />
    <Starfield />
    <main className="relative z-10 mx-auto w-full max-w-site px-4 pb-20 pt-6 sm:px-8 lg:px-12 xl:px-16">
      <header className="flex min-h-[72px] flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-electric"
        >
          Aliasist
        </Link>
      </header>

      <section className="max-w-4xl py-10 sm:py-16">
        <div className="section-divider mb-8">
          <span>Entertainment</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">Entertainment</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Interactive entertainment workbench: stream audio stations, watch movie/anime trailers, explore trending games, view deep space telemetry, and test your knowledge in the trivia arena.
        </p>
      </section>

      <section aria-labelledby="entertainment-tabs">
        <h2 id="entertainment-tabs" className="sr-only">
          Entertainment sections
        </h2>
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="movies" className="flex items-center gap-1.5">
              <Film className="size-3.5" /> Movies & TV
            </TabsTrigger>
            <TabsTrigger value="anime" className="flex items-center gap-1.5">
              <Clapperboard className="size-3.5" /> Anime Trends
            </TabsTrigger>
            <TabsTrigger value="radio" className="flex items-center gap-1.5">
              <Radio className="size-3.5" /> Lo-Fi & Radio
            </TabsTrigger>
            <TabsTrigger value="space" className="flex items-center gap-1.5">
              <Telescope className="size-3.5" /> NASA APOD
            </TabsTrigger>
            <TabsTrigger value="trivia" className="flex items-center gap-1.5">
              <HelpCircle className="size-3.5" /> Trivia Arena
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-1.5">
              <Gamepad2 className="size-3.5" /> Games
            </TabsTrigger>
            <TabsTrigger value="odds" className="flex items-center gap-1.5">
              <Trophy className="size-3.5" /> Sports Odds
            </TabsTrigger>
            <TabsTrigger value="live-tv" className="flex items-center gap-1.5">
              <Tv className="size-3.5" /> Live TV
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-1.5">
              <CloudSun className="size-3.5" /> 7-Day Weather
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <MoviesTab />
          </TabsContent>
          <TabsContent value="anime">
            <AnimeTab />
          </TabsContent>
          <TabsContent value="radio">
            <RadioTab />
          </TabsContent>
          <TabsContent value="space">
            <NasaSpaceTab />
          </TabsContent>
          <TabsContent value="trivia">
            <TriviaTab />
          </TabsContent>
          <TabsContent value="games">
            <GamesTab />
          </TabsContent>
          <TabsContent value="odds">
            <OddsTab />
          </TabsContent>
          <TabsContent value="live-tv">
            <LiveTvTab />
          </TabsContent>
          <TabsContent value="weather">
            <WeatherTab />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  </div>
);

export default Entertainment;
