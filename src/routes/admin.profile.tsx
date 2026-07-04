import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/admin/ProfilePage";

export const Route = createFileRoute("/admin/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Profile — AnamDev Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProfilePage,
});
