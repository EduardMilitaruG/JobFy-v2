/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobRow } from "../components/JobRow.js";
import type { Job } from "@jobfy/shared";

const mockJob: Job = {
  id: 1,
  jobTitle: "React Developer",
  company: "TechCorp",
  location: "Remote",
  salary: "$100k",
  tags: "React, TypeScript, Node.js",
  applyLink: "https://example.com/job/1",
  source: "RemoteOK",
  createdAt: new Date().toISOString(),
};

// Wrap in table/tbody so <tr> is valid in the DOM
function renderRow(onDelete = jest.fn()) {
  return render(
    <table>
      <tbody>
        <JobRow job={mockJob} onDelete={onDelete} />
      </tbody>
    </table>,
  );
}

describe("JobRow", () => {
  it("renders job title, company and location", () => {
    renderRow();
    expect(screen.getByText("React Developer")).toBeDefined();
    expect(screen.getByText("TechCorp")).toBeDefined();
    expect(screen.getByText("Remote")).toBeDefined();
  });

  it("renders up to 3 tags", () => {
    renderRow();
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("TypeScript")).toBeDefined();
    expect(screen.getByText("Node.js")).toBeDefined();
  });

  it("renders source badge", () => {
    renderRow();
    expect(screen.getByText("RemoteOK")).toBeDefined();
  });

  it("opens ConfirmDialog when delete button is clicked", async () => {
    renderRow();
    await userEvent.click(screen.getByTitle("Delete"));
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
  });

  it("calls onDelete after confirming dialog", async () => {
    const onDelete = jest.fn();
    renderRow(onDelete);
    await userEvent.click(screen.getByTitle("Delete"));
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("does NOT call onDelete when cancel is clicked", async () => {
    const onDelete = jest.fn();
    renderRow(onDelete);
    await userEvent.click(screen.getByTitle("Delete"));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("closes dialog after cancel", async () => {
    renderRow();
    await userEvent.click(screen.getByTitle("Delete"));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("button", { name: "Confirm" })).toBeNull();
  });
});
