import { jsonLdScript } from "@/lib/jsonld";

type Props = {
  data: unknown | unknown[];
  id?: string;
};

export function JsonLd({ data, id }: Props) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;

  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: jsonLdScript(payload) }}
    />
  );
}
