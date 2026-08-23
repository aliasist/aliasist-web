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
  HelpCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Clapperboard,
  Compass,
  Wind,
  Droplets,
  Sun,
  Joystick,
  RotateCcw,
  CloudRain,
  Coffee,
  Waves
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

// ── Curated High-Res Fallback Datasets ─────────────────────────────────────────

const CURATED_MOVIES: MovieItem[] = [
  {
    id: 693134,
    title: "Dune: Part Two",
    mediaType: "movie",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
    posterPath: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    rating: 8.3,
    releaseDate: "2024-03-01",
    trailerEmbed: "https://www.youtube.com/embed/Way9Dexny3w",
  },
  {
    id: 157336,
    title: "Interstellar",
    mediaType: "movie",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    posterPath: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: 8.7,
    releaseDate: "2014-11-05",
    trailerEmbed: "https://www.youtube.com/embed/zSWdZVtXT7E",
  },
  {
    id: 95396,
    title: "Severance",
    mediaType: "tv",
    overview: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.",
    posterPath: "https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg",
    rating: 8.5,
    releaseDate: "2022-02-18",
    trailerEmbed: "https://www.youtube.com/embed/xEQP4VVuyrY",
  },
  {
    id: 335984,
    title: "Blade Runner 2049",
    mediaType: "movie",
    overview: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
    posterPath: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    rating: 8.0,
    releaseDate: "2017-10-04",
    trailerEmbed: "https://www.youtube.com/embed/gCcx85zbxz4",
  },
  {
    id: 105248,
    title: "Cyberpunk: Edgerunners",
    mediaType: "tv",
    overview: "A street kid trying to survive in a technology and body modification-obsessed city of the future. Having everything to lose, he chooses to stay alive by becoming an edgerunner: a mercenary outlaw also known as a cyberpunk.",
    posterPath: "https://image.tmdb.org/t/p/w500/lqcDVZ8pyk08AVftMBildDR3QUK.jpg",
    rating: 8.6,
    releaseDate: "2022-09-13",
    trailerEmbed: "https://www.youtube.com/embed/JtqIas3bYhg",
  },
  {
    id: 872585,
    title: "Oppenheimer",
    mediaType: "movie",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    posterPath: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    rating: 8.1,
    releaseDate: "2023-07-19",
    trailerEmbed: "https://www.youtube.com/embed/uYPbbksJxIg",
  },
  {
    id: 106379,
    title: "Fallout",
    mediaType: "tv",
    overview: "The story of haves and have-nots in a world in which there's almost nothing left to have. 200 years after the apocalypse, the gentle denizens of luxury fallout shelters are forced to return to the irradiated hellscape their ancestors left behind.",
    posterPath: "https://image.tmdb.org/t/p/w500/c15BtJxCXMrISLVmysdsnZUPQft.jpg",
    rating: 8.4,
    releaseDate: "2024-04-10",
    trailerEmbed: "https://www.youtube.com/embed/voqG4iaATuA",
  },
  {
    id: 94605,
    title: "Arcane",
    mediaType: "tv",
    overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.",
    posterPath: "https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
    rating: 8.7,
    releaseDate: "2021-11-06",
    trailerEmbed: "https://www.youtube.com/embed/fXmAurh012s",
  }
];


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

const CURATED_ODDS: OddsEvent[] = [
  {
    id: "sample-nfl-1",
    sportTitle: "NFL",
    homeTeam: "Kansas City Chiefs",
    awayTeam: "Buffalo Bills",
    commenceTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    bookmakers: [
      { title: "Sample Odds", markets: [{ key: "h2h", outcomes: [{ name: "Kansas City Chiefs", price: -145 }, { name: "Buffalo Bills", price: 124 }] }] },
    ],
  },
  {
    id: "sample-nba-1",
    sportTitle: "NBA",
    homeTeam: "Boston Celtics",
    awayTeam: "Denver Nuggets",
    commenceTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    bookmakers: [
      { title: "Sample Odds", markets: [{ key: "h2h", outcomes: [{ name: "Boston Celtics", price: -180 }, { name: "Denver Nuggets", price: 155 }] }] },
    ],
  },
  {
    id: "sample-nfl-2",
    sportTitle: "NFL",
    homeTeam: "San Francisco 49ers",
    awayTeam: "Dallas Cowboys",
    commenceTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    bookmakers: [
      { title: "Sample Odds", markets: [{ key: "h2h", outcomes: [{ name: "San Francisco 49ers", price: -110 }, { name: "Dallas Cowboys", price: -110 }] }] },
    ],
  },
];

// ── 1. Movies & TV Tab (100% Resilient + In-App Cinema Trailer Streaming) ──────

interface MovieItem {
  id: number;
  title: string;
  mediaType: string;
  overview: string;
  posterPath: string | null;
  rating: number;
  releaseDate: string;
  trailerEmbed?: string;
}

const MoviesTab = () => {
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data } = useQuery({
    queryKey: ["entertainment-movies"],
    queryFn: async () => {
      try {
        const res = await fetch(siteEndpoints.entertainmentMoviesApi);
        const body = await readJsonBody<{ results?: MovieItem[]; error?: string }>(res);
        if (res.ok && body && !body.error && body.results?.length) {
          return body.results;
        }
      } catch (e) {
        // Fallback gracefully
      }
      return CURATED_MOVIES;
    },
    initialData: CURATED_MOVIES,
  });

  const displayList = data || CURATED_MOVIES;

  const filtered = displayList.filter((item) => {
    const matchesType = filterType === "all" || item.mediaType === filterType;
    const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // The trending list has no trailer data, and real (non-curated) items have
  // no trailerEmbed — fetch a real one on demand when the modal opens rather
  // than falling back to a fake YouTube search-embed URL, which no longer works.
  const trailerQuery = useQuery({
    queryKey: ["entertainment-movie-trailer", selectedMovie?.id, selectedMovie?.mediaType],
    queryFn: async () => {
      const media = selectedMovie!.mediaType === "tv" ? "tv" : "movie";
      const res = await fetch(
        `${siteEndpoints.entertainmentMovieTrailerApi}?id=${selectedMovie!.id}&media=${media}`,
      );
      const body = await readJsonBody<{ embedUrl?: string | null; error?: string }>(res);
      if (!res.ok || !body || body.error) return null;
      return body.embedUrl ?? null;
    },
    enabled: !!selectedMovie && !selectedMovie.trailerEmbed,
  });

  const activeTrailerUrl = selectedMovie?.trailerEmbed || trailerQuery.data;

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
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
              {t === "all" ? "All Trends" : t === "movie" ? "Feature Films" : "TV Series"}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movie or series…"
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
                  <Play className="size-3.5 fill-current" /> Watch Trailer & Details
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

      {/* Cinema Mode Movie Modal */}
      <Dialog open={!!selectedMovie} onOpenChange={() => setSelectedMovie(null)}>
        {selectedMovie && (
          <DialogContent className="max-w-3xl border-border/80 bg-card p-0 overflow-hidden shadow-2xl">
            {/* Embedded YouTube Trailer Player */}
            <div className="aspect-video w-full bg-black relative">
              {activeTrailerUrl ? (
                <iframe
                  src={activeTrailerUrl}
                  title={selectedMovie.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : trailerQuery.isLoading ? (
                <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
                  Loading trailer…
                </div>
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
                  No trailer available
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-sm border border-electric/30 bg-electric/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-electric font-semibold">
                    {selectedMovie.mediaType === "tv" ? "TV Series" : "Feature Film"}
                  </span>
                  {selectedMovie.releaseDate && (
                    <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      {selectedMovie.releaseDate.slice(0, 4)}
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-electric flex items-center gap-1">
                  <Star className="size-3.5 fill-electric text-electric" />
                  {selectedMovie.rating?.toFixed(1) ?? "—"}/10
                </span>
              </div>

              <DialogHeader className="text-left">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {selectedMovie.title}
                </DialogTitle>
              </DialogHeader>

              <DialogDescription className="text-xs leading-relaxed text-muted-foreground max-h-36 overflow-y-auto pr-1">
                {selectedMovie.overview || "No synopsis available."}
              </DialogDescription>

              <div className="pt-4 border-t border-border/50 flex flex-wrap gap-2.5">
                <a
                  href={`https://www.justwatch.com/us/search?q=${encodeURIComponent(selectedMovie.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm bg-electric px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-background transition-all hover:bg-electric/90 active:scale-95 shadow-sm"
                >
                  <Search className="size-3.5" /> Check Stream Availability
                </a>
                <a
                  href={`https://www.themoviedb.org/${selectedMovie.mediaType === "tv" ? "tv" : "movie"}/${selectedMovie.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-border/80 text-xs font-mono text-muted-foreground hover:text-electric transition-colors"
                >
                  <ExternalLink className="size-3.5" /> TMDB Record
                </a>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

// ── 2. Live Radio & Multi-Track Ambient Sound Mixer ───────────────────────────

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
    description: "Relaxing atmospheric lofi hip hop beats for coding and deep concentration.",
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
    name: "Deep Space Ambient & Cosmic Sound",
    category: "Cosmic Ambient",
    streamUrl: "https://icecast.walmradio.com:8443/jazz",
    description: "Ethereal drone ambient soundscapes tuned for flow state and contemplation.",
  },
];

const RadioTab = () => {
  const [activeStation, setActiveStation] = useState<RadioStation>(RADIO_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ambient sound layers (synthesized Web Audio noise)
  const [ambientRain, setAmbientRain] = useState(false);
  const [ambientCosmic, setAmbientCosmic] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const cosmicGainRef = useRef<GainNode | null>(null);

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
      <audio ref={audioRef} src={activeStation.streamUrl} preload="none" />

      {/* Main Deck */}
      <Card className="border-electric/40 bg-gradient-to-b from-electric/5 via-card/70 to-card p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-sm bg-electric/10 border border-electric/30 flex items-center justify-center text-electric shadow-lg shadow-electric/10">
              <Radio className="size-6 animate-pulse" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-electric font-bold">
                {activeStation.category} · Live Web Stream
              </span>
              <h3 className="text-lg font-bold text-foreground mt-0.5">{activeStation.name}</h3>
            </div>
          </div>

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

        {/* Volume & Audio Status */}
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
            <span>{isPlaying ? "Broadcasting Stream" : "Station Ready"}</span>
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

// ── 3. Retro Arcade Sound Synth (Web Audio API - Zero External Assets) ────────

class RetroSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {}
  }

  playScore() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(0.12, now + i * 0.04);
        gain.gain.linearRampToValueAtTime(0.01, now + i * 0.04 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.1);
      });
    } catch (e) {}
  }

  playBounce() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.setValueAtTime(440, this.ctx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }
}

const synth = new RetroSynth();

// ── 4. ARCADE GAME COLLECTION (12 Playable Retro Cyberpunk Games) ─────────────

// GAME 1: Space Defender (Enhanced with Starfield & Boss Waves)
const GameSpaceDefender = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ship = { x: canvas.width / 2, y: canvas.height - 35, size: 14, speed: 5.5 };
    let bullets: Array<{ x: number; y: number; speed: number }> = [];
    let asteroids: Array<{ x: number; y: number; size: number; speed: number; hp: number }> = [];
    let particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = [];
    let keys: Record<string, boolean> = {};
    let animId: number;
    let localScore = 0;
    let lastShot = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === " " && Date.now() - lastShot > 140) {
        bullets.push({ x: ship.x, y: ship.y - 12, speed: 8 });
        synth.playLaser();
        lastShot = Date.now();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = () => {
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield background
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (let s = 0; s < 25; s++) {
        const sx = (s * 37 + (Date.now() * 0.05)) % canvas.width;
        const sy = (s * 41 + (Date.now() * 0.1)) % canvas.height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Ship movement
      if (keys["ArrowLeft"] || keys["a"]) ship.x = Math.max(15, ship.x - ship.speed);
      if (keys["ArrowRight"] || keys["d"]) ship.x = Math.min(canvas.width - 15, ship.x + ship.speed);

      // Draw Ship
      ctx.fillStyle = "#0acc97";
      ctx.beginPath();
      ctx.moveTo(ship.x, ship.y - 12);
      ctx.lineTo(ship.x - 12, ship.y + 10);
      ctx.lineTo(ship.x + 12, ship.y + 10);
      ctx.closePath();
      ctx.fill();

      // Bullets
      ctx.fillStyle = "#38bdf8";
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y -= b.speed;
        ctx.fillRect(b.x - 1.5, b.y, 3, 9);
        if (b.y < 0) bullets.splice(i, 1);
      }

      // Spawn Asteroids
      if (Math.random() < 0.038) {
        asteroids.push({
          x: Math.random() * (canvas.width - 30) + 15,
          y: -15,
          size: Math.random() * 12 + 10,
          speed: Math.random() * 2 + 1.2,
          hp: 1,
        });
      }

      // Move & Draw Asteroids
      ctx.fillStyle = "#a855f7";
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const ast = asteroids[i];
        ast.y += ast.speed;

        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.size, 0, Math.PI * 2);
        ctx.fill();

        // Check bullet hit
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          if (Math.hypot(ast.x - b.x, ast.y - b.y) < ast.size) {
            // Spawn explosion particles
            for (let p = 0; p < 8; p++) {
              particles.push({
                x: ast.x,
                y: ast.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color: "#a855f7",
              });
            }
            asteroids.splice(i, 1);
            bullets.splice(j, 1);
            localScore += 100;
            setScore(localScore);
            synth.playScore();
            break;
          }
        }

        // Ship collision
        if (Math.hypot(ast.x - ship.x, ast.y - ship.y) < ast.size + ship.size) {
          synth.playExplosion();
          onGameOver(localScore);
          cancelAnimationFrame(animId);
          return;
        }

        if (ast.y > canvas.height + 20) asteroids.splice(i, 1);
      }

      // Draw Particles
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.05;
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillRect(pt.x, pt.y, 2, 2);
        ctx.globalAlpha = 1;
        if (pt.life <= 0) particles.splice(p, 1);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block" />;
};

// GAME 2: Neural Snake (Neon Light Trail & Power Nodes)
const GameNeuralSnake = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gridSize = 16;
    const cols = Math.floor(canvas.width / gridSize);
    const rows = Math.floor(canvas.height / gridSize);

    let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = { x: 15, y: 10 };
    let localScore = 0;
    let lastTick = 0;
    let animId: number;

    const spawnFood = () => {
      food = {
        x: Math.floor(Math.random() * (cols - 2)) + 1,
        y: Math.floor(Math.random() * (rows - 2)) + 1,
      };
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "ArrowUp" || e.key === "w") && dir.y === 0) nextDir = { x: 0, y: -1 };
      if ((e.key === "ArrowDown" || e.key === "s") && dir.y === 0) nextDir = { x: 0, y: 1 };
      if ((e.key === "ArrowLeft" || e.key === "a") && dir.x === 0) nextDir = { x: -1, y: 0 };
      if ((e.key === "ArrowRight" || e.key === "d") && dir.x === 0) nextDir = { x: 1, y: 0 };
    };
    window.addEventListener("keydown", handleKeyDown);

    const loop = (time: number) => {
      if (time - lastTick > 90) {
        lastTick = time;
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // Wall collision
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
          synth.playExplosion();
          onGameOver(localScore);
          return;
        }

        // Self collision
        if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
          synth.playExplosion();
          onGameOver(localScore);
          return;
        }

        snake.unshift(head);

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          localScore += 150;
          synth.playScore();
          spawnFood();
        } else {
          snake.pop();
        }
      }

      // Draw Grid & Snake
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw Food (Pulsing Glow)
      ctx.fillStyle = "#fbbf24";
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 8;
      ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);
      ctx.shadowBlur = 0;

      // Draw Snake
      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#0acc97" : "#059669";
        ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block" />;
};

// GAME 3: Quantum Breakout (Arkanoid with Particle Trails)
const GameQuantumBreakout = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let paddle = { x: canvas.width / 2 - 40, w: 80, h: 10, speed: 7 };
    let ball = { x: canvas.width / 2, y: canvas.height - 60, r: 5, vx: 3.5, vy: -3.5 };
    let bricks: Array<{ x: number; y: number; w: number; h: number; color: string; alive: boolean }> = [];
    let localScore = 0;
    let keys: Record<string, boolean> = {};
    let animId: number;

    const cols = 8;
    const rows = 4;
    const colors = ["#f43f5e", "#fbbf24", "#0acc97", "#38bdf8"];
    const brickW = (canvas.width - 40) / cols;
    const brickH = 14;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: 20 + c * brickW,
          y: 25 + r * (brickH + 5),
          w: brickW - 4,
          h: brickH,
          color: colors[r % colors.length],
          alive: true,
        });
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => { keys[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = () => {
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Paddle move
      if (keys["ArrowLeft"] || keys["a"]) paddle.x = Math.max(0, paddle.x - paddle.speed);
      if (keys["ArrowRight"] || keys["d"]) paddle.x = Math.min(canvas.width - paddle.w, paddle.x + paddle.speed);

      // Ball move
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall bounces
      if (ball.x < ball.r || ball.x > canvas.width - ball.r) {
        ball.vx = -ball.vx;
        synth.playBounce();
      }
      if (ball.y < ball.r) {
        ball.vy = -ball.vy;
        synth.playBounce();
      }

      // Paddle bounce
      if (
        ball.y + ball.r >= canvas.height - 25 &&
        ball.y - ball.r <= canvas.height - 15 &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.w
      ) {
        const hitOffset = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        ball.vx = hitOffset * 5;
        ball.vy = -Math.abs(ball.vy);
        synth.playBounce();
      }

      // Brick collision
      bricks.forEach(b => {
        if (!b.alive) return;
        if (
          ball.x > b.x &&
          ball.x < b.x + b.w &&
          ball.y > b.y &&
          ball.y < b.y + b.h
        ) {
          b.alive = false;
          ball.vy = -ball.vy;
          localScore += 50;
          synth.playScore();
        }
      });

      // Bottom death
      if (ball.y > canvas.height) {
        synth.playExplosion();
        onGameOver(localScore);
        return;
      }

      // Draw Paddle
      ctx.fillStyle = "#0acc97";
      ctx.fillRect(paddle.x, canvas.height - 25, paddle.w, paddle.h);

      // Draw Ball
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();

      // Draw Bricks
      bricks.forEach(b => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block" />;
};

// GAME 4: Firewall Invaders (Space Invaders Waves)
const GameFirewallInvaders = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ship = { x: canvas.width / 2, y: canvas.height - 25, w: 24, speed: 5 };
    let bullets: Array<{ x: number; y: number }> = [];
    let invaders: Array<{ x: number; y: number; alive: boolean }> = [];
    let invaderDir = 1;
    let lastStep = 0;
    let localScore = 0;
    let keys: Record<string, boolean> = {};
    let animId: number;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        invaders.push({ x: 40 + c * 50, y: 30 + r * 30, alive: true });
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === " " && bullets.length < 3) {
        bullets.push({ x: ship.x, y: ship.y - 10 });
        synth.playLaser();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = (time: number) => {
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (keys["ArrowLeft"] || keys["a"]) ship.x = Math.max(15, ship.x - ship.speed);
      if (keys["ArrowRight"] || keys["d"]) ship.x = Math.min(canvas.width - 15, ship.x + ship.speed);

      // Invaders step
      if (time - lastStep > 450) {
        lastStep = time;
        let edgeReached = false;
        invaders.forEach(inv => {
          if (!inv.alive) return;
          inv.x += invaderDir * 12;
          if (inv.x > canvas.width - 30 || inv.x < 20) edgeReached = true;
        });
        if (edgeReached) {
          invaderDir = -invaderDir;
          invaders.forEach(inv => { inv.y += 12; });
        }
      }

      // Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y -= 7;
        ctx.fillStyle = "#0acc97";
        ctx.fillRect(b.x - 1.5, b.y, 3, 8);

        invaders.forEach(inv => {
          if (inv.alive && Math.hypot(inv.x - b.x, inv.y - b.y) < 16) {
            inv.alive = false;
            bullets.splice(i, 1);
            localScore += 100;
            synth.playScore();
          }
        });

        if (b.y < 0) bullets.splice(i, 1);
      }

      // Check Invaders bottom reach
      if (invaders.some(inv => inv.alive && inv.y > canvas.height - 40)) {
        synth.playExplosion();
        onGameOver(localScore);
        return;
      }

      // Draw Ship
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(ship.x - 12, ship.y, 24, 10);
      ctx.fillRect(ship.x - 4, ship.y - 6, 8, 6);

      // Draw Invaders
      invaders.forEach(inv => {
        if (!inv.alive) return;
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(inv.x - 8, inv.y - 8, 16, 12);
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(inv.x - 4, inv.y - 4, 3, 3);
        ctx.fillRect(inv.x + 1, inv.y - 4, 3, 3);
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block" />;
};

// GAME 5: Cyber Pong 2088 (vs Adaptive AI)
const GameCyberPong = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let playerY = canvas.height / 2 - 25;
    let aiY = canvas.height / 2 - 25;
    let ball = { x: canvas.width / 2, y: canvas.height / 2, vx: 4, vy: 2.5, r: 5 };
    let pScore = 0;
    let aiScore = 0;
    let keys: Record<string, boolean> = {};
    let animId: number;

    const handleKeyDown = (e: KeyboardEvent) => { keys[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = () => {
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center Line
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
      ctx.setLineDash([]);

      // Player move
      if (keys["ArrowUp"] || keys["w"]) playerY = Math.max(0, playerY - 5);
      if (keys["ArrowDown"] || keys["s"]) playerY = Math.min(canvas.height - 50, playerY + 5);

      // AI move (smooth tracking)
      const aiTarget = ball.y - 25;
      aiY += (aiTarget - aiY) * 0.085;
      aiY = Math.max(0, Math.min(canvas.height - 50, aiY));

      // Ball move
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Top/Bottom bounce
      if (ball.y < ball.r || ball.y > canvas.height - ball.r) {
        ball.vy = -ball.vy;
        synth.playBounce();
      }

      // Player paddle hit
      if (ball.x - ball.r <= 25 && ball.y >= playerY && ball.y <= playerY + 50 && ball.vx < 0) {
        ball.vx = -ball.vx * 1.05;
        ball.vy += (Math.random() - 0.5) * 2;
        synth.playBounce();
      }

      // AI paddle hit
      if (ball.x + ball.r >= canvas.width - 25 && ball.y >= aiY && ball.y <= aiY + 50 && ball.vx > 0) {
        ball.vx = -ball.vx * 1.05;
        synth.playBounce();
      }

      // Scoring
      if (ball.x < 0) {
        aiScore++;
        ball = { x: canvas.width / 2, y: canvas.height / 2, vx: 4, vy: 2, r: 5 };
        if (aiScore >= 5) {
          synth.playExplosion();
          onGameOver(pScore * 100);
          return;
        }
      }
      if (ball.x > canvas.width) {
        pScore++;
        synth.playScore();
        ball = { x: canvas.width / 2, y: canvas.height / 2, vx: -4, vy: -2, r: 5 };
      }

      // Draw Paddles
      ctx.fillStyle = "#0acc97";
      ctx.fillRect(15, playerY, 10, 50);
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(canvas.width - 25, aiY, 10, 50);

      // Draw Ball
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();

      // Scores
      ctx.font = "bold 14px monospace";
      ctx.fillStyle = "#0acc97";
      ctx.fillText(`P1: ${pScore}`, canvas.width / 4, 25);
      ctx.fillStyle = "#f43f5e";
      ctx.fillText(`AI: ${aiScore}`, (canvas.width * 3) / 4, 25);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block" />;
};

// GAME 6: Neon Grid Runner (3D Pseudo-Perspective Dodger)
const GameNeonRunner = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let playerX = 1; // 0: left, 1: center, 2: right
    let obstacles: Array<{ lane: number; z: number }> = [];
    let localScore = 0;
    let animId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") playerX = Math.max(0, playerX - 1);
      if (e.key === "ArrowRight" || e.key === "d") playerX = Math.min(2, playerX + 1);
    };
    window.addEventListener("keydown", handleKeyDown);

    const loop = () => {
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Perspective Grid Lines
      const horizonY = 70;
      const vp = { x: canvas.width / 2, y: horizonY };
      const laneXs = [canvas.width * 0.2, canvas.width * 0.5, canvas.width * 0.8];

      ctx.strokeStyle = "rgba(10,204,151,0.25)";
      ctx.beginPath();
      laneXs.forEach(lx => {
        ctx.moveTo(vp.x, vp.y);
        ctx.lineTo(lx, canvas.height);
      });
      ctx.stroke();

      // Spawn Obstacles
      if (Math.random() < 0.035) {
        obstacles.push({ lane: Math.floor(Math.random() * 3), z: 0 });
      }

      // Move & Draw Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.z += 0.018;

        const screenY = horizonY + obs.z * (canvas.height - horizonY);
        const screenX = vp.x + (laneXs[obs.lane] - vp.x) * obs.z;
        const size = 15 + obs.z * 35;

        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size * 0.7);

        // Check collision at bottom
        if (obs.z > 0.88 && obs.z < 0.98 && obs.lane === playerX) {
          synth.playExplosion();
          onGameOver(localScore);
          return;
        }

        if (obs.z >= 1) {
          obstacles.splice(i, 1);
          localScore += 50;
          synth.playScore();
        }
      }

      // Draw Player Bike
      const px = laneXs[playerX];
      const py = canvas.height - 35;
      ctx.fillStyle = "#0acc97";
      ctx.fillRect(px - 14, py, 28, 12);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(px - 6, py - 6, 12, 6);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block" />;
};

// GAME 7: Drone Hopper (Laser Gate Precision Booster)
const GameDroneHopper = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let drone = { y: canvas.height / 2, vy: 0, gravity: 0.28, lift: -5.5 };
    let pipes: Array<{ x: number; top: number; bottom: number; passed: boolean }> = [];
    let localScore = 0;
    let animId: number;

    const flap = () => {
      drone.vy = drone.lift;
      synth.playBounce();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") flap();
    };
    window.addEventListener("keydown", handleKeyDown);

    const loop = () => {
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Drone physics
      drone.vy += drone.gravity;
      drone.y += drone.vy;

      // Spawn Laser Gates
      if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 150) {
        const gap = 85;
        const topH = Math.random() * (canvas.height - gap - 60) + 30;
        pipes.push({ x: canvas.width, top: topH, bottom: topH + gap, passed: false });
      }

      // Move & Draw Pipes
      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= 2.2;

        ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
        ctx.fillRect(p.x, 0, 24, p.top);
        ctx.fillRect(p.x, p.bottom, 24, canvas.height - p.bottom);

        // Laser edge
        ctx.fillStyle = "#a855f7";
        ctx.fillRect(p.x + 10, p.top - 4, 4, 4);
        ctx.fillRect(p.x + 10, p.bottom, 4, 4);

        // Collision
        if (
          70 + 8 > p.x &&
          70 - 8 < p.x + 24 &&
          (drone.y - 8 < p.top || drone.y + 8 > p.bottom)
        ) {
          synth.playExplosion();
          onGameOver(localScore);
          return;
        }

        if (!p.passed && p.x < 70) {
          p.passed = true;
          localScore += 100;
          synth.playScore();
        }

        if (p.x < -30) pipes.splice(i, 1);
      }

      // Ground/Ceiling collision
      if (drone.y < 0 || drone.y > canvas.height) {
        synth.playExplosion();
        onGameOver(localScore);
        return;
      }

      // Draw Drone
      ctx.fillStyle = "#0acc97";
      ctx.beginPath();
      ctx.arc(70, drone.y, 8, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block" />;
};

// GAME 8: Lunar Descent (Physics Thruster Landing)
const GameLunarDescent = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lander = { x: canvas.width / 2, y: 30, vx: 1.2, vy: 0, fuel: 100, landed: false };
    const pad = { x: canvas.width / 2 - 35, y: canvas.height - 20, w: 70, h: 8 };
    let keys: Record<string, boolean> = {};
    let animId: number;

    const handleKeyDown = (e: KeyboardEvent) => { keys[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = () => {
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gravity & Thrust
      lander.vy += 0.045; // Gravity

      if ((keys["ArrowUp"] || keys["w"] || keys[" "]) && lander.fuel > 0) {
        lander.vy -= 0.11;
        lander.fuel -= 0.35;
        synth.playBounce();
      }
      if ((keys["ArrowLeft"] || keys["a"]) && lander.fuel > 0) {
        lander.vx -= 0.06;
        lander.fuel -= 0.15;
      }
      if ((keys["ArrowRight"] || keys["d"]) && lander.fuel > 0) {
        lander.vx += 0.06;
        lander.fuel -= 0.15;
      }

      lander.x += lander.vx;
      lander.y += lander.vy;

      // Landing check
      if (lander.y >= pad.y - 10) {
        const onPad = lander.x >= pad.x && lander.x <= pad.x + pad.w;
        const safeSpeed = Math.abs(lander.vy) < 1.4 && Math.abs(lander.vx) < 1.2;

        if (onPad && safeSpeed) {
          synth.playScore();
          const score = Math.round(lander.fuel * 20 + 500);
          onGameOver(score);
          return;
        } else {
          synth.playExplosion();
          onGameOver(0);
          return;
        }
      }

      // Bounds
      if (lander.x < 10 || lander.x > canvas.width - 10) {
        synth.playExplosion();
        onGameOver(0);
        return;
      }

      // Draw Terrain & Landing Pad
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
      ctx.fillStyle = "#0acc97";
      ctx.fillRect(pad.x, pad.y, pad.w, pad.h);

      // Draw Lander
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(lander.x - 8, lander.y - 8, 16, 12);
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(lander.x - 10, lander.y + 4, 4, 6);
      ctx.fillRect(lander.x + 6, lander.y + 4, 4, 6);

      // HUD
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = lander.fuel > 20 ? "#0acc97" : "#f43f5e";
      ctx.fillText(`FUEL: ${Math.max(0, Math.round(lander.fuel))}%`, 15, 20);
      ctx.fillStyle = Math.abs(lander.vy) < 1.4 ? "#0acc97" : "#f43f5e";
      ctx.fillText(`V-SPD: ${lander.vy.toFixed(1)}`, 15, 35);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block" />;
};

// GAME 9: Tetra Blocks (Cyberpunk Tetris)
const GameTetraBlocks = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = 10;
    const rows = 16;
    const size = 16;
    const offsetX = (canvas.width - cols * size) / 2;
    const offsetY = 12;

    const board: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
    const SHAPES = [
      [[1, 1, 1, 1]], // I
      [[1, 1], [1, 1]], // O
      [[0, 1, 0], [1, 1, 1]], // T
      [[1, 1, 0], [0, 1, 1]], // S
      [[0, 1, 1], [1, 1, 0]], // Z
      [[1, 0, 0], [1, 1, 1]], // J
      [[0, 0, 1], [1, 1, 1]], // L
    ];
    const COLORS = ["#38bdf8", "#fbbf24", "#a855f7", "#0acc97", "#f43f5e", "#3b82f6", "#f97316"];

    let curShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    let curColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    let curX = 3;
    let curY = 0;
    let localScore = 0;
    let lastDrop = 0;
    let animId: number;

    const collides = (nx: number, ny: number, shape: number[][]) => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const bx = nx + c;
            const by = ny + r;
            if (bx < 0 || bx >= cols || by >= rows) return true;
            if (by >= 0 && board[by][bx]) return true;
          }
        }
      }
      return false;
    };

    const rotate = () => {
      const rotated = curShape[0].map((_, i) => curShape.map(row => row[i]).reverse());
      if (!collides(curX, curY, rotated)) {
        curShape = rotated;
        synth.playBounce();
      }
    };

    const lockAndClear = () => {
      curShape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val && curY + r >= 0) {
            board[curY + r][curX + c] = 1;
          }
        });
      });

      // Clear full lines
      let lines = 0;
      for (let r = rows - 1; r >= 0; r--) {
        if (board[r].every(v => v === 1)) {
          board.splice(r, 1);
          board.unshift(Array(cols).fill(0));
          lines++;
          r++;
        }
      }
      if (lines > 0) {
        localScore += lines * 250;
        synth.playScore();
      }

      // Spawn next
      curShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      curColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      curX = 3;
      curY = 0;

      if (collides(curX, curY, curShape)) {
        synth.playExplosion();
        onGameOver(localScore);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        if (!collides(curX - 1, curY, curShape)) curX--;
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        if (!collides(curX + 1, curY, curShape)) curX++;
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        if (!collides(curX, curY + 1, curShape)) curY++;
      }
      if (e.key === "ArrowUp" || e.key === "w") rotate();
      if (e.key === " ") {
        while (!collides(curX, curY + 1, curShape)) curY++;
        lockAndClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const loop = (time: number) => {
      if (time - lastDrop > 480) {
        lastDrop = time;
        if (!collides(curX, curY + 1, curShape)) {
          curY++;
        } else {
          lockAndClear();
        }
      }

      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Board Boundary
      ctx.strokeStyle = "rgba(10,204,151,0.3)";
      ctx.strokeRect(offsetX - 2, offsetY - 2, cols * size + 4, rows * size + 4);

      // Draw Board Blocks
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (board[r][c]) {
            ctx.fillStyle = "#0acc97";
            ctx.fillRect(offsetX + c * size + 1, offsetY + r * size + 1, size - 2, size - 2);
          }
        }
      }

      // Draw Current Falling Piece
      ctx.fillStyle = curColor;
      curShape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) {
            ctx.fillRect(offsetX + (curX + c) * size + 1, offsetY + (curY + r) * size + 1, size - 2, size - 2);
          }
        });
      });

      // Score
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`SCORE: ${localScore}`, 15, 25);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block" />;
};

// GAME 10: Missile Defense Matrix (Point Defense Flak Command)
const GameMissileDefense = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let missiles: Array<{ x: number; y: number; tx: number; ty: number; speed: number }> = [];
    let explosions: Array<{ x: number; y: number; r: number; maxR: number; expanding: boolean }> = [];
    let cities = [{ x: 80, alive: true }, { x: 250, alive: true }, { x: 420, alive: true }];
    let crosshair = { x: canvas.width / 2, y: canvas.height / 2 };
    let localScore = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      crosshair.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      crosshair.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    };

    const handleClick = () => {
      explosions.push({ x: crosshair.x, y: crosshair.y, r: 2, maxR: 28, expanding: true });
      synth.playLaser();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    const loop = () => {
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn Missiles
      if (Math.random() < 0.03) {
        const targetCity = cities.filter(c => c.alive)[Math.floor(Math.random() * cities.filter(c => c.alive).length)];
        const tx = targetCity ? targetCity.x : Math.random() * canvas.width;
        missiles.push({
          x: Math.random() * canvas.width,
          y: 0,
          tx: tx,
          ty: canvas.height - 15,
          speed: Math.random() * 0.8 + 0.9,
        });
      }

      // Update & Draw Missiles
      for (let i = missiles.length - 1; i >= 0; i--) {
        const m = missiles[i];
        const angle = Math.atan2(m.ty - m.y, m.tx - m.x);
        m.x += Math.cos(angle) * m.speed;
        m.y += Math.sin(angle) * m.speed;

        ctx.strokeStyle = "#f43f5e";
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - Math.cos(angle) * 12, m.y - Math.sin(angle) * 12); ctx.stroke();

        // Check if caught in explosion
        explosions.forEach(exp => {
          if (Math.hypot(m.x - exp.x, m.y - exp.y) < exp.r) {
            missiles.splice(i, 1);
            localScore += 100;
            synth.playScore();
          }
        });

        // City impact
        if (m.y >= canvas.height - 20) {
          cities.forEach(c => {
            if (c.alive && Math.abs(m.x - c.x) < 25) c.alive = false;
          });
          missiles.splice(i, 1);
          synth.playExplosion();
        }
      }

      // Check all cities lost
      if (cities.every(c => !c.alive)) {
        synth.playExplosion();
        onGameOver(localScore);
        return;
      }

      // Update & Draw Explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        if (exp.expanding) {
          exp.r += 1.5;
          if (exp.r >= exp.maxR) exp.expanding = false;
        } else {
          exp.r -= 1.2;
          if (exp.r <= 0) explosions.splice(i, 1);
        }

        ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
        ctx.beginPath(); ctx.arc(exp.x, exp.y, Math.max(0, exp.r), 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#38bdf8"; ctx.stroke();
      }

      // Draw Cities / Power Hubs
      cities.forEach(c => {
        ctx.fillStyle = c.alive ? "#0acc97" : "#334155";
        ctx.fillRect(c.x - 18, canvas.height - 18, 36, 18);
      });

      // Draw Crosshair
      ctx.strokeStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(crosshair.x, crosshair.y, 8, 0, Math.PI * 2);
      ctx.moveTo(crosshair.x - 12, crosshair.y); ctx.lineTo(crosshair.x + 12, crosshair.y);
      ctx.moveTo(crosshair.x, crosshair.y - 12); ctx.lineTo(crosshair.x, crosshair.y + 12);
      ctx.stroke();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block cursor-crosshair" />;
};

// GAME 11: Laser Tank Duel (Ricochet Arena Combat)
const GameLaserTank = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tank = { x: 60, y: canvas.height / 2, angle: 0, speed: 3 };
    let bullets: Array<{ x: number; y: number; vx: number; vy: number; bounces: number }> = [];
    let enemy = { x: canvas.width - 60, y: canvas.height / 2, angle: Math.PI, alive: true };
    let localScore = 0;
    let keys: Record<string, boolean> = {};
    let animId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === " " && bullets.length < 4) {
        bullets.push({
          x: tank.x + Math.cos(tank.angle) * 16,
          y: tank.y + Math.sin(tank.angle) * 16,
          vx: Math.cos(tank.angle) * 5,
          vy: Math.sin(tank.angle) * 5,
          bounces: 0,
        });
        synth.playLaser();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = () => {
      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Tank Controls
      if (keys["ArrowLeft"] || keys["a"]) tank.angle -= 0.06;
      if (keys["ArrowRight"] || keys["d"]) tank.angle += 0.06;
      if (keys["ArrowUp"] || keys["w"]) {
        tank.x += Math.cos(tank.angle) * tank.speed;
        tank.y += Math.sin(tank.angle) * tank.speed;
      }

      tank.x = Math.max(20, Math.min(canvas.width - 20, tank.x));
      tank.y = Math.max(20, Math.min(canvas.height - 20, tank.y));

      // Bullets Ricochet
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < 5 || b.x > canvas.width - 5) { b.vx = -b.vx; b.bounces++; synth.playBounce(); }
        if (b.y < 5 || b.y > canvas.height - 5) { b.vy = -b.vy; b.bounces++; synth.playBounce(); }

        // Hit enemy
        if (enemy.alive && Math.hypot(b.x - enemy.x, b.y - enemy.y) < 18) {
          enemy.alive = false;
          localScore += 500;
          synth.playScore();
          bullets.splice(i, 1);
          // Respawn enemy after delay
          setTimeout(() => {
            enemy.x = Math.random() * (canvas.width - 150) + 75;
            enemy.y = Math.random() * (canvas.height - 100) + 50;
            enemy.alive = true;
          }, 1200);
          continue;
        }

        if (b.bounces > 4) bullets.splice(i, 1);

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
      }

      // Draw Player Tank
      ctx.save();
      ctx.translate(tank.x, tank.y);
      ctx.rotate(tank.angle);
      ctx.fillStyle = "#0acc97";
      ctx.fillRect(-12, -10, 24, 20);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(0, -3, 16, 6);
      ctx.restore();

      // Draw Enemy Drone
      if (enemy.alive) {
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(enemy.x - 4, enemy.y - 4, 8, 8);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} width={500} height={280} className="w-full h-full block" />;
};

// GAME 12: Cyber 2048 (Neural Tile Merging)
const GameCyber2048 = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const [board, setBoard] = useState<number[][]>([
    [0, 2, 0, 0],
    [0, 0, 4, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 2],
  ]);
  const [score, setScore] = useState(0);

  const addRandomTile = (grid: number[][]) => {
    const empties: Array<{ r: number; c: number }> = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) empties.push({ r, c });
      }
    }
    if (empties.length > 0) {
      const { r, c } = empties[Math.floor(Math.random() * empties.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const move = (dir: "left" | "right" | "up" | "down") => {
    let newGrid = board.map(row => [...row]);
    let gained = 0;
    let changed = false;

    const slide = (row: number[]) => {
      let filtered = row.filter(v => v !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          gained += filtered[i];
          filtered.splice(i + 1, 1);
        }
      }
      while (filtered.length < 4) filtered.push(0);
      return filtered;
    };

    if (dir === "left") {
      newGrid = newGrid.map(row => {
        const s = slide(row);
        if (s.some((v, idx) => v !== row[idx])) changed = true;
        return s;
      });
    } else if (dir === "right") {
      newGrid = newGrid.map(row => {
        const s = slide(row.reverse()).reverse();
        if (s.some((v, idx) => v !== row[idx])) changed = true;
        return s;
      });
    } else if (dir === "up") {
      for (let c = 0; c < 4; c++) {
        const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
        const s = slide(col);
        for (let r = 0; r < 4; r++) {
          if (newGrid[r][c] !== s[r]) changed = true;
          newGrid[r][c] = s[r];
        }
      }
    } else if (dir === "down") {
      for (let c = 0; c < 4; c++) {
        const col = [newGrid[3][c], newGrid[2][c], newGrid[1][c], newGrid[0][c]];
        const s = slide(col);
        for (let r = 0; r < 4; r++) {
          if (newGrid[3 - r][c] !== s[r]) changed = true;
          newGrid[3 - r][c] = s[r];
        }
      }
    }

    if (changed) {
      addRandomTile(newGrid);
      setBoard(newGrid);
      const newScore = score + gained;
      setScore(newScore);
      synth.playScore();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") move("left");
      if (e.key === "ArrowRight" || e.key === "d") move("right");
      if (e.key === "ArrowUp" || e.key === "w") move("up");
      if (e.key === "ArrowDown" || e.key === "s") move("down");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#07090e]">
      <div className="flex items-center justify-between w-64 mb-3 text-xs font-mono">
        <span className="text-muted-foreground uppercase">Target: 2048</span>
        <span className="text-electric font-bold">SCORE: {score}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 bg-card/60 p-2.5 rounded-lg border border-border/60">
        {board.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-12 h-12 flex items-center justify-center rounded font-mono font-black text-xs transition-all ${
                val === 0 ? "bg-background/40" :
                val === 2 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                val === 4 ? "bg-teal-500/20 text-teal-300 border border-teal-500/40" :
                val === 8 ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/50" :
                val === 16 ? "bg-blue-500/30 text-blue-300 border border-blue-500/50" :
                val === 32 ? "bg-indigo-500/35 text-indigo-300 border border-indigo-500/50" :
                val === 64 ? "bg-purple-500/40 text-purple-300 border border-purple-500/50" :
                "bg-amber-500/50 text-amber-200 border border-amber-500/70 shadow-lg"
              }`}
            >
              {val > 0 ? val : ""}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── 5. ARCADE CABINET MASTER COMPONENT ────────────────────────────────────────

const ARCADE_GAMES = [
  { id: "space", title: "Space Defender", icon: "🚀", genre: "Arcade Shooter", diff: "Medium", desc: "Blast descending asteroids & interceptors." },
  { id: "snake", title: "Neural Snake", icon: "🐍", genre: "Grid Hunter", diff: "Easy", desc: "Eat quantum data nodes and extend your light trail." },
  { id: "breakout", title: "Quantum Breakout", icon: "🧱", genre: "Brick Breaker", diff: "Medium", desc: "Deflect energy orbs into data clusters." },
  { id: "invaders", title: "Firewall Invaders", icon: "👾", genre: "Wave Defense", diff: "Hard", desc: "Repel descending waves of hostile drones." },
  { id: "pong", title: "Cyber Pong 2088", icon: "🏓", genre: "Laser Tennis", diff: "Adaptive", desc: "High-voltage 1v1 paddle duel vs smart AI." },
  { id: "runner", title: "Neon Grid Runner", icon: "⚡", genre: "Cyber Highway", diff: "Fast", desc: "Dodge firewall spikes on an infinite 3D grid." },
  { id: "hopper", title: "Drone Hopper", icon: "🐦", genre: "Flap Precision", diff: "Hard", desc: "Navigate pulsating laser conduits." },
  { id: "lunar", title: "Lunar Descent", icon: "🛸", genre: "Physics Lander", diff: "Hard", desc: "Control thrusters and touch down safely." },
  { id: "tetra", title: "Tetra Blocks", icon: "🧩", genre: "Polyomino Drop", diff: "Classic", desc: "Clear lines with falling cyber pieces." },
  { id: "missile", title: "Missile Command", icon: "🎯", genre: "Point Defense", diff: "Fast", desc: "Intercept cluster warheads with flak." },
  { id: "tank", title: "Laser Tank Duel", icon: "⚔️", genre: "Arena Combat", diff: "Medium", desc: "Ricochet laser projectiles in tactical arena." },
  { id: "2048", title: "Cyber 2048", icon: "🔢", genre: "Neural Puzzle", diff: "Logic", desc: "Merge numeric tiles up to the Singularity." },
];

const ArcadeTab = () => {
  const [selectedGameId, setSelectedGameId] = useState("space");
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [crtMode, setCrtMode] = useState(true);

  const handleGameOver = (score: number) => {
    setLastScore(score);
    setIsPlaying(false);
  };

  const activeGame = ARCADE_GAMES.find(g => g.id === selectedGameId) || ARCADE_GAMES[0];

  return (
    <div className="space-y-6">
      {/* Top Game Selector Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {ARCADE_GAMES.map((game) => {
          const isSelected = game.id === selectedGameId;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                setSelectedGameId(game.id);
                setIsPlaying(false);
                setLastScore(null);
              }}
              className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "bg-electric/15 border-electric text-foreground shadow-md shadow-electric/10 scale-[1.02]"
                  : "bg-card/70 hover:bg-white/5 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                <span className="text-sm">{game.icon}</span>
                <span className="truncate">{game.title}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono opacity-70 mt-1">
                <span>{game.genre}</span>
                <span className="text-electric">{game.diff}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Arcade Screen Card */}
      <Card className="border-electric/40 bg-card/90 p-6 shadow-2xl space-y-4 max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{activeGame.icon}</span>
            <div>
              <h3 className="font-mono text-xs uppercase font-black text-electric">
                {activeGame.title}
              </h3>
              <p className="text-[10px] text-muted-foreground font-mono">{activeGame.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                synth.enabled = !soundOn;
                setSoundOn(!soundOn);
              }}
              className="p-1.5 rounded bg-background border border-border/60 text-muted-foreground hover:text-electric text-[10px] font-mono flex items-center gap-1 cursor-pointer"
            >
              {soundOn ? <Volume2 className="size-3 text-electric" /> : <VolumeX className="size-3 text-red-400" />}
              <span>{soundOn ? "SFX ON" : "MUTED"}</span>
            </button>

            <button
              type="button"
              onClick={() => setCrtMode(!crtMode)}
              className={`px-2 py-1 rounded border text-[10px] font-mono cursor-pointer ${
                crtMode ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-background border-border/60 text-muted-foreground"
              }`}
            >
              CRT SCANLINES
            </button>
          </div>
        </div>

        {/* Screen Bezel & Canvas */}
        <div className="relative aspect-[16/9] w-full bg-[#07090e] border border-border/70 rounded-md overflow-hidden flex items-center justify-center shadow-inner">
          {crtMode && (
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40 z-10" />
          )}

          {isPlaying ? (
            <>
              {selectedGameId === "space" && <GameSpaceDefender onGameOver={handleGameOver} />}
              {selectedGameId === "snake" && <GameNeuralSnake onGameOver={handleGameOver} />}
              {selectedGameId === "breakout" && <GameQuantumBreakout onGameOver={handleGameOver} />}
              {selectedGameId === "invaders" && <GameFirewallInvaders onGameOver={handleGameOver} />}
              {selectedGameId === "pong" && <GameCyberPong onGameOver={handleGameOver} />}
              {selectedGameId === "runner" && <GameNeonRunner onGameOver={handleGameOver} />}
              {selectedGameId === "hopper" && <GameDroneHopper onGameOver={handleGameOver} />}
              {selectedGameId === "lunar" && <GameLunarDescent onGameOver={handleGameOver} />}
              {selectedGameId === "tetra" && <GameTetraBlocks onGameOver={handleGameOver} />}
              {selectedGameId === "missile" && <GameMissileDefense onGameOver={handleGameOver} />}
              {selectedGameId === "tank" && <GameLaserTank onGameOver={handleGameOver} />}
              {selectedGameId === "2048" && <GameCyber2048 onGameOver={handleGameOver} />}
            </>
          ) : (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 p-6 text-center z-20">
              <span className="text-3xl animate-bounce">{activeGame.icon}</span>
              <h4 className="font-mono text-sm font-black text-foreground uppercase tracking-widest">
                {activeGame.title}
              </h4>
              {lastScore !== null ? (
                <div className="space-y-1">
                  <p className="font-mono text-xs font-bold text-red-400">SESSION TERMINATED</p>
                  <p className="font-mono text-xs text-electric font-bold">Final Score: {lastScore}</p>
                </div>
              ) : (
                <p className="font-mono text-xs text-muted-foreground max-w-sm">
                  Controls: <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">WASD</kbd> / <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Arrow Keys</kbd> · Action: <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Spacebar</kbd>
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setLastScore(null);
                  setIsPlaying(true);
                }}
                className="mt-2 px-6 py-2.5 rounded-sm bg-electric text-black font-mono text-xs uppercase font-black hover:bg-electric/90 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                {lastScore !== null ? "Play Again ➔" : "Insert Coin & Start ➔"}
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ── 5. Anime Trends (Free Jikan API) ──────────────────────────────────────────

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
  };
  synopsis?: string;
  score?: number;
  episodes?: number;
  year?: number;
  genres?: Array<{ name: string }>;
}

const AnimeTab = () => {
  const [selectedAnime, setSelectedAnime] = useState<AnimeItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["entertainment-anime"],
    queryFn: async () => {
      const res = await fetch("https://api.jikan.moe/v4/top/anime?limit=12&filter=bypopularity");
      if (!res.ok) throw new Error("anime_fetch_failed");
      const json = await res.json();
      return (json.data ?? []) as AnimeItem[];
    },
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) return <SkeletonGrid count={8} />;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(data ?? []).map((anime) => (
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
                  <Play className="size-3.5 fill-current" /> Play Trailer
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

      <Dialog open={!!selectedAnime} onOpenChange={() => setSelectedAnime(null)}>
        {selectedAnime && (
          <DialogContent className="max-w-2xl border-purple-500/30 bg-card p-0 overflow-hidden shadow-2xl">
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
                  Official Anime Preview
                </div>
              </div>
            )}

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
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

              <div className="pt-4 border-t border-border/50 flex flex-wrap gap-2.5">
                <a
                  href={`https://myanimelist.net/anime/${selectedAnime.mal_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm bg-purple-600 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-white transition-all hover:bg-purple-500 active:scale-95"
                >
                  <ExternalLink className="size-3.5" /> View on MyAnimeList
                </a>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

// ── 7. Trivia Arena ──────────────────────────────────────────────────────────

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
      setCurrentIdx(0);
      setScore(0);
      refetch();
    }
  };

  if (isLoading) return <Skeleton className="h-64 max-w-xl rounded-sm" />;
  if (!data?.length || !currentQ) return null;

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

// ── 8. Weather ───────────────────────────────────────────────────────────────

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

  const { data, isLoading } = useQuery({
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
          placeholder="Search global city…"
          className="font-mono text-sm"
        />
        <button
          type="submit"
          className="shrink-0 border border-electric/40 bg-electric/[0.08] px-4 font-mono text-xs uppercase tracking-[0.12em] text-electric transition-colors hover:bg-electric/[0.15]"
        >
          Go
        </button>
      </form>

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
      {data && (
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
        </Card>
      )}
    </div>
  );
};

// ── 8. Live Odds Tab (Display-only sports odds — no wagering on this site) ────

const OddsTab = () => {
  const { data } = useQuery({
    queryKey: ["entertainment-odds"],
    queryFn: async () => {
      try {
        const res = await fetch(siteEndpoints.entertainmentOddsApi);
        const body = await readJsonBody<{ results?: OddsEvent[]; error?: string }>(res);
        if (res.ok && body && !body.error && body.results?.length) {
          return body.results;
        }
      } catch (e) {
        // Fallback gracefully
      }
      return CURATED_ODDS;
    },
    initialData: CURATED_ODDS,
  });

  const displayOdds = data || CURATED_ODDS;

  return (
    <div className="space-y-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
        Informational odds display only — no bets are placed on this site.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {displayOdds.map((event) => {
          const market = event.bookmakers?.[0]?.markets?.find((m) => m.key === "h2h");
          return (
            <Card key={event.id} className="border-border/60 bg-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Trophy className="size-3.5 text-electric" />
                  {event.awayTeam} @ {event.homeTeam}
                </CardTitle>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">
                  {event.sportTitle} · {new Date(event.commenceTime).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2.5 pt-0">
                {market?.outcomes?.map((outcome) => (
                  <span
                    key={outcome.name}
                    className="rounded-sm border border-electric/25 bg-electric/[0.06] px-2.5 py-1 font-mono text-xs text-electric"
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
  );
};

// ── Main Entertainment Component ──────────────────────────────────────────────

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

      <section className="relative mx-auto max-w-3xl py-14 text-center sm:py-20">
        {/* Ambient premium glow, matching the site's hero treatment */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,_hsl(165_90%_42%_/_0.08)_0%,_transparent_65%)]" />

        {/* Animated gradient orb centerpiece — a soft, breathing blur behind
            the title. Two overlapping colors (electric + violet) drifting at
            slightly different rhythms so it never feels static. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center" aria-hidden="true">
          <div className="relative h-[280px] w-[280px] sm:h-[380px] sm:w-[380px]">
            <div className="absolute inset-0 animate-pulse rounded-full bg-electric/25 blur-3xl [animation-duration:4s]" />
            <div
              className="absolute inset-0 animate-pulse rounded-full bg-violet/25 blur-3xl [animation-duration:5s]"
              style={{ animationDelay: "1s" }}
            />
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="section-divider mx-auto mb-8 max-w-xs font-sans tracking-[0.3em]">
            <span>Now Playing</span>
          </div>
          <h1 className="bg-gradient-to-r from-electric via-emerald-300 to-electric bg-clip-text font-sans text-4xl font-black tracking-wide text-transparent drop-shadow-[0_0_30px_rgba(10,204,151,0.35)] sm:text-6xl sm:tracking-widest">
            Entertainment
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-sans text-base leading-relaxed tracking-wide text-muted-foreground">
            Interactive media & gaming workbench: stream live radio stations, play the space defender mini-arcade, watch movie & anime trailers, and solve trivia challenges.
          </p>
        </div>
      </section>

      <section aria-labelledby="entertainment-tabs">
        <h2 id="entertainment-tabs" className="sr-only">
          Entertainment sections
        </h2>
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="mx-auto mb-8 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-lg border border-violet/15 bg-background/76 p-1.5 shadow-[0_0_22px_hsl(var(--electric)_/_0.08),0_0_28px_hsl(var(--violet)_/_0.06),0_2px_14px_hsl(0_0%_0%_/_0.14)] backdrop-blur-md">
            <TabsTrigger value="movies" className="flex items-center gap-1.5">
              <Film className="size-3.5" /> Movies & TV
            </TabsTrigger>
            <TabsTrigger value="arcade" className="flex items-center gap-1.5">
              <Joystick className="size-3.5" /> Retro Arcade
            </TabsTrigger>
            <TabsTrigger value="radio" className="flex items-center gap-1.5">
              <Radio className="size-3.5" /> Lo-Fi & Radio
            </TabsTrigger>
            <TabsTrigger value="anime" className="flex items-center gap-1.5">
              <Clapperboard className="size-3.5" /> Anime Trends
            </TabsTrigger>
            <TabsTrigger value="trivia" className="flex items-center gap-1.5">
              <HelpCircle className="size-3.5" /> Trivia Arena
            </TabsTrigger>
            <TabsTrigger value="odds" className="flex items-center gap-1.5">
              <Trophy className="size-3.5" /> Odds
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-1.5">
              <CloudSun className="size-3.5" /> Weather
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <MoviesTab />
          </TabsContent>
          <TabsContent value="arcade">
            <ArcadeTab />
          </TabsContent>
          <TabsContent value="radio">
            <RadioTab />
          </TabsContent>
          <TabsContent value="anime">
            <AnimeTab />
          </TabsContent>
          <TabsContent value="trivia">
            <TriviaTab />
          </TabsContent>
          <TabsContent value="odds">
            <OddsTab />
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
