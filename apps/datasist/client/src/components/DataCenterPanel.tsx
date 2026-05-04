import { useQuery } from "@tanstack/react-query";
import { X, Zap, Droplets, DollarSign, AlertTriangle, CheckCircle, Clock, XCircle, Leaf, Sparkles, Scale } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { DataCenter } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  center: DataCenter;
  onClose: () => void;
  onAskAI?: (center: DataCenter) => void;
  onCompare?: (center: DataCenter) => void;
  isCompareSelected?: boolean;
}

interface LiveInsights {
  electricity?: {
    retailPriceCentsPerKwh?: number | null;
    estimatedAnnualElectricityCostMillions?: number | null;
    source?: string;
  } | null;
  gridCarbon?: {
    zone?: string | null;
    carbonIntensity?: number | null;
    renewablePercentage?: number | null;
    fossilFreePercentage?: number | null;
    carbonFreeEnergyPercentage?: number | null;
    carbonIntensityLevel?: string | null;
    isEstimated?: boolean | null;
    source?: string;
  } | null;
  weather?: {
    temperature2m?: number | null;
    relativeHumidity2m?: number | null;
    apparentTemperature?: number | null;
    precipitation?: number | null;
    cloudCover?: number | null;
    windSpeed10m?: number | null;
    windGusts10m?: number | null;
    temperatureMaxToday?: number | null;
    temperatureMinToday?: number | null;
    precipitationSumToday?: number | null;
    shortwaveRadiationSumToday?: number | null;
    evapotranspirationToday?: number | null;
    source?: string;
  } | null;
  airQuality?: {
    usAqi?: number | null;
    pm2_5?: number | null;
    pm10?: number | null;
    ozone?: number | null;
    nitrogenDioxide?: number | null;
    source?: string;
  } | null;
  nws?: {
    forecastHeadline?: string | null;
    activeAlerts?: Array<{
      event?: string | null;
      severity?: string | null;
      headline?: string | null;
      expires?: string | null;
    }>;
    source?: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  operational: { label: "Operational", color: "var(--status-operational)", icon: CheckCircle },
  under_construction: { label: "Under Construction", color: "var(--status-construction)", icon: Clock },
  planned: { label: "Planned", color: "var(--status-planned)", icon: Clock },
  canceled: { label: "Canceled / Blocked", color: "var(--status-canceled)", icon: XCircle },
};

const GRID_RISK_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low Risk", color: "var(--status-operational)" },
  medium: { label: "Medium Risk", color: "var(--status-construction)" },
  high: { label: "High Risk", color: "var(--status-canceled)" },
};

function StatBadge({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div
      className="flex flex-col gap-1 p-2 rounded"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-1.5" style={{ color: "var(--color-text-muted)", fontSize: "10px", letterSpacing: "0.08em" }}>
        <Icon size={10} style={{ color: color || "var(--color-green)" }} />
        {label}
      </div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: color || "var(--color-text)" }}>{value}</div>
    </div>
  );
}

function formatMillions(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  return `$${Math.round(value)}M`;
}

export default function DataCenterPanel({ center, onClose, onAskAI, onCompare, isCompareSelected }: Props) {
  const isMobile = useIsMobile();
  const status = STATUS_CONFIG[center.status] || STATUS_CONFIG.operational;
  const gridRisk = center.gridRisk ? GRID_RISK_CONFIG[center.gridRisk] : null;
  const models: string[] = center.primaryModels ? JSON.parse(center.primaryModels) : [];
  const { data: liveInsights, isLoading: liveInsightsLoading } = useQuery<LiveInsights>({
    queryKey: ["/api/data-centers", center.id, "live-insights"],
    queryFn: () => apiRequest("GET", `/api/data-centers/${center.id}/live-insights`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: "'General Sans', sans-serif" }}
    >
      {/* Panel Header */}
      <div
        className="flex items-start justify-between border-b flex-shrink-0"
        style={{
          borderColor: "var(--color-border)",
          padding: isMobile ? "12px 14px" : "16px",
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "var(--color-surface-strong)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2">
          <span className="datasist-tag w-fit" style={{ padding: "4px 8px", fontSize: "9px", marginBottom: "4px" }}>
            Facility Dossier
          </span>
          <h2
            className="font-bold leading-tight"
            style={{ fontSize: isMobile ? "16px" : "18px", color: "var(--color-text)", fontFamily: "'Cabinet Grotesk', sans-serif" }}
          >
            {center.name}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
              {center.city}, {center.state}
              {center.country !== "USA" ? `, ${center.country}` : ""}
            </span>
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{
                fontSize: "10px",
                color: status.color,
                background: `${status.color}18`,
                border: `1px solid ${status.color}40`,
                letterSpacing: "0.05em",
              }}
            >
              <status.icon size={9} />
              {status.label}
            </span>
          </div>
        </div>
        <button
          data-testid="panel-close"
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded transition-opacity hover:opacity-80"
          style={{ color: "var(--color-text-muted)" }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4" style={{ padding: isMobile ? "12px 14px 14px" : "16px" }}>
        {/* Operator badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(113,255,156,0.08)",
              border: "1px solid rgba(113,255,156,0.2)",
              color: "var(--color-green)",
              letterSpacing: "0.08em",
              fontSize: "10px",
            }}
          >
            {center.company}
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-xs"
            style={{
              background: "rgba(94,246,255,0.06)",
              border: "1px solid rgba(94,246,255,0.15)",
              color: "var(--color-cyan)",
              letterSpacing: "0.06em",
              fontSize: "10px",
            }}
          >
            {center.companyType.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {/* Action buttons */}
        {!isMobile && (
        <div className="flex gap-2">
          {onAskAI && (
            <button
              data-testid="btn-ask-ai"
              onClick={() => onAskAI(center)}
              className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-2xl transition-all"
              style={{
                background: "rgba(113,255,156,0.08)",
                border: "1px solid rgba(113,255,156,0.25)",
                color: "var(--color-green)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              <Sparkles size={11} />
              Ask AI
            </button>
          )}
          {onCompare && (
            <button
              data-testid="btn-compare"
              onClick={() => onCompare(center)}
              className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-2xl transition-all"
              style={{
                background: isCompareSelected ? "rgba(94,246,255,0.15)" : "rgba(94,246,255,0.06)",
                border: isCompareSelected ? "1px solid rgba(94,246,255,0.4)" : "1px solid rgba(94,246,255,0.15)",
                color: "var(--color-cyan)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              <Scale size={11} />
              {isCompareSelected ? "Selected" : "Compare"}
            </button>
          )}
        </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {center.capacityMW && (
            <StatBadge
              icon={Zap}
              label="CAPACITY"
              value={`${center.capacityMW >= 1000 ? `${(center.capacityMW / 1000).toFixed(1)} GW` : `${center.capacityMW} MW`}`}
              color="var(--color-green)"
            />
          )}
          {center.investmentBillions && (
            <StatBadge
              icon={DollarSign}
              label="INVESTMENT"
              value={`$${center.investmentBillions}B`}
              color="var(--color-cyan)"
            />
          )}
          {center.estimatedAnnualGWh && (
            <StatBadge
              icon={Zap}
              label="ANNUAL USE"
              value={`${(center.estimatedAnnualGWh / 1000).toFixed(1)} TWh/yr`}
              color="var(--color-warning)"
            />
          )}
          {center.waterUsageMillionGallons && (
            <StatBadge
              icon={Droplets}
              label="WATER USE"
              value={`${center.waterUsageMillionGallons}M gal/yr`}
              color="#5ef6ff"
            />
          )}
          {center.renewablePercent !== null && center.renewablePercent !== undefined && (
            <StatBadge
              icon={Leaf}
              label="RENEWABLE"
              value={`${center.renewablePercent}%`}
              color={center.renewablePercent >= 80 ? "var(--status-operational)" : center.renewablePercent >= 50 ? "var(--status-construction)" : "var(--status-canceled)"}
            />
          )}
          {center.acreage && (
            <StatBadge
              icon={CheckCircle}
              label="FOOTPRINT"
              value={`${center.acreage.toLocaleString()} acres`}
            />
          )}
        </div>

        {/* Grid risk */}
        {gridRisk && (
          <div
            className="flex items-center gap-2 p-3 rounded-2xl"
            style={{
              background: `${gridRisk.color}0d`,
              border: `1px solid ${gridRisk.color}30`,
            }}
          >
            <AlertTriangle size={12} style={{ color: gridRisk.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.08em" }}>GRID RISK</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: gridRisk.color }}>{gridRisk.label}</div>
            </div>
          </div>
        )}

        {/* Community resistance */}
        {center.communityResistance === 1 && (
          <div
            className="flex items-center gap-2 p-3 rounded-2xl"
            style={{
              background: "rgba(255,85,85,0.06)",
              border: "1px solid rgba(255,85,85,0.25)",
            }}
          >
            <AlertTriangle size={12} style={{ color: "var(--status-canceled)", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", color: "#ff8888" }}>
              Active community resistance or opposition recorded
            </span>
          </div>
        )}

        {/* AI Models */}
        {models.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>AI MODELS / SERVICES</div>
            <div className="flex flex-wrap gap-1">
              {models.map((m) => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded"
                  style={{
                    fontSize: "10px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Community Journal */}
        {center.communityImpact && (
          <div className="flex flex-col gap-1.5">
            <div
              style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}
              className="flex items-center gap-1.5"
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-cyan)" }}
              />
              COMMUNITY JOURNAL
            </div>
            <p
              style={{
                fontSize: "12px",
                lineHeight: "1.65",
                color: "var(--color-text-muted)",
                borderLeft: "2px solid var(--color-border-strong)",
                paddingLeft: "10px",
              }}
            >
              {center.communityImpact}
            </p>
          </div>
        )}

        {/* Notes */}
        {center.notes && (
          <div
            className="p-2 rounded text-xs"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
              lineHeight: "1.5",
              fontSize: "11px",
            }}
          >
            <span style={{ color: "var(--color-green)", fontWeight: 600 }}>NOTE: </span>
            {center.notes}
          </div>
        )}

        {/* Year */}
        {(center.yearOpened || center.yearPlanned) && (
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            {center.yearOpened ? (
              <span>Opened: <strong style={{ color: "var(--color-text)" }}>{center.yearOpened}</strong></span>
            ) : (
              <span>Projected online: <strong style={{ color: "var(--color-text)" }}>{center.yearPlanned}</strong></span>
            )}
          </div>
        )}

        {/* Live insights */}
        <div className="flex flex-col gap-2">
          <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
            LIVE ENERGY & ENVIRONMENTAL SIGNALS
          </div>
          {liveInsightsLoading ? (
            <div
              className="p-2 rounded"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", fontSize: "11px", color: "var(--color-text-muted)" }}
            >
              Pulling live signals...
            </div>
          ) : (
            <>
              {(liveInsights?.electricity?.retailPriceCentsPerKwh !== null && liveInsights?.electricity?.retailPriceCentsPerKwh !== undefined) || (liveInsights?.electricity?.estimatedAnnualElectricityCostMillions !== null && liveInsights?.electricity?.estimatedAnnualElectricityCostMillions !== undefined) ? (
                <div
                  className="flex flex-col gap-2 p-2 rounded"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,215,112,0.12), rgba(94,246,255,0.04))",
                    border: "1px solid rgba(255,215,112,0.18)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "#ffd76a" }}>
                      POWER MARKET PULSE
                    </div>
                    <div style={{ fontSize: "9px", color: "var(--color-text-muted)" }}>
                      {liveInsights.electricity?.source ?? "EIA"}
                    </div>
                  </div>
                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
                    {liveInsights?.electricity?.retailPriceCentsPerKwh !== null && liveInsights?.electricity?.retailPriceCentsPerKwh !== undefined && (
                      <StatBadge
                        icon={DollarSign}
                        label="LIVE POWER PRICE"
                        value={`${liveInsights.electricity.retailPriceCentsPerKwh.toFixed(1)} c/kWh`}
                        color="#ffd700"
                      />
                    )}
                    {liveInsights?.electricity?.estimatedAnnualElectricityCostMillions !== null && liveInsights?.electricity?.estimatedAnnualElectricityCostMillions !== undefined && (
                      <StatBadge
                        icon={Zap}
                        label="ANNUAL POWER COST"
                        value={formatMillions(liveInsights.electricity.estimatedAnnualElectricityCostMillions)}
                        color="var(--color-warning)"
                      />
                    )}
                  </div>
                  <div
                    className="rounded px-2 py-1.5"
                    style={{ background: "rgba(5,10,6,0.45)", border: "1px solid rgba(255,215,112,0.12)" }}
                  >
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      Retail commercial electricity pricing is mapped by U.S. state and used to estimate yearly facility power spend.
                    </div>
                  </div>
                </div>
              ) : null}

              {liveInsights?.gridCarbon && (
                <div
                  className="p-2 rounded flex flex-col gap-1.5"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                >
                  <div style={{ fontSize: "10px", letterSpacing: "0.08em", color: "var(--color-text-muted)" }}>
                    GRID CARBON · {liveInsights.gridCarbon.source}
                  </div>
                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-2`} style={{ fontSize: "11px", color: "var(--color-text)" }}>
                    <div>Carbon intensity: <strong>{liveInsights.gridCarbon.carbonIntensity ? `${liveInsights.gridCarbon.carbonIntensity} gCO2e/kWh` : "—"}</strong></div>
                    <div>Carbon-free: <strong>{liveInsights.gridCarbon.carbonFreeEnergyPercentage ?? liveInsights.gridCarbon.fossilFreePercentage ?? "—"}{liveInsights.gridCarbon.carbonFreeEnergyPercentage != null || liveInsights.gridCarbon.fossilFreePercentage != null ? "%" : ""}</strong></div>
                    <div>Renewable: <strong>{liveInsights.gridCarbon.renewablePercentage != null ? `${liveInsights.gridCarbon.renewablePercentage}%` : "—"}</strong></div>
                    <div>Level: <strong>{liveInsights.gridCarbon.carbonIntensityLevel?.toUpperCase() ?? "—"}</strong></div>
                  </div>
                </div>
              )}

              {liveInsights?.weather && (
                <div
                  className="p-2 rounded flex flex-col gap-1.5"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                >
                  <div style={{ fontSize: "10px", letterSpacing: "0.08em", color: "var(--color-text-muted)" }}>
                    WEATHER / COOLING CONDITIONS · {liveInsights.weather.source}
                  </div>
                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-2`} style={{ fontSize: "11px", color: "var(--color-text)" }}>
                    <div>Temp: <strong>{liveInsights.weather.temperature2m != null ? `${liveInsights.weather.temperature2m}°C` : "—"}</strong></div>
                    <div>Feels like: <strong>{liveInsights.weather.apparentTemperature != null ? `${liveInsights.weather.apparentTemperature}°C` : "—"}</strong></div>
                    <div>Humidity: <strong>{liveInsights.weather.relativeHumidity2m != null ? `${liveInsights.weather.relativeHumidity2m}%` : "—"}</strong></div>
                    <div>Wind: <strong>{liveInsights.weather.windSpeed10m != null ? `${liveInsights.weather.windSpeed10m} km/h` : "—"}</strong></div>
                    <div>Cloud cover: <strong>{liveInsights.weather.cloudCover != null ? `${liveInsights.weather.cloudCover}%` : "—"}</strong></div>
                    <div>Daily solar: <strong>{liveInsights.weather.shortwaveRadiationSumToday != null ? `${Math.round(liveInsights.weather.shortwaveRadiationSumToday)} MJ/m²` : "—"}</strong></div>
                  </div>
                </div>
              )}

              {liveInsights?.airQuality && (
                <div
                  className="p-2 rounded flex flex-col gap-1.5"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                >
                  <div style={{ fontSize: "10px", letterSpacing: "0.08em", color: "var(--color-text-muted)" }}>
                    AIR QUALITY · {liveInsights.airQuality.source}
                  </div>
                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-2`} style={{ fontSize: "11px", color: "var(--color-text)" }}>
                    <div>US AQI: <strong>{liveInsights.airQuality.usAqi ?? "—"}</strong></div>
                    <div>PM2.5: <strong>{liveInsights.airQuality.pm2_5 != null ? `${liveInsights.airQuality.pm2_5} ug/m3` : "—"}</strong></div>
                    <div>PM10: <strong>{liveInsights.airQuality.pm10 != null ? `${liveInsights.airQuality.pm10} ug/m3` : "—"}</strong></div>
                    <div>NO2: <strong>{liveInsights.airQuality.nitrogenDioxide != null ? `${liveInsights.airQuality.nitrogenDioxide} ug/m3` : "—"}</strong></div>
                  </div>
                </div>
              )}

              {liveInsights?.nws?.forecastHeadline && (
                <div
                  className="p-2 rounded flex flex-col gap-1.5"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                >
                  <div style={{ fontSize: "10px", letterSpacing: "0.08em", color: "var(--color-text-muted)" }}>
                    U.S. WEATHER SERVICE
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text)" }}>{liveInsights.nws.forecastHeadline}</div>
                  {(liveInsights.nws.activeAlerts?.length ?? 0) > 0 && (
                    <div style={{ fontSize: "11px", color: "#ffb347" }}>
                      Active alerts: {liveInsights.nws.activeAlerts?.map((alert) => alert.event).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 border-t"
        style={{
          borderColor: "var(--color-border)",
          padding: isMobile ? "12px 14px calc(12px + env(safe-area-inset-bottom))" : "8px 12px",
          background: isMobile ? "var(--color-surface-strong)" : "transparent",
          backdropFilter: isMobile ? "blur(14px)" : undefined,
        }}
      >
        {isMobile && (
          <div className="flex gap-2 mb-3">
            {onAskAI && (
              <button
                data-testid="btn-ask-ai-mobile"
                onClick={() => onAskAI(center)}
                className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-2xl transition-all"
                style={{
                  background: "rgba(113,255,156,0.08)",
                  border: "1px solid rgba(113,255,156,0.25)",
                  color: "var(--color-green)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                <Sparkles size={11} />
                Ask AI
              </button>
            )}
            {onCompare && (
              <button
                data-testid="btn-compare-mobile"
                onClick={() => onCompare(center)}
                className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-2xl transition-all"
                style={{
                  background: isCompareSelected ? "rgba(94,246,255,0.15)" : "rgba(94,246,255,0.06)",
                  border: isCompareSelected ? "1px solid rgba(94,246,255,0.4)" : "1px solid rgba(94,246,255,0.15)",
                  color: "var(--color-cyan)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                <Scale size={11} />
                {isCompareSelected ? "Selected" : "Compare"}
              </button>
            )}
          </div>
        )}
        <p style={{ fontSize: "9px", color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>
          ALIASIST.COM · DataSist · dev@aliasist.com · Data sourced from public reporting
        </p>
      </div>
    </div>
  );
}
