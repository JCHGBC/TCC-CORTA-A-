import type { Metadata } from "next";
import { ProfileView } from "@/features/profile/profile-view";

export const metadata: Metadata = { title: "Meu perfil" };

export default function Page() {
  return <ProfileView />;
}
