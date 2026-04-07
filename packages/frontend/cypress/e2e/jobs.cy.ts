const mockJobs = [
  {
    id: 1,
    jobTitle: "React Developer",
    company: "TechCorp",
    location: "Remote",
    salary: "$100k",
    tags: "React, TypeScript",
    applyLink: "https://example.com/1",
    source: "RemoteOK",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    jobTitle: "Python Engineer",
    company: "DataCo",
    location: "Madrid",
    salary: "N/A",
    tags: "Python, Django",
    applyLink: "https://example.com/2",
    source: "Indeed",
    createdAt: new Date().toISOString(),
  },
];

const mockStats = {
  totalJobs: 2,
  bySource: [
    { source: "RemoteOK", count: 1 },
    { source: "Indeed", count: 1 },
  ],
  byCompany: [{ company: "TechCorp", count: 1 }],
  byLocation: [{ location: "Remote", count: 1 }],
  topTags: [{ tag: "React", count: 1 }],
};

describe("Jobs tab", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/jobs*", {
      body: { data: mockJobs, total: 2, limit: 200, offset: 0 },
    }).as("getJobs");

    cy.intercept("GET", "/api/stats", { body: mockStats }).as("getStats");

    cy.intercept("GET", "/api/sites", {
      body: { sites: [{ id: "remoteok", name: "RemoteOK", requiresAuth: false }] },
    }).as("getSites");

    cy.visit("/");
    cy.wait(["@getJobs", "@getStats"]);
  });

  it("has no accessibility violations on load", () => {
    cy.injectAxe();
    cy.checkA11y(undefined, {
      rules: { "color-contrast": { enabled: false } },
    });
  });

  it("renders the job table with jobs", () => {
    cy.contains("React Developer").should("be.visible");
    cy.contains("Python Engineer").should("be.visible");
    cy.contains("TechCorp").should("be.visible");
  });

  it("shows job count in tab", () => {
    cy.contains("Jobs (2)").should("be.visible");
  });

  it("filters jobs when searching", () => {
    cy.intercept("GET", "/api/jobs*search=React*", {
      body: { data: [mockJobs[0]], total: 1, limit: 200, offset: 0 },
    }).as("searchJobs");

    cy.get('input[aria-label="Search jobs"]').type("React");
    cy.wait("@searchJobs");
    cy.contains("React Developer").should("be.visible");
  });

  it("filters jobs by source dropdown", () => {
    cy.intercept("GET", "/api/jobs*source=RemoteOK*", {
      body: { data: [mockJobs[0]], total: 1, limit: 200, offset: 0 },
    }).as("filterJobs");

    cy.get('select[aria-label="Filter by source"]').select("RemoteOK");
    cy.wait("@filterJobs");
  });

  it("deletes a single job via ConfirmDialog", () => {
    cy.intercept("DELETE", "/api/jobs/1", { body: { message: "Deleted" } }).as("deleteJob");

    cy.get('button[title="Delete"]').first().click();

    // ConfirmDialog should appear
    cy.contains("React Developer").should("be.visible"); // message in dialog
    cy.contains("button", "Confirm").click();
    cy.wait("@deleteJob");
  });

  it("cancels single job delete when Cancel is clicked", () => {
    cy.get('button[title="Delete"]').first().click();
    cy.contains("button", "Cancel").click();

    // Dialog gone, job still visible
    cy.contains("React Developer").should("be.visible");
    cy.contains("button", "Confirm").should("not.exist");
  });

  it("clears all jobs via ConfirmDialog", () => {
    cy.intercept("DELETE", "/api/jobs", { body: { message: "All deleted" } }).as("clearAll");
    cy.intercept("GET", "/api/jobs*", {
      body: { data: [], total: 0, limit: 200, offset: 0 },
    });

    cy.get('button[title="Clear all"]').click();
    cy.contains("cannot be undone").should("be.visible");
    cy.contains("button", "Confirm").click();
    cy.wait("@clearAll");
  });

  it("cancels clear all when Cancel is clicked", () => {
    cy.get('button[title="Clear all"]').click();
    cy.contains("button", "Cancel").click();
    cy.contains("button", "Confirm").should("not.exist");
    cy.contains("React Developer").should("be.visible");
  });

  it("shows error banner when API fails", () => {
    cy.intercept("GET", "/api/jobs*", { forceNetworkError: true }).as("failedJobs");
    cy.reload();
    cy.wait("@failedJobs");
    cy.get('[role="alert"]').should("be.visible");
  });
});
