import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#16a34a",
  "#94a3b8",
  "#64748b",
];

interface SourcePieChartProps {
  data: { source: string; count: number }[];
}

export function SourcePieChart({ data }: SourcePieChartProps) {
  if (!data.length) return <p className="no-data">No data available</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props) => `${props.name}: ${props.value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="count"
          nameKey="source"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
