## Fix: Blog Sidebar — Remove Fixed Height, Expand Naturally

**Root cause:** The outer `<aside>` in `src/routes/blog.$slug.tsx` (line 1002) still constrains the sidebar with `lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto`. This caps the sidebar height to the viewport and turns it into an internal scroll container — the exact pattern the older post layout (screenshot 2) does NOT use.

**Change (one line):**

`src/routes/blog.$slug.tsx` line 1002 — strip all height/overflow constraints from the aside; keep only sticky positioning so the column pins to the top and any overflow simply extends down the page naturally as content scrolls past (matching screenshot 2 behavior).

From:
```tsx
<aside className="no-scrollbar hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
```

To:
```tsx
<aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
```

Removed: `no-scrollbar`, `lg:max-h-[calc(100vh-2rem)]`, `lg:overflow-y-auto`.

**Result:** TOC + Recommended cards render at their full natural height. On tall sidebars, the whole column simply scrolls with the page once its bottom passes the viewport — same behavior as screenshot 2. No internal scrollbar, no clipping.
