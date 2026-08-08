import "server-only";
import type { Locale } from "@/i18n-config";

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
};

/** The whole editable surface of the site for one language. */
export type ApiContent = {
  locale: string;
  /** Same shape as the bundled dictionaries — merged over them. */
  content: Record<string, unknown>;
  /** Keyed by page key: `home`, `about`, `service-detail`, … */
  seo: Record<string, ApiSeo>;
};

export type ApiService = {
  id: number;
  slug: string;
  icon: string | null;
  title: string;
  summary: string;
  description: string;
  features: string[];
  sort_order: number;
  seo?: ApiSeo;
};

export type ApiProject = {
  id: number;
  slug: string;
  client: string | null;
  year: number | null;
  url: string | null;
  cover_image: string | null;
  /** Ordered gallery image URLs; empty when nothing has been uploaded yet. */
  gallery: string[];
  title: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
  seo?: ApiSeo;
};

export type ApiBlogPost = {
  id: number;
  slug: string;
  cover_image: string | null;
  read_minutes: number;
  published_at: string | null;
  author?: { name: string | null };
  title: string;
  excerpt: string;
  content?: string;
  seo?: ApiSeo;
};

type Collection<T> = { data: T[] };
type Single<T> = { data: T };

async function apiFetch<T>(
  path: string,
  locale: Locale,
  revalidate: number | false = DEFAULT_REVALIDATE,
): Promise<T | null> {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "X-Locale": locale },
      next:
        revalidate === false
          ? { revalidate: 0, tags: [CONTENT_TAG] }
          : { revalidate, tags: [CONTENT_TAG] },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`API ${res.status} for ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`API fetch failed for ${url}:`, err);
    return null;
  }
}

/**
 * Page copy and meta managed in the admin. Fetched once per render pass and
 * merged over the bundled dictionary — see lib/content.ts.
 */
export async function fetchContent(locale: Locale): Promise<ApiContent | null> {
  const body = await apiFetch<Single<ApiContent>>("/content", locale);
  return body?.data ?? null;
}

export async function fetchServices(locale: Locale): Promise<ApiService[]> {
  const body = await apiFetch<Collection<ApiService>>("/services", locale);
  return body?.data ?? [];
}

export async function fetchService(
  slug: string,
  locale: Locale,
): Promise<ApiService | null> {
  const body = await apiFetch<Single<ApiService>>(`/services/${slug}`, locale);
  return body?.data ?? null;
}

export async function fetchProjects(locale: Locale): Promise<ApiProject[]> {
  const body = await apiFetch<Collection<ApiProject>>("/projects", locale);
  return body?.data ?? [];
}

export async function fetchProject(
  slug: string,
  locale: Locale,
): Promise<ApiProject | null> {
  const body = await apiFetch<Single<ApiProject>>(`/projects/${slug}`, locale);
  return body?.data ?? null;
}

export async function fetchBlogPosts(locale: Locale): Promise<ApiBlogPost[]> {
  const body = await apiFetch<Collection<ApiBlogPost>>("/blog", locale);
  return body?.data ?? [];
}

export async function fetchBlogPost(
  slug: string,
  locale: Locale,
): Promise<ApiBlogPost | null> {
  const body = await apiFetch<Single<ApiBlogPost>>(`/blog/${slug}`, locale);
  return body?.data ?? null;
}
