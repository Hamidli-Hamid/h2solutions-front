"use client";

import { useState } from "react";
import { CheckCircleIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function NewsletterForm({ lang, dict }: Props) {
  const [state, setState] = useState<FormState>("idle");
  const t = dict.footer;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!email) return;

    setState("submitting");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      // The backend exposes a single inbound endpoint; newsletter sign-ups are
      // stored as leads tagged with the `newsletter` service.
      const res = await fetch(`${apiUrl}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: email.split("@")[0],
          email,
          service: "newsletter",
          message: t.newsletterTitle,
          locale: lang,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("success");
      form.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="mt-4 inline-flex items-start gap-2 text-sm text-[color:var(--color-foreground-soft)]"
      >
        <CheckCircleIcon
          aria-hidden
          className="mt-0.5 h-4 w-4 flex-none text-[color:var(--color-accent)]"
        />
        {t.newsletterSuccess}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4" aria-label={t.newsletterTitle}>
      <div className="flex items-center gap-2 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] p-1 focus-within:border-[color:var(--color-accent)]">
        <label htmlFor="newsletter-email" className="sr-only">
          {t.newsletterPlaceholder}
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={t.newsletterPlaceholder}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none placeholder:text-[color:var(--color-foreground-faint)]"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          aria-label={t.newsletterSubmit}
          aria-busy={state === "submitting"}
          className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-sm bg-[color:var(--color-accent)] text-[#001019] transition hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PaperAirplaneIcon aria-hidden className="h-4 w-4" />
        </button>
      </div>

      {state === "error" && (
        <p role="alert" className="mt-2 text-xs text-[color:var(--color-danger)]">
          {t.newsletterError}
        </p>
      )}
    </form>
  );
}
