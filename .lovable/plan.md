## Goal
Change the "Live Demo" link text color from blue (`var(--primary)`) to orange (`#F97316` / `var(--orange)`) on the project gallery cards.

## Scope
- `src/components/site/ProjectCard.tsx` only.
- Affect the `<a>` tag that renders "Live Demo" (lines 101–118).
- Change the active-link class from `text-[color:var(--primary)]` to `text-[color:var(--orange)]`.
- Keep the placeholder state (`#` or empty URL) styling unchanged (`text-muted-foreground opacity-60`).

## What will NOT change
- Card layout, borders, hover states, shadows
- "View Project →" link styling
- Any other page or component