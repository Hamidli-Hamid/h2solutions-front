"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm({ dict }: Props) {
  const [state, setState] = useState<FormState>("idle");
  const t = dict.contact.form;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${apiUrl}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("success");
      event.currentTarget.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="card flex flex-col items-center justify-center gap-3 p-10 text-center"
      >
        <div
          aria-hidden
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[#001019]"
        >
          ✓
        </div>
        <p className="text-base text-[color:var(--color-foreground)]">{t.success}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate={false}
      aria-label={dict.contact.title}
      className="card flex flex-col gap-5 p-6 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t.name}
          name="name"
          placeholder={t.namePlaceholder}
          autoComplete="name"
          required
        />
        <Field
          label={t.email}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          required
        />
        <Field
          label={t.phone}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t.phonePlaceholder}
        />
        <Field
          label={t.company}
          name="company"
          autoComplete="organization"
          placeholder={t.companyPlaceholder}
        />
      </div>

      <label htmlFor="contact-service" className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[color:var(--color-foreground-soft)]">
          {t.service}
        </span>
        <select
          id="contact-service"
          name="service"
          defaultValue="web"
          className="rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)]"
        >
          <option value="web">{t.serviceOptions.web}</option>
          <option value="seo">{t.serviceOptions.seo}</option>
          <option value="consult">{t.serviceOptions.consult}</option>
          <option value="other">{t.serviceOptions.other}</option>
        </select>
      </label>

      <label htmlFor="contact-message" className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[color:var(--color-foreground-soft)]">
          {t.message}
        </span>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder={t.messagePlaceholder}
          className="rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none transition placeholder:text-[color:var(--color-foreground-muted)] focus:border-[color:var(--color-accent)]"
        />
      </label>

      {state === "error" && (
        <p
          role="alert"
          aria-live="assertive"
          className="text-sm text-[color:var(--color-danger)]"
        >
          {t.error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        aria-busy={state === "submitting"}
        className="btn-primary self-start disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "submitting" ? t.submitting : t.submit}
        {state !== "submitting" && <span aria-hidden>→</span>}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  autoComplete,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const id = `contact-${name}`;
  return (
    <label htmlFor={id} className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-[color:var(--color-foreground-soft)]">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-[color:var(--color-accent)]">
            *
          </span>
        )}
      </span>
      <input
        id={id}
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-required={required || undefined}
        className="rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none transition placeholder:text-[color:var(--color-foreground-muted)] focus:border-[color:var(--color-accent)]"
      />
    </label>
  );
}
