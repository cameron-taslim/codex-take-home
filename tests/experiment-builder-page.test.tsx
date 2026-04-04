import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  pushMock,
  refreshMock,
  redirectMock,
  requireUserSessionMock,
  saveDraftExperimentActionMock,
  generateExperimentActionMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  redirectMock: vi.fn(),
  requireUserSessionMock: vi.fn(),
  saveDraftExperimentActionMock: vi.fn(),
  generateExperimentActionMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  redirect: redirectMock,
}));

vi.mock("@/lib/auth/session", () => ({
  requireUserSession: requireUserSessionMock,
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: "user_1", email: "demo@example.com" },
  }),
}));

vi.mock("@/app/experiments/new/actions", () => ({
  saveDraftExperimentAction: saveDraftExperimentActionMock,
  generateExperimentAction: generateExperimentActionMock,
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children?: React.ReactNode;
  }) => (
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </main>
  ),
}));

import NewExperimentPage from "@/app/experiments/new/page";

describe("experiment builder page", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    redirectMock.mockReset();
    requireUserSessionMock.mockReset();
    saveDraftExperimentActionMock.mockReset();
    generateExperimentActionMock.mockReset();

    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });

    saveDraftExperimentActionMock.mockResolvedValue({
      values: {
        experimentId: "exp_123",
        name: "Holiday hero refresh",
        goal: "",
        pageType: "",
        targetAudience: "",
        tone: "",
        brandConstraints: "",
        seedContext: "",
      },
      experimentId: "exp_123",
      savedMessage: "Draft saved. Continue editing or generate variants.",
    });

    generateExperimentActionMock.mockResolvedValue({
      values: {
        experimentId: "exp_123",
        name: "Holiday hero refresh",
        goal: "Increase clickthrough",
        pageType: "Homepage hero",
        targetAudience: "Gift buyers",
        tone: "Confident",
        brandConstraints: "",
        seedContext: "",
      },
      experimentId: "exp_123",
      redirectTo: "/experiments/exp_123",
    });
  });

  it("redirects unauthenticated users to login", async () => {
    requireUserSessionMock.mockImplementation(async () => {
      redirectMock("/login");
      throw new Error("NEXT_REDIRECT");
    });

    await expect(NewExperimentPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("renders the builder layout and actions", async () => {
    render(await NewExperimentPage());

    expect(screen.getByRole("heading", { name: "Experiment Builder" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save Draft" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate Variants" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Generation guide")).toBeInTheDocument();
  });

  it("blocks generation when required fields are incomplete", async () => {
    render(await NewExperimentPage());

    fireEvent.click(screen.getByRole("button", { name: "Generate Variants" }));

    expect(generateExperimentActionMock).not.toHaveBeenCalled();
    expect(screen.getByText("Experiment name is required.")).toBeInTheDocument();
    expect(screen.getByText("Experiment goal is required.")).toBeInTheDocument();
    expect(screen.getByText("Target page type is required.")).toBeInTheDocument();
    expect(screen.getByText("Target audience is required.")).toBeInTheDocument();
    expect(screen.getByText("Tone is required.")).toBeInTheDocument();
  });

  it("saves a draft with the entered data and keeps the form recoverable", async () => {
    saveDraftExperimentActionMock.mockResolvedValue({
      values: {
        experimentId: "exp_123",
        name: "Holiday hero refresh",
        goal: "",
        pageType: "",
        targetAudience: "",
        tone: "",
        brandConstraints: "",
        seedContext: "Existing campaign callouts",
      },
      experimentId: "exp_123",
      savedMessage: "Draft saved. Continue editing or generate variants.",
    });

    render(await NewExperimentPage());

    fireEvent.change(screen.getByLabelText("Name *"), {
      target: { value: "Holiday hero refresh" },
    });
    fireEvent.change(screen.getByLabelText("Seed context"), {
      target: { value: "Existing campaign callouts" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Draft" }));

    await waitFor(() => {
      expect(saveDraftExperimentActionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Holiday hero refresh",
          goal: "",
          pageType: "",
          targetAudience: "",
          tone: "",
          brandConstraints: "",
          seedContext: "Existing campaign callouts",
        }),
      );
    });

    expect(
      await screen.findByText("Draft saved. Continue editing or generate variants."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name *")).toHaveValue("Holiday hero refresh");
    expect(screen.getByLabelText("Seed context")).toHaveValue(
      "Existing campaign callouts",
    );
  });

  it("routes to the detail page after a successful generation", async () => {
    render(await NewExperimentPage());

    fireEvent.change(screen.getByLabelText("Name *"), {
      target: { value: "Holiday hero refresh" },
    });
    fireEvent.change(screen.getByLabelText("Goal *"), {
      target: { value: "Increase clickthrough" },
    });
    fireEvent.change(screen.getByLabelText("Target page type *"), {
      target: { value: "Homepage hero" },
    });
    fireEvent.change(screen.getByLabelText("Target audience *"), {
      target: { value: "Gift buyers" },
    });
    fireEvent.change(screen.getByLabelText("Tone *"), {
      target: { value: "Confident" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate Variants" }));

    await waitFor(() => {
      expect(generateExperimentActionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Holiday hero refresh",
          goal: "Increase clickthrough",
          pageType: "Homepage hero",
          targetAudience: "Gift buyers",
          tone: "Confident",
          brandConstraints: "",
          seedContext: "",
        }),
      );
      expect(pushMock).toHaveBeenCalledWith("/experiments/exp_123");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("shows a recoverable error when generation fails and preserves inputs", async () => {
    generateExperimentActionMock.mockResolvedValue({
      values: {
        experimentId: "exp_123",
        name: "Holiday hero refresh",
        goal: "Increase clickthrough",
        pageType: "Homepage hero",
        targetAudience: "Gift buyers",
        tone: "Confident",
        brandConstraints: "",
        seedContext: "Existing campaign callouts",
      },
      experimentId: "exp_123",
      formError: "provider down",
    });

    render(await NewExperimentPage());

    fireEvent.change(screen.getByLabelText("Name *"), {
      target: { value: "Holiday hero refresh" },
    });
    fireEvent.change(screen.getByLabelText("Goal *"), {
      target: { value: "Increase clickthrough" },
    });
    fireEvent.change(screen.getByLabelText("Target page type *"), {
      target: { value: "Homepage hero" },
    });
    fireEvent.change(screen.getByLabelText("Target audience *"), {
      target: { value: "Gift buyers" },
    });
    fireEvent.change(screen.getByLabelText("Tone *"), {
      target: { value: "Confident" },
    });
    fireEvent.change(screen.getByLabelText("Seed context"), {
      target: { value: "Existing campaign callouts" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate Variants" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("provider down");
    expect(screen.getByLabelText("Name *")).toHaveValue("Holiday hero refresh");
    expect(screen.getByLabelText("Seed context")).toHaveValue(
      "Existing campaign callouts",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
