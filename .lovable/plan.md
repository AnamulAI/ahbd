# Custom Thumbnails for SMM Clips

Add an optional custom thumbnail image to each SMM clip (Instagram, TikTok, LinkedIn) in the Sample Builder, with its own on/off switch, shown as the clip poster on the public sample page.

## Admin editor (New / Edit Sample)

Inside the existing "// SMM Clips (optional)" block, under each clip's video uploader and above its caption field:

- A "Custom thumbnail" image uploader (drag & drop, same style as the existing media uploaders), stored in the `content-images` bucket.
- An on/off toggle next to it, default off.
- A small 9:16 preview of the uploaded thumbnail, with a remove action.

Empty or toggled-off thumbnails change nothing — the clip card behaves exactly as it does today.

## Public sample page

In the Social Repurposing section, each clip card shows the custom thumbnail as the poster image behind the play button when that clip's thumbnail is enabled and uploaded. Pressing play still plays the uploaded clip (or YouTube embed) as before. If disabled or missing, the current behaviour applies (YouTube thumb or plain brand-colour background).

## Database

One migration on `sample_previews` adding 6 nullable columns:

```text
clip_instagram_thumb_url / clip_instagram_thumb_enabled
clip_tiktok_thumb_url    / clip_tiktok_thumb_enabled
clip_linkedin_thumb_url  / clip_linkedin_thumb_enabled
```

`*_enabled` defaults to false, URLs default to null. Existing rows unaffected; no RLS change.

## Technical notes

- `src/lib/sample-builder.functions.ts` — add the fields to the select list, `SamplePayload`, and both create/update handlers. Thumbnails go in `content-images` (private) so they join the signed-URL field list.
- `src/components/admin/SampleEditorPage.tsx` — three thumbnail state pairs, reuse the existing dropzone + toggle patterns.
- `src/routes/sample.$slug.tsx` — pass `thumbUrl` into `SmmClipCard` and render it as the poster layer.
