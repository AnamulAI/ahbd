Apply the Pricing Reveal Card's dual-color glow + gradient border treatment to the circular profile photo in the About section on the Home page.

### What to change
- File: `src/routes/index.tsx` — About (condensed) section, profile photo container (around line 553).

### Current state
The profile photo has two separate radial gradient blobs (blue + orange) behind it, but no unified border/ring treatment matching the Pricing Reveal Card.

### New treatment
Replace the current dual-blob glow with a circular adaptation of the Pricing Reveal Card's exact style:
1. **Outer glow** — `bg-gradient-to-r from-[#3B82F6] via-[#3B82F6]/40 to-[#F97316] opacity-60 blur-2xl` on a full circle behind the photo.
2. **Gradient border/ring** — `bg-gradient-to-r from-[#3B82F6] to-[#F97316] opacity-80` on a slightly larger circle, creating a visible blue→orange ring around the photo.
3. **Inner backing** — a dark circular pad (`bg-[oklch(0.15_0.02_260)]`) between the ring and the photo so the gradient ring pops against the section background.
4. Keep the photo itself circular and unchanged.

### Technical approach
- Use a `relative` wrapper around the image.
- Layer three absolute `rounded-full` divs behind the image for glow, border, and backing.
- Match the sizing/spacing proportions to the Pricing Reveal Card (glow `-inset-4`, ring `-inset-1` or similar, inner pad flush with image edge or slightly inset).
- Ensure no rectangular card container is re-introduced — only the circular ring/glow around the photo.

### Out of scope
- No changes to photo size, position, or alt text.
- No changes to text/layout in the About section.
- No changes to the Pricing Reveal Card itself.