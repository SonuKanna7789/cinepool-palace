import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ProfileView } from "@/components/ProfileView";

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <ProfileView targetUserId={id} />;
}
