import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Rnd } from "react-rnd";
import { TOOL_MODE_ENUM, ToolModeType } from '@/constants/canvas';
import { getHTMLWrapper } from '@/lib/page-wrapper';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Code2, PaintbrushIcon, Trash2Icon, Download, RefreshCw, Pencil, Braces, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { PageType } from '@/types/project';
import { Skeleton } from '@/components/ui/skeleton';
import { downloadPage } from '@/lib/export';
import FeedbackButtons from '@/components/chat/feedback-buttons';
import { renamePageAction } from '@/app/action/action';
import { motion, AnimatePresence } from 'motion/react';

type PropsType = {
  page: PageType
  initialPosition?: { x: number; y: number };
  scale?: number;
  toolMode: ToolModeType;
  selectedPageId: string | null;
  setSelectedPageId: (pageId: string | null) => void
  isDeleting: boolean;
  isVisible: boolean;
  onDeletePage: (pageId: string) => void
  onRegeneratePage?: (pageId: string) => void
  onRenamePage?: (pageId: string, newName: string) => void
}

const PageFrame = ({
  page,
  initialPosition = { x: 0, y: 0 },
  scale = 1,
  toolMode,
  selectedPageId,
  setSelectedPageId,
  isDeleting,
  isVisible,
  onDeletePage,
  onRegeneratePage,
  onRenamePage,
}: PropsType) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [size, setSize] = useState({ width: 1550, height: 900 });
  const [isHovered, setIsHovered] = useState(false);
  const [showColorScheme, setShowColorScheme] = useState(false);
  const [isRenamingInline, setIsRenamingInline] = useState(false);
  const [renameValue, setRenameValue] = useState(page.name);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  // Track whether the iframe has ever been rendered — once rendered we keep
  // it alive (just hidden) so it doesn't re-parse on every pan back
  const [hasBeenVisible, setHasBeenVisible] = useState(isVisible);

  useEffect(() => {
    if (isVisible && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [isVisible, hasBeenVisible]);

  const fullHtml = useMemo(
    () => getHTMLWrapper(page.htmlContent, page.name, page.rootStyles, page.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page.htmlContent, page.rootStyles, page.id]
  );

  const isSelected = selectedPageId === page.id;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "FRAME_HEIGHT" && event.data.pageId === page.id) {
        setSize(prev => ({ ...prev, height: event.data.height }));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [page.id]);

  const colorTokens = useMemo(() => {
    if (!page.rootStyles) return [];
    const tokens = [
      { key: '--background', label: 'Background' },
      { key: '--foreground', label: 'Foreground' },
      { key: '--primary',    label: 'Primary' },
      { key: '--secondary',  label: 'Secondary' },
      { key: '--accent',     label: 'Accent' },
      { key: '--card',       label: 'Card' },
      { key: '--muted',      label: 'Muted' },
      { key: '--border',     label: 'Border' },
    ];
    return tokens
      .map(({ key, label }) => {
        const match = page.rootStyles.match(new RegExp(`${key}:\\s*([^;]+)`));
        return { label, value: match ? match[1].trim() : null };
      })
      .filter(t => t.value);
  }, [page.rootStyles]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fullHtml);
    setCopiedHtml(true);
    toast.success("HTML copied to clipboard!");
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleCopyCss = () => {
    if (!page.rootStyles?.trim()) {
      toast.error("No CSS variables found for this page.");
      return;
    }
    // Format as a clean :root { ... } block for easy paste into any codebase
    const cssBlock = `:root {\n${page.rootStyles
      .split(";")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `  ${line};`)
      .join("\n")}\n}`;
    navigator.clipboard.writeText(cssBlock);
    setCopiedCss(true);
    toast.success("CSS variables copied to clipboard!");
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const startRename = () => {
    setRenameValue(page.name);
    setIsRenamingInline(true);
    setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 20);
  };

  const commitRename = async () => {
    setIsRenamingInline(false);
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === page.name) return;
    onRenamePage?.(page.id, trimmed);
    const result = await renamePageAction(page.id, trimmed);
    if (result.error) {
      toast.error(result.error);
      onRenamePage?.(page.id, page.name);
    }
  };

  const cancelRename = () => {
    setIsRenamingInline(false);
    setRenameValue(page.name);
  };

  // ── Virtualized content ────────────────────────────────────────────────────
  // Render the real iframe only when visible (or once it has been visible).
  // When off-screen we show a lightweight static placeholder that preserves
  // the exact frame dimensions so layout never shifts.
  const renderContent = () => {
    if (page.isLoading) {
      return (
        <div
          className="w-full h-full flex flex-col py-10 px-10 gap-3 bg-black/50 dark:bg-white/50 animate-pulse rounded-sm"
          style={{ width: size.width, height: size.height }}
        >
          <Skeleton className="w-full h-8 bg-black/50 dark:bg-white/50" />
          <Skeleton className="w-1/2 h-10 bg-black/50 dark:bg-white/50" />
        </div>
      );
    }

    return (
      <>
        {/* ── Live iframe — mounted once visible, kept alive after ── */}
        {hasBeenVisible && (
          <iframe
            ref={iframeRef}
            srcDoc={fullHtml}
            title={page.name}
            sandbox="allow-scripts"
            style={{
              width: "100%",
              height: `${size.height}px`,
              border: "none",
              display: "block",
              pointerEvents: "none",
              // Hide (not unmount) when off-screen to save GPU compositing
              // while keeping the iframe alive so it doesn't reload on pan-back
              visibility: isVisible ? "visible" : "hidden",
              position: isVisible ? "relative" : "absolute",
              top: 0,
              left: 0,
            }}
          />
        )}

        {/* ── Off-screen placeholder — shown when iframe is hidden ── */}
        {!isVisible && (
          <PagePlaceholder
            width={size.width}
            height={size.height}
            name={page.name}
            rootStyles={page.rootStyles}
          />
        )}

        {/* ── First-load placeholder — before iframe has ever rendered ── */}
        {!hasBeenVisible && (
          <PagePlaceholder
            width={size.width}
            height={size.height}
            name={page.name}
            rootStyles={page.rootStyles}
          />
        )}
      </>
    );
  };

  return (
    <Rnd
      default={{
        x: initialPosition.x,
        y: initialPosition.y,
        width: size.width,
        height: size.height,
      }}
      size={{ width: size.width, height: size.height }}
      minWidth={320}
      minHeight={900}
      scale={scale}
      disableDragging={toolMode === TOOL_MODE_ENUM.HAND}
      enableResizing={(isSelected || isHovered) && toolMode !== TOOL_MODE_ENUM.HAND}
      onResize={(_, __, ref) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
      onClick={(e: any) => {
        e.stopPropagation();
        if (page.isLoading) return;
        if (toolMode === TOOL_MODE_ENUM.SELECT) setSelectedPageId(page.id);
      }}
      resizeHandleComponent={{
        topLeft:     (isSelected || isHovered) ? <Handle /> : undefined,
        topRight:    (isSelected || isHovered) ? <Handle /> : undefined,
        bottomLeft:  (isSelected || isHovered) ? <Handle /> : undefined,
        bottomRight: (isSelected || isHovered) ? <Handle /> : undefined,
      }}
      className={cn(
        "relative z-30",
        (isSelected || isHovered) && toolMode !== TOOL_MODE_ENUM.HAND &&
          "ring-4 ring-blue-500 ring-offset-1",
        toolMode === TOOL_MODE_ENUM.HAND
          ? "cursor-grab! active:cursor-grabbing!"
          : "cursor-move"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Floating toolbar ── */}
      {(isSelected || isHovered) && toolMode !== TOOL_MODE_ENUM.HAND && (
        <div
          className="absolute -top-13 left-0 z-50 flex items-center bg-card rounded-lg px-1 py-1 shadow-md"
          style={{
            transform: `scale(${1 / scale})`,
            transformOrigin: "bottom left",
          }}
        >
          {/* Page name — double-click to rename */}
          <AnimatePresence mode="wait" initial={false}>
            {isRenamingInline ? (
              <motion.div
                key="rename-input"
                initial={{ opacity: 0, width: 80 }}
                animate={{ opacity: 1, width: 160 }}
                exit={{ opacity: 0, width: 80 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-1 pl-2 pr-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") cancelRename();
                  }}
                  onBlur={commitRename}
                  maxLength={60}
                  className="w-full bg-transparent text-xs font-medium text-foreground outline-none border-b border-primary pb-px caret-primary"
                />
              </motion.div>
            ) : (
              <motion.h5
                key="name-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="text-xs pl-3 pr-4 font-medium truncate max-w-37.5 cursor-text"
                onDoubleClick={(e) => { e.stopPropagation(); startRename(); }}
                title="Double-click to rename"
              >
                {page.name}
              </motion.h5>
            )}
          </AnimatePresence>

          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center px-2 gap-1">
            {!isRenamingInline && (
              <Button
                size="icon"
                variant="ghost"
                className="p-1! hover:bg-accent size-6! cursor-pointer"
                title="Rename page"
                onClick={(e) => { e.stopPropagation(); startRename(); }}
              >
                <Pencil className="size-3.5" />
              </Button>
            )}

            {onRegeneratePage && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="h-6 px-2 text-[11px] gap-1 font-medium cursor-pointer"
                  onClick={() => onRegeneratePage(page.id)}
                  title="Regenerate this page"
                >
                  <RefreshCw className="size-3" />
                  Regenerate
                </Button>
                <Separator orientation="vertical" className="h-4" />
              </>
            )}

            <FeedbackButtons pageId={page.id} scale={1} />
            <Separator orientation="vertical" className="h-4" />

            <Popover open={showColorScheme} onOpenChange={setShowColorScheme}>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="p-1! hover:bg-accent size-6! cursor-pointer" title="Color scheme">
                  <PaintbrushIcon className="size-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 p-3">
                <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Color Scheme</p>
                <div className="flex flex-col gap-2">
                  {colorTokens.map(({ label, value }: any) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="size-4 rounded-sm border border-border" style={{ backgroundColor: value! }} />
                        <span className="text-xs font-mono text-foreground">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Copy CSS variables */}
            <Button
              size="icon"
              variant="ghost"
              className="p-1! hover:bg-accent size-6! cursor-pointer"
              title="Copy CSS variables"
              onClick={handleCopyCss}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copiedCss ? (
                  <motion.span
                    key="check-css"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Check className="size-3.5 text-green-500" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="icon-css"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Braces className="size-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Copy HTML */}
            <Button
              size="icon"
              variant="ghost"
              className="p-1! hover:bg-accent size-6! cursor-pointer"
              title="Copy HTML"
              onClick={handleCopyCode}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copiedHtml ? (
                  <motion.span
                    key="check-html"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Check className="size-3.5 text-green-500" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="icon-html"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Code2 className="size-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            <Button size="icon" variant="ghost" className="p-1! hover:bg-accent size-6! cursor-pointer" title="Download page" onClick={() => downloadPage(page)}>
              <Download className="size-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="p-1! hover:bg-accent size-6! cursor-pointer" onClick={() => onDeletePage(page.id)}>
              {isDeleting ? <Spinner /> : <Trash2Icon className="size-3.5" />}
            </Button>
          </div>
        </div>
      )}

      {/* ── Page content ── */}
      <div className="w-full relative overflow-hidden rounded-sm bg-muted/90">
        {renderContent()}
      </div>
    </Rnd>
  );
};

// ── Off-screen placeholder ────────────────────────────────────────────────────
// Extracts the background color from rootStyles so the placeholder matches
// the page's actual background — no jarring white flash on pan-back.
function PagePlaceholder({
  width,
  height,
  name,
  rootStyles,
}: {
  width: number;
  height: number;
  name: string;
  rootStyles: string;
}) {
  const bg = useMemo(() => {
    const match = rootStyles?.match(/--background:\s*([^;]+)/);
    return match ? match[1].trim() : undefined;
  }, [rootStyles]);

  const primary = useMemo(() => {
    const match = rootStyles?.match(/--primary:\s*([^;]+)/);
    return match ? match[1].trim() : undefined;
  }, [rootStyles]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center gap-4 rounded-sm select-none"
      style={{
        width,
        height,
        backgroundColor: bg ?? "var(--muted)",
      }}
    >
      {/* Subtle page name watermark */}
      <div className="flex flex-col items-center gap-3 opacity-30">
        {/* Mini page icon */}
        <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
          <rect x="1" y="1" width="46" height="58" rx="4" stroke="currentColor" strokeWidth="2" />
          <line x1="10" y1="16" x2="38" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="32" x2="28" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span
          className="text-2xl font-semibold tracking-tight"
          style={{ color: primary ?? "currentColor" }}
        >
          {name}
        </span>
        <span className="text-sm font-medium" style={{ color: "currentColor" }}>
          Scroll into view to load
        </span>
      </div>
    </motion.div>
  );
}

const Handle = () => (
  <div className="z-30 h-6 w-6 bg-white border-2 border-blue-500 shadow-sm" />
);

export default PageFrame;
