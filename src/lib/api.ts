import "server-only";
import type { Locale } from "@/i18n-config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8888/api";

const DEFAULT_REVALIDATE = 300;

export type ApiService = {
  id: number;
  slug: string;
  icon: string | null;
  title: string;
  summary: string;
  description: string;
  features: string[];
  sort_order: number;
};

export type ApiProject = {
  id: number;
  slug: string;
  client: string | null;
  year: number | null;
  url: string | null;
  cover_image: string | null;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
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
      next: revalidate === false ? { revalidate: 0 } : { revalidate },
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
