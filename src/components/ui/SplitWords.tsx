import { Fragment } from "react";

type Props = {
  text: string;
  className?: string;
};

/**
 * Wraps each word of a title so `.word-reveal` can stagger them as the
 * title scrolls into view. The words stay separated by real spaces, so the
 * text reads the same to assistive technology, search engines and anything
 * else that ignores CSS. The stagger index is capped so a long title's last
 * words do not lag behind the rest.
 */
export function SplitWords({ text, className }: Props) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <span className={`word-reveal ${className ?? ""}`}>
      {words.map((word, index) => (
        <Fragment key={`${index}-${word}`}>
          {index > 0 ? " " : null}
          <span
            className="w"
            style={{ "--i": Math.min(index, 10) } as React.CSSProperties}
          >
            {word}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
