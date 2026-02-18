interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  jobCount: number;
}

const TABS = [
  { id: "jobs", label: "Jobs" },
  { id: "stats", label: "Statistics" },
  { id: "scrape", label: "Scrape" },
];

export function TabNavigation({
  activeTab,
  onTabChange,
  jobCount,
}: TabNavigationProps) {
  return (
    <div className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {tab.id === "jobs" ? ` (${jobCount})` : ""}
        </button>
      ))}
    </div>
  );
}
