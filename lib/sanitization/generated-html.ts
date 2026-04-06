import { JSDOM } from "jsdom";

const ALLOWED_TAGS = new Set([
  "a",
  "article",
  "aside",
  "b",
  "blockquote",
  "br",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
  "ol",
  "p",
  "section",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "ul",
]);

const REMOVE_WITH_CONTENT_TAGS = new Set([
  "button",
  "embed",
  "form",
  "iframe",
  "input",
  "link",
  "meta",
  "object",
  "script",
  "select",
  "style",
  "textarea",
]);

const ALLOWED_GLOBAL_ATTRIBUTES = new Set([
  "aria-hidden",
  "aria-label",
  "role",
  "style",
  "title",
]);

const ALLOWED_TAG_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "rel", "target"]),
  img: new Set(["alt", "height", "src", "width"]),
};

const ALLOWED_CSS_PROPERTIES = new Set([
  "align-items",
  "aspect-ratio",
  "background",
  "background-color",
  "border",
  "border-bottom",
  "border-color",
  "border-left",
  "border-radius",
  "border-right",
  "border-style",
  "border-top",
  "border-width",
  "box-shadow",
  "color",
  "display",
  "flex",
  "flex-direction",
  "flex-wrap",
  "font-size",
  "font-style",
  "font-weight",
  "gap",
  "grid-template-columns",
  "grid-template-rows",
  "height",
  "justify-content",
  "letter-spacing",
  "line-height",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "max-height",
  "max-width",
  "min-height",
  "min-width",
  "object-fit",
  "opacity",
  "overflow",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "position",
  "text-align",
  "text-decoration",
  "text-transform",
  "width",
  "word-break",
  "overflow-wrap",
]);

const SAFE_VALUE_PATTERN = /^[#(),.%/\-+\s\w"]+$/i;
const FORBIDDEN_HTML_PATTERN = /<\/?(?:html|head|body)\b|<!doctype/i;
const FORBIDDEN_CSS_VALUE_PATTERN =
  /(calc\(|expression\(|javascript:|@import|url\(|var\(|vb|vi|viewport|<|>|\\)/i;
const VIEWPORT_UNIT_PATTERN = /(^|[\s,(])[-\d.]+(?:vw|vh|vmin|vmax)\b/i;
const ALLOWED_DISPLAY_VALUES = new Set([
  "block",
  "flex",
  "grid",
  "inline",
  "inline-block",
  "inline-flex",
  "inline-grid",
]);
const ALLOWED_POSITION_VALUES = new Set(["relative", "static"]);
const ALLOWED_OVERFLOW_VALUES = new Set(["clip", "hidden"]);
const ALLOWED_TEXT_ALIGN_VALUES = new Set(["center", "justify", "left", "right"]);
const ALLOWED_TEXT_TRANSFORM_VALUES = new Set([
  "capitalize",
  "lowercase",
  "none",
  "uppercase",
]);
const ALLOWED_TEXT_DECORATION_VALUES = new Set([
  "line-through",
  "none",
  "underline",
]);
const ALLOWED_OBJECT_FIT_VALUES = new Set(["contain", "cover", "fill", "scale-down"]);
const ALLOWED_FLEX_DIRECTION_VALUES = new Set([
  "column",
  "column-reverse",
  "row",
  "row-reverse",
]);
const ALLOWED_FLEX_WRAP_VALUES = new Set(["nowrap", "wrap"]);
const ALLOWED_ALIGNMENT_VALUES = new Set([
  "center",
  "end",
  "flex-end",
  "flex-start",
  "space-around",
  "space-between",
  "space-evenly",
  "start",
  "stretch",
]);
const ALLOWED_WORD_BREAK_VALUES = new Set(["break-word", "break-all", "normal"]);
const ALLOWED_OVERFLOW_WRAP_VALUES = new Set(["anywhere", "break-word", "normal"]);

export class HtmlSanitizationError extends Error {}

export function sanitizeGeneratedHtml(rawHtml: string) {
  const input = rawHtml.trim();

  if (!input) {
    throw new HtmlSanitizationError("Generated HTML preview was empty.");
  }

  if (FORBIDDEN_HTML_PATTERN.test(input)) {
    throw new HtmlSanitizationError(
      "Generated HTML preview must be a fragment, not a full document.",
    );
  }

  const dom = new JSDOM(`<body>${input}</body>`);
  const { document, Node } = dom.window;
  const body = document.body;

  sanitizeChildren(body, document, Node);

  const sanitized = body.innerHTML.trim();

  if (!sanitized) {
    throw new HtmlSanitizationError(
      "Generated HTML preview was empty after sanitization.",
    );
  }

  return sanitized;
}

function sanitizeChildren(
  parent: HTMLElement,
  document: Document,
  nodeTypes: typeof Node,
) {
  for (const child of [...parent.childNodes]) {
    sanitizeNode(child, document, nodeTypes);
  }
}

function sanitizeNode(node: Node, document: Document, nodeTypes: typeof Node) {
  if (node.nodeType === nodeTypes.TEXT_NODE) {
    return;
  }

  if (node.nodeType !== nodeTypes.ELEMENT_NODE) {
    node.parentNode?.removeChild(node);
    return;
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();

  if (REMOVE_WITH_CONTENT_TAGS.has(tagName)) {
    element.remove();
    return;
  }

  if (!ALLOWED_TAGS.has(tagName)) {
    unwrapElement(element, document);
    return;
  }

  sanitizeAttributes(element);

  if (tagName === "img" && !element.getAttribute("src")) {
    element.remove();
    return;
  }

  sanitizeChildren(element, document, nodeTypes);
}

function unwrapElement(element: HTMLElement, document: Document) {
  const fragment = document.createDocumentFragment();

  while (element.firstChild) {
    fragment.appendChild(element.firstChild);
  }

  element.replaceWith(fragment);
}

function sanitizeAttributes(element: HTMLElement) {
  const tagName = element.tagName.toLowerCase();
  const allowedTagAttributes = ALLOWED_TAG_ATTRIBUTES[tagName] ?? new Set<string>();

  for (const attribute of [...element.attributes]) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value.trim();

    if (name.startsWith("on")) {
      element.removeAttribute(attribute.name);
      continue;
    }

    if (
      !ALLOWED_GLOBAL_ATTRIBUTES.has(name) &&
      !allowedTagAttributes.has(name)
    ) {
      element.removeAttribute(attribute.name);
      continue;
    }

    if (name === "style") {
      const sanitizedStyle = sanitizeInlineStyle(value);

      if (sanitizedStyle) {
        element.setAttribute("style", sanitizedStyle);
      } else {
        element.removeAttribute("style");
      }

      continue;
    }

    if (name === "href") {
      const sanitizedHref = sanitizeHref(value);

      if (sanitizedHref) {
        element.setAttribute("href", sanitizedHref);
      } else {
        element.removeAttribute("href");
      }

      continue;
    }

    if (name === "src") {
      const sanitizedSrc = sanitizeImageSrc(value);

      if (sanitizedSrc) {
        element.setAttribute("src", sanitizedSrc);
      } else {
        element.removeAttribute("src");
      }

      continue;
    }

    if (name === "target") {
      if (value !== "_blank") {
        element.removeAttribute("target");
      }
      continue;
    }

    if (name === "rel") {
      element.setAttribute("rel", "noopener noreferrer");
      continue;
    }

    if (name === "width" || name === "height") {
      const numericValue = value.match(/^\d{1,4}$/)?.[0];

      if (numericValue) {
        element.setAttribute(name, numericValue);
      } else {
        element.removeAttribute(name);
      }
    }
  }

  if (tagName === "a" && element.getAttribute("target") === "_blank") {
    element.setAttribute("rel", "noopener noreferrer");
  }
}

function sanitizeInlineStyle(styleValue: string) {
  const safeDeclarations: string[] = [];

  for (const declaration of styleValue.split(";")) {
    const [rawProperty, ...rawValueParts] = declaration.split(":");
    const property = rawProperty?.trim().toLowerCase();
    const value = rawValueParts.join(":").trim();

    if (!property || !value || !ALLOWED_CSS_PROPERTIES.has(property)) {
      continue;
    }

    const sanitizedValue = sanitizeCssValue(property, value);

    if (sanitizedValue) {
      safeDeclarations.push(`${property}: ${sanitizedValue}`);
    }
  }

  return safeDeclarations.join("; ");
}

function sanitizeCssValue(property: string, value: string) {
  if (
    !SAFE_VALUE_PATTERN.test(value) ||
    FORBIDDEN_CSS_VALUE_PATTERN.test(value) ||
    VIEWPORT_UNIT_PATTERN.test(value)
  ) {
    return null;
  }

  switch (property) {
    case "display":
      return matchAllowedKeyword(value, ALLOWED_DISPLAY_VALUES);
    case "position":
      return matchAllowedKeyword(value, ALLOWED_POSITION_VALUES);
    case "overflow":
      return matchAllowedKeyword(value, ALLOWED_OVERFLOW_VALUES);
    case "text-align":
      return matchAllowedKeyword(value, ALLOWED_TEXT_ALIGN_VALUES);
    case "text-transform":
      return matchAllowedKeyword(value, ALLOWED_TEXT_TRANSFORM_VALUES);
    case "text-decoration":
      return matchAllowedKeyword(value, ALLOWED_TEXT_DECORATION_VALUES);
    case "object-fit":
      return matchAllowedKeyword(value, ALLOWED_OBJECT_FIT_VALUES);
    case "flex-direction":
      return matchAllowedKeyword(value, ALLOWED_FLEX_DIRECTION_VALUES);
    case "flex-wrap":
      return matchAllowedKeyword(value, ALLOWED_FLEX_WRAP_VALUES);
    case "justify-content":
    case "align-items":
      return matchAllowedKeyword(value, ALLOWED_ALIGNMENT_VALUES);
    case "word-break":
      return matchAllowedKeyword(value, ALLOWED_WORD_BREAK_VALUES);
    case "overflow-wrap":
      return matchAllowedKeyword(value, ALLOWED_OVERFLOW_WRAP_VALUES);
    case "width":
    case "max-width":
    case "min-width":
    case "height":
    case "max-height":
    case "min-height":
      return sanitizeSizeValue(value);
    default:
      return value;
  }
}

function matchAllowedKeyword(value: string, allowedValues: Set<string>) {
  const normalized = value.trim().toLowerCase();
  return allowedValues.has(normalized) ? normalized : null;
}

function sanitizeSizeValue(value: string) {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "auto" ||
    normalized === "fit-content" ||
    normalized === "max-content" ||
    normalized === "min-content"
  ) {
    return normalized;
  }

  const percentageMatch = normalized.match(/^(-?\d+(?:\.\d+)?)%$/);

  if (percentageMatch) {
    const percentage = Math.max(0, Math.min(100, Number(percentageMatch[1])));
    return `${percentage}%`;
  }

  if (/^-?\d+(?:\.\d+)?(?:px|rem|em|ch)$/.test(normalized)) {
    return normalized;
  }

  return null;
}

function sanitizeHref(value: string) {
  if (!value || /^(?:javascript|data|vbscript):/i.test(value)) {
    return null;
  }

  if (
    value.startsWith("#") ||
    value.startsWith("/") ||
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }

  return null;
}

function sanitizeImageSrc(value: string) {
  if (/^data:image\/(?:png|gif|jpeg|jpg|webp|svg\+xml);base64,[a-z0-9+/=]+$/i.test(value)) {
    return value;
  }

  return null;
}
