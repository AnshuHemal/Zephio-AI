import { ChatStatus } from "ai";
import React, { useState, useEffect, useRef } from "react";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "../ai-elements/prompt-input";
import { useAuth } from "@/components/auth-context";
import Link from "next/link";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item";
import { ArrowUpIcon, LockIcon, Square, XIcon, Palette, History, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "../ai-elements/attachments";
import { PageType } from "@/types/project";
import { useCanvas } from "@/hooks/use-canvas";
import { Badge } from "../ui/badge";
import { STYLE_PRESETS, type StylePreset } from "@/lib/style-presets";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useKeyboardShortcutsContext } from "@/components/keyboard-shortcuts-provider";
import { getShortcutDisplay } from "@/hooks/use-keyboard-shortcuts";
import { getPromptHistory, removeFromPromptHistory } from "@/lib/prompt-history";
import { motion, AnimatePresence } from "motion/react";

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  status: ChatStatus;
  selectedPage?: PageType;
  setInput: (input: string) => void;
  onStop: () => void;
  onSubmit: (message: PromptInputMessage, options?: any) => void;
};

const ChatInput = ({
  input,
  isLoading,
  status,
  selectedPage,
  setInput,
  onStop,
  onSubmit,
}: ChatInputProps) => {
  const { isSignedIn } = useAuth();
  const [showAuthBanner, setShowAuthBanner] = useState(false);
  const [activePreset, setActivePreset] = useState<StylePreset | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const submitRef = useRef<(() => void) | null>(null);

  // Load history when popover opens
  const handleHistoryOpen = (open: boolean) => {
    if (open) setHistory(getPromptHistory());
    setHistoryOpen(open);
  };

  const handleSelectHistory = (prompt: string) => {
    setInput(prompt);
    setHistoryOpen(false);
    // Focus textarea after selection
    setTimeout(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(prompt.length, prompt.length);
      }
    }, 50);
  };

  const handleDeleteHistory = (e: React.MouseEvent, prompt: string) => {
    e.stopPropagation();
    removeFromPromptHistory(prompt);
    setHistory((prev) => prev.filter((p) => p !== prompt));
  };

  const { setSelectedPageId } = useCanvas();
  const { registerSubmitHandler, registerEscapeHandler } = useKeyboardShortcutsContext();

  const handleSubmit = (message: PromptInputMessage) => {
    if (!isSignedIn) {
      setShowAuthBanner(true);
      return;
    }

    setShowAuthBanner(false);
    onSubmit(message, {
      selectedPageId: selectedPage?.id,
      stylePreset: activePreset?.instruction ?? null,
    });
    setSelectedPageId(null);
  };

  // Register Cmd+Enter to submit
  useEffect(() => {
    const submit = () => {
      if (input.trim() && !isLoading) {
        handleSubmit({ text: input, files: [] });
      }
    };
    submitRef.current = submit;
    return registerSubmitHandler(submit);
  }, [input, isLoading, registerSubmitHandler]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register Escape to deselect page
  useEffect(() => {
    if (selectedPage) {
      return registerEscapeHandler(() => setSelectedPageId(null));
    }
  }, [selectedPage, registerEscapeHandler, setSelectedPageId]);

  return (
    <div className="w-full flex flex-col gap-2">
      {showAuthBanner && (
        <Item
          variant="outline"
          size="sm"
          className="py-2
      bg-amber-50 dark:bg-amber-950/40
      border-amber-200 dark:border-amber-800/30
      animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <ItemMedia variant="icon" className="bg-transparent">
            <LockIcon className="size-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="text-sm">Sign in to continue</ItemTitle>
            <ItemDescription>
              Create a free account to start designing with Zephio.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/sign-in">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowAuthBanner(false)}
            >
              <XIcon className="size-3.5" />
            </Button>
          </ItemActions>
        </Item>
      )}

      <PromptInput
        globalDrop
        className="rounded-xl! shadow-md bg-background
         border
        "
        onSubmit={handleSubmit}
      >
        {selectedPage && (
          <div className="px-2 pt-2 w-full">
            <Badge variant="secondary" className="text-xs">
              {selectedPage.name} Page
              <button onClick={() => setSelectedPageId(null)}>
                <XIcon className="size-3.5" />
              </button>
            </Badge>
          </div>
        )}
        <PromptInputAttachmentsDisplay />
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder="Describe your design vision..."
            className="pt-5"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>

            {/* Style preset picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className={cn(
                    "rounded-md gap-1.5 px-2 text-xs font-medium transition-colors",
                    activePreset
                      ? "text-primary bg-primary/8 hover:bg-primary/12"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Style preset"
                >
                  <Palette className="size-3.5" />
                  {activePreset ? (
                    <span className="hidden sm:inline">{activePreset.emoji} {activePreset.label}</span>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" className="w-64 p-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pb-2">
                  Style preset
                </p>
                <div className="flex flex-col gap-0.5">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() =>
                        setActivePreset(activePreset?.id === preset.id ? null : preset)
                      }
                      className={cn(
                        "flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors w-full",
                        activePreset?.id === preset.id
                          ? "bg-primary/8 text-primary"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <span className="text-base leading-none mt-0.5">{preset.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold">{preset.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{preset.description}</p>
                      </div>
                    </button>
                  ))}
                  {activePreset && (
                    <button
                      onClick={() => setActivePreset(null)}
                      className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-center"
                    >
                      Clear preset
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Prompt history */}
            <Popover open={historyOpen} onOpenChange={handleHistoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className={cn(
                    "rounded-md transition-colors",
                    historyOpen
                      ? "text-primary bg-primary/8 hover:bg-primary/12"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Prompt history"
                >
                  <History className="size-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" className="w-80 p-0 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Recent prompts
                  </p>
                  {history.length > 0 && (
                    <span className="text-[10px] text-muted-foreground/60">
                      Click to reuse
                    </span>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {history.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center"
                    >
                      <History className="size-6 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">
                        No prompts yet. Your history will appear here after you send a message.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col max-h-64 overflow-y-auto py-1"
                    >
                      {history.map((prompt, i) => (
                        <motion.div
                          key={prompt}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8, height: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="group flex items-start gap-2 px-2 py-1.5 mx-1 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => handleSelectHistory(prompt)}
                        >
                          <History className="size-3 mt-0.5 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                          <span className="flex-1 text-xs text-foreground leading-relaxed line-clamp-2 min-w-0">
                            {prompt}
                          </span>
                          <button
                            onClick={(e) => handleDeleteHistory(e, prompt)}
                            className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all mt-0.5"
                            title="Remove"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </PopoverContent>
            </Popover>

            {/* Keyboard shortcut hints */}
            <div className="hidden sm:flex items-center gap-1.5 ml-auto mr-2 text-[11px] text-muted-foreground">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
                {getShortcutDisplay({ key: "K", metaKey: true })}
              </kbd>
              <span>commands</span>
              <span className="mx-1">•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
                {getShortcutDisplay({ key: "Enter", metaKey: true })}
              </kbd>
              <span>send</span>
            </div>
          </PromptInputTools>

          {isLoading ? (
            <StopButton onStop={onStop} />
          ) : (
            <PromptInputSubmit
              status={status}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 rounded-full bottom-1.5"
            >
              <ArrowUpIcon size={25} />
            </PromptInputSubmit>
          )}
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
};

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments
      variant="grid"
      className="w-full h-auto min-h-20 px-4 pt-4 justify-start flex-nowrap
       overflow-x-auto ml-0
      "
    >
      {attachments.files.map((attachment) => (
        <Attachment
          data={attachment}
          key={attachment.id}
          className="size-15 shrink-0"
          onRemove={() => attachments.remove(attachment.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
};

const StopButton = ({ onStop }: { onStop: () => void }) => {
  return (
    <Button
      size="icon"
      className="bg-muted! rounded-full dark:bg-black!
      border cursor-pointer"
      onClick={onStop}
    >
      <Square
        fill="black"
        size={14}
        className="text-black
       dark:text-white"
      />
    </Button>
  );
};

export default ChatInput;
