/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobFilters } from "../components/JobFilters.js";
import type { StatsResponse } from "@jobfy/shared";

const mockStats: StatsResponse = {
  totalJobs: 5,
  bySource: [
    { source: "RemoteOK", count: 3 },
    { source: "Indeed", count: 2 },
  ],
  byCompany: [],
  byLocation: [],
  topTags: [],
};

const defaultProps = {
  search: "",
  onSearchChange: jest.fn(),
  sourceFilter: "",
  onSourceFilterChange: jest.fn(),
  stats: mockStats,
  onRefresh: jest.fn(),
  onClearAll: jest.fn(),
};

describe("JobFilters", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders search input and source dropdown", () => {
    render(<JobFilters {...defaultProps} />);
    expect(screen.getByLabelText("Search jobs")).toBeDefined();
    expect(screen.getByLabelText("Filter by source")).toBeDefined();
  });

  it("calls onSearchChange when user types", async () => {
    render(<JobFilters {...defaultProps} />);
    await userEvent.type(screen.getByLabelText("Search jobs"), "react");
    expect(defaultProps.onSearchChange).toHaveBeenCalled();
  });

  it("calls onSourceFilterChange when dropdown changes", async () => {
    render(<JobFilters {...defaultProps} />);
    await userEvent.selectOptions(screen.getByLabelText("Filter by source"), "RemoteOK");
    expect(defaultProps.onSourceFilterChange).toHaveBeenCalledWith("RemoteOK");
  });

  it("calls onRefresh when refresh button is clicked", async () => {
    render(<JobFilters {...defaultProps} />);
    await userEvent.click(screen.getByTitle("Refresh"));
    expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);
  });

  it("shows ConfirmDialog when clear all button is clicked", async () => {
    render(<JobFilters {...defaultProps} />);
    await userEvent.click(screen.getByTitle("Clear all"));
    expect(screen.getByText(/cannot be undone/i)).toBeDefined();
  });

  it("calls onClearAll after confirming dialog", async () => {
    render(<JobFilters {...defaultProps} />);
    await userEvent.click(screen.getByTitle("Clear all"));
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(defaultProps.onClearAll).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClearAll when cancel is clicked in dialog", async () => {
    render(<JobFilters {...defaultProps} />);
    await userEvent.click(screen.getByTitle("Clear all"));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(defaultProps.onClearAll).not.toHaveBeenCalled();
    expect(screen.queryByText(/cannot be undone/i)).toBeNull();
  });

  it("populates source options from stats", () => {
    render(<JobFilters {...defaultProps} />);
    expect(screen.getByRole("option", { name: "RemoteOK" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Indeed" })).toBeDefined();
  });
});
