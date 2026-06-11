import React from "react";
import { ProfileView } from "@/components/ProfileView";
import { useAuth } from "@/providers/AuthProvider";

export default function MyProfileScreen() {
  const { userId } = useAuth();
  if (!userId) return null;
  return <ProfileView targetUserId={userId} />;
}
