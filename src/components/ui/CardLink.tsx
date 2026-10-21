import Link from "next/link";

type Props = {
  href: string;
};

/**
 * Makes a whole card clickable. A stretched `::before` on the title link
 * cannot do it here: `.glow-card > *` positions every direct child of a card,
 * so the pseudo-element only ever covered the title's own block. This is a
 * direct child itself, laid over the card above the glow and sheen layers.
 *
 * It is a pointer target only — hidden from assistive tech and out of the tab
 * order — so the card still announces and focuses once, through its title
 * link. Render it as the card's last child, inside a `.glow-card` (or any
 * positioned) element.
 */
export function CardLink({ href }: Props) {
  return (
    <Link
      href={href}
      aria-hidden
      tabIndex={-1}
      className="absolute inset-0 z-[3] rounded-[inherit]"
    />
  );
}
