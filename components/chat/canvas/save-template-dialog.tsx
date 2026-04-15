"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookmarkPlus, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageType } from "@/types/project";

type Props = {
  page: PageType;
  open: boolean;
  onClose: () => void;
};

export default function SaveTemplateDialog({ page, open, onClose }: Props) {
  const [name, setName] = useState(page.name);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) { toast.error("Please enter a template name."); return; }
    if (!page.htmlContent?.trim()) { toast.error("This page has no content to save."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim(),
          prompt: `Recreate this design: ${trimmedName}`,
          htmlContent: page.htmlContent,
          rootStyles: page.rootStyles,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save template.");
        return;
      }

      setSaved(true);
      toast.success(`"${trimmedName}" saved to your templates!`);
      setTimeout(() => {
        setSaved(false);
        onClose();
        setName(page.name);
        setDescription("");
      }, 1200);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden">
              {/* Header bar */}
              <div className="h-0.5 bg-linear-to-r from-primary/60 via-primary to-primary/60" />

              <div className="p-6">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>

                {/* Icon + heading */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <BookmarkPlus className="size-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Save as template</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Reuse this design in future projects
                    </p>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Template name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. SaaS Hero Section"
                      maxLength={60}
                      className="h-9 text-sm"
                      onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Description{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What makes this design special?"
                      maxLength={120}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-5">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={cn("flex-1 gap-2 font-semibold", saved && "bg-green-500 hover:bg-green-500")}
                    onClick={handleSave}
                    disabled={saving || saved || !name.trim()}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {saved ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Check className="size-4" />
                        </motion.span>
                      ) : saving ? (
                        <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Loader2 className="size-4 animate-spin" />
                        </motion.span>
                      ) : (
                        <motion.span key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <BookmarkPlus className="size-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {saved ? "Saved!" : saving ? "Saving…" : "Save template"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
