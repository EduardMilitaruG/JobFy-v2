/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { JobTable } from "../components/JobTable.js";
import type { Job } from "@jobfy/shared";

const mockJobs: Job[] = [
  {
    id: 1,
    jobTitle: "React Developer",
    company: "TechCorp",
    location: "Remote",
    salary: "$100k",
    tags: "React, TypeScript",
    applyLink: "https://example.com/1",
    source: "RemoteOK",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    jobTitle: "Python Engineer",
    company: "DataCo",
    location: "Madrid",
    salary: "N/A",
    tags: "Python, Django",
    applyLink: "https://example.com/2",
    source: "Indeed",
    createdAt: new Date().toISOString(),
  },
];

describe("JobTable", () => {
  it("renders loading state", () => {
    render(<JobTable jobs={[]} loading={true} onDelete={jest.fn()} />);
    expect(screen.getByText("Loading jobs...")).toBeDefined();
  });

  it("renders empty state when no jobs", () => {
    render(<JobTable jobs={[]} loading={false} onDelete={jest.fn()} />);
    expect(screen.getByText(/No jobs found/)).toBeDefined();
  });

  it("renders job rows", () => {
    render(<JobTable jobs={mockJobs} loading={false} onDelete={jest.fn()} />);
    expect(screen.getByText("React Developer")).toBeDefined();
    expect(screen.getByText("Python Engineer")).toBeDefined();
    expect(screen.getByText("TechCorp")).toBeDefined();
    expect(screen.getByText("DataCo")).toBeDefined();
  });

  it("renders source badges", () => {
    render(<JobTable jobs={mockJobs} loading={false} onDelete={jest.fn()} />);
    expect(screen.getByText("RemoteOK")).toBeDefined();
    expect(screen.getByText("Indeed")).toBeDefined();
  });
});
