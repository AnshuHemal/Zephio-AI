import { ChatStatus } from "ai";
import React, { useState } from "react";
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
import { ArrowUpIcon, LockIcon, Square, XIcon, Palette } from "lucide-react";
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

  const { setSelectedPageId } = useCanvas();

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
