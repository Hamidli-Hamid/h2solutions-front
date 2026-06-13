import { createElement, type ComponentType, type SVGProps } from "react";
import * as Outline from "@heroicons/react/24/outline";
import * as Solid from "@heroicons/react/24/solid";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement> & { title?: string }>;

/**
 * Map Filament-style heroicon names like `heroicon-o-code-bracket-square`
 * or `heroicon-s-light-bulb` to React components.
 * Returns null when the name is unknown — caller decides on fallback.
 */
export function resolveHeroicon(name: string | null | undefined): HeroIcon | null {
  if (!name) return null;
  const match = name.match(/^heroicon-([os])-(.+)$/);
  if (!match) return null;

  const [, variant, kebab] = match;
  const pascal =
    kebab
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("") + "Icon";

  const set = variant === "s" ? Solid : Outline;
  const icon = (set as Record<string, HeroIcon>)[pascal];
  return icon ?? null;
}

type Props = {
  name: string | null | undefined;
  className?: string;
  fallback?: React.ReactNode;
};

export function Icon({ name, className, fallback = null }: Props) {
  const Component = resolveHeroicon(name);
  if (!Component) return <>{fallback}</>;
  return createElement(Component, { className, "aria-hidden": true });
}
