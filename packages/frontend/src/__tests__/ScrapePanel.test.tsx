/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { ScrapeForm } from "../components/ScrapeForm.js";
import type { SiteInfo } from "@jobfy/shared";

const mockSites: SiteInfo[] = [
  { id: "remoteok", name: "RemoteOK", requiresAuth: false },
  { id: "indeed", name: "Indeed", requiresAuth: false },
  { id: "linkedin", name: "LinkedIn", requiresAuth: true },
];

describe("ScrapeForm", () => {
  const defaultProps = {
    sites: mockSites,
    selectedSites: ["remoteok"],
    onToggleSite: jest.fn(),
    keyword: "",
    onKeywordChange: jest.fn(),
    location: "",
    onLocationChange: jest.fn(),
    scraping: false,
    message: null,
    onSubmit: jest.fn(),
  };

  it("renders site toggle buttons", () => {
    render(<ScrapeForm {...defaultProps} />);
    expect(screen.getByText("RemoteOK")).toBeDefined();
    expect(screen.getByText("Indeed")).toBeDefined();
    expect(screen.getByText("LinkedIn")).toBeDefined();
  });

  it("shows auth badge for auth-required sites", () => {
    render(<ScrapeForm {...defaultProps} />);
    const authBadges = screen.getAllByText("Auth");
    expect(authBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders keyword and location inputs", () => {
    render(<ScrapeForm {...defaultProps} />);
    expect(screen.getByPlaceholderText(/python, react/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Madrid, Remote/i)).toBeDefined();
  });

  it("renders start button", () => {
    render(<ScrapeForm {...defaultProps} />);
    expect(screen.getByText("Start Scraping")).toBeDefined();
  });

  it("shows scraping state", () => {
    render(<ScrapeForm {...defaultProps} scraping={true} />);
    expect(screen.getByText("Scraping...")).toBeDefined();
  });

  it("renders success message", () => {
    render(
      <ScrapeForm
        {...defaultProps}
        message={{ type: "success", text: "Scraping started!" }}
      />,
    );
    expect(screen.getByText("Scraping started!")).toBeDefined();
  });

  it("renders error message", () => {
    render(
      <ScrapeForm
        {...defaultProps}
        message={{ type: "error", text: "Something failed" }}
      />,
    );
    expect(screen.getByText("Something failed")).toBeDefined();
  });
});
