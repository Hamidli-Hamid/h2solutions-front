import Image from "next/image";

type Props = {
  src?: string | null;
  alt: string;
  /** Responsive `sizes` hint — must match the grid the card sits in. */
  sizes?: string;
  /** Varies the placeholder graphic so a row of cards doesn't look cloned. */
  variant?: number;
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
  className,
}: Props) {
  const nodes = PLACEHOLDER_NODES[variant % PLACEHOLDER_NODES.length];
  const polyline = nodes
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");

  return (
    <div
      className={`relative aspect-16/10 overflow-hidden border-b border-[color:var(--color-border)] ${className ?? ""}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading="lazy"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="media-placeholder absolute inset-0" aria-hidden>
          <svg
            viewBox="0 0 160 100"
            className="absolute inset-0 h-full w-full text-[color:var(--color-accent)] opacity-35"
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
