# Extra Episode Videos for Sample Builder

Add 4 additional Episode Video slots (5 total) to the Sample Builder editor, each with an optional title and its own on/off switch, rendered below the main video in the public Video Podcast module.

## Admin editor (New / Edit Sample)

- The existing "Episode Video File" field stays exactly where it is, unchanged.
- Directly below it, a new block "Additional Episode Videos" with 4 upload cards in a 2-per-row grid (single column on mobile).
- Each card contains:
  - the same drag-and-drop video uploader used today (`sample-video` bucket)
  - an optional "Video title" text input
  - an on/off toggle (enabled/disabled), default off
- Disabled or empty slots are simply not shown on the public page.
- Styling matches the current editor: `#121A2E` cards, `#1E293B` borders, blue accent, lucide icons only.

## Public sample page

Inside the existing Video Podcast module, below the main video player: the enabled extra videos render in a 2-column grid (stacked on mobile), each with its player and its title if one was set. If no extras are enabled, the module looks exactly as it does today.

## Database

One migration on `sample_previews` adding 12 nullable columns:

```text
extra_video_1_url / extra_video_1_title / extra_video_1_enabled
... through ...
extra_video_4_url / extra_video_4_title / extra_video_4_enabled
```

`*_enabled` defaults to false, URLs and titles default to null. Existing rows are unaffected; no RLS change needed (same table, same policies).

## Technical notes

- `src/lib/sample-builder.functions.ts` — add the new fields to the select list, the payload type, and both create/update handlers.
- `src/components/admin/SampleEditorPage.tsx` — hold the 4 slots as one `extraVideos` state array, reuse `MediaDropzone` and `uploadMedia`, add the toggle control, load/save the new columns.
- `src/routes/sample.$slug.tsx` — pass the extras into `VideoModule` and render the enabled ones.
