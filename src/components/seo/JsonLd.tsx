import { jsonLdScript } from "@/lib/jsonld";

type Props = {
  data: unknown | unknown[];
  id?: string;
};

/**
 * Several nodes share one `@context` when they are wrapped in a `@graph`, so
 * the per-node copies each builder emits (they are also used standalone) are
 * dropped on the way in — repeating it inside every node is valid JSON-LD but
 * pure weight in the served HTML.
 */
function withoutContext(node: unknown): unknown {
  if (typeof node !== "object" || node === null || Array.isArray(node)) return node;
  return Object.fromEntries(
    Object.entries(node as Record<string, unknown>).filter(
      ([key]) => key !== "@context",
    ),
  );
}

export function JsonLd({ data, id }: Props) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data.map(withoutContext) }
    : data;

  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: jsonLdScript(payload) }}
    />
  );
}
