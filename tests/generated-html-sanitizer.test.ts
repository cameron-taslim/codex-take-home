import { describe, expect, it } from "vitest";
import {
  HtmlSanitizationError,
  sanitizeGeneratedHtml,
} from "@/lib/sanitization/generated-html";

describe("generated html sanitizer", () => {
  it("strips scripts, event handlers, dangerous urls, and forbidden css", () => {
    const result = sanitizeGeneratedHtml(
      [
        '<section onclick="alert(1)" style="display: flex; position: absolute; width: 160%; background: url(https://bad.test/a.png); padding: 24px;">',
        '<script>alert(1)</script>',
        '<a href="javascript:alert(1)" style="text-decoration: underline;">Shop now</a>',
        '<p style="font-size: 18px; max-width: 180%;">Safer preview</p>',
        "</section>",
      ].join(""),
    );

    expect(result).not.toContain("script");
    expect(result).not.toContain("onclick");
    expect(result).not.toContain("javascript:");
    expect(result).not.toContain("position: absolute");
    expect(result).not.toContain("url(");
    expect(result).toContain('style="display: flex; width: 100%; padding: 24px"');
    expect(result).toContain('style="font-size: 18px; max-width: 100%"');
  });

  it("preserves allowed semantic and layout markup", () => {
    const result = sanitizeGeneratedHtml(
      '<section style="display: grid; gap: 12px;"><h1 style="margin: 0;">Wear what lasts</h1><p style="line-height: 1.6;">Product-led copy.</p></section>',
    );

    expect(result).toContain("<section");
    expect(result).toContain("<h1");
    expect(result).toContain("<p");
    expect(result).toContain("display: grid");
    expect(result).toContain("gap: 12px");
  });

  it("rejects full document html", () => {
    expect(() =>
      sanitizeGeneratedHtml("<html><body><h1>Unsafe</h1></body></html>"),
    ).toThrow(HtmlSanitizationError);
  });
});
