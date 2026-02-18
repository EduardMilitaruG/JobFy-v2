/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { StatsCharts } from "../components/StatsCharts.js";
import type { StatsResponse } from "@jobfy/shared";

// Mock recharts to avoid canvas issues in jsdom
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Pie: () => <div>Pie</div>,
  Cell: () => <div />,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

const mockStats: StatsResponse = {
  totalJobs: 42,
  bySource: [
    { source: "RemoteOK", count: 20 },
    { source: "Indeed", count: 22 },
  ],
  byCompany: [
    { company: "TechCorp", count: 10 },
    { company: "DataCo", count: 8 },
  ],
  byLocation: [
    { location: "Remote", count: 15 },
    { location: "Madrid", count: 12 },
  ],
  topTags: [
    { tag: "React", count: 10 },
    { tag: "Python", count: 8 },
  ],
};

describe("StatsCharts", () => {
  it("renders loading when stats is null", () => {
    render(<StatsCharts stats={null} />);
    expect(screen.getByText("Loading statistics...")).toBeDefined();
  });

  it("renders stat cards with correct values", () => {
    render(<StatsCharts stats={mockStats} />);
    expect(screen.getByText("42")).toBeDefined();
    expect(screen.getByText("Total Jobs")).toBeDefined();
    expect(screen.getByText("Companies")).toBeDefined();
    expect(screen.getByText("Locations")).toBeDefined();
    expect(screen.getByText("Unique Tags")).toBeDefined();
  });

  it("renders chart titles", () => {
    render(<StatsCharts stats={mockStats} />);
    expect(screen.getByText("Jobs by Source")).toBeDefined();
    expect(screen.getByText("Top Companies")).toBeDefined();
    expect(screen.getByText("Most Requested Skills")).toBeDefined();
    expect(screen.getByText("Top Locations")).toBeDefined();
  });
});
