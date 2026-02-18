describe("Jobs tab", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/jobs*", {
      body: {
        data: [
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
        ],
        total: 2,
        limit: 200,
        offset: 0,
      },
    }).as("getJobs");

    cy.intercept("GET", "/api/stats", {
      body: {
        totalJobs: 2,
        bySource: [{ source: "RemoteOK", count: 1 }, { source: "Indeed", count: 1 }],
        byCompany: [{ company: "TechCorp", count: 1 }],
        byLocation: [{ location: "Remote", count: 1 }],
        topTags: [{ tag: "React", count: 1 }],
      },
    }).as("getStats");

    cy.intercept("GET", "/api/sites", {
      body: { sites: [{ id: "remoteok", name: "RemoteOK", requiresAuth: false }] },
    }).as("getSites");

    cy.visit("/");
    cy.wait(["@getJobs", "@getStats"]);
  });

  it("renders the job table with jobs", () => {
    cy.contains("React Developer").should("be.visible");
    cy.contains("Python Engineer").should("be.visible");
    cy.contains("TechCorp").should("be.visible");
  });

  it("shows job count in tab", () => {
    cy.contains("Jobs (2)").should("be.visible");
  });

  it("has search functionality", () => {
    cy.get('input[placeholder*="Search"]').type("React");
    cy.wait("@getJobs");
  });

  it("has source filter dropdown", () => {
    cy.get(".source-filter").select("RemoteOK");
    cy.wait("@getJobs");
  });

  it("can delete a job", () => {
    cy.intercept("DELETE", "/api/jobs/1", { body: { message: "Deleted" } }).as(
      "deleteJob",
    );

    cy.get('button[title="Delete"]').first().click();
    cy.wait("@deleteJob");
  });
});
