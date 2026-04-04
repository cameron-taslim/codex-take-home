import { describe, expect, it } from "vitest";
import {
  isProtectedPath,
  shouldRedirectAuthenticatedUser,
} from "@/lib/auth/config";

describe("auth route policy", () => {
  it("identifies protected routes", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/experiments/new")).toBe(true);
    expect(isProtectedPath("/experiments/abc")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
  });

  it("redirects authenticated users away from login", () => {
    expect(shouldRedirectAuthenticatedUser("/login")).toBe(true);
    expect(shouldRedirectAuthenticatedUser("/dashboard")).toBe(false);
  });
});
