import "server-only";
import { availableLocales, i18n, type Locale } from "@/i18n-config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8888/api";

const DEFAULT_REVALIDATE = 300;

/** Cache tag every API read carries, so the admin can refresh the site at once. */
export const CONTENT_TAG = "h2-content";

/** Per-page or per-record meta overrides set in the admin. */
export type ApiSeo = {
  title?: string | null;
  description?: string | null;
  /** Share card image; its title and description come from the two above. */
  og_image?: string | null;
  robots?: { index: boolean; follow: boolean };
  /**
   * Extra schema.org nodes typed in the admin. Validated by the backend, but
   * read defensively: it may arrive as an object, a list, or a JSON string —
   * see `mergeAdminNodes`.
   */
  structured_data?: Record<string, unknown> | Record<string, unknown>[] | string | null;
};

/** The whole editable surface of the site for one language. */
export type ApiContent = {
  locale: string;
  /** Same shape as the bundled dictionaries — merged over them. */
  content: Record<string, unknown>;
  /** Keyed by page key: `home`, `about`, `service-detail`, … */
  seo: Record<string, ApiSeo>;
  /** Last edit per page key, keyed as `seo` is — the sitemap's `lastmod`. */
  updated?: Record<string, string>;
};

export type ApiService = {
  id: number;
  slug: string;
  icon: string | null;
  title: string;
  summary: string;
  description: string;
  features: string[];
  /** Questions written for this one service; empty when none were filled in. */
  faq?: { question: string; answer: string }[];
  /**
   * Cases that demonstrate this service (detail endpoint only, at most six).
   * Optional: absent until the backend serves it, and absent means no block.
   */
  projects?: ApiProjectSummary[];
  sort_order: number;
  updated_at?: string | null;
  /** Newest edit across the record and what the page renders with it (SEO row, FAQs). */
  lastmod?: string | null;
  seo?: ApiSeo;
};

export type ApiProject = {
  id: number;
  slug: string;
  client: string | null;
  year: number | null;
  url: string | null;
  /** Slug of the primary service this case demonstrates; optional, may be unset. */
  service_slug?: string | null;
  /** Ticked in the admin: the home page shows these, in the API's (admin) order. */
  show_on_home?: boolean;
  cover_image: string | null;
  /** Ordered gallery image URLs; empty when nothing has been uploaded yet. */
  gallery: string[];
  /** Cover then gallery, each with its plain desktop/mobile screenshots when uploaded. */
  shots?: { image: string; desktop?: string; mobile?: string; alt?: string }[];
  /** Absolute URL of a clip uploaded in the admin; wins over `video_url`. */
  video_file?: string | null;
  /** YouTube/Vimeo link or a direct video URL — see lib/video.ts. */
  video_url?: string | null;
  title: string;
  summary: string;
  /** The project story as rich-text HTML from the admin editor. */
  body: string;
  updated_at?: string | null;
  /** Newest edit across the record, its SEO row and its gallery. */
  lastmod?: string | null;
  seo?: ApiSeo;
};

/**
 * What a project card shows. The client's own `url` is deliberately not part
 * of it: no card may link a visitor out to a client's site.
 */
export type ApiProjectSummary = Pick<
  ApiProject,
  "slug" | "title" | "summary" | "cover_image" | "client" | "year"
>;

export type ApiBlogPost = {
  id: number;
  slug: string;
  cover_image: string | null;
  read_minutes: number;
  published_at: string | null;
  updated_at?: string | null;
  /** Newest edit across the post and its SEO row. */
  lastmod?: string | null;
  /** `url` is absent when the author has no public profile. */
  author?: { name: string | null; url?: string | null };
  title: string;
  excerpt: string;
  content?: string;
  /**
   * The languages this post exists in. Optional: absent means all of them
   * (read it through `availableLocales`).
   */
  locales?: string[];
  seo?: ApiSeo;
};

type Collection<T> = { data: T[] };
type Single<T> = { data: T };

/**
 * A read the API could not answer: unreachable, timed out, a non-2xx other than
 * a record's 404, or a body that is not the shape every endpoint returns.
 */
export class ApiError extends Error {
  readonly url: string;
  readonly status: number | null;

  constructor(url: string, status: number | null, detail?: string, cause?: unknown) {
    const what = status === null ? `API unreachable: ${url}` : `API ${status} for ${url}`;
    super(detail ? `${what} (${detail})` : what, { cause });
    this.name = "ApiError";
    this.url = url;
    this.status = status;
  }
}

export type ReadOptions = {
  /**
   * Abort a read that has not answered in this time. Only for callers that do
   * not share reads with a render (the sitemap, llms.txt): Next opts any fetch
   * carrying a `signal` out of request de-duplication
   * (next/dist/server/lib/dedupe-fetch.js), which would multiply the reads the
   * layout, the page and `generateMetadata` share. Without it, a hung API is
   * bounded only by undici's own timeouts.
   */
  timeoutMs?: number;
};

/**
 * Strict by design: `null` means the API said 404 and nothing else. Every
 * other failure throws.
 *
 * The earlier version returned `null` for any failure, so an outage read as
 * "not found" (a real service page cached as a 404) or as "empty" (the sitemap
 * losing every service URL with a 200). Throwing is what lets ISR keep serving
 * the last good page: "If an error is thrown while attempting to revalidate
 * data, the last successfully generated data will continue to be served from
 * the cache" (docs/01-app/02-guides/incremental-static-regeneration.md).
 */
async function apiFetch<T>(
  path: string,
  locale: Locale,
  { timeoutMs }: ReadOptions = {},
): Promise<{ url: string; body: T } | null> {
  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json", "X-Locale": locale },
      next: { revalidate: DEFAULT_REVALIDATE, tags: [CONTENT_TAG] },
      ...(timeoutMs ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
    });
  } catch (err) {
    console.error(`API fetch failed for ${url}:`, err);
    throw new ApiError(url, null, undefined, err);
  }

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(`API ${res.status} for ${url}`);
    throw new ApiError(url, res.status);
  }

  try {
    return { url, body: (await res.json()) as T };
  } catch (err) {
    console.error(`API returned an unreadable body for ${url}:`, err);
    throw new ApiError(url, res.status, "unreadable body", err);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * A collection. The endpoint always exists, so a 404 (a wrong base URL, a
 * vhost answering outside `/api`) or a body without a `data` list is a broken
 * API — never "no records", which would de-index the hubs and empty the
 * sitemap.
 */
async function readList<T>(path: string, locale: Locale, options?: ReadOptions): Promise<T[]> {
  const read = await apiFetch<Collection<T>>(path, locale, options);
  if (read === null) {
    console.error(`API 404 for the collection ${API_BASE}${path}`);
    throw new ApiError(`${API_BASE}${path}`, 404, "collection endpoint missing");
  }
  if (!isRecord(read.body) || !Array.isArray(read.body.data)) {
    console.error(`API returned no data list for ${read.url}`);
    throw new ApiError(read.url, 200, "no data list");
  }
  return read.body.data;
}

/**
 * One record: `null` only when the API says it does not exist (404).
 *
 * The record reads below put the slug into the path through
 * `encodeURIComponent`: route params can reach here decoded, and a raw
 * `../`, `?` or `#` would otherwise move the request to another endpoint (a
 * slug of `..%2F..%2Fcontent` fetched `/content`) or to another record's URL.
 */
async function readOne<T>(path: string, locale: Locale, options?: ReadOptions): Promise<T | null> {
  const read = await apiFetch<Single<T>>(path, locale, options);
  if (read === null) return null;
  if (!isRecord(read.body) || !isRecord(read.body.data)) {
    console.error(`API returned no data object for ${read.url}`);
    throw new ApiError(read.url, 200, "no data object");
  }
  return read.body.data as T;
}

/**
 * The fail-soft exception, for the few places where rendering without the data
 * is the intended outcome (the footer's service column, the home page's
 * previews). The failure is logged and the caller gets `fallback`; everywhere
 * else the error must propagate.
 */
export async function withFallback<T>(read: Promise<T>, fallback: T, what: string): Promise<T> {
  try {
    return await read;
  } catch (err) {
    console.error(`${what} unavailable; rendering without it:`, err);
    return fallback;
  }
}

/**
 * Page copy and meta managed in the admin. Fetched once per render pass and
 * merged over the bundled dictionary — see lib/content.ts.
 */
export async function fetchContent(
  locale: Locale,
  options?: ReadOptions,
): Promise<ApiContent | null> {
  return readOne<ApiContent>("/content", locale, options);
}

export async function fetchServices(locale: Locale, options?: ReadOptions): Promise<ApiService[]> {
  return readList<ApiService>("/services", locale, options);
}

export async function fetchService(
  slug: string,
  locale: Locale,
): Promise<ApiService | null> {
  return readOne<ApiService>(`/services/${encodeURIComponent(slug)}`, locale);
}

/**
 * The cases mapped to a service, normalised for a card. The field is optional
 * and new, so a missing or malformed value is "no cases" rather than a broken
 * page, and an entry without a slug or a title is dropped instead of becoming
 * a dead card.
 */
export function serviceProjects(service: ApiService): ApiProjectSummary[] {
  const list: unknown = service.projects;
  if (!Array.isArray(list)) return [];

  return list
    .filter(
      (item): item is Record<string, unknown> =>
        isRecord(item) &&
        typeof item.slug === "string" &&
        item.slug !== "" &&
        typeof item.title === "string" &&
        item.title !== "",
    )
    .slice(0, 6)
    .map((item) => ({
      slug: item.slug as string,
      title: item.title as string,
      summary: typeof item.summary === "string" ? item.summary : "",
      cover_image: typeof item.cover_image === "string" && item.cover_image ? item.cover_image : null,
      client: typeof item.client === "string" && item.client ? item.client : null,
      year: typeof item.year === "number" && Number.isFinite(item.year) ? item.year : null,
    }));
}

export async function fetchProjects(locale: Locale, options?: ReadOptions): Promise<ApiProject[]> {
  return readList<ApiProject>("/projects", locale, options);
}

export async function fetchProject(
  slug: string,
  locale: Locale,
): Promise<ApiProject | null> {
  return readOne<ApiProject>(`/projects/${encodeURIComponent(slug)}`, locale);
}

export async function fetchBlogPosts(locale: Locale, options?: ReadOptions): Promise<ApiBlogPost[]> {
  return readList<ApiBlogPost>("/blog", locale, options);
}

/** Slug → languages, only for the posts missing from at least one language. */
export function partialPostLocales(posts: ApiBlogPost[]): Record<string, Locale[]> {
  return Object.fromEntries(
    posts
      .map((post) => [post.slug, availableLocales(post.locales)] as const)
      .filter(([, locales]) => locales.length < i18n.locales.length),
  );
}

export async function fetchBlogPost(
  slug: string,
  locale: Locale,
): Promise<ApiBlogPost | null> {
  return readOne<ApiBlogPost>(`/blog/${encodeURIComponent(slug)}`, locale);
}
