"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/context/LocaleContext";
import { createClient } from "@/lib/infrastructure/supabase/client";

const SHARE_DURATION_MS = 2 * 60 * 60 * 1000;

function createShareToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function WorkoutShareControl() {
  const t = useTranslations("workoutShare");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "working" | "error" | "copied">("idle");

  if (process.env.NEXT_PUBLIC_ENABLE_DATABASE !== "true") return null;

  const createShareLink = async () => {
    setStatus("working");
    try {
      const token = createShareToken();
      const expiresAt = new Date(Date.now() + SHARE_DURATION_MS).toISOString();
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error("Authentication is required to share a workout");

      const { error } = await supabase
        .from("workout_share_links")
        .insert({ token, owner_id: user.id, expires_at: expiresAt });
      if (error) throw error;

      setShareToken(token);
      setShareUrl(`${window.location.origin}/workout-share/${token}`);
      setStatus("idle");
    } catch (error) {
      console.error("[WorkoutShareControl] Could not create share link", error);
      setStatus("error");
    }
  };

  const revokeShareLink = async () => {
    if (!shareToken) return;
    setStatus("working");
    try {
      const { error } = await createClient()
        .from("workout_share_links")
        .update({ revoked_at: new Date().toISOString() })
        .eq("token", shareToken);
      if (error) throw error;

      setShareToken(null);
      setShareUrl(null);
      setStatus("idle");
    } catch (error) {
      console.error("[WorkoutShareControl] Could not revoke share link", error);
      setStatus("error");
    }
  };

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
    } catch (error) {
      console.error("[WorkoutShareControl] Could not copy share link", error);
      setStatus("error");
    }
  };

  return (
    <section className="mx-auto mt-3 w-full max-w-3xl rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {t("title")}
        </p>
        {shareUrl ? (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={copyShareLink} disabled={status === "working"}>
              {status === "copied" ? t("copied") : t("copyLink")}
            </Button>
            <Button variant="ghost" size="sm" onClick={revokeShareLink} disabled={status === "working"}>
              {t("revoke")}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={createShareLink} disabled={status === "working"}>
            {status === "working" ? t("working") : t("createLink")}
          </Button>
        )}
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {t("description")}
      </p>
      {shareUrl && (
        <input
          aria-label={t("linkLabel")}
          className="mt-2 w-full rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          readOnly
          value={shareUrl}
        />
      )}
      {status === "error" && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {t("error")}
        </p>
      )}
    </section>
  );
}
