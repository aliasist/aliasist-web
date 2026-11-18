// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ForumSection from "./ForumSection";
import { forumSection } from "@/content/homepage";

let root: Root;
let container: HTMLDivElement;
const render = (element: React.ReactNode) => {
  act(() => root.render(element));
  return { unmount: () => act(() => root.unmount()) };
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
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
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("ForumSection", () => {
  it("renders grouped threads, reply snippets, and discussed panel with reply counts", async () => {
    const mockPayload = {
      threads: [
        {
          postId: "p1",
          postTitle: "First thread",
          board: "show-and-tell",
          link: "https://alias.aliasist.tech/post/p1",
          commentCount: 12,
          replies: [
            { id: "r1", body: "what the reply says", author: "bot-alpha", isBot: true, createdAt: Date.now() - 60000 },
          ],
        },
      ],
      discussed: [
        {
          id: "p1",
          title: "First thread",
          board: "show-and-tell",
          commentCount: 12,
          createdAt: Date.now() - 3600000,
          link: "https://alias.aliasist.tech/post/p1",
        },
      ],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPayload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await act(async () => {
      render(<ForumSection />);
    });

    // renders grouped threads and their reply snippets
    expect(container.textContent).toContain("First thread");
    expect(container.textContent).toContain("what the reply says");
    // renders the discussed panel with reply counts, never vote counts
    expect(container.textContent).toContain("12 replies");
    expect(container.textContent).not.toContain("0 points");
    // board label, not raw slug (Review Focus 5 of the spec's design)
    expect(container.textContent).toContain("Show & tell");
    expect(container.textContent).not.toContain("c/show-and-tell");
    // links point at the thread, not the forum root
    expect(container.querySelector('a[href="https://alias.aliasist.tech/post/p1"]')).not.toBeNull();
    expect(container.textContent).not.toContain("undefined");
  });

  it("handles offline or rejected fetch by showing fallback without undefined or NaN", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(<ForumSection />);
    });

    expect(container.textContent).toContain(forumSection.offline);
    expect(container.textContent).not.toContain("undefined");
    expect(container.textContent).not.toContain("NaN");
  });

  it("renders hostile reply bodies as plain text, never markup", async () => {
    const mockPayload = {
      threads: [
        {
          postId: "p1",
          postTitle: "Thread with XSS attempt",
          board: "general",
          link: "https://alias.aliasist.tech/post/p1",
          commentCount: 1,
          replies: [
            { id: "r1", body: '<script data-x="1">alert("xss")</script>', author: "attacker", isBot: false, createdAt: Date.now() },
          ],
        },
      ],
      discussed: [],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPayload), { status: 200 })
    );

    await act(async () => {
      render(<ForumSection />);
    });

    expect(container.querySelector("script[data-x]")).toBeNull();
    expect(container.textContent).toContain('<script data-x="1">');
  });
});
