interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  jobCount: number;
}

const TABS = [
  { id: "jobs",     label: "Jobs",     num: "01" },
  { id: "stats",    label: "Stats",    num: "02" },
  { id: "scrape",   label: "Scrape",   num: "03" },
  { id: "cv-match", label: "CV Match", num: "04" },
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
          <span className="tab-num">{tab.num}</span>
          {tab.label}
          {tab.id === "jobs" && jobCount > 0 && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
              ({jobCount})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
