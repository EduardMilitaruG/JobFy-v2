import { useScrape } from "../hooks/useScrape.js";
import { ScrapeForm } from "./ScrapeForm.js";
import { ScrapeLogTable } from "./ScrapeLogTable.js";

interface ScrapePanelProps {
  onScrapeComplete: () => void;
}

export function ScrapePanel({ onScrapeComplete }: ScrapePanelProps) {
  const {
    sites,
    selectedSites,
    toggleSite,
    keyword,
    setKeyword,
    location,
    setLocation,
    scraping,
    logs,
    message,
    startScrape,
  } = useScrape(onScrapeComplete);

  return (
    <div className="scrape-section">
      <ScrapeForm
        sites={sites}
        selectedSites={selectedSites}
        onToggleSite={toggleSite}
        keyword={keyword}
        onKeywordChange={setKeyword}
        location={location}
        onLocationChange={setLocation}
        scraping={scraping}
        message={message}
        onSubmit={startScrape}
      />

      <div className="scrape-logs">
        <h3>Recent Scrape Logs</h3>
        <ScrapeLogTable logs={logs} />
      </div>
    </div>
  );
}
