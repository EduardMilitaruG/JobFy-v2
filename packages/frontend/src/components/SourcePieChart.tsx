import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#f5a623",
  "#e09518",
  "#cc8412",
  "#22c55e",
  "#888888",
  "#444444",
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
          label={(props: { source: string; count: number }) => `${props.source}: ${props.count}`}
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
