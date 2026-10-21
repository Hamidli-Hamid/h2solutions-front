import { brandAsset, LOGO_LOCKUP } from "@/lib/brand";

type Props = {
  className?: string;
  /** Logo uploaded in the admin; without one the brand-pack lockup is drawn. */
  logo?: string | null;
  /** Accessible name for the logo — normally the brand name. */
  alt?: string;
};

export function H2Logo({ className, logo, alt }: Props) {
  if (logo) {
    /* An uploaded logo replaces the whole lockup, mark and wordmark alike.
       Height is fixed to the header rhythm; the width follows the artwork. */
    return (
      /* eslint-disable-next-line @next/next/no-img-element --
         arbitrary admin artwork of unknown intrinsic size, which next/image
         requires; it is a small header asset, so optimisation buys little. */
      <img
        src={logo}
        alt={alt ?? ""}
        className={`h-9 w-auto max-w-[12rem] object-contain ${className ?? ""}`}
      />
    );
  }

  /* Two faces of the same lockup — navy ink for light surfaces, white for
     dark ones. Which one shows is decided by the nearest theme block (see
     `.h2-logo-on-*` in globals.css), so the always-dark footer gets the white
     face even on the light theme. The hidden one is `display: none`, which
     also takes it out of the accessibility tree. Plain <img>: a vector needs
     no optimiser. */
  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brandAsset("/brand/h2-solutions-logo-light.svg")}
        alt={alt ?? ""}
        {...LOGO_LOCKUP}
        className="h2-logo-on-light h-9 w-auto sm:h-10"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brandAsset("/brand/h2-solutions-logo-dark.svg")}
        alt={alt ?? ""}
        {...LOGO_LOCKUP}
        className="h2-logo-on-dark h-9 w-auto sm:h-10"
      />
    </span>
  );
}
