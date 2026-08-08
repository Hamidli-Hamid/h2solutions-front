import Link from "next/link";

export type Crumb = {
  label: string;
  /** Omit on the current page — it renders as plain text with aria-current. */
  href?: string;
};

type Props = {
  items: Crumb[];
  label: string;
};

export function Breadcrumbs({ items, label }: Props) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[color:var(--color-foreground-muted)]">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden className="text-[color:var(--color-border-strong)]">
                /
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="transition hover:text-[color:var(--color-accent)]"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-[color:var(--color-foreground-soft)]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
