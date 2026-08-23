import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import BackgroundRotator from "@/components/BackgroundRotator";
import Starfield from "@/components/Starfield";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { readJsonBody, siteEndpoints } from "@/config/api";

// ── Shared helpers ───────────────────────────────────────────────────────────

const SkeletonGrid = ({ count = 8 }: { count?: number }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className="h-64 w-full" />
    ))}
  </div>
);

const ErrorNote = ({ message }: { message: string }) => (
  <p className="border border-border/45 bg-card/55 p-5 font-mono text-xs text-muted-foreground">{message}</p>
);

// ── Movies & TV ───────────────────────────────────────────────────────────────

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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item) => (
        <Card key={`${item.mediaType}-${item.id}`} className="overflow-hidden border-border/60 bg-card/70">
          <div className="aspect-[2/3] w-full bg-muted">
            {item.posterPath ? (
              <img src={item.posterPath} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase text-muted-foreground">
                No poster
              </div>
            )}
          </div>
          <CardContent className="p-3">
            <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-electric">
              {item.mediaType === "tv" ? "TV" : "Movie"} · ★ {item.rating?.toFixed(1) ?? "—"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ── Games ─────────────────────────────────────────────────────────────────────

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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item) => (
        <Card key={item.id} className="overflow-hidden border-border/60 bg-card/70">
          <div className="aspect-video w-full bg-muted">
            {item.backgroundImage ? (
              <img src={item.backgroundImage} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase text-muted-foreground">
                No image
              </div>
            )}
          </div>
          <CardContent className="p-3">
            <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 line-clamp-1 font-mono text-[10px] uppercase tracking-[0.1em] text-electric">
              ★ {item.rating?.toFixed(1) ?? "—"} {item.platforms?.length ? `· ${item.platforms.slice(0, 2).join(", ")}` : ""}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ── Sports odds (display only — no wagering) ─────────────────────────────────

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
    <div className="space-y-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
        Informational odds display only — no bets are placed on this site.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {data.map((event) => {
          const market = event.bookmakers?.[0]?.markets?.find((m) => m.key === "h2h");
          return (
            <Card key={event.id} className="border-border/60 bg-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {event.awayTeam} @ {event.homeTeam}
                </CardTitle>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">
                  {event.sportTitle} · {new Date(event.commenceTime).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3 pt-0">
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

// ── Weather (Open-Meteo — no API key required) ───────────────────────────────

interface WeatherResult {
  name: string;
  temperatureC: number;
  windKph: number;
  weatherCode: number;
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

async function fetchWeather(city: string): Promise<WeatherResult> {
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
  forecastUrl.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
  const forecastRes = await fetch(forecastUrl);
  const forecast = (await forecastRes.json()) as {
    current?: { temperature_2m: number; weather_code: number; wind_speed_10m: number };
  };
  if (!forecast.current) throw new Error("forecast_unavailable");

  return {
    name: place.name,
    temperatureC: forecast.current.temperature_2m,
    windKph: forecast.current.wind_speed_10m,
    weatherCode: forecast.current.weather_code,
  };
}

const WeatherTab = () => {
  const [city, setCity] = useState("New York");
  const [query, setQuery] = useState("New York");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["entertainment-weather", query],
    queryFn: () => fetchWeather(query),
  });

  return (
    <div className="max-w-md space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(city.trim() || "New York");
        }}
        className="flex gap-2"
      >
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search a city…"
          className="font-mono text-sm"
        />
        <button
          type="submit"
          className="shrink-0 border border-electric/40 bg-electric/[0.08] px-4 font-mono text-xs uppercase tracking-[0.12em] text-electric transition-colors hover:bg-electric/[0.15]"
        >
          Go
        </button>
      </form>

      {isLoading && <Skeleton className="h-32 w-full" />}
      {isError && <ErrorNote message="Couldn't find that city — try a different spelling." />}
      {data && (
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>{data.name}</CardTitle>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">
              {WEATHER_CODES[data.weatherCode] ?? "Conditions unavailable"}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-electric">{Math.round(data.temperatureC)}°C</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {Math.round((data.temperatureC * 9) / 5 + 32)}°F · Wind {Math.round(data.windKph)} km/h
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

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
          Trending movies & TV, popular games, live sports odds (display only — no wagering), and weather.
        </p>
      </section>

      <section aria-labelledby="entertainment-tabs">
        <h2 id="entertainment-tabs" className="sr-only">
          Entertainment sections
        </h2>
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="movies">Movies & TV</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="odds">Odds</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
          </TabsList>
          <TabsContent value="movies">
            <MoviesTab />
          </TabsContent>
          <TabsContent value="games">
            <GamesTab />
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
