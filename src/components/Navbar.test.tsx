// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";

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
const button = (name: string) => Array.from(container.querySelectorAll("button"))
  .find(element => (element.getAttribute("aria-label") || element.textContent) === name)!;
const click = (element: HTMLElement) => act(() => element.click());
const escape = (element: EventTarget) => act(() => {
  element.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
});

let desktop: MediaQueryList;
let mediaListeners: Set<() => void>;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  mediaListeners = new Set();
  desktop = {
    matches: false,
    addEventListener: (_: string, listener: () => void) => mediaListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => mediaListeners.delete(listener),
  } as unknown as MediaQueryList;
  vi.stubGlobal("matchMedia", () => desktop);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  document.body.style.overflow = "";
});

describe("homepage navigation", () => {
  it("dismisses the mobile menu with Escape, restores focus and the previous scroll setting", () => {
    document.body.style.overflow = "auto";
    render(<Navbar />);
    const trigger = button("Toggle menu");
    click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    escape(document);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("auto");
  });

  it("releases the scroll lock when the viewport switches to desktop", () => {
    render(<Navbar />);
    const trigger = button("Toggle menu");
    click(trigger);
    act(() => {
      Object.assign(desktop, { matches: true });
      mediaListeners.forEach(listener => listener());
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.body.style.overflow).toBe("");
    expect(mediaListeners.size).toBe(0);
  });

  it("releases the scroll lock and viewport listener when unmounted", () => {
    const { unmount } = render(<Navbar />);
    click(button("Toggle menu"));
    unmount();
    expect(document.body.style.overflow).toBe("");
    expect(mediaListeners.size).toBe(0);
  });

  it("dismisses the desktop project links with Escape and returns focus", () => {
    render(<Navbar />);
    const trigger = button("Menu");
    click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const link = document.querySelector<HTMLAnchorElement>("#suite-navigation a")!;
    act(() => link.focus());
    escape(link);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });
});
