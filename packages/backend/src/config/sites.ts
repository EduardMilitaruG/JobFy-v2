import type { SiteConfig } from "@jobfy/shared";

export interface Credentials {
  username: string;
  password: string;
}

export interface FullSiteConfig extends SiteConfig {
  credentials?: Credentials;
}

function getCredentials(
  prefix: string,
): Credentials | undefined {
  const username = process.env[`${prefix}_USERNAME`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (username && password) return { username, password };
  return undefined;
}

export const SITES_CONFIG: Record<string, FullSiteConfig> = {
  remoteok: {
    name: "RemoteOK",
    baseUrl: "https://remoteok.com",
    requiresAuth: false,
  },
  infojobs: {
    name: "InfoJobs",
    baseUrl: "https://www.infojobs.net",
    requiresAuth: true,
    credentials: getCredentials("INFOJOBS"),
  },
  linkedin: {
    name: "LinkedIn",
    baseUrl: "https://www.linkedin.com",
    requiresAuth: true,
    credentials: getCredentials("LINKEDIN"),
  },
  indeed: {
    name: "Indeed",
    baseUrl: "https://www.indeed.com",
    requiresAuth: false,
  },
  tecnoempleo: {
    name: "Tecnoempleo",
    baseUrl: "https://www.tecnoempleo.com",
    requiresAuth: false,
  },
};

export const REQUEST_TIMEOUT = 30_000;
export const REQUEST_DELAY = 2_000;

export const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  Connection: "keep-alive",
};
