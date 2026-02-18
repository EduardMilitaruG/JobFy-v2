import { Play, Loader2 } from "lucide-react";
import type { SiteInfo } from "@jobfy/shared";
import { SiteToggle } from "./SiteToggle.js";

interface ScrapeFormProps {
  sites: SiteInfo[];
  selectedSites: string[];
  onToggleSite: (siteId: string) => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  scraping: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onSubmit: () => void;
}

export function ScrapeForm({
  sites,
  selectedSites,
  onToggleSite,
  keyword,
  onKeywordChange,
  location,
  onLocationChange,
  scraping,
  message,
  onSubmit,
}: ScrapeFormProps) {
  return (
    <div className="scrape-form">
      <h3>Start New Scrape</h3>

      <div className="form-group">
        <label>Select Sites</label>
        <div className="site-toggles">
          {sites.map((site) => (
            <SiteToggle
              key={site.id}
              site={site}
              selected={selectedSites.includes(site.id)}
              onToggle={onToggleSite}
            />
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Keyword</label>
          <input
            type="text"
            placeholder="e.g., python, react, data engineer"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            placeholder="e.g., Madrid, Remote"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <button
        onClick={onSubmit}
        disabled={scraping || selectedSites.length === 0}
        className="btn btn-primary btn-lg"
      >
        {scraping ? (
          <>
            <Loader2 size={18} className="spinning" />
            Scraping...
          </>
        ) : (
          <>
            <Play size={18} />
            Start Scraping
          </>
        )}
      </button>
    </div>
  );
}
