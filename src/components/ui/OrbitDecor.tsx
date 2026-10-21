import type { CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Decorative orbit — three rings and a handful of nodes, turning slowly. It
 * is the one graphic motif the site repeats: behind the hero panel and in
 * the open half of every inner page header. Purely decorative, so it is
 * hidden from assistive technology; placement is left to the caller.
 */
export function OrbitDecor({ className, style }: Props) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 800"
      fill="none"
      className={`orbit ${className ?? ""}`}
      style={style}
    >
      <g className="orbit-spin" stroke="currentColor" vectorEffect="non-scaling-stroke">
        <circle cx="400" cy="400" r="150" strokeOpacity="0.55" strokeDasharray="3 9" />
        <circle cx="400" cy="400" r="250" strokeOpacity="0.4" />
        <circle cx="400" cy="400" r="345" strokeOpacity="0.3" strokeDasharray="1 14" />
        <circle cx="650" cy="400" r="5" fill="currentColor" stroke="none" />
        <circle cx="400" cy="150" r="3.5" fill="currentColor" stroke="none" opacity="0.8" />
        <circle cx="156" cy="400" r="6" fill="currentColor" stroke="none" opacity="0.5" />
        <circle cx="400" cy="745" r="3" fill="currentColor" stroke="none" opacity="0.6" />
      </g>
      <g
        className="orbit-spin orbit-spin-reverse"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
      >
        <circle cx="400" cy="400" r="395" strokeOpacity="0.18" />
        <circle cx="400" cy="5" r="4" fill="currentColor" stroke="none" opacity="0.7" />
        <circle cx="400" cy="795" r="2.5" fill="currentColor" stroke="none" opacity="0.5" />
      </g>
      <circle
        cx="400"
        cy="400"
        r="58"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeDasharray="2 6"
      />
    </svg>
  );
}
