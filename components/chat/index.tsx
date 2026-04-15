"use client"
import { useChat } from "@ai-sdk/react"
import { generateSlugId } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { DefaultChatTransport, UIMessage } from "ai";
import { toast } from "sonner";
import { PromptInputMessage } from "../ai-elements/prompt-input";
import NewProjectChat from "./new-project-chat";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import ChatPanel from "./chat-panel";
import Canvas from "./canvas";
import { PageType } from "@/types/project";
import { useQuery } from "@tanstack/react-query";
import { useCanvas } from "@/hooks/use-canvas";
import { useHistory } from "@/hooks/use-history";
import ProjectTitle from "./project-title";
import UpgradeModal from "@/components/credits/upgrade-modal";
import CreditsBadge from "@/components/credits/credits-badge";
import { useAnalytics } from "@/lib/analytics";
import KeyboardShortcutsProvider from "@/components/keyboard-shortcuts-provider";
import { setLastOpened } from "@/lib/last-opened";
import { addToPromptHistory } from "@/lib/prompt-history";
import { completeStep } from "@/lib/onboarding-checklist";

type PropsType = {
  isProjectPage?: boolean;
  slugId?: string;
}

const ChatInterface = ({
  isProjectPage = false,
  slugId: propSlugId
}: PropsType) => {
  const pathname = usePathname();
  const router = useRouter()

  const [slugId, setSlugId] = useState(() => propSlugId
    || generateSlugId())


  const [input, setInput] = useState("")
  const [hasStarted, setHasStarted] = useState(isProjectPage);
  const [projectTitle, setProjectTitle] = useState<string | null>(null)
  const [pages, setPages] = useState<PageType[]>([]);
  const { pushSnapshot, undo, redo, canUndo, canRedo } = useHistory();

  // Mark "create project" complete when opening an existing project
  useEffect(() => {
    if (isProjectPage) completeStep("create_project");
  }, [isProjectPage]);

  // Credits / upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitData, setLimitData] = useState<{ used: number; limit: number; resetAt?: string } | null>(null);
  const [creditsRefreshKey, setCreditsRefreshKey] = useState(0);
  const [isPro, setIsPro] = useState(false);

  // Fetch plan once on mount so Canvas knows whether to watermark exports
  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.plan && d.plan !== "free") setIsPro(true); })
      .catch(() => {});
  }, []);

  const { capture } = useAnalytics();
  // Track generation start time for duration measurement
  const generationStartRef = useRef<number | null>(null);

  const { data: projectData, isLoading: isProjectLoading } = useQuery({    queryKey: ["project", slugId],
    queryFn: async () => {
      const res = await fetch(`/api/project/${slugId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json() as Promise<{ title: string; messages: UIMessage[]; pages: PageType[] }>
    },
  enabled: isProjectPage, // Only fetch on project page
  refetchOnWindowFocus: false, // Prevent breaking stream when switching tabs
  staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

  // Track last-opened project for the dashboard "Continue" banner
  // Placed after projectData is declared. Fires whenever the title resolves.
  useEffect(() => {
    if (!isProjectPage || !propSlugId) return;
    const title = projectTitle || projectData?.title;
    if (!title) return;
    setLastOpened("current_user", { slugId: propSlugId, title });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectPage, propSlugId, projectTitle, projectData?.title]);

  const { messages, sendMessage, setMessages, status, error,
    stop
  } = useChat({
    messages: [],
    transport: new DefaultChatTransport({
      api: "/api/project",
      prepareSendMessagesRequest: ({ messages, body }) => {
        return {
          body: {
            ...body,
            messages
          }
        }
      }
    }),
    onData(dataPart) {
      const part = dataPart as any;
      const data = part.data

      switch (part.type) {
        case "data-project-title": {
          if (data.title) setProjectTitle(data.title)
          break
        }
        case "data-pages-skeleton": {
          const newPages = (data?.pages || []).map((page: any) => ({
            id: page.id,
            name: page.name,
            rootStyles: page.rootStyles,
            htmlContent: "",
            isLoading: true
          }))
          setPages((prev) => {
            pushSnapshot(prev);
            const existingIds = new Set(prev.map(p => p.id));
            const toAdd = newPages.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...toAdd]
          })
          break;
        }

        case "data-page-created": {
          const page = data.page
          const tempId = data.tempId
          setPages((prev) => {
            const idx = prev.findIndex(p => p.id === tempId || p.id === page.id)
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = { ...page, isLoading: false };
              return updated;
            }
            return [...prev, { ...page, isLoading: false }]
          })
          // Mark "generate first page" step complete
          completeStep("generate_page");
          break;
        }

        case "data-page-loading": {
          const pageId = data.pageId;
          setPages(prev => {
            const idx = prev.findIndex(p => p.id === pageId);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], isLoading: true };
              return updated;
            }
            return prev
          });
          break;
        }

        case "data-generation": {
          // Track generation_completed when status flips to "complete"
          if (data.status === "complete" && generationStartRef.current) {
            const duration_ms = Date.now() - generationStartRef.current;
            const isRegen = !!data.regeneratePage;
            capture("generation_completed", {
              slug_id: slugId,
              page_count: isRegen ? 1 : (data.pages?.length ?? 1),
              duration_ms,
              intent: isRegen ? "regenerate" : "generate",
            });
            generationStartRef.current = null;
          }
          // Track generation_canceled
          if (data.status === "canceled") {
            capture("generation_canceled", { slug_id: slugId });
            generationStartRef.current = null;
          }
          break;
        }

        case "data-credits-updated": {
          setCreditsRefreshKey(k => k + 1);
          break;
        }
      }
    },
    onError: (error) => {
      console.log(error)
      generationStartRef.current = null;
      try {
        const parsed = JSON.parse((error as any)?.message || "{}");
        if (parsed?.error === "limit_reached") {
          setLimitData({ used: parsed.used, limit: parsed.limit, resetAt: parsed.resetAt });
          setShowUpgradeModal(true);
          capture("upgrade_modal_opened", {
            trigger: "limit_reached",
            used: parsed.used,
            limit: parsed.limit,
            plan: parsed.plan ?? "free",
          });
          return;
        }
        if (parsed?.error === "rate_limited") {
          toast.error(parsed.message ?? "Too many requests. Please wait a moment.");
          return;
        }
      } catch { /* not JSON */ }
      capture("generation_failed", {
        slug_id: slugId,
        reason: (error as any)?.message ?? "unknown",
        intent: "unknown",
      });
      toast.error("Failed to generate response")
    }
  })

  // Sync messages when data is initially loaded
  // We use a ref to track the last synced slugId to ensure we only sync once per project,
  const lastSyncedSlug = useRef<string | null>(null);

  useEffect(() => {
      if (projectData && slugId !== lastSyncedSlug.current) {
          if (projectData.messages) setMessages(projectData.messages);
          if (projectData.pages) setPages(projectData.pages);
          lastSyncedSlug.current = slugId;
      }
  }, [projectData, slugId, setMessages]);


  useEffect(() => {
    const checkReset = () => {
      if (window.location.pathname === "/" && (hasStarted || isProjectPage)) {
        setSlugId(generateSlugId());
        setMessages([])
        setHasStarted(false)
        setProjectTitle(null)
      }
    }

    window.addEventListener("popstate", checkReset)

    if (pathname === "/" && hasStarted) {
      checkReset()
    }

    return () => window.removeEventListener("popstate",
      checkReset
    )
  }, [pathname, hasStarted, isProjectPage, setMessages])



  const { selectedPageId, setSelectedPageId } = useCanvas()

  // ── Undo / Redo — handled via KeyboardShortcutsProvider below ──────────
  const handleUndo = useCallback(() => {
    const prev = undo(pages);
    if (prev) setPages(prev);
    else toast("Nothing to undo");
  }, [undo, pages]);

  const handleRedo = useCallback(() => {
    const next = redo(pages);
    if (next) setPages(next);
    else toast("Nothing to redo");
  }, [redo, pages]);

  const isLoading = status === "submitted" || status === "streaming"

  const onSubmit = async (message: PromptInputMessage, options: any = {}) => {

    if (!message.text.trim()) {
      toast.error("Please enter a message")
      return
    }

    if (!isProjectPage && !hasStarted) {
      window.history.pushState(null, "", `/project/${slugId}`);
      setHasStarted(true)
      // Mark "create first project" step complete
      completeStep("create_project");
    }

    // Track generation start
    generationStartRef.current = Date.now();
    capture("generation_started", {
      slug_id: slugId,
      prompt_length: message.text.trim().length,
      has_image: (message.files?.length ?? 0) > 0,
      has_style_preset: !!(options?.stylePreset),
      intent: "generate", // intent is classified server-side; this is the optimistic value
    });

    sendMessage(
      {
        text: message.text,
        files: message.files
      },
      {
        body: {
          ...options,
          slugId
        }
      }
    )

    // Save to prompt history after successful send
    addToPromptHistory(message.text);
    setInput("")
  }

  const handleBack = () => {
    if (!isProjectPage) {
      setSlugId(generateSlugId());
      setHasStarted(false);
      setMessages([]);
      setProjectTitle(null)
    }
    router.push("/dashboard");
  }

  // Triggered from the canvas Regenerate button — selects the page and
  // pre-fills the input so the user just hits send
  const handleRegeneratePage = useCallback((pageId: string) => {
    setSelectedPageId(pageId);
    setInput("Regenerate this page with improvements");
    setTimeout(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
      textarea?.focus();
      textarea?.select();
    }, 50);
  }, [setSelectedPageId]);

  // Triggered from the sidebar "Generate with AI" button
  const handleGeneratePage = useCallback(() => {
    setInput("Add a new page: ");
    setTimeout(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
      if (!textarea) return;
      textarea.focus();
      // Place cursor at end so user can type right away
      const len = textarea.value.length;
      textarea.setSelectionRange(len, len);
    }, 50);
  }, []);

  // Optimistic rename — updates local state immediately
  const handleRenamePage = useCallback((pageId: string, newName: string) => {
    setPages(prev =>
      prev.map(p => p.id === pageId ? { ...p, name: newName } : p)
    );
  }, []);

  // Reorder with undo support — snapshot before applying new order.
  // Use a ref for pages so the callback is stable and doesn't recreate on every render.
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  const handleReorderPages = useCallback((reordered: PageType[]) => {
    pushSnapshot(pagesRef.current);
    setPages(reordered);
  }, [pushSnapshot]); // stable — pagesRef.current always has latest value

  if (!isProjectPage && !hasStarted) {
    return (
      <KeyboardShortcutsProvider onUpgradeClick={() => setShowUpgradeModal(true)}>
        <NewProjectChat
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          status={status}
          onStop={stop}
          onSubmit={onSubmit}
        />
      </KeyboardShortcutsProvider>
    )
  }


  const selectedPage = pages.find((p) => p.id === selectedPageId);


  return (
    <KeyboardShortcutsProvider
      onUpgradeClick={() => setShowUpgradeModal(true)}
      onUndo={handleUndo}
      onRedo={handleRedo}
    >
      <div className="flex h-screen w-full overflow-hidden">
        {/* Upgrade modal */}
        <UpgradeModal
          open={showUpgradeModal}
          used={limitData?.used ?? 10}
          limit={limitData?.limit ?? 10}
          resetAt={limitData?.resetAt}
          trigger={limitData ? "limit_reached" : "credits_badge"}
          plan="free"
          onClose={() => setShowUpgradeModal(false)}
        />

        <div className="flex relative w-full max-w-md border-r border-border">
          {/* Project header */}
          <div className="w-full absolute left-0 top-0 z-10 pb-2 bg-background">
            <div className="flex items-center gap-2 px-0">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft />
              </Button>

              <ProjectTitle
                title={projectTitle || projectData?.title || "Untitled Project"}
                slugId={slugId}
                onRename={setProjectTitle}
                className="flex-1 min-w-0"
              />

              {/* Credits badge */}
              <CreditsBadge
                onUpgradeClick={() => setShowUpgradeModal(true)}
                refreshKey={creditsRefreshKey}
              />
            </div>
          </div>

          <ChatPanel
            className="h-full pt-8"
            messages={messages}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            isProjectLoading={isProjectLoading}
            selectedPage={selectedPage}
            status={status}
            error={error}
            onStop={stop}
            onSubmit={onSubmit}
          />
        </div>

        <div className="flex-1">
          <Canvas
            pages={pages}
            setPages={setPages}
            slugId={slugId}
            projectTitle={projectTitle || projectData?.title}
            isProjectLoading={isProjectLoading}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onRegeneratePage={handleRegeneratePage}
            onRenamePage={handleRenamePage}
            onReorderPages={handleReorderPages}
            onGeneratePage={handleGeneratePage}
            isPro={isPro}
          />
        </div>
      </div>
    </KeyboardShortcutsProvider>
  )
}

export default ChatInterface