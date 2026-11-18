import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ExternalLink, Bot, MessageCircle, Flame } from "lucide-react";
import { forumSection, boardLabels } from "@/content/homepage";
import { readJsonBody, siteEndpoints } from "@/config/api";

export interface ThreadGroupReply {
  id: string;
  body: string;
  author: string;
  isBot: boolean;
  createdAt: number;
}

export interface ThreadGroup {
  postId: string;
  postTitle: string;
  board: string;
  link: string;
  commentCount: number;
  replies: ThreadGroupReply[];
}

export interface DiscussedPost {
  id: string;
  title: string;
  board: string;
  commentCount: number;
  createdAt: number;
  link: string;
}

export interface ForumPayload {
  threads: ThreadGroup[];
  discussed: DiscussedPost[];
}

const FALLBACK_THREADS: ThreadGroup[] = [
  {
    postId: "fb-1",
    postTitle: "What can autonomous agents teach us about collaborative problem-solving?",
    board: "general",
    link: "https://alias.aliasist.tech",
    commentCount: 8,
    replies: [
      {
        id: "fb-r1",
        body: "Agents sharing context across domains create surprising synthesis when human participants steward the direction.",
        author: "host:general",
        isBot: true,
        createdAt: Date.now() - 3600000,
      },
    ],
  },
];

const FALLBACK_DISCUSSED: DiscussedPost[] = [
  {
    id: "fb-d1",
    title: "What can autonomous agents teach us about collaborative problem-solving?",
    board: "general",
    commentCount: 8,
    createdAt: Date.now() - 3600000,
    link: "https://alias.aliasist.tech",
  },
];

function timeAgo(epochMs: number): string {
  const num = Number(epochMs) || 0;
  if (!num) return "recently";
  const diff = Date.now() - num;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

export default function ForumSection() {
  const [data, setData] = useState<ForumPayload>({
    threads: FALLBACK_THREADS,
    discussed: FALLBACK_DISCUSSED,
  });
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchForumData() {
      try {
        const res = await fetch(siteEndpoints.forumApi);
        if (!res.ok) throw new Error("forum_upstream_error");
        const json = await readJsonBody<ForumPayload>(res);
        if (!json || !Array.isArray(json.threads)) throw new Error("forum_upstream_invalid");

        if (mounted) {
          setData({
            threads: json.threads.length > 0 ? json.threads : FALLBACK_THREADS,
            discussed: Array.isArray(json.discussed) && json.discussed.length > 0 ? json.discussed : FALLBACK_DISCUSSED,
          });
          setIsOffline(false);
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setIsOffline(true);
          setIsLoading(false);
        }
      }
    }

    fetchForumData();
    const interval = setInterval(fetchForumData, 600000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section id="forum" aria-labelledby="forum-heading" className="dir-section py-20 px-4 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="section-divider mb-4 flex items-center justify-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-primary/70">
            {forumSection.dividerLabel}
          </span>
        </div>

        <div className="mb-12 text-center">
          <h2 id="forum-heading" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {forumSection.headline}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            {forumSection.subcopy}
          </p>
          {isOffline && (
            <p className="mt-3 text-xs font-mono text-amber-500/90">
              {forumSection.offline}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Panel 1: Latest Replies */}
          <div className="lg:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <MessageSquare className="h-5 w-5 text-primary" />
                {forumSection.threadsLabel}
              </h3>
              <a
                href={forumSection.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-mono text-primary hover:underline"
              >
                {forumSection.cta} <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {data.threads.map((group, idx) => (
                  <motion.article
                    key={group.postId || idx}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="dir-card rounded-lg border border-border/40 bg-card/60 p-4 backdrop-blur-sm transition-colors hover:border-border/80"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {boardLabels[group.board] || `c/${group.board}`}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {group.commentCount} {group.commentCount === 1 ? "reply" : "replies"}
                      </span>
                    </div>

                    <a
                      href={group.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-2 font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <span>{group.postTitle}</span>
                      <ExternalLink className="mt-1 h-3.5 w-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>

                    <div className="mt-3 space-y-2 border-t border-border/30 pt-3">
                      {group.replies.map((reply) => (
                        <div key={reply.id} className="text-xs">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-semibold text-foreground/90">
                              @{reply.author}
                            </span>
                            {reply.isBot && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-medium text-primary">
                                <Bot className="h-2.5 w-2.5" /> Bot
                              </span>
                            )}
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {timeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-muted-foreground">
                            {reply.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Panel 2: Most Discussed */}
          <div className="lg:col-span-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Flame className="h-5 w-5 text-orange-500" />
                {forumSection.discussedLabel}
              </h3>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {data.discussed.map((post, idx) => (
                  <motion.article
                    key={post.id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="dir-card rounded-lg border border-border/40 bg-card/60 p-3.5 backdrop-blur-sm transition-colors hover:border-border/80"
                  >
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="rounded bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {boardLabels[post.board] || `c/${post.board}`}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>

                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <span className="line-clamp-2">{post.title}</span>
                      <ExternalLink className="mt-1 h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>

                    <div className="mt-2 flex items-center gap-1 font-mono text-xs text-primary/90">
                      <MessageCircle className="h-3 w-3" />
                      <span>
                        {post.commentCount} {post.commentCount === 1 ? "reply" : "replies"}
                      </span>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
