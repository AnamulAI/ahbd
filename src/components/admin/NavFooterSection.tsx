import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowDown,
  ArrowUp,
  Link2,
  Menu,
  Plus,
  Share2,
  Trash2,
  Type,
} from "lucide-react";
import { toast } from "sonner";

import {
  getSiteContent,
  listAllNavLinks,
  upsertNavLink,
  deleteNavLink,
  updateSiteContentText,
  type NavLinkRow,
  type NavPlacement,
  type SiteContentText,
} from "@/lib/site-content.functions";
import { SOCIAL_ICON_OPTIONS, SocialIcon } from "@/lib/social-icons";

const textInputCls =
  "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors duration-[250ms] ease hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20";
const cardCls = "space-y-4 card-elevated p-5";
const eyebrowCls = "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#3B82F6]";

function IconBadge({ icon: Icon }: { icon: typeof Link2 }) {
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#3B82F6]/15 text-[#3B82F6] ring-1 ring-[#3B82F6]/30">
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

// Uncontrolled text input that saves on blur (Enter blurs), matching the
// TextField pattern already established in Builder Settings.
function EditableText({
  value,
  onSave,
  placeholder,
  multiline,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);

  const commit = () => {
    if (v !== value) onSave(v);
  };

  if (multiline) {
    return (
      <textarea
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={commit}
        rows={2}
        placeholder={placeholder}
        className={`${textInputCls} resize-y`}
      />
    );
  }
  return (
    <input
      type="text"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      placeholder={placeholder}
      className={textInputCls}
    />
  );
}

function EmptyRowsHint({ label }: { label: string }) {
  return <div className="text-xs text-white/35">No {label} yet.</div>;
}

function NavLinkGroupEditor({
  title,
  icon,
  placement,
  rows,
  onAdd,
  onSave,
  onDelete,
  onReorder,
}: {
  title: string;
  icon: typeof Link2;
  placement: NavPlacement;
  rows: NavLinkRow[];
  onAdd: () => void;
  onSave: (row: NavLinkRow) => void;
  onDelete: (id: string) => void;
  onReorder: (a: NavLinkRow, b: NavLinkRow) => void;
}) {
  const sorted = [...rows].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className={cardCls}>
      <div className="flex items-center justify-between gap-3">
        <div className={eyebrowCls}>
          <IconBadge icon={icon} />
          {title}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/85 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Add Link
        </button>
      </div>

      <div className="space-y-2">
        {sorted.length === 0 && <EmptyRowsHint label="links" />}
        {sorted.map((row, i) => {
          const hrefLocked = row.link_key === "services";
          return (
            <div
              key={row.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-white/[0.06] bg-[#0B0F1A] p-3"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => onReorder(row, sorted[i - 1])}
                  className="text-white/40 hover:text-white disabled:opacity-20"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={i === sorted.length - 1}
                  onClick={() => onReorder(row, sorted[i + 1])}
                  className="text-white/40 hover:text-white disabled:opacity-20"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>

              <div className="min-w-[140px] flex-1">
                <EditableText
                  value={row.label}
                  onSave={(label) => onSave({ ...row, label })}
                  placeholder="Label"
                />
              </div>
              <div className="min-w-[180px] flex-1">
                {hrefLocked ? (
                  <div>
                    <input
                      type="text"
                      value={row.href}
                      disabled
                      className={`${textInputCls} cursor-not-allowed opacity-50`}
                    />
                    <p className="mt-1 text-[11px] text-white/40">
                      Link target is controlled by Page Assignment → Services Page.
                    </p>
                  </div>
                ) : (
                  <EditableText
                    value={row.href}
                    onSave={(href) => onSave({ ...row, href })}
                    placeholder="/path or https://…"
                  />
                )}
              </div>

              {placement === "footer_social" && (
                <div className="flex items-center gap-1">
                  {SOCIAL_ICON_OPTIONS.map((opt) => {
                    const active = row.icon_name === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => onSave({ ...row, icon_name: opt.name })}
                        aria-label={opt.name}
                        aria-pressed={active}
                        title={opt.name}
                        className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                          active
                            ? "border-[#3B82F6]/50 bg-[#3B82F6]/[0.15] text-white"
                            : "border-white/[0.1] bg-[#16181D] text-white/50 hover:text-white/80"
                        }`}
                      >
                        <SocialIcon name={opt.name} className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
              )}

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.is_active}
                  onClick={() => onSave({ ...row, is_active: !row.is_active })}
                  className={`relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E1A] ${
                    row.is_active ? "bg-[#3B82F6]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                      row.is_active ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
                <span className="text-xs text-white/65">Active</span>
              </label>

              <button
                type="button"
                disabled={row.link_key != null}
                onClick={() => onDelete(row.id)}
                title={
                  row.link_key != null
                    ? "This link is required for site navigation and can't be deleted here."
                    : undefined
                }
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-white/40"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PLACEMENT_GROUPS: { key: NavPlacement; title: string; icon: typeof Link2 }[] = [
  { key: "header_nav", title: "Header Navigation", icon: Menu },
  { key: "footer_explore", title: "Footer — Explore Column", icon: Link2 },
  { key: "footer_services", title: "Footer — Services Column", icon: Link2 },
  { key: "footer_legal", title: "Footer — Legal Column", icon: Link2 },
  { key: "footer_social", title: "Footer — Social Links", icon: Share2 },
];

export function NavFooterSection() {
  const qc = useQueryClient();
  const fetchText = useServerFn(getSiteContent);
  const fetchLinks = useServerFn(listAllNavLinks);
  const saveLinkFn = useServerFn(upsertNavLink);
  const deleteLinkFn = useServerFn(deleteNavLink);
  const saveTextFn = useServerFn(updateSiteContentText);

  const textQuery = useQuery({
    queryKey: ["site-content-text"],
    queryFn: () => fetchText(),
  });
  const linksQuery = useQuery({
    queryKey: ["site-nav-links-admin"],
    queryFn: () => fetchLinks(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["site-nav-links-admin"] });
    qc.invalidateQueries({ queryKey: ["site-content"] });
  };

  const saveLink = useMutation({
    mutationFn: (row: NavLinkRow) =>
      saveLinkFn({
        data: {
          id: row.id,
          placement: row.placement,
          label: row.label,
          href: row.href,
          icon_name: row.icon_name,
          link_key: row.link_key,
          display_order: row.display_order,
          is_active: row.is_active,
        },
      }),
    onSuccess: () => {
      toast.success("Saved", { duration: 1200 });
      invalidate();
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const addLink = useMutation({
    mutationFn: (placement: NavPlacement) => {
      const existing = (linksQuery.data ?? []).filter((r) => r.placement === placement);
      return saveLinkFn({
        data: {
          placement,
          label: "New Link",
          href: "/",
          icon_name: null,
          link_key: null,
          display_order: existing.length + 1,
          is_active: true,
        },
      });
    },
    onSuccess: () => {
      toast.success("Added", { duration: 1200 });
      invalidate();
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Add failed"),
  });

  const removeLink = useMutation({
    mutationFn: (id: string) => deleteLinkFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted", { duration: 1200 });
      invalidate();
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const reorder = useMutation({
    mutationFn: ({ a, b }: { a: NavLinkRow; b: NavLinkRow }) =>
      Promise.all([
        saveLinkFn({
          data: {
            id: a.id,
            placement: a.placement,
            label: a.label,
            href: a.href,
            icon_name: a.icon_name,
            link_key: a.link_key,
            display_order: b.display_order,
            is_active: a.is_active,
          },
        }),
        saveLinkFn({
          data: {
            id: b.id,
            placement: b.placement,
            label: b.label,
            href: b.href,
            icon_name: b.icon_name,
            link_key: b.link_key,
            display_order: a.display_order,
            is_active: b.is_active,
          },
        }),
      ]),
    onSuccess: invalidate,
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Reorder failed"),
  });

  const saveText = useMutation({
    mutationFn: (next: SiteContentText) => saveTextFn({ data: next }),
    onSuccess: () => {
      toast.success("Saved", { duration: 1200 });
      qc.invalidateQueries({ queryKey: ["site-content-text"] });
      qc.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const text = textQuery.data?.text;
  const links = linksQuery.data ?? [];

  function updateTextField(key: keyof SiteContentText, value: string) {
    if (!text) return;
    saveText.mutate({ ...text, [key]: value });
  }

  return (
    <div className="mt-8 space-y-6">
      <div>
        <div className={eyebrowCls}>
          <IconBadge icon={Type} />
          Header &amp; Footer Text
        </div>
        <p className="mt-1 text-xs text-white/55">
          Shown across every page. Leave a field empty to hide that piece (e.g. no address/contact
          block until you fill one in).
        </p>
      </div>

      {text && (
        <div className={cardCls}>
          <div>
            <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-white/60">
              Header Tagline (optional)
            </label>
            <EditableText
              value={text.header_tagline_text}
              onSave={(v) => updateTextField("header_tagline_text", v)}
              placeholder="Shown next to the logo on wide screens"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-white/60">
              Footer Tagline / Description
            </label>
            <EditableText
              value={text.footer_tagline_text}
              onSave={(v) => updateTextField("footer_tagline_text", v)}
              multiline
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-white/60">
              Copyright Text
            </label>
            <EditableText
              value={text.footer_copyright_text}
              onSave={(v) => updateTextField("footer_copyright_text", v)}
              placeholder="Use {year} to auto-insert the current year"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-white/60">
                Address (optional)
              </label>
              <EditableText
                value={text.footer_address_text}
                onSave={(v) => updateTextField("footer_address_text", v)}
                placeholder="Empty = hidden"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-white/60">
                Contact Email (optional)
              </label>
              <EditableText
                value={text.footer_contact_email}
                onSave={(v) => updateTextField("footer_contact_email", v)}
                placeholder="Empty = hidden"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-white/60">
                Contact Phone (optional)
              </label>
              <EditableText
                value={text.footer_contact_phone}
                onSave={(v) => updateTextField("footer_contact_phone", v)}
                placeholder="Empty = hidden"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <div className={eyebrowCls}>
          <IconBadge icon={Menu} />
          Navigation &amp; Footer Links
        </div>
        <p className="mt-1 text-xs text-white/55">
          Reorder, rename, add, or disable links shown in the header and footer.
        </p>
      </div>

      {PLACEMENT_GROUPS.map((group) => (
        <NavLinkGroupEditor
          key={group.key}
          title={group.title}
          icon={group.icon}
          placement={group.key}
          rows={links.filter((l) => l.placement === group.key)}
          onAdd={() => addLink.mutate(group.key)}
          onSave={(row) => saveLink.mutate(row)}
          onDelete={(id) => removeLink.mutate(id)}
          onReorder={(a, b) => reorder.mutate({ a, b })}
        />
      ))}
    </div>
  );
}
