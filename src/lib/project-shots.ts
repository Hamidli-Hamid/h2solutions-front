import type { ApiProject } from "@/lib/api";

/** One gallery page as plain screenshots, keyed by its composed picture. */
export type ViewerShot = { desktop?: string; mobile?: string; alt?: string };
export type ViewerShots = Record<string, ViewerShot>;

/**
 * The project's per-page screenshots, keyed by the picture the grid shows —
 * the viewer looks a page up by the image it was opened on. A page without
 * shots is simply missing, and the viewer falls back to its picture.
 */
export function shotsByImage(project: Pick<ApiProject, "shots">): ViewerShots {
  const map: ViewerShots = {};
  for (const shot of project.shots ?? []) {
    map[shot.image] = { desktop: shot.desktop, mobile: shot.mobile, alt: shot.alt };
  }
  return map;
}
