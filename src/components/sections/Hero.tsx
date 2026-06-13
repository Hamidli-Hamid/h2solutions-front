import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

const VIDEO_PUBLIC_PATH = "/videos/hero.mp4";
const VIDEO_POSTER_PATH = "/videos/hero-poster.jpg";

function publicFileExists(relativePath: string): boolean {
  try {
    return existsSync(join(process.cwd(), "public", relativePath));
  } catch {
    return false;
  }
}

/**
 * Resolution order for the hero video:
 *   1. NEXT_PUBLIC_HERO_VIDEO_URL env var (external CDN URL)
 *   2. /public/videos/hero.mp4 if present
 *   3. null → right column hides
 */
function resolveVideoSrc(): string | null {
  const envUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim();
  if (envUrl) return envUrl;
  if (publicFileExists(VIDEO_PUBLIC_PATH)) return VIDEO_PUBLIC_PATH;
  return null;
}

export function Hero({ lang, dict }: Props) {
  const videoSrc = resolveVideoSrc();
  const hasPoster = publicFileExists(VIDEO_POSTER_PATH);

  return (
    <section className="relative isolate overflow-hidden grid-bg">
      <div className="container-h2 relative pt-8 pb-16 md:pt-10 md:pb-20 lg:pt-12 lg:pb-24">
        <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-12">
          {/* LEFT 50% — services are the focus; copy stays compact */}
          <div className="flex flex-col">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)]/80 px-3 py-1 text-xs font-medium tracking-wide text-[color:var(--color-foreground-soft)] backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)] shadow-[var(--shadow-glow)]" />
              {dict.hero.badge}
            </span>

            <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {dict.hero.title.split(" ").map((word, i, arr) => {
                const isAccent = i === arr.length - 1 || i === arr.length - 2;
                return (
                  <span key={i} className={isAccent ? "accent-text" : ""}>
                    {word}
                    {i < arr.length - 1 ? " " : ""}
                  </span>
                );
              })}
            </h1>

            <div className="mt-6 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-foreground-muted)]">
                {dict.hero.chipsTitle}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {dict.hero.chips.map((chip) => (
                  <Link
                    key={chip.name}
                    href={`/${lang}/services`}
                    className="group flex items-center gap-4 rounded-xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)]/80 p-4 backdrop-blur transition hover:border-[color:var(--color-accent)] hover:shadow-[var(--shadow-glow)]"
                  >
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] text-[color:var(--color-accent)] transition group-hover:shadow-[var(--shadow-glow)]">
                      <Icon name={chip.icon} className="h-5 w-5" />
                    </span>
                    <span className="text-base font-semibold text-[color:var(--color-foreground)] transition group-hover:text-[color:var(--color-accent)]">
                      {chip.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/${lang}/contact`} className="btn-primary">
                {dict.hero.ctaPrimary}
                <span aria-hidden>→</span>
              </Link>
              <Link href={`/${lang}/portfolio`} className="btn-secondary backdrop-blur">
                {dict.hero.ctaSecondary}
              </Link>
            </div>
          </div>

          {/* RIGHT 50% — contained video fills full column height on lg+ */}
          <div className="relative h-full min-h-[420px] lg:min-h-0">
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)] shadow-[var(--shadow-glow)]">
              {videoSrc ? (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  disablePictureInPicture
                  disableRemotePlayback
                  poster={hasPoster ? VIDEO_POSTER_PATH : undefined}
                  preload="metadata"
                  aria-hidden
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>
              ) : (
                <div className="absolute inset-0 grid-bg" aria-hidden />
              )}

              {/* Subtle inner overlay for contrast against badges */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[color:var(--color-background)]/30 via-transparent to-transparent" />

              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)]/70 px-3 py-1 text-xs font-medium text-[color:var(--color-foreground-soft)] backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                {dict.hero.videoBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Stats strip — full width below the split */}
        <div className="mt-14 grid grid-cols-3 gap-3 md:gap-4">
          {dict.hero.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-[color:var(--color-border-strong)] bg-[color:var(--color-background-elevated)]/70 p-4 backdrop-blur"
            >
              <span className="block font-[var(--font-display)] text-2xl font-bold text-[color:var(--color-foreground)] md:text-3xl">
                {stat.value}
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-wider text-[color:var(--color-foreground-muted)] md:text-xs">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
