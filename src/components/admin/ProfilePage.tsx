import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Save,
  Upload,
  User as UserIcon,
  ShieldCheck,
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyProfile } from "@/hooks/use-my-permissions";
import {
  SECTION_KEYS,
  SECTION_LABELS,
  getMyProfile,
  updateMyProfile,
  type SectionKey,
} from "@/lib/profile.functions";
import {
  inviteTeamMember,
  listTeamMembers,
  removeTeamMember,
  updateMemberPermissions,
  type TeamMember,
} from "@/lib/team.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type RolePreset = "Owner" | "Admin" | "Editor" | "Custom";

const PRESET_DEFAULTS: Record<RolePreset, Partial<Record<SectionKey, boolean>>> = {
  Owner: SECTION_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {}),
  Admin: SECTION_KEYS.reduce(
    (acc, k) => ({ ...acc, [k]: !["integrations", "profile"].includes(k) }),
    {},
  ),
  Editor: { blog_posts: true, dashboard: true, profile: true },
  Custom: {},
};

function sectionsFromPreset(preset: RolePreset): Record<SectionKey, boolean> {
  const base = PRESET_DEFAULTS[preset];
  return SECTION_KEYS.reduce(
    (acc, k) => {
      acc[k] = Boolean(base[k]);
      return acc;
    },
    {} as Record<SectionKey, boolean>,
  );
}

export function ProfilePage() {
  const gate = useAdminGate();
  const { data: profile, isLoading } = useMyProfile();

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <AdminShell email={gate.email}>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">Profile</h1>
        <p className="mt-1 text-sm text-white/55">Manage your account and team access.</p>
      </header>

      {isLoading || !profile ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : (
        <div className="grid gap-6">
          <YourProfileCard />
          <RolePermissionsCard />
          {profile.is_primary_owner && <TeamMembersSection />}
        </div>
      )}
    </AdminShell>
  );
}

/* -------------------------- Card 1: Your Profile -------------------------- */

function YourProfileCard() {
  const qc = useQueryClient();
  const { data: profile } = useMyProfile();
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () =>
      saveProfile({
        data: {
          full_name: fullName || null,
          phone: phone || null,
          avatar_url: avatarUrl,
        },
      }),
    onSuccess: async () => {
      toast.success("Profile saved");
      await fetchProfile();
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  async function handleUpload(file: File) {
    if (!profile) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("profile-avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("profile-avatars").getPublicUrl(path);
      setAvatarUrl(pub.publicUrl);
      toast.success("Avatar uploaded — remember to Save.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-xl border border-[#1E293B] bg-[#121A2E] p-6">
      <div className="flex items-center gap-2 mb-5">
        <UserIcon className="h-5 w-5 text-[#3B82F6]" />
        <h2 className="font-display text-lg font-semibold text-white">Your Profile</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/20 bg-[#0A0E1A] hover:border-[#3B82F6]/50 transition-colors"
            disabled={uploading}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-white/40">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6" />
                    <span className="text-[10px]">Upload</span>
                  </>
                )}
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
        </div>

        <div className="grid gap-4">
          <div>
            <Label className="text-white/80 mb-1.5 block text-xs">Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-[#0A0E1A] border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-white/80 mb-1.5 block text-xs">Email</Label>
            <Input
              value={profile?.email ?? ""}
              disabled
              className="bg-[#0A0E1A] border-white/10 text-white/50"
            />
          </div>
          <div>
            <Label className="text-white/80 mb-1.5 block text-xs">Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#0A0E1A] border-white/10 text-white"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || uploading}
              className="bg-gradient-to-r from-[#3B82F6] to-[#F97316] text-white hover:opacity-90"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Card 2: Role & Permissions ------------------------ */

function RolePermissionsCard() {
  const { data: profile } = useMyProfile();
  if (!profile) return null;

  return (
    <section className="rounded-xl border border-[#1E293B] bg-[#121A2E] p-6">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="h-5 w-5 text-[#F97316]" />
        <h2 className="font-display text-lg font-semibold text-white">Role & Permissions</h2>
      </div>
      <p className="text-xs text-white/50 mb-4">
        Role:{" "}
        <span className="font-mono text-white/90">{profile.role_label}</span>
        {profile.is_primary_owner && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#3B82F6] border border-[#3B82F6]/30">
            <Lock className="h-3 w-3" /> Primary Owner
          </span>
        )}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {SECTION_KEYS.map((key) => {
          const on = profile.sections[key];
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                on
                  ? "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-white"
                  : "border-white/10 bg-[#0A0E1A] text-white/50",
              )}
            >
              <Checkbox checked={on} disabled className="data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6]" />
              <span>{SECTION_LABELS[key]}</span>
              {profile.is_primary_owner && <Lock className="ml-auto h-3 w-3 text-white/40" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------- Team Members --------------------------------- */

function TeamMembersSection() {
  const qc = useQueryClient();
  const fetchTeam = useServerFn(listTeamMembers);
  const { data: members, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => fetchTeam(),
  });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const removeFn = useServerFn(removeTeamMember);
  const removeMut = useMutation({
    mutationFn: (id: string) => removeFn({ data: { user_id: id } }),
    onSuccess: () => {
      toast.success("Team member removed");
      qc.invalidateQueries({ queryKey: ["team-members"] });
      setRemoving(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Remove failed"),
  });

  return (
    <section className="rounded-xl border border-[#1E293B] bg-[#121A2E] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#3B82F6]" />
          <h2 className="font-display text-lg font-semibold text-white">Team Members</h2>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          className="bg-gradient-to-r from-[#3B82F6] to-[#F97316] text-white hover:opacity-90"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Invite Team Member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-white/40" />
        </div>
      ) : !members || members.length === 0 ? (
        <div className="rounded-md border border-white/10 bg-[#0A0E1A] p-6 text-center text-sm text-white/50">
          No team members yet. Invite someone to give them access.
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.06] rounded-md border border-white/10 bg-[#0A0E1A]">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#F97316] flex items-center justify-center text-sm font-bold text-white">
                {(m.full_name || m.email || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{m.full_name || m.email}</div>
                <div className="text-xs text-white/45 truncate">
                  {m.email} · <span className="font-mono">{m.role_label}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(m)}
                className="text-white/70 hover:text-white hover:bg-white/[0.05]"
              >
                <Pencil className="h-4 w-4 mr-1" /> Manage
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRemoving(m)}
                className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {inviteOpen && (
        <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
      )}
      {editing && (
        <EditMemberDialog member={editing} onClose={() => setEditing(null)} />
      )}

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent className="bg-[#121A2E] border-[#1E293B] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This permanently deletes {removing?.email}'s access to the admin panel. They will need a new invite to return.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => removing && removeMut.mutate(removing.id)}
            >
              {removeMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function PermissionChecklist({
  value,
  onChange,
}: {
  value: Record<SectionKey, boolean>;
  onChange: (v: Record<SectionKey, boolean>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SECTION_KEYS.map((k) => (
        <label
          key={k}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer",
            value[k]
              ? "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-white"
              : "border-white/10 bg-[#0A0E1A] text-white/70 hover:bg-white/[0.03]",
          )}
        >
          <Checkbox
            checked={value[k]}
            onCheckedChange={(c) => onChange({ ...value, [k]: c === true })}
            className="data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6]"
          />
          {SECTION_LABELS[k]}
        </label>
      ))}
    </div>
  );
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const invite = useServerFn(inviteTeamMember);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [preset, setPreset] = useState<RolePreset>("Editor");
  const [sections, setSections] = useState<Record<SectionKey, boolean>>(sectionsFromPreset("Editor"));

  function applyPreset(p: RolePreset) {
    setPreset(p);
    setSections(sectionsFromPreset(p));
  }

  const mut = useMutation({
    mutationFn: () =>
      invite({
        data: { email, full_name: fullName || undefined, role_label: preset, sections },
      }),
    onSuccess: () => {
      toast.success("Invite sent");
      qc.invalidateQueries({ queryKey: ["team-members"] });
      onClose();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Invite failed"),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#121A2E] border-[#1E293B] text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-white/70 mb-1.5 block">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              type="email"
              className="bg-[#0A0E1A] border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-white/70 mb-1.5 block">Full Name (optional)</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-[#0A0E1A] border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-white/70 mb-1.5 block">Role Preset</Label>
            <Select value={preset} onValueChange={(v) => applyPreset(v as RolePreset)}>
              <SelectTrigger className="bg-[#0A0E1A] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#121A2E] border-white/10 text-white">
                <SelectItem value="Owner">Owner (all sections)</SelectItem>
                <SelectItem value="Admin">Admin (all except Integrations)</SelectItem>
                <SelectItem value="Editor">Editor (Blog only)</SelectItem>
                <SelectItem value="Custom">Custom (nothing preselected)</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-white/45">
              The preset just fills in defaults — you can toggle any section below.
            </p>
          </div>
          <div>
            <Label className="text-xs text-white/70 mb-1.5 block">Section Access</Label>
            <PermissionChecklist value={sections} onChange={setSections} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70">
            Cancel
          </Button>
          <Button
            onClick={() => mut.mutate()}
            disabled={mut.isPending || !email}
            className="bg-gradient-to-r from-[#3B82F6] to-[#F97316] text-white hover:opacity-90"
          >
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditMemberDialog({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const qc = useQueryClient();
  const update = useServerFn(updateMemberPermissions);
  const [sections, setSections] = useState<Record<SectionKey, boolean>>(member.sections);
  const [roleLabel, setRoleLabel] = useState<RolePreset>(
    (["Owner", "Admin", "Editor", "Custom"] as RolePreset[]).includes(member.role_label as RolePreset)
      ? (member.role_label as RolePreset)
      : "Custom",
  );

  const mut = useMutation({
    mutationFn: () =>
      update({ data: { user_id: member.id, role_label: roleLabel, sections } }),
    onSuccess: () => {
      toast.success("Permissions updated");
      qc.invalidateQueries({ queryKey: ["team-members"] });
      onClose();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#121A2E] border-[#1E293B] text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Permissions — {member.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-white/70 mb-1.5 block">Role Label</Label>
            <Select value={roleLabel} onValueChange={(v) => setRoleLabel(v as RolePreset)}>
              <SelectTrigger className="bg-[#0A0E1A] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#121A2E] border-white/10 text-white">
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-white/70 mb-1.5 block">Section Access</Label>
            <PermissionChecklist value={sections} onChange={setSections} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70">
            Cancel
          </Button>
          <Button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="bg-gradient-to-r from-[#3B82F6] to-[#F97316] text-white hover:opacity-90"
          >
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
