import { useState } from "react";
import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import { TabNavigation } from "./components/TabNavigation.js";
import { JobFilters } from "./components/JobFilters.js";
import { JobTable } from "./components/JobTable.js";
import { JobPagination } from "./components/JobPagination.js";
import { StatsCharts } from "./components/StatsCharts.js";
import { ScrapePanel } from "./components/ScrapePanel.js";
import { useJobs } from "./hooks/useJobs.js";
import { useStats } from "./hooks/useStats.js";
import "./styles/globals.css";
import "./styles/components.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("jobs");

  const {
    jobs,
    total,
    loading,
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
    offset,
    setOffset,
    limit,
    refresh: refreshJobs,
    deleteJob,
    clearAll,
  } = useJobs();

  const { stats, refresh: refreshStats } = useStats();

  const refreshAll = () => {
    refreshJobs();
    refreshStats();
  };

  return (
    <div className="app">
      <Header />

      <main className="main">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          jobCount={total}
        />

        {activeTab === "jobs" && (
          <div className="jobs-section">
            <JobFilters
              search={search}
              onSearchChange={setSearch}
              sourceFilter={sourceFilter}
              onSourceFilterChange={setSourceFilter}
              stats={stats}
              onRefresh={refreshAll}
              onClearAll={() => {
                clearAll();
                refreshStats();
              }}
            />
            <JobTable jobs={jobs} loading={loading} onDelete={deleteJob} />
            <JobPagination
              total={total}
              limit={limit}
              offset={offset}
              onOffsetChange={setOffset}
            />
          </div>
        )}

        {activeTab === "stats" && <StatsCharts stats={stats} />}

        {activeTab === "scrape" && (
          <ScrapePanel onScrapeComplete={refreshAll} />
        )}
      </main>

      <Footer />
    </div>
  );
}
