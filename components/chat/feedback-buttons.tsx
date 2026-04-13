"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Rating = "up" | "down" | null;

type Props = {
  pageId: string;
  scale?: number;
};

export default function FeedbackButtons({ pageId, scale = 1 }: Props) {
  const [rating, setRating] = useState<Rating>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (value: "up" | "down") => {
    if (submitting) return;
    const next = rating === value ? null : value; // toggle off
    setRating(next);

    if (!next) return; // toggled off — no API call needed

    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, rating: next }),
      });
      if (next === "up") {
        toast.success("Thanks for the feedback!", { duration: 2000 });
      } else {
        toast("Got it — we'll keep improving.", { duration: 2000 });
      }
    } catch {
      // silent — feedback is non-critical
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex items-center gap-0.5"
      style={{
        transform: `scale(${1 / scale})`,
        transformOrigin: "center",
      }}
    >
      {/* Thumbs up */}
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "size-6 p-1! cursor-pointer transition-all duration-200",
          rating === "up"
            ? "text-green-500 bg-green-500/10 hover:bg-green-500/15"
            : "hover:bg-accent text-muted-foreground hover:text-foreground"
        )}
        onClick={() => handleRate("up")}
        title="This looks great"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={rating === "up" ? "up-filled" : "up-empty"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ThumbsUp
              className={cn(
                "size-3.5 transition-all",
                rating === "up" && "fill-green-500"
              )}
            />
          </motion.div>
        </AnimatePresence>
      </Button>

      {/* Thumbs down */}
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "size-6 p-1! cursor-pointer transition-all duration-200",
          rating === "down"
            ? "text-destructive bg-destructive/10 hover:bg-destructive/15"
            : "hover:bg-accent text-muted-foreground hover:text-foreground"
        )}
        onClick={() => handleRate("down")}
        title="Needs improvement"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={rating === "down" ? "down-filled" : "down-empty"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ThumbsDown
              className={cn(
                "size-3.5 transition-all",
                rating === "down" && "fill-destructive"
              )}
            />
          </motion.div>
        </AnimatePresence>
      </Button>
    </div>
  );
}
