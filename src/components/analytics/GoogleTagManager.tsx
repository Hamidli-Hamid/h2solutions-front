import Script from "next/script";

/**
 * Google Tag Manager, in the two halves the container needs: the loader that
 * belongs in the document head, and the `<noscript>` frame that has to be the
 * first thing inside `<body>`.
 *
 * The ID comes from `NEXT_PUBLIC_GTM_ID`, which is set in `.env.production`
 * only — a dev build leaves it unset and both halves render nothing, so local
 * work never reports into the live container.
 *
 * `afterInteractive` is the strategy Next prescribes for tag managers (and the
 * one its own `@next/third-parties` component uses): the container still loads
 * early, but it is kept off the critical path, where a synchronous GTM is a
 * well-known INP offender.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <Script id="gtm-loader" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}

/** The fallback frame, for visitors whose browser runs no JavaScript. */
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
