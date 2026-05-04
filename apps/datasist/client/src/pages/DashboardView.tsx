import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { DataCenter } from "@shared/schema";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { Zap, DollarSign, Droplets, AlertTriangle, Globe, Leaf, Building2 } from "lucide-react";

const CHART_COLORS = ["#71ff9c", "#5ef6ff", "#ffb347", "#ff5555", "#a78bfa", "#f97316", "#34d399", "#fb7185"];

type DataCenterWithLiveMetrics = DataCenter & {
  electricityPriceCentsPerKwh?: number;
  estimatedAnnualElectricityCostMillions?: number;
};

const STATUS_COLORS: Record<string, string> = {
  operational: "#71ff9c",
  under_construction: "#ffb347",
  planned: "#5ef6ff",
  canceled: "#ff5555",
};

function KpiCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color?: string }) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-2" style={{ color: "var(--color-text-muted)", fontSize: "10px", letterSpacing: "0.1em" }}>
        <Icon size={12} style={{ color: color || "var(--color-green)" }} />
        {label}
      </div>
      <div
        className="font-bold"
        style={{ fontSize: "22px", color: color || "var(--color-green)", fontFamily: "'Cabinet Grotesk', sans-serif", lineHeight: 1 }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{sub}</div>
      )}
    </div>
  );
}

const CustomTooltipStyle = {
  contentStyle: {
    background: "#0a0f0b",
    border: "1px solid #1d3425",
    borderRadius: "4px",
    color: "#d6f5e0",
    fontSize: "11px",
    fontFamily: "'General Sans', sans-serif",
  },
  itemStyle: { color: "#7aad8a" },
  labelStyle: { color: "#71ff9c", fontWeight: 600, marginBottom: "4px" },
};

export default function DashboardView() {
  const { data: centers = [], isLoading } = useQuery<DataCenterWithLiveMetrics[]>({
    queryKey: ["/api/data-centers"],
    queryFn: () => apiRequest("GET", "/api/data-centers").then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span style={{ fontSize: "12px", color: "var(--color-green)", letterSpacing: "0.15em" }}>
          COMPILING INTELLIGENCE...
        </span>
      </div>
    );
  }

  // Compute stats
  const totalCapacityMW = centers.reduce((s, c) => s + (c.capacityMW || 0), 0);
  const totalInvestment = centers.reduce((s, c) => s + (c.investmentBillions || 0), 0);
  const totalWater = centers.reduce((s, c) => s + (c.waterUsageMillionGallons || 0), 0);
  const totalElectricityCostMillions = centers.reduce(
    (sum, center) => sum + (center.estimatedAnnualElectricityCostMillions || 0),
    0,
  );
  const communityResistanceCount = centers.filter((c) => c.communityResistance === 1).length;
  const highRiskCount = centers.filter((c) => c.gridRisk === "high").length;
  const centersWithElectricity = centers.filter((c) => c.electricityPriceCentsPerKwh !== null && c.electricityPriceCentsPerKwh !== undefined);
  const avgElectricityPrice = centersWithElectricity.length
    ? centersWithElectricity.reduce((sum, center) => sum + (center.electricityPriceCentsPerKwh || 0), 0) / centersWithElectricity.length
    : null;
  const highestElectricityCenter = centersWithElectricity.reduce<DataCenterWithLiveMetrics | null>(
    (highest, center) =>
      !highest || (center.electricityPriceCentsPerKwh || 0) > (highest.electricityPriceCentsPerKwh || 0)
        ? center
        : highest,
    null,
  );
  const lowestElectricityCenter = centersWithElectricity.reduce<DataCenterWithLiveMetrics | null>(
    (lowest, center) =>
      !lowest || (center.electricityPriceCentsPerKwh || 0) < (lowest.electricityPriceCentsPerKwh || 0)
        ? center
        : lowest,
    null,
  );

  const validRenewable = centers.filter((c) => c.renewablePercent !== null && c.renewablePercent !== undefined);
  const avgRenewable = validRenewable.length
    ? Math.round(validRenewable.reduce((s, c) => s + (c.renewablePercent || 0), 0) / validRenewable.length)
    : 0;

  // Charts data
  const statusData = [
    { name: "Operational", value: centers.filter((c) => c.status === "operational").length, color: "#71ff9c" },
    { name: "Under Construction", value: centers.filter((c) => c.status === "under_construction").length, color: "#ffb347" },
    { name: "Planned", value: centers.filter((c) => c.status === "planned").length, color: "#5ef6ff" },
    { name: "Canceled", value: centers.filter((c) => c.status === "canceled").length, color: "#ff5555" },
  ].filter((d) => d.value > 0);

  // Company capacity chart
  const byCompany: Record<string, { capacityMW: number; count: number }> = {};
  for (const c of centers) {
    if (!byCompany[c.company]) byCompany[c.company] = { capacityMW: 0, count: 0 };
    byCompany[c.company].capacityMW += c.capacityMW || 0;
    byCompany[c.company].count++;
  }
  const companyCapacityData = Object.entries(byCompany)
    .map(([company, data]) => ({
      company: company.split(" ")[0].split("/")[0], // short name
      fullCompany: company,
      capacityMW: Math.round(data.capacityMW),
      count: data.count,
    }))
    .sort((a, b) => b.capacityMW - a.capacityMW);

  // Grid risk data
  const gridRiskData = [
    { name: "High Risk", value: centers.filter((c) => c.gridRisk === "high").length, color: "#ff5555" },
    { name: "Medium Risk", value: centers.filter((c) => c.gridRisk === "medium").length, color: "#ffb347" },
    { name: "Low Risk", value: centers.filter((c) => c.gridRisk === "low").length, color: "#71ff9c" },
  ].filter((d) => d.value > 0);

  // Renewable breakdown
  const renewableData = [
    { range: "0%", count: centers.filter((c) => (c.renewablePercent || 0) === 0).length },
    { range: "1–50%", count: centers.filter((c) => (c.renewablePercent || 0) > 0 && (c.renewablePercent || 0) <= 50).length },
    { range: "51–80%", count: centers.filter((c) => (c.renewablePercent || 0) > 50 && (c.renewablePercent || 0) <= 80).length },
    { range: "81–99%", count: centers.filter((c) => (c.renewablePercent || 0) > 80 && (c.renewablePercent || 0) < 100).length },
    { range: "100%", count: centers.filter((c) => (c.renewablePercent || 0) === 100).length },
  ];

  // Community impact table
  const communityImpactCenters = centers.filter((c) => c.communityResistance === 1);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--color-bg)" }}>
      <div className="p-4 flex flex-col gap-4 max-w-screen-xl mx-auto">

        {/* Page header */}
        <div className="flex items-end justify-between">
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontFamily: "'Cabinet Grotesk', sans-serif",
                color: "var(--color-green)",
                fontWeight: 800,
                letterSpacing: "0.05em",
              }}
              className="text-glow-green"
            >
              AI Infrastructure Intelligence
            </h1>
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Global AI data center analysis · {centers.length} facilities tracked · Aliasist.com
            </p>
          </div>
          <div
            className="px-3 py-1 rounded text-xs"
            style={{
              background: "rgba(113,255,156,0.06)",
              border: "1px solid rgba(113,255,156,0.15)",
              color: "var(--color-text-muted)",
              fontSize: "10px",
              letterSpacing: "0.1em",
            }}
          >
            DATA AS OF 2025–2026
          </div>
        </div>

        <section
          className="md:hidden flex gap-3 overflow-x-auto pb-2"
          aria-label="Mobile cinematic intelligence slides"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {[
            {
              title: "Global Facility Lattice",
              detail: "Track the global AI buildout with a cleaner orbital systems view.",
              kicker: "Mission View",
              image: "/cinematic/datasist-orbital-infrastructure-hero.png",
            },
            {
              title: "Power + Water Context",
              detail: "Keep grid pressure, water demand, and regional exposure visible early.",
              kicker: "Resource Lens",
              image: "/cinematic/ecosist-environmental-observatory-hero.png",
            },
          ].map((slide) => (
            <article
              key={slide.title}
              className="relative min-w-[86%] overflow-hidden rounded-[1.5rem] border"
              style={{
                minHeight: "13.5rem",
                scrollSnapAlign: "start",
                borderColor: "var(--color-border)",
                background:
                  "linear-gradient(180deg, rgba(6,13,20,0.12), rgba(6,13,20,0.88)), var(--color-surface)",
                boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(5,10,14,0.05), rgba(5,10,14,0.86)), url('${slide.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(94,246,255,0.18),transparent_30%),linear-gradient(180deg,rgba(113,255,156,0.04),transparent_35%)]" />
              <div className="relative z-10 flex h-full flex-col justify-end gap-2 p-4">
                <span
                  className="w-fit rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]"
                  style={{
                    background: "rgba(8, 16, 23, 0.72)",
                    border: "1px solid var(--color-border-strong)",
                    color: "var(--color-cyan)",
                  }}
                >
                  {slide.kicker}
                </span>
                <h2
                  style={{
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    lineHeight: 1.05,
                  }}
                >
                  {slide.title}
                </h2>
                <p style={{ fontSize: "0.8rem", color: "rgba(220,239,228,0.76)", maxWidth: "18rem" }}>
                  {slide.detail}
                </p>
              </div>
            </article>
          ))}
        </section>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KpiCard
            icon={Zap}
            label="TOTAL CAPACITY"
            value={`${(totalCapacityMW / 1000).toFixed(1)} GW`}
            sub="All tracked facilities"
            color="var(--color-green)"
          />
          <KpiCard
            icon={Building2}
            label="FACILITIES"
            value={String(centers.length)}
            sub={`${centers.filter((c) => c.status === "operational").length} operational`}
            color="var(--color-cyan)"
          />
          <KpiCard
            icon={DollarSign}
            label="INVESTMENT"
            value={`$${totalInvestment.toFixed(0)}B`}
            sub="Total tracked spend"
            color="#ffd700"
          />
          <KpiCard
            icon={Droplets}
            label="WATER USE"
            value={`${(totalWater / 1000).toFixed(1)}B`}
            sub="Gallons per year"
            color="#5ef6ff"
          />
          <KpiCard
            icon={DollarSign}
            label="POWER COST"
            value={
              totalElectricityCostMillions >= 1000
                ? `$${(totalElectricityCostMillions / 1000).toFixed(1)}B`
                : `$${Math.round(totalElectricityCostMillions)}M`
            }
            sub={
              avgElectricityPrice !== null
                ? `Avg ${avgElectricityPrice.toFixed(1)} c/kWh`
                : "EIA pricing unavailable"
            }
            color="#ffd700"
          />
          <KpiCard
            icon={AlertTriangle}
            label="COMMUNITY OPP."
            value={String(communityResistanceCount)}
            sub={`of ${centers.length} facing resistance`}
            color="var(--color-warning)"
          />
          <KpiCard
            icon={Leaf}
            label="AVG RENEWABLE"
            value={`${avgRenewable}%`}
            sub="Across all facilities"
            color={avgRenewable >= 70 ? "var(--status-operational)" : "var(--status-construction)"}
          />
        </div>

        <div
          className="rounded p-4 flex flex-col gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(255,215,112,0.10), rgba(94,246,255,0.04) 60%, rgba(10,15,11,0.96))",
            border: "1px solid rgba(255,215,112,0.18)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: "11px", letterSpacing: "0.14em", color: "#ffd76a" }}>
                POWER MARKET PULSE
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "3px" }}>
                EIA commercial electricity pricing layered onto U.S. facilities
              </div>
            </div>
            <div
              className="px-2.5 py-1 rounded-full"
              style={{ border: "1px solid rgba(255,215,112,0.2)", color: "#ffd76a", fontSize: "10px", letterSpacing: "0.1em" }}
            >
              LIVE COST SIGNAL
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              className="rounded p-3 flex flex-col gap-1.5"
              style={{ background: "rgba(5,10,6,0.52)", border: "1px solid rgba(255,215,112,0.12)" }}
            >
              <div style={{ fontSize: "9px", color: "var(--color-text-muted)", letterSpacing: "0.12em" }}>AVERAGE U.S. POWER PRICE</div>
              <div style={{ fontSize: "22px", color: "#ffd76a", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, lineHeight: 1 }}>
                {avgElectricityPrice !== null ? `${avgElectricityPrice.toFixed(1)} c/kWh` : "—"}
              </div>
              <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                Across {centersWithElectricity.length} U.S.-priced facilities
              </div>
            </div>
            <div
              className="rounded p-3 flex flex-col gap-1.5"
              style={{ background: "rgba(5,10,6,0.52)", border: "1px solid rgba(255,215,112,0.12)" }}
            >
              <div style={{ fontSize: "9px", color: "var(--color-text-muted)", letterSpacing: "0.12em" }}>HIGHEST PRICE MARKET</div>
              <div style={{ fontSize: "16px", color: "var(--color-text)", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, lineHeight: 1.1 }}>
                {highestElectricityCenter?.state ?? "—"}
              </div>
              <div style={{ fontSize: "12px", color: "#ffd76a", fontWeight: 600 }}>
                {highestElectricityCenter?.electricityPriceCentsPerKwh != null
                  ? `${highestElectricityCenter.electricityPriceCentsPerKwh.toFixed(1)} c/kWh`
                  : "—"}
              </div>
              <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                {highestElectricityCenter?.name ?? "No priced facility available"}
              </div>
            </div>
            <div
              className="rounded p-3 flex flex-col gap-1.5"
              style={{ background: "rgba(5,10,6,0.52)", border: "1px solid rgba(255,215,112,0.12)" }}
            >
              <div style={{ fontSize: "9px", color: "var(--color-text-muted)", letterSpacing: "0.12em" }}>LOWEST PRICE MARKET</div>
              <div style={{ fontSize: "16px", color: "var(--color-text)", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, lineHeight: 1.1 }}>
                {lowestElectricityCenter?.state ?? "—"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-green)", fontWeight: 600 }}>
                {lowestElectricityCenter?.electricityPriceCentsPerKwh != null
                  ? `${lowestElectricityCenter.electricityPriceCentsPerKwh.toFixed(1)} c/kWh`
                  : "—"}
              </div>
              <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                {lowestElectricityCenter?.name ?? "No priced facility available"}
              </div>
            </div>
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Company capacity */}
          <div
            className="md:col-span-2 p-4 rounded flex flex-col gap-3"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
              CAPACITY BY OPERATOR (MW)
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={companyCapacityData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(29,52,37,0.5)" vertical={false} />
                <XAxis
                  dataKey="company"
                  tick={{ fill: "#7aad8a", fontSize: 10, fontFamily: "'General Sans', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#7aad8a", fontSize: 10, fontFamily: "'General Sans', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  {...CustomTooltipStyle}
                  formatter={(value: any, name: any, props: any) => [
                    `${value} MW`,
                    props.payload.fullCompany,
                  ]}
                />
                <Bar dataKey="capacityMW" radius={[2, 2, 0, 0]}>
                  {companyCapacityData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status pie */}
          <div
            className="p-4 rounded flex flex-col gap-3"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
              FACILITY STATUS
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  {...CustomTooltipStyle}
                  formatter={(value: any, name: any) => [value, name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "10px", color: "#7aad8a", fontFamily: "'General Sans', sans-serif" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Renewable energy breakdown */}
          <div
            className="p-4 rounded flex flex-col gap-3"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
              RENEWABLE ENERGY COVERAGE
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={renewableData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(29,52,37,0.5)" vertical={false} />
                <XAxis
                  dataKey="range"
                  tick={{ fill: "#7aad8a", fontSize: 10, fontFamily: "'General Sans', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#7aad8a", fontSize: 10, fontFamily: "'General Sans', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  {...CustomTooltipStyle}
                  formatter={(v: any) => [`${v} facilities`, "Count"]}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]} fill="#71ff9c" fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grid risk */}
          <div
            className="p-4 rounded flex flex-col gap-3"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
              GRID STRESS RISK BY FACILITY
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={gridRiskData}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: "#2f6443" }}
                >
                  {gridRiskData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip
                  {...CustomTooltipStyle}
                  formatter={(v: any, n: any) => [v, n]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Community Resistance Table */}
        {communityImpactCenters.length > 0 && (
          <div
            className="p-4 rounded flex flex-col gap-3"
            style={{ background: "var(--color-surface)", border: "1px solid rgba(255,85,85,0.2)" }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} style={{ color: "#ff5555" }} />
              <span style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#ff8888" }}>
                COMMUNITY OPPOSITION & CONTESTED FACILITIES
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Facility", "Operator", "Location", "Status", "Capacity", "Community Issue"].map((h) => (
                      <th
                        key={h}
                        className="text-left pb-2 pr-4"
                        style={{ fontSize: "9px", letterSpacing: "0.1em", color: "var(--color-text-muted)", fontWeight: 500 }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {communityImpactCenters.map((c) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: "1px solid rgba(29,52,37,0.5)" }}
                    >
                      <td className="py-2 pr-4" style={{ fontSize: "11px", color: "var(--color-text)", fontWeight: 500 }}>
                        {c.name}
                      </td>
                      <td className="py-2 pr-4" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        {c.company}
                      </td>
                      <td className="py-2 pr-4" style={{ fontSize: "11px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                        {c.city}, {c.state}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{
                            fontSize: "9px",
                            color: STATUS_COLORS[c.status],
                            background: `${STATUS_COLORS[c.status]}18`,
                            border: `1px solid ${STATUS_COLORS[c.status]}35`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2 pr-4" style={{ fontSize: "11px", color: "var(--color-green)", whiteSpace: "nowrap" }}>
                        {c.capacityMW ? `${c.capacityMW >= 1000 ? `${(c.capacityMW / 1000).toFixed(1)} GW` : `${c.capacityMW} MW`}` : "—"}
                      </td>
                      <td className="py-2" style={{ fontSize: "10px", color: "var(--color-text-muted)", maxWidth: "280px" }}>
                        {c.communityImpact?.slice(0, 100)}
                        {c.communityImpact && c.communityImpact.length > 100 ? "..." : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Global scale context */}
        <div
          className="p-4 rounded flex flex-col gap-3"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <Globe size={13} style={{ color: "var(--color-cyan)" }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
              GLOBAL CONTEXT · KEY FIGURES
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "176 TWh", label: "US data center electricity (2023)", color: "var(--color-green)" },
              { value: "580 TWh", label: "Projected US usage by 2028", color: "var(--color-warning)" },
              { value: "4,088+", label: "Total US data centers (2025)", color: "var(--color-cyan)" },
              { value: "+267%", label: "Electricity price hike in DC hotspots", color: "var(--status-canceled)" },
              { value: "$98B", label: "Projects blocked by communities (2025)", color: "var(--status-canceled)" },
              { value: "40%", label: "Virginia's electricity → data centers", color: "var(--color-warning)" },
              { value: "12%", label: "Projected share of US electricity (2028)", color: "var(--color-warning)" },
              { value: "100,000", label: "Homes equivalent per hyperscale center", color: "var(--color-cyan)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 p-3 rounded"
                style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
              >
                <div style={{ fontSize: "18px", fontWeight: 800, color: stat.color, fontFamily: "'Cabinet Grotesk', sans-serif", lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textAlign: "center", letterSpacing: "0.08em", paddingBottom: "8px" }}>
          DataSist · ALIASIST.COM · dev@aliasist.com · Data sourced from ABI Research, Lawrence Berkeley National Lab, Consumer Reports, NPR, Axios, Business Insider, Lincoln Institute · 2025–2026
        </div>
      </div>
    </div>
  );
}
