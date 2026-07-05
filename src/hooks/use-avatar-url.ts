import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve a user_profiles.avatar_url value to a displayable URL.
 *
 * Accepts either:
 *   - a full http(s) URL (returned as-is)
 *   - a storage object path in the `profile-avatars` bucket (signed for 7 days)
 *   - null / empty (returns null)
 *
 * Used by every avatar consumer (Profile page, sidebar, homepage) so they
 * all read from the same source of truth (user_profiles.avatar_url) and see
 * the same image immediately after an upload.
 */
export function useAvatarUrl(avatarPath: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!avatarPath) {
      setUrl(null);
      return;
    }
    if (/^https?:\/\//i.test(avatarPath)) {
      setUrl(avatarPath);
      return;
    }
    (async () => {
      const { data, error } = await supabase.storage
        .from("profile-avatars")
        .createSignedUrl(avatarPath, 60 * 60 * 24 * 7);
      if (cancelled) return;
      if (error || !data?.signedUrl) {
        setUrl(null);
        return;
      }
      setUrl(data.signedUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [avatarPath]);

  return url;
}
