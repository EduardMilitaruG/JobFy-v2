import type { SiteInfo } from "@jobfy/shared";

interface SiteToggleProps {
  site: SiteInfo;
  selected: boolean;
  onToggle: (siteId: string) => void;
}

export function SiteToggle({ site, selected, onToggle }: SiteToggleProps) {
  return (
    <button
      className={`site-toggle ${selected ? "active" : ""}`}
      onClick={() => onToggle(site.id)}
      disabled={site.requiresAuth}
      title={
        site.requiresAuth
          ? "Requires authentication (configure in .env)"
          : undefined
      }
    >
      {site.name}
      {site.requiresAuth && <span className="auth-badge">Auth</span>}
    </button>
  );
}
