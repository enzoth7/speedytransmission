import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

describe("dashboard", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("shows executive KPIs and supports navigation", async () => {
    const user = userEvent.setup();
    render(<DashboardApp />);
    expect(await screen.findByText("Speedy's Finance")).toBeInTheDocument();
    expect(screen.getByText("Estimated profit")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open revenue details" }));
    expect(await screen.findByText("What is generating revenue")).toBeInTheDocument();
    expect(window.location.hash).toBe("#revenue");
  });

  it("changes the period and keeps valid data", async () => {
    const user = userEvent.setup();
    render(<DashboardApp />);
    await screen.findByText("Speedy's Finance");
    await user.selectOptions(screen.getByLabelText("Period"), "month");
    await waitFor(() => expect(screen.getByText("Speedy's Finance")).toBeInTheDocument());
    expect(screen.getByText(/completed jobs/)).toBeInTheDocument();
  });

  it("shows purchase traceability and storage inventory", async () => {
    const user = userEvent.setup();
    render(<DashboardApp />);
    await screen.findByText("Speedy's Finance");
    await user.click(screen.getByRole("button", { name: "Parts Purchases" }));
    expect(await screen.findByRole("heading", { name: "Parts purchasing control" })).toBeInTheDocument();
    expect(screen.getByText("Purchase details")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Vehicle Storage" }));
    expect(await screen.findByRole("heading", { name: "Vehicles held in storage" })).toBeInTheDocument();
    expect(screen.getByText("Storage inventory")).toBeInTheDocument();
  });

  it("uses dashboard KPIs as drill-down controls", async () => {
    const user = userEvent.setup();
    render(<DashboardApp />);
    await screen.findByText("Speedy's Finance");
    await user.click(screen.getByRole("button", { name: "Open parts purchases" }));
    expect(await screen.findByRole("heading", { name: "Parts purchasing control" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Dashboard" }));
    await user.click(await screen.findByRole("button", { name: "Open vehicle storage" }));
    expect(await screen.findByRole("heading", { name: "Vehicles held in storage" })).toBeInTheDocument();
  });
});
