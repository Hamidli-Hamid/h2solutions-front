/**
 * Pulls React's canary typings into the project, which is where the
 * `<ViewTransition>` component is declared. Next's App Router ships that
 * React build, so the component exists at runtime; the stable
 * `@types/react` entry simply does not describe it yet. One reference
 * anywhere in the project is enough (see `@types/react/canary.d.ts`).
 */
/// <reference types="react/canary" />
