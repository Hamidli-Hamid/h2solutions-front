"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

import { SectionHeading } from "@/components/ui/SectionHeading";

/** Shape every FAQ block shares — home, services and any page added later. */
export type FaqContent = {
  label: string;
  title: string;
  items: { question: string; answer: string }[];
};

type Props = {
  content: FaqContent;
  /**
   * `section` is the full-width band with its own container; `inline` drops
   * the wrapper and stacks the questions, for use inside a page column.
   */
  variant?: "section" | "inline";
  /** Ordinal for the section heading — omitted by the inline variant. */
  index?: number;
  /**
   * A picture beside the questions (section variant): it takes the left
   * column from `lg`, the heading and questions stack in one column on the
   * right. On a phone it sits above them.
   */
  image?: SideImage;
};

export type SideImage = { src: string; alt: string; width: number; height: number };

export function FaqAccordion({ content: t, variant = "section", index, image }: Props) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const inline = variant === "inline";

  const body = (
    <>
      {inline ? (
        <h2 id="faq-heading" className="type-h3">
          {t.title}
        </h2>
      ) : (
        <SectionHeading
          id="faq-heading"
          label={t.label}
          title={t.title}
          index={index}
        />
      )}

      <ul className={`grid gap-3 ${inline ? "mt-5" : image ? "mt-9" : "mt-9 md:grid-cols-2 md:gap-4"}`}>
        {t.items.map((item, itemIndex) => {
          const open = openIndex === itemIndex;
          const buttonId = `${baseId}-faq-${itemIndex}`;
          const panelId = `${baseId}-faq-panel-${itemIndex}`;

          return (
            <li
              key={item.question}
              data-glow
              /* The open row keeps an accent edge so an answer stays visually
                 attached to its question across a two-column layout. */
              className={`panel glow-card h-fit px-5 transition-colors duration-300 ${
                open
                  ? "border-[color:color-mix(in_oklab,var(--color-accent)_45%,transparent)]"
                  : "hover:border-[color:var(--color-border-strong)]"
              }`}
            >
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(open ? null : itemIndex)}
                  className="group flex w-full items-center justify-between gap-4 py-4.5 text-left text-[0.9375rem] font-medium text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-accent)]"
                >
                  <span className="flex items-baseline gap-3">
                    <span
                      aria-hidden
                      className={`font-[family-name:var(--font-display)] text-[0.6875rem] font-bold tracking-[0.12em] transition ${
                        open
                          ? "text-[color:var(--color-accent)]"
                          : "text-[color:var(--color-foreground-faint)] group-hover:text-[color:var(--color-accent)]"
                      }`}
                    >
                      {String(itemIndex + 1).padStart(2, "0")}
                    </span>
                    {item.question}
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border transition duration-300 ${
                      open
                        ? "rotate-180 border-transparent bg-[image:linear-gradient(100deg,var(--h2-fill-from),var(--h2-fill-to))] text-[color:var(--color-on-accent)]"
                        : "border-[color:var(--color-border-strong)] text-[color:var(--color-accent)]"
                    }`}
                  >
                    {open ? (
                      <MinusIcon className="h-3.5 w-3.5" />
                    ) : (
                      <PlusIcon className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              >
                {/* `invisible` keeps collapsed answers out of the tab order and
                      the a11y tree while leaving them in the DOM for crawlers. */}
                <div
                  className={`overflow-hidden ${open ? "visible" : "invisible"}`}
                >
                  <p className="border-t border-[color:var(--color-border)] py-4 pl-8 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                    {item.answer}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );

  if (inline) {
    return <section aria-labelledby="faq-heading">{body}</section>;
  }

  if (image) {
    return (
      <section aria-labelledby="faq-heading" className="reveal">
        <div className="container-h2 grid gap-8 py-14 md:py-20 lg:grid-cols-12 lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:col-span-5">
            <SidePicture image={image} />
          </div>
          <div className="lg:col-span-7">{body}</div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="faq-heading" className="reveal">
      <div className="container-h2 py-14 md:py-20">{body}</div>
    </section>
  );
}

/** The framed picture both home side-blocks (FAQ, SEO text) put beside their copy. */
export function SidePicture({ image }: { image: SideImage }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border-strong)] shadow-[var(--h2-panel-shadow)]">
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="block h-auto w-full"
      />
    </div>
  );
}
