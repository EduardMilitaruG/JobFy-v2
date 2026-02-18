describe("Scrape tab", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/jobs*", {
      body: { data: [], total: 0, limit: 200, offset: 0 },
    });

    cy.intercept("GET", "/api/stats", {
      body: {
        totalJobs: 0,
        bySource: [],
        byCompany: [],
        byLocation: [],
        topTags: [],
      },
    });

    cy.intercept("GET", "/api/sites", {
      body: {
        sites: [
          { id: "remoteok", name: "RemoteOK", requiresAuth: false },
          { id: "indeed", name: "Indeed", requiresAuth: false },
          { id: "linkedin", name: "LinkedIn", requiresAuth: true },
        ],
      },
    }).as("getSites");

    cy.intercept("GET", "/api/scrape/logs", {
      body: {
        logs: [
          {
            id: 1,
            keyword: "react",
            location: "",
            sites: "remoteok",
            jobsFound: 10,
            status: "completed",
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            errorMessage: null,
          },
        ],
      },
    }).as("getLogs");

    cy.visit("/");
    cy.contains("Scrape").click();
    cy.wait(["@getSites", "@getLogs"]);
  });

  it("renders site toggles", () => {
    cy.contains("RemoteOK").should("be.visible");
    cy.contains("Indeed").should("be.visible");
    cy.contains("LinkedIn").should("be.visible");
  });

  it("shows auth badge on LinkedIn", () => {
    cy.contains("Auth").should("be.visible");
  });

  it("can select sites and enter keyword", () => {
    cy.contains("Indeed").click();
    cy.get('input[placeholder*="python"]').type("python developer");
    cy.get('input[placeholder*="Madrid"]').type("Madrid");
  });

  it("shows scrape logs", () => {
    cy.contains("Recent Scrape Logs").should("be.visible");
    cy.contains("remoteok").should("be.visible");
    cy.contains("10").should("be.visible");
  });

  it("can start a scrape", () => {
    cy.intercept("POST", "/api/scrape", {
      body: { message: "Scraping started", logId: 2 },
    }).as("startScrape");

    cy.contains("Start Scraping").click();
    cy.wait("@startScrape");
    cy.contains("Scraping started").should("be.visible");
  });
});
