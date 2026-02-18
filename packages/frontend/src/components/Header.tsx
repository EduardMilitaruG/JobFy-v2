import { Briefcase } from "lucide-react";

export function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Briefcase size={28} />
          <h1>JobFy</h1>
        </div>
        <p className="tagline">Job Scraper Dashboard</p>
      </div>
    </header>
  );
}
