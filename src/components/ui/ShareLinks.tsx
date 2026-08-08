import { EnvelopeIcon } from "@heroicons/react/24/outline";

type Props = {
  /** Absolute URL of the page being shared. */
  url: string;
  title: string;
  label: string;
};

/** Brand marks for the share row — heroicons carries no logos. */
const MARKS = {
  linkedin:
    "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z",
  x: "M17.53 3h3.02l-6.6 7.54L21.75 21h-5.9l-4.62-6.04L5.94 21H2.92l7.06-8.07L2.25 3h6.05l4.18 5.52L17.53 3zm-1.06 16.2h1.67L7.6 4.72H5.81l10.66 14.48z",
  facebook:
    "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.63c-.29-.04-1.28-.13-2.43-.13-2.4 0-4.05 1.47-4.05 4.17V9.9H7.5V13h2.72v8h3.28z",
  whatsapp:
    "M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96 0-2.66-1.04-5.16-2.92-7.04A9.88 9.88 0 0 0 12.04 2zm0 18.16h-.01a8.26 8.26 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.24 8.24 0 0 1-1.26-4.38c0-4.56 3.71-8.27 8.27-8.27 2.21 0 4.28.86 5.84 2.42a8.2 8.2 0 0 1 2.42 5.85c0 4.56-3.71 8.24-8.27 8.24zm4.53-6.17c-.25-.13-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.38-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.16 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.15-1.19-.06-.1-.23-.17-.48-.29z",
} as const;

export function ShareLinks({ url, title, label }: Props) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      d: MARKS.linkedin,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      d: MARKS.x,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      d: MARKS.facebook,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      d: MARKS.whatsapp,
    },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-foreground-muted)]">
        {label}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {targets.map((target) => (
          <a
            key={target.name}
            href={target.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={`${label} — ${target.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] text-[color:var(--color-foreground-soft)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d={target.d} />
            </svg>
          </a>
        ))}
        <a
          href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
          aria-label={`${label} — e-mail`}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--color-border-strong)] text-[color:var(--color-foreground-soft)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
        >
          <EnvelopeIcon aria-hidden className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
