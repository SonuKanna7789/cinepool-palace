import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getCrew,
  getMessages,
  getParties,
  joinCrew,
  leaveCrew,
  rsvp,
  sendMessage,
  subscribeToMessages,
} from "@/api/crews";
import { PartyCard } from "@/components/PartyCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import { colors, radius, spacing, type } from "@/theme";
import type { Crew, CrewMessage, WatchParty } from "@/types";

type Tab = "parties" | "chat";

export default function CrewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();

  const [crew, setCrew] = useState<Crew | null>(null);
  const [tab, setTab] = useState<Tab>("parties");
  const [parties, setParties] = useState<WatchParty[]>([]);
  const [messages, setMessages] = useState<CrewMessage[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!id || !userId) return;
    try {
      const [c, p] = await Promise.all([getCrew(id, userId), getParties(id, userId)]);
      setCrew(c);
      setParties(p);
      if (c?.is_member) setMessages(await getMessages(id));
    } catch {
      // transient
    }
  }, [id, userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    if (!id || !crew?.is_member) return;
    return subscribeToMessages(id, () => {
      getMessages(id).then(setMessages).catch(() => {});
    });
  }, [id, crew?.is_member]);

  const send = async () => {
    const body = draft.trim();
    if (!body || !id || !userId) return;
    setDraft("");
    try {
      await sendMessage(id, userId, body);
      setMessages(await getMessages(id));
      listRef.current?.scrollToEnd({ animated: true });
    } catch {
      setDraft(body);
    }
  };

  const toggleMembership = async () => {
    if (!id || !userId || !crew) return;
    try {
      if (crew.is_member) await leaveCrew(id, userId);
      else await joinCrew(id, userId);
      load();
    } catch {
      load();
    }
  };

  if (!crew) return <View style={{ flex: 1 }} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: `${crew.emoji} ${crew.name}` }} />

      <View style={styles.header}>
        <Text style={styles.meta}>
          {crew.member_count} member{crew.member_count === 1 ? "" : "s"}
          {crew.city ? ` · ${crew.city}` : ""}
        </Text>
        {crew.description ? <Text style={styles.desc}>{crew.description}</Text> : null}
        <View style={styles.actionsRow}>
          <Button
            title={crew.is_member ? "Leave crew" : "Join crew"}
            variant={crew.is_member ? "secondary" : "primary"}
            size="sm"
            onPress={toggleMembership}
            style={{ flex: 1 }}
          />
          {crew.is_member ? (
            <Button
              title="+ Watch party"
              size="sm"
              onPress={() => router.push({ pathname: "/party/new", params: { crewId: crew.id } })}
              style={{ flex: 1 }}
            />
          ) : null}
        </View>
        <View style={styles.tabRow}>
          {(["parties", "chat"] as Tab[]).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
                {t === "parties" ? "Watch parties" : "Chat"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === "parties" ? (
        <FlatList
          data={parties}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No watch parties planned"
              subtitle="Pick a movie, a cinema and a time — then watch it together and argue about it after."
            />
          }
          renderItem={({ item }) => (
            <PartyCard
              party={item}
              onRsvp={async (status) => {
                if (!userId) return;
                await rsvp(item.id, userId, status).catch(() => {});
                load();
              }}
            />
          )}
        />
      ) : !crew.is_member ? (
        <EmptyState icon="chatbubbles-outline" title="Members only" subtitle="Join the crew to read and join the conversation." />
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <EmptyState icon="chatbubbles-outline" title="Quiet in here" subtitle="Say hi. Recommend something obscure." />
            }
            renderItem={({ item }) => {
              const mine = item.user_id === userId;
              return (
                <View style={[styles.msgRow, mine && { flexDirection: "row-reverse" }]}>
                  {!mine ? <Avatar profile={item.profile} size={28} /> : null}
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    {!mine ? (
                      <Text style={styles.msgName}>{item.profile?.display_name ?? "Cinephile"}</Text>
                    ) : null}
                    <Text style={[styles.msgBody, mine && { color: "#1A1404" }]}>{item.body}</Text>
                  </View>
                </View>
              );
            }}
          />
          <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
            <TextInput
              style={styles.composerInput}
              placeholder="Message the crew…"
              placeholderTextColor={colors.textFaint}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <Pressable onPress={send} style={styles.sendBtn}>
              <Ionicons name="arrow-up" size={20} color="#1A1404" />
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  meta: { ...type.caption },
  desc: { ...type.body, fontSize: 14, color: colors.textMuted },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  tabRow: { flexDirection: "row", gap: spacing.sm },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: colors.gold },
  tabLabel: { fontSize: 13, fontWeight: "700", color: colors.textFaint },
  tabLabelActive: { color: colors.gold },
  list: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
  bubble: { maxWidth: "78%", borderRadius: radius.lg, padding: spacing.md, gap: 2 },
  bubbleTheirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSolid },
  bubbleMine: { backgroundColor: colors.gold, marginLeft: "auto" },
  msgName: { fontSize: 11, fontWeight: "800", color: colors.gold },
  msgBody: { fontSize: 14, color: colors.text, lineHeight: 19 },
  composer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSolid,
    backgroundColor: colors.bg,
  },
  composerInput: {
    flex: 1,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSolid,
    paddingHorizontal: spacing.lg,
    color: colors.text,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
});
