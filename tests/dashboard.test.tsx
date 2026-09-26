import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

describe("dashboard", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("muestra KPIs ejecutivos y permite navegar", async () => {
    const user = userEvent.setup();
    render(<DashboardApp />);
    expect(await screen.findByText("El negocio, en números")).toBeInTheDocument();
    expect(screen.getByText("Utilidad neta")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Abrir detalle de ingresos" }));
    expect(await screen.findByText("Qué está generando dinero")).toBeInTheDocument();
    expect(window.location.hash).toBe("#ingresos");
  });

  it("cambia el período y conserva datos válidos", async () => {
    const user = userEvent.setup();
    render(<DashboardApp />);
    await screen.findByText("El negocio, en números");
    await user.selectOptions(screen.getByLabelText("Período"), "month");
    await waitFor(() => expect(screen.getByText("El negocio, en números")).toBeInTheDocument());
    expect(screen.getByText(/trabajos finalizados/)).toBeInTheDocument();
  });

  it("expone la trazabilidad de compras y el inventario del depósito", async () => {
    const user = userEvent.setup();
    render(<DashboardApp />);
    await screen.findByText("El negocio, en números");
    await user.click(screen.getByRole("button", { name: "Compras" }));
    expect(await screen.findByRole("heading", { name: "Control de compras y repuestos" })).toBeInTheDocument();
    expect(screen.getByText("Detalle de cada compra")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Autos en depósito" }));
    expect(await screen.findByRole("heading", { name: "Autos inmovilizados en el depósito" })).toBeInTheDocument();
    expect(screen.getByText("Inventario del depósito")).toBeInTheDocument();
  });

  it("usa los KPIs del resumen como accesos a su detalle", async () => {
    const user = userEvent.setup();
    render(<DashboardApp />);
    await screen.findByText("El negocio, en números");
    await user.click(screen.getByRole("button", { name: "Abrir detalle de compras" }));
    expect(await screen.findByRole("heading", { name: "Control de compras y repuestos" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resumen" }));
    await user.click(await screen.findByRole("button", { name: "Abrir autos en depósito" }));
    expect(await screen.findByRole("heading", { name: "Autos inmovilizados en el depósito" })).toBeInTheDocument();
  });
});
