import { notFound } from "next/navigation";

import { Hero } from "@/components/sections/Hero";
import { UspGrid } from "@/components/sections/UspGrid";
import { ServicesPreview } from "@/components/sections/ServicesPreview";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/lib/dictionaries";
import { fetchServices } from "@/lib/api";
import { isLocale } from "@/i18n-config";
import { itemListJsonLd } from "@/lib/jsonld";
import { siteConfig } from "@/lib/site-config";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, services] = await Promise.all([
    getDictionary(lang),
    fetchServices(lang),
  ]);

  const serviceList = itemListJsonLd(
    dict.services.title,
    services.map((s) => ({
      name: s.title,
      url: `${siteConfig.url}/${lang}/services/${s.slug}`,
    })),
  );

  return (
    <>
      <Hero lang={lang} dict={dict} />
      <UspGrid dict={dict} />
      <ServicesPreview lang={lang} dict={dict} services={services} />
      <CtaBanner lang={lang} dict={dict} />
      {services.length > 0 && <JsonLd id="ld-home-services" data={serviceList} />}
    </>
  );
}
