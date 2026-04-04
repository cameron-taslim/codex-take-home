import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  pushMock,
  refreshMock,
  signInMock,
  getServerSessionMock,
  redirectMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  signInMock: vi.fn(),
  getServerSessionMock: vi.fn(),
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

import LoginPage from "@/app/login/page";
import { LoginForm } from "@/components/auth/login-form";

describe("login page", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signInMock.mockReset();
    getServerSessionMock.mockReset();
    redirectMock.mockReset();
  });

  it("redirects authenticated users to the dashboard", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });

    await LoginPage();

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
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

  it("redirects to the dashboard after a successful sign-in", async () => {
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
        callbackUrl: "/dashboard",
      });
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
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
