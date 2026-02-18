import { useState, useEffect, useCallback } from "react";
import type { SiteInfo, ScrapeLog } from "@jobfy/shared";
import * as scrapeApi from "../services/scrape.api.js";

export function useScrape(onComplete?: () => void) {
  const [sites, setSites] = useState<SiteInfo[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>(["remoteok"]);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [scraping, setScraping] = useState(false);
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await scrapeApi.fetchScrapeLogs();
      setLogs(data.logs);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  }, []);

  useEffect(() => {
    scrapeApi.fetchSites().then((d) => setSites(d.sites)).catch(console.error);
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const toggleSite = (siteId: string) => {
    setSelectedSites((prev) =>
      prev.includes(siteId)
        ? prev.filter((s) => s !== siteId)
        : [...prev, siteId],
    );
  };

  const startScrape = async () => {
    if (selectedSites.length === 0) {
      setMessage({ type: "error", text: "Select at least one site" });
      return;
    }

    setScraping(true);
    setMessage(null);

    try {
      await scrapeApi.startScrape({
        sites: selectedSites,
        keyword: keyword || undefined,
        location: location || undefined,
      });
      setMessage({
        type: "success",
        text: "Scraping started! Check logs below.",
      });
      fetchLogs();
      setTimeout(() => {
        fetchLogs();
        onComplete?.();
      }, 5000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Connection error",
      });
    }

    setScraping(false);
  };

  return {
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
  };
}
