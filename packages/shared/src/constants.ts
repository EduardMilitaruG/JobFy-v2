export const SITE_IDS = [
  "remoteok",
  "infojobs",
  "linkedin",
  "indeed",
  "tecnoempleo",
] as const;

export type SiteId = (typeof SITE_IDS)[number];

export const SITE_COLORS: Record<string, string> = {
  RemoteOK: "#ff6b6b",
  Indeed: "#2164f3",
  LinkedIn: "#0077b5",
  InfoJobs: "#167db7",
  Tecnoempleo: "#e94e1b",
};
