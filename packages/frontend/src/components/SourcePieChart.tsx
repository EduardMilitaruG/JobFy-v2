import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
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
          label={(props) => `${(props as unknown as { source: string }).source}: ${(props as unknown as { count: number }).count}`}
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
