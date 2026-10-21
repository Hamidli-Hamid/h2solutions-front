import Image from "next/image";

type Props = {
  src?: string | null;
  alt: string;
  /** Responsive `sizes` hint — must match the grid the card sits in. */
  sizes?: string;
  /** Varies the placeholder graphic so a row of cards doesn't look cloned. */
  variant?: number;
  /**
   * `framed` is the classic band above a card's copy; `fill` stretches the
   * artwork over the whole card so the copy can sit on top of it.
   */
  layout?: "framed" | "fill";
  className?: string;
};

/** Node coordinates for the placeholder polyline; index 0 is the default. */
const PLACEHOLDER_NODES: Array<Array<[number, number]>> = [
  [
    [24, 74],
    [56, 48],
    [92, 62],
    [136, 26],
  ],
  [
    [24, 62],
    [52, 70],
    [88, 34],
    [136, 44],
  ],
  [
    [24, 40],
    [60, 70],
    [96, 40],
    [136, 66],
  ],
  [
    [24, 70],
    [60, 34],
    [96, 58],
    [136, 30],
  ],
];

/**
 * Cover image for project/blog cards. Falls back to a CSS-drawn technical
 * placeholder when the API has no cover image, so the grid never collapses.
 */
export function CardMedia({
  src,
  alt,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw",
  variant = 0,
  layout = "framed",
  className,
}: Props) {
  const nodes = PLACEHOLDER_NODES[variant % PLACEHOLDER_NODES.length];
  const polyline = nodes
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");

  const shell =
    layout === "fill"
      ? "absolute inset-0 overflow-hidden"
      : "relative aspect-16/10 overflow-hidden border-b border-[color:var(--color-border)]";

  return (
    <div className={`${shell} ${className ?? ""}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading="lazy"
          /* A longer, eased zoom than the old 500ms linear step — at card
             size the movement should be felt rather than seen. */
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
      ) : (
        <div className="media-placeholder absolute inset-0" aria-hidden>
          <svg
            viewBox="0 0 160 100"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full text-[color:var(--color-accent)] opacity-35 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
          >
            <path d={polyline} strokeOpacity="0.55" />
            <path d="M24 26h112M24 50h32M104 50h32" strokeOpacity="0.2" />
            {nodes.slice(1).map(([x, y], index) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={index === nodes.length - 2 ? 3 : 2.4}
                fill="currentColor"
                stroke="none"
              />
            ))}
            <rect
              x="60"
              y="36"
              width="40"
              height="28"
              rx="3"
              strokeOpacity="0.35"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
