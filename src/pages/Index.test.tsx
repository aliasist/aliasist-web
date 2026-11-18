// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Index from "./Index";
import { forumSection } from "@/content/homepage";

vi.mock("@clerk/react", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  UserButton: () => null,
}));
vi.mock("@/lib/use-open-site-sign-in", () => ({
  useOpenSiteSignIn: () => vi.fn(),
}));

let root: Root;
let container: HTMLDivElement;
const render = (element: React.ReactNode) => {
  act(() => root.render(element));
  return { unmount: () => act(() => root.unmount()) };
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  // jsdom has no IntersectionObserver, and framer-motion's whileInView needs
  // one. Without this stub, rendering any section that animates on scroll
  // throws before the assertions run.
  vi.stubGlobal("IntersectionObserver", function IntersectionObserverStub() {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [],
    };
  });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("Aliasist Index Landing Page", () => {
  it("renders the hero ASCII banner", () => {
    render(<Index />);
    expect(container.textContent).toContain("█████╗ ██╗");
    expect(container.querySelector("#main-content")).not.toBeNull();
  });

  it("renders all fleet tools and services", () => {
    render(<Index />);
    expect(container.textContent).toContain("Aliasist AI");
    expect(container.textContent).toContain("Globalize");
    expect(container.textContent).toContain("SpaceSist");
    expect(container.textContent).toContain("ClearSist");
    expect(container.textContent).toContain("PDFSist");
    expect(container.textContent).toContain("Aliasist Forum");
    expect(container.textContent).toContain("Files Abductor");
  });

  it("renders the about section and contact form", () => {
    render(<Index />);
    expect(container.querySelector("#about")).not.toBeNull();
    expect(container.textContent).toContain("What it's about");
    expect(container.querySelector("#contact")).not.toBeNull();
    expect(container.textContent).toContain("Open Contact");
    expect(container.querySelector("form")).not.toBeNull();
  });

  it("renders the forum window between transmissions and contact", () => {
    render(<Index />);
    const forum = container.querySelector("#forum");
    expect(forum).not.toBeNull();
    expect(container.textContent).toContain(forumSection.headline);
    const order = Array.from(container.querySelectorAll("#transmissions, #forum, #contact"));
    expect(order.map((el) => el.id)).toEqual(["transmissions", "forum", "contact"]);
  });
});
