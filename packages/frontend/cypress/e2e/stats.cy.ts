describe("Statistics tab", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/jobs*", {
      body: { data: [], total: 0, limit: 200, offset: 0 },
    });

    cy.intercept("GET", "/api/stats", {
      body: {
        totalJobs: 50,
        bySource: [
          { source: "RemoteOK", count: 30 },
          { source: "Indeed", count: 20 },
        ],
        byCompany: [
          { company: "Google", count: 10 },
          { company: "Meta", count: 8 },
        ],
        byLocation: [
          { location: "Remote", count: 25 },
          { location: "Madrid", count: 15 },
        ],
        topTags: [
          { tag: "React", count: 15 },
          { tag: "Python", count: 12 },
        ],
      },
    }).as("getStats");

    cy.intercept("GET", "/api/sites", {
      body: { sites: [] },
    });

    cy.visit("/");
    cy.contains("Statistics").click();
    cy.wait("@getStats");
  });

  it("shows stat cards", () => {
    cy.contains("50").should("be.visible");
    cy.contains("Total Jobs").should("be.visible");
    cy.contains("Companies").should("be.visible");
    cy.contains("Locations").should("be.visible");
  });

  it("shows chart titles", () => {
    cy.contains("Jobs by Source").should("be.visible");
    cy.contains("Top Companies").should("be.visible");
    cy.contains("Most Requested Skills").should("be.visible");
    cy.contains("Top Locations").should("be.visible");
  });
});
