// ═══════════════════════════════════════════════════════════════════
// CinePool — ChatDrawer.tsx (Phase 4)
// Floating AI chat button + drawer for movie discovery
// ═══════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, X, Send, ThumbsUp, BookmarkPlus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface MiniMovieCardProps {
  title: string;
  year?: string;
}

interface ChatDrawerProps {
  userId: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const GREETING = "Hey! 🎬 What are you in the mood for tonight? I can suggest something based on what you love.";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function extractMovieMentions(text: string): MiniMovieCardProps[] {
  const regex = /\*\*([^*]+?)\s*(?:\((\d{4})\))?\*\*/g;
  const movies: MiniMovieCardProps[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[1].length < 60) {
      movies.push({ title: match[1].trim(), year: match[2] });
    }
  }
  return movies;
}

// ─── MiniMovieCard ────────────────────────────────────────────────────────────

function MiniMovieCard({ title, year, onLike }: MiniMovieCardProps & { userId: string; onLike: (title: string) => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    setLiked(true);
    onLike(title);
  };

  return (
    <div className="flex items-center gap-3 bg-muted/60 border border-border rounded-xl px-3 py-2 mt-2 text-sm">
      <div className="w-8 h-10 rounded bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs">🎬</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{title}</p>
        {year && <p className="text-xs text-muted-foreground">{year}</p>}
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={handleLike}
          title="Love it"
          className={`p-1.5 rounded-full transition-colors ${liked ? "text-green-400 bg-green-400/10" : "text-muted-foreground hover:text-green-400"}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setSaved(true)}
          title="Save for later"
          className={`p-1.5 rounded-full transition-colors ${saved ? "text-yellow-400 bg-yellow-400/10" : "text-muted-foreground hover:text-yellow-400"}`}
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  userId,
  onMovieLike,
}: {
  message: ChatMessage;
  userId: string;
  onMovieLike: (title: string) => void;
}) {
  const isUser = message.role === "user";
  const movieCards = isUser ? [] : extractMovieMentions(message.content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[85%] ${isUser ? "order-2" : "order-1"}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm border border-border"
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-strong:text-foreground">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {movieCards.length > 0 && (
          <div className="mt-1 space-y-1">
            {movieCards.map((movie, i) => (
              <MiniMovieCard
                key={i}
                title={movie.title}
                year={movie.year}
                userId={userId}
                onLike={onMovieLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-muted border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ChatDrawer ──────────────────────────────────────────────────────────

export function ChatDrawer({ userId }: ChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "greeting", role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    setIsOpen(false);
    setStreaming(false);
    setIsTyping(false);
  }, []);

  const handleMovieLike = useCallback((title: string) => {
    console.log(`User liked movie from chat: ${title}`);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = { id: generateId(), role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setStreaming(true);

    abortRef.current = new AbortController();
    const assistantId = generateId();
    let assistantContent = "";

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/movie-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          user_id: userId,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Request failed");
      }

      setIsTyping(false);
      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              assistantContent += parsed.content;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch { /* skip malformed */ }
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      console.error("Chat error:", err);
      setIsTyping(false);
      const errorMsg = (err as Error)?.message ?? "Something went wrong";
      setMessages(prev => [
        ...prev,
        { id: assistantId, role: "assistant", content: `Sorry, I ran into an issue: ${errorMsg}. Try again?` },
      ]);
    } finally {
      setStreaming(false);
      setIsTyping(false);
    }
  }, [input, messages, streaming, userId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Open movie chat"
        >
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">CinePool AI</p>
              <p className="text-xs text-muted-foreground">
                {streaming ? "Thinking..." : "Movie concierge"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                userId={userId}
                onMovieLike={handleMovieLike}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-border bg-card">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What are you in the mood for?"
                disabled={streaming}
                className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || streaming}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Powered by Gemini 2.5 Flash
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatDrawer;
