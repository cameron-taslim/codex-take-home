import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { getTokenMock } = vi.hoisted(() => ({
  getTokenMock: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: getTokenMock,
}));

import middleware from "@/lib/auth/middleware";

describe("auth middleware", () => {
  it("redirects unauthenticated protected requests to login with a callback URL", async () => {
    getTokenMock.mockResolvedValue(null);

    const response = await middleware(
      new NextRequest("http://127.0.0.1:3001/experiments/new"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toMatch(
      /\/login\?callbackUrl=%2Fexperiments%2Fnew$/,
    );
  });

  it("redirects authenticated login requests to the authenticated entry route", async () => {
    getTokenMock.mockResolvedValue({ sub: "user_1" });

    const response = await middleware(
      new NextRequest("http://127.0.0.1:3001/login"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toMatch(/\/$/);
  });

  it("allows authenticated requests to protected routes", async () => {
    getTokenMock.mockResolvedValue({ sub: "user_1" });

    const response = await middleware(
      new NextRequest("http://127.0.0.1:3001/dashboard"),
    );

    expect(response.status).toBe(200);
  });
});
