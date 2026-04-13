import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { TOOL_MODE_ENUM, ToolModeType } from "@/constants/canvas";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import CanvasControls from "./canvas-controls";
import PageFrame from "./page-frame";
import PageSidebar from "./page-sidebar";
import { useCanvas } from "@/hooks/use-canvas";
import { PageType } from "@/types/project";
import { deletePageAction } from "@/app/action/action";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { downloadAllPages } from "@/lib/export";
import { Button } from "@/components/ui/button";
import {
  Download,
  Undo2,
  Redo2,
  Share2,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PropsType = {
  pages: PageType[];
  setPages: React.Dispatch<React.SetStateAction<PageType[]>>;
  isProjectLoading?: boolean;
  slugId: string;
  projectTitle?: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRegeneratePage?: (pageId: string) => void;
  onRenamePage?: (pageId: string, newName: string) => void;
};

const Canvas = ({
  isProjectLoading,
  pages,
  setPages,
  slugId,
  projectTitle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRegeneratePage,
  onRenamePage,
}: PropsType) => {
  const queryClient = useQueryClient();
  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.SELECT);
  const [zoomPercent, setZoomPercent] = useState<number>(26);
  const [currentScale, setCurrentScale] = useState<number>(0.26);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { selectedPageId, setSelectedPageId } = useCanvas();

  const handleDelete = async (pageId: string) => {
    setDeletingPageId(pageId);
    const { error } = await deletePageAction(slugId, pageId);
    if (error) {
      setDeletingPageId(null);
      toast.error(error);
      return;
    }
    setPages((prev) => prev.filter((page) => page.id !== pageId));
    queryClient.invalidateQueries({ queryKey: ["project", slugId] });
    setDeletingPageId(null);
    toast.success("Page deleted");
  };

  const handleReorder = (reordered: PageType[]) => {
    setPages(reordered);
  };

  const handleDownloadAll = async () => {
    if (pages.length === 0) return;
    setIsDownloading(true);
    await downloadAllPages(pages, projectTitle || "zephio-project");
    setIsDownloading(false);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/preview/${slugId}`;
    navigator.clipboard.writeText(url);
    toast.success("Preview link copied to clipboard!");
  };

  const visiblePages = pages.filter((p) => !p.isLoading || p.htmlContent);

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* ── Page Sidebar ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex h-full shrink-0 flex-col overflow-hidden border-r border-border bg-background"
          >
            <div className="flex-1 overflow-y-auto">
              <PageSidebar
                pages={pages}
                selectedPageId={selectedPageId}
                deletingPageId={deletingPageId}
                onSelectPage={setSelectedPageId}
                onDeletePage={handleDelete}
                onReorder={handleReorder}
                onRenamePage={onRenamePage ?? (() => {})}
                isProjectLoading={isProjectLoading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Canvas area ── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Top toolbar */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-3 py-2 pointer-events-none">
          {/* Left: sidebar toggle */}
          <div className="pointer-events-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="rounded-lg shadow-sm bg-card"
                  onClick={() => setSidebarOpen((v) => !v)}
                >
                  {sidebarOpen ? (
                    <PanelLeftClose className="size-3.5" />
                  ) : (
                    <PanelLeftOpen className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {sidebarOpen ? "Hide pages" : "Show pages"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right: undo/redo + export + share */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Undo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="rounded-lg shadow-sm bg-card"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <Undo2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Undo (⌘Z)</TooltipContent>
            </Tooltip>

            {/* Redo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="rounded-lg shadow-sm bg-card"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <Redo2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Redo (⌘⇧Z)</TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-border mx-0.5" />

            {/* Export all */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg shadow-sm bg-card gap-1.5 text-xs h-7 px-2.5"
                  onClick={handleDownloadAll}
                  disabled={isDownloading || pages.length === 0}
                >
                  {isDownloading ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  {isDownloading ? "Exporting…" : "Export"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Download all pages as ZIP</TooltipContent>
            </Tooltip>

            {/* Share */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="default"
                  className="rounded-lg shadow-sm gap-1.5 text-xs h-7 px-2.5"
                  onClick={handleShare}
                >
                  <Share2 className="size-3.5" />
                  Share
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Copy preview link</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <TransformWrapper
          initialScale={0.26}
          initialPositionX={40}
          initialPositionY={5}
          minScale={0.1}
          maxScale={3}
          wheel={{ step: 0.1 }}
          pinch={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
          centerZoomedOut={false}
          centerOnInit={false}
          smooth={true}
          limitToBounds={false}
          panning={{ disabled: toolMode !== TOOL_MODE_ENUM.HAND }}
          onTransformed={(ref) => {
            setZoomPercent(Math.round(ref.state.scale * 100));
            setCurrentScale(ref.state.scale);
          }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div
                className={cn(
                  "absolute inset-0 w-full h-full bg-[#eee] dark:bg-[#101010] p-3",
                  toolMode === TOOL_MODE_ENUM.HAND
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-default"
                )}
                style={{
                  backgroundImage:
                    "radial-gradient(circle, color-mix(in oklch, var(--primary) 30%, transparent) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
                onClick={() => setSelectedPageId(null)}
              >
                {isProjectLoading && (
                  <div className="absolute w-full h-full flex flex-col gap-1.5 items-center justify-center">
                    <Spinner className="w-15 h-15 stroke-1" />
                    <span className="text-sm font-medium">Preparing workspace</span>
                  </div>
                )}

                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%", overflow: "unset" }}
                  contentStyle={{ width: "100%", height: "100%" }}
                >
                  {pages.map((page, i) => {
                    const x = 100 + i * 1600;
                    const y = 100;
                    const isDeleting = deletingPageId === page.id;
                    return (
                      <PageFrame
                        key={page.id}
                        page={page}
                        scale={currentScale}
                        toolMode={toolMode}
                        initialPosition={{ x, y }}
                        selectedPageId={selectedPageId}
                        setSelectedPageId={setSelectedPageId}
                        isDeleting={isDeleting}
                        onDeletePage={handleDelete}
                        onRegeneratePage={onRegeneratePage}
                        onRenamePage={onRenamePage}
                      />
                    );
                  })}
                </TransformComponent>
              </div>

              <CanvasControls
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                zoomPercent={zoomPercent}
                toolMode={toolMode}
                setToolMode={setToolMode}
              />
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
};

export default Canvas;
