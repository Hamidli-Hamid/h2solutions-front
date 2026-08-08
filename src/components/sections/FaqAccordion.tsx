"use client";

import { useId, useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export function FaqAccordion({ dict }: Props) {
  const t = dict.home.faq;
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section aria-labelledby="faq-heading" className="reveal">
      <div className="container-h2 py-12 md:py-14">
        <p className="section-label">{t.label}</p>
        <h2 id="faq-heading" className="mt-3 text-2xl font-bold md:text-[1.75rem]">
          {t.title}
        </h2>

        <ul className="mt-9 grid gap-4 md:grid-cols-2">
          {t.items.map((item, index) => {
            const open = openIndex === index;
            const buttonId = `${baseId}-faq-${index}`;
            const panelId = `${baseId}-faq-panel-${index}`;

            return (
              <li key={item.question} className="panel h-fit px-5">
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-[0.9375rem] font-medium text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-accent)]"
                  >
                    {item.question}
                    <span
                      aria-hidden
                      className="flex h-6 w-6 flex-none items-center justify-center rounded-md border border-[color:var(--color-border-strong)] text-[color:var(--color-accent)]"
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
                    <p className="border-t border-[color:var(--color-border)] py-4 text-[0.8125rem] leading-relaxed text-[color:var(--color-foreground-soft)]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
