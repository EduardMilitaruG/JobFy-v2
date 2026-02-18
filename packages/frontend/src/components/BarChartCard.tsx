import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey: string;
  color: string;
  layout?: "horizontal" | "vertical";
  wide?: boolean;
  maxItems?: number;
}

export function BarChartCard({
  title,
  data,
  dataKey,
  nameKey,
  color,
  layout = "vertical",
  wide,
  maxItems = 8,
}: BarChartCardProps) {
  const sliced = data.slice(0, maxItems);

  return (
    <div className={`chart-card${wide ? " wide" : ""}`}>
      <h3>{title}</h3>
      {sliced.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          {layout === "vertical" ? (
            <BarChart data={sliced} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis
                type="category"
                dataKey={nameKey}
                width={120}
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
            </BarChart>
          ) : (
            <BarChart data={sliced}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey={nameKey}
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      ) : (
        <p className="no-data">No data available</p>
      )}
    </div>
  );
}
