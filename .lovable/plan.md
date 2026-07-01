## Two small fixes

### 1) Blog TOC — only show H2 headings
File: `src/routes/blog.$slug.tsx`

- In `parseHtmlIntoSegments` (line ~79), change the selector from `"h2, h3"` to `"h2"` so only H2s get IDs and are collected. Also drop the `level === "H3" ? 3 : 2` branch — always push `level: 2`.
- In `useMemo` around line ~1111, keep the block filter as-is (already filters `type === "h2"`), so markdown-block-based posts also stay H2-only.
- In the `StickySidebar` render (line ~1023), remove the `h.level === 3 ? "pl-6 pr-3 text-[13px]" : "px-3"` conditional and just use `"px-3"` (no more nested indent styling).
- Scroll-spy (`useScrollSpy`) is unchanged — it already tracks whatever IDs it receives, which will now be H2-only.

No changes to sticky behavior, card styling, or any other visual treatment.

### 2) Admin sidebar — hide the internal scrollbar
File: `src/components/admin/AdminShell.tsx`

The `<nav>` inside `SidebarInner` uses `overflow-y-auto`, which renders the visible scrollbar shown in the screenshot. Add the existing `no-scrollbar` utility (already defined in `src/styles.css`) so scrolling still works but the scrollbar is hidden:

```tsx
<nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-5">
```

No other admin layout changes.
