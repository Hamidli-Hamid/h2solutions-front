/**
 * Turns whatever the admin saved on a project — an uploaded clip or a pasted
 * link — into something renderable: a file the browser can play itself, or a
 * player URL for an <iframe>.
 */

export type ProjectVideoSource =
  | { kind: "file"; src: string }
  | { kind: "embed"; src: string; provider: "youtube" | "vimeo" };

const FILE_EXTENSIONS = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i;

const YOUTUBE_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
];

/** `null` for anything we cannot play, so callers can just skip the section. */
export function resolveProjectVideo(project: {
  video_file?: string | null;
  video_url?: string | null;
}): ProjectVideoSource | null {
  // An upload is the deliberate choice — it wins over a leftover link.
  if (project.video_file) return { kind: "file", src: project.video_file };

  const raw = project.video_url?.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (YOUTUBE_HOSTS.includes(url.hostname)) {
    const id = youtubeId(url);
    return id
      ? {
          kind: "embed",
          provider: "youtube",
          // nocookie keeps the tracking cookie off the page until playback.
          src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
        }
      : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop();
    return id && /^\d+$/.test(id)
      ? { kind: "embed", provider: "vimeo", src: `https://player.vimeo.com/video/${id}` }
      : null;
  }

  if (FILE_EXTENSIONS.test(url.pathname)) return { kind: "file", src: raw };

  return null;
}

function youtubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") {
    return url.pathname.slice(1).split("/")[0] || null;
  }

  const watchId = url.searchParams.get("v");
  if (watchId) return watchId;

  // /embed/ID, /shorts/ID and /live/ID all carry the id as the last segment.
  const segments = url.pathname.split("/").filter(Boolean);
  if (["embed", "shorts", "live", "v"].includes(segments[0])) {
    return segments[1] ?? null;
  }

  return null;
}
