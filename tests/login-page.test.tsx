import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  pushMock,
  refreshMock,
  signInMock,
  getServerSessionMock,
  getAuthenticatedHomePathMock,
  redirectMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  signInMock: vi.fn(),
  getServerSessionMock: vi.fn(),
  getAuthenticatedHomePathMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  redirect: redirectMock,
}));

vi.mock("next-auth/react", () => ({
  signIn: signInMock,
}));

vi.mock("@/lib/auth/session", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/navigation", () => ({
  getAuthenticatedHomePath: getAuthenticatedHomePathMock,
}));

import LoginPage from "@/app/login/page";
import { LoginForm } from "@/components/auth/login-form";

describe("login page", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signInMock.mockReset();
    getServerSessionMock.mockReset();
    getAuthenticatedHomePathMock.mockReset();
    redirectMock.mockReset();
  });

  it("redirects authenticated users into the experiment workspace", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    getAuthenticatedHomePathMock.mockResolvedValue("/experiments/exp_123");

    await LoginPage();

    expect(getAuthenticatedHomePathMock).toHaveBeenCalledWith("user_1");
    expect(redirectMock).toHaveBeenCalledWith("/experiments/exp_123");
  });

  it("shows an inline error for invalid credentials and preserves values", async () => {
    signInMock.mockResolvedValue({ error: "CredentialsSignin" });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "demo@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
    expect(screen.getByLabelText(/email/i)).toHaveValue("demo@example.com");
    expect(screen.getByLabelText(/password/i)).toHaveValue("wrong-password");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("routes to the authenticated home resolver after a successful sign-in", async () => {
    signInMock.mockResolvedValue({ ok: true, error: undefined });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "demo@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("credentials", {
        email: "demo@example.com",
        password: "password123",
        redirect: false,
        callbackUrl: "/",
      });
      expect(pushMock).toHaveBeenCalledWith("/");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("shows a retryable error for unexpected auth failures", async () => {
    signInMock.mockRejectedValue(new Error("unexpected"));

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "demo@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sign in failed. Try again.",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
