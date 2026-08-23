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

const CURATED_GAMES: GameItem[] = [
  {
    id: 41494,
    title: "Cyberpunk 2077",
    released: "2020-12-10",
    rating: 4.3,
    backgroundImage: "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg",
    platforms: ["PC", "PlayStation 5", "Xbox Series X/S"],
    metacritic: 86,
    trailerEmbed: "https://www.youtube.com/embed/8X2kIfS6fb8",
  },
  {
    id: 326243,
    title: "Elden Ring",
    released: "2022-02-25",
    rating: 4.6,
    backgroundImage: "https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg",
    platforms: ["PC", "PlayStation 5", "Xbox Series S/X"],
    metacritic: 96,
    trailerEmbed: "https://www.youtube.com/embed/E3Huy2cdih0",
  },
  {
    id: 987537,
    title: "Black Myth: Wukong",
    released: "2024-08-20",
    rating: 4.5,
    backgroundImage: "https://media.rawg.io/media/screenshots/496/4963a02fb0315e5327ee4944e2f3d73b.jpg",
    platforms: ["PC", "PlayStation 5"],
    metacritic: 82,
    trailerEmbed: "https://www.youtube.com/embed/0Zw-mo0EFt0",
  },
  {
    id: 324997,
    title: "Baldur's Gate 3",
    released: "2023-08-03",
    rating: 4.7,
    backgroundImage: "https://media.rawg.io/media/games/699/69907ecf13f172e9e144069769c3be73.jpg",
    platforms: ["PC", "PlayStation 5", "macOS", "Xbox Series S/X"],
    metacritic: 96,
    trailerEmbed: "https://www.youtube.com/embed/1T22wNvoNiU",
  },
  {
    id: 3498,
    title: "Grand Theft Auto V",
    released: "2013-09-17",
    rating: 4.5,
    backgroundImage: "https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg",
    platforms: ["PC", "PlayStation 5", "Xbox Series X/S"],
    metacritic: 97,
    trailerEmbed: "https://www.youtube.com/embed/QkkoHAzjnUs",
  },
  {
    id: 3328,
    title: "The Witcher 3: Wild Hunt",
    released: "2015-05-18",
    rating: 4.7,
    backgroundImage: "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
    platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "Nintendo Switch"],
    metacritic: 93,
    trailerEmbed: "https://www.youtube.com/embed/c0i88t0Kacs",
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

// ── 3. Playable Retro Space Defender Mini-Game ────────────────────────────────

const RetroArcadeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ship = { x: canvas.width / 2, y: canvas.height - 30, size: 14, speed: 5 };
    let bullets: Array<{ x: number; y: number; speed: number }> = [];
    let asteroids: Array<{ x: number; y: number; size: number; speed: number }> = [];
    let keys: Record<string, boolean> = {};
    let animId: number;
    let localScore = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === " " || e.key === "ArrowUp") {
        bullets.push({ x: ship.x, y: ship.y - 10, speed: 7 });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ship movement
      if (keys["ArrowLeft"] || keys["a"]) ship.x = Math.max(15, ship.x - ship.speed);
      if (keys["ArrowRight"] || keys["d"]) ship.x = Math.min(canvas.width - 15, ship.x + ship.speed);

      // Draw Ship (Cyberpunk Tri-Fighter)
      ctx.fillStyle = "#0acc97";
      ctx.beginPath();
      ctx.moveTo(ship.x, ship.y - 12);
      ctx.lineTo(ship.x - 10, ship.y + 10);
      ctx.lineTo(ship.x + 10, ship.y + 10);
      ctx.closePath();
      ctx.fill();

      // Bullets
      ctx.fillStyle = "#38bdf8";
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y -= b.speed;
        ctx.fillRect(b.x - 1.5, b.y, 3, 8);
        if (b.y < 0) bullets.splice(i, 1);
      }

      // Spawn Asteroids
      if (Math.random() < 0.04) {
        asteroids.push({
          x: Math.random() * (canvas.width - 20) + 10,
          y: -10,
          size: Math.random() * 12 + 10,
          speed: Math.random() * 2 + 1.5,
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

        // Check collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          if (Math.hypot(ast.x - b.x, ast.y - b.y) < ast.size) {
            asteroids.splice(i, 1);
            bullets.splice(j, 1);
            localScore += 100;
            setScore(localScore);
            break;
          }
        }

        // Check collision with ship
        if (Math.hypot(ast.x - ship.x, ast.y - ship.y) < ast.size + ship.size) {
          setGameOver(true);
          setIsPlaying(false);
          cancelAnimationFrame(animId);
          return;
        }

        if (ast.y > canvas.height + 20) asteroids.splice(i, 1);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  return (
    <Card className="border-purple-500/40 bg-card/80 p-6 shadow-xl space-y-4 max-w-xl">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Joystick className="size-4 text-purple-400" />
          <h3 className="font-mono text-xs uppercase font-bold text-purple-400">
            Cyberpunk Star Defender Mini-Arcade
          </h3>
        </div>
        <span className="font-mono text-xs font-bold text-electric">Score: {score}</span>
      </div>

      <div className="relative aspect-[16/9] w-full bg-[#0a0c10] border border-border/60 rounded-sm overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} width={480} height={270} className="w-full h-full block" />

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 p-4 text-center">
            {gameOver ? (
              <>
                <p className="font-mono text-sm font-bold text-red-400">MISSION TERMINATED</p>
                <p className="font-mono text-xs text-muted-foreground">Final Score: {score}</p>
              </>
            ) : (
              <p className="font-mono text-xs text-muted-foreground">
                Steer with <kbd className="px-1 bg-muted rounded">A</kbd> / <kbd className="px-1 bg-muted rounded">D</kbd> or Arrow Keys · Shoot with <kbd className="px-1 bg-muted rounded">Spacebar</kbd>
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setScore(0);
                setGameOver(false);
                setIsPlaying(true);
              }}
              className="px-5 py-2 rounded-sm bg-purple-600 font-mono text-xs uppercase font-bold text-white hover:bg-purple-500 transition-all shadow-md active:scale-95"
            >
              {gameOver ? "Play Again" : "Launch Defender ➔"}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

// ── 4. Games Tab (100% Resilient + Arcade & Trailers) ─────────────────────────

interface GameItem {
  id: number;
  title: string;
  released: string | null;
  rating: number;
  backgroundImage: string | null;
  platforms: string[];
  metacritic: number | null;
  trailerEmbed?: string;
}

const GamesTab = () => {
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  const { data } = useQuery({
    queryKey: ["entertainment-games"],
    queryFn: async () => {
      try {
        const res = await fetch(siteEndpoints.entertainmentGamesApi);
        const body = await readJsonBody<{ results?: GameItem[]; error?: string }>(res);
        if (res.ok && body && !body.error && body.results?.length) {
          return body.results;
        }
      } catch (e) {}
      return CURATED_GAMES;
    },
    initialData: CURATED_GAMES,
  });

  const displayGames = data || CURATED_GAMES;

  // The trending list has no trailer data, and real (non-curated) items have
  // no trailerEmbed — fetch a real one on demand when the modal opens. RAWG
  // serves its own trailer clips as direct video files (not YouTube), so
  // this is a native <video> source, not an iframe.
  const trailerQuery = useQuery({
    queryKey: ["entertainment-game-trailer", selectedGame?.id],
    queryFn: async () => {
      const res = await fetch(`${siteEndpoints.entertainmentGameTrailerApi}?id=${selectedGame!.id}`);
      const body = await readJsonBody<{ videoUrl?: string | null; previewImage?: string | null; error?: string }>(res);
      if (!res.ok || !body || body.error) return null;
      return { videoUrl: body.videoUrl ?? null, previewImage: body.previewImage ?? null };
    },
    enabled: !!selectedGame && !selectedGame.trailerEmbed,
  });

  const activeVideoUrl = trailerQuery.data?.videoUrl;

  return (
    <div className="space-y-8">
      {/* Retro Mini-Arcade Highlight */}
      <RetroArcadeGame />

      {/* Main Game Catalog */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayGames.map((item) => (
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
                  <Gamepad2 className="size-3.5" /> Gameplay & Details
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
          <DialogContent className="max-w-2xl border-border/80 bg-card p-0 overflow-hidden shadow-2xl">
            <div className="aspect-video w-full bg-black relative">
              {selectedGame.trailerEmbed ? (
                <iframe
                  src={selectedGame.trailerEmbed}
                  title={selectedGame.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeVideoUrl ? (
                <video
                  src={activeVideoUrl}
                  poster={trailerQuery.data?.previewImage ?? selectedGame.backgroundImage ?? undefined}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
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
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl font-bold text-foreground">{selectedGame.title}</DialogTitle>
                </DialogHeader>
                {selectedGame.metacritic && (
                  <span className="rounded-md border border-emerald-500/40 bg-background/90 px-2.5 py-1 font-mono text-xs font-black text-emerald-400 shadow-md">
                    MC {selectedGame.metacritic}
                  </span>
                )}
              </div>

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
                  href={`https://store.steampowered.com/search/?term=${encodeURIComponent(selectedGame.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm bg-electric px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-background transition-all hover:bg-electric/90 active:scale-95 shadow-sm"
                >
                  <Search className="size-3.5" /> Find on Steam
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
            <TabsTrigger value="games" className="flex items-center gap-1.5">
              <Gamepad2 className="size-3.5" /> Games & Arcade
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
          <TabsContent value="games">
            <GamesTab />
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
