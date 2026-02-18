import { Briefcase, Building2, MapPin, Tag } from "lucide-react";
import type { StatsResponse } from "@jobfy/shared";
import { StatCard } from "./StatCard.js";
import { SourcePieChart } from "./SourcePieChart.js";
import { BarChartCard } from "./BarChartCard.js";
import { LoadingSpinner } from "./LoadingSpinner.js";

interface StatsChartsProps {
  stats: StatsResponse | null;
}

export function StatsCharts({ stats }: StatsChartsProps) {
  if (!stats) return <LoadingSpinner text="Loading statistics..." />;

  return (
    <div className="stats-section">
      <div className="stats-grid">
        <StatCard
          icon={<Briefcase size={24} />}
          value={stats.totalJobs}
          label="Total Jobs"
          highlight
        />
        <StatCard
          icon={<Building2 size={24} />}
          value={stats.byCompany?.length ?? 0}
          label="Companies"
        />
        <StatCard
          icon={<MapPin size={24} />}
          value={stats.byLocation?.length ?? 0}
          label="Locations"
        />
        <StatCard
          icon={<Tag size={24} />}
          value={stats.topTags?.length ?? 0}
          label="Unique Tags"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Jobs by Source</h3>
          <SourcePieChart data={stats.bySource ?? []} />
        </div>

        <BarChartCard
          title="Top Companies"
          data={stats.byCompany ?? []}
          dataKey="count"
          nameKey="company"
          color="#6366f1"
        />

        <BarChartCard
          title="Most Requested Skills"
          data={stats.topTags ?? []}
          dataKey="count"
          nameKey="tag"
          color="#8b5cf6"
          layout="horizontal"
          wide
          maxItems={12}
        />

        <BarChartCard
          title="Top Locations"
          data={stats.byLocation ?? []}
          dataKey="count"
          nameKey="location"
          color="#a855f7"
        />
      </div>
    </div>
  );
}
