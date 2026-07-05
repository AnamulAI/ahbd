/**
 * The `profile-avatars` bucket is public, so `user_profiles.avatar_url` is
 * stored as a full public URL. This hook is a passthrough kept for backwards
 * compatibility with existing call sites — prefer using `avatar_url` directly.
 */
export function useAvatarUrl(avatarUrl: string | null | undefined): string | null {
  return avatarUrl ?? null;
}
