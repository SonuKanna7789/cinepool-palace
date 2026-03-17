<<<<<<< HEAD
// ═══════════════════════════════════════════════════════════════════
// CinePool — movie-chat Edge Function (Phase 4 Final)
// POST /functions/v1/movie-chat
// Streaming SSE · Queries user_reviews (not user_reviews_cache)
// ═══════════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role:    "user" | "assistant";
  content: string;
}

interface RequestBody {
  user_id:  string;
  messages: ChatMessage[];
}

async function buildSystemPrompt(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string> {
  const [prefsRes, historyRes, reviewsRes, feedbackRes] = await Promise.all([
    supabase.from("user_preferences").select("favorite_genres, favorite_platforms, preferred_languages").eq("user_id", userId).single(),
    supabase.from("user_watch_history").select("movie_title, rating").eq("user_id", userId).order("watched_at", { ascending: false }).limit(20),
    // FIX: query user_reviews (not user_reviews_cache) — matches what the app writes
    supabase.from("user_reviews").select("movie_title, review_text, rating, platform_watched").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    supabase.from("suggestion_feedback").select("movie_id, action").eq("user_id", userId).limit(50),
  ]);

  const prefs    = prefsRes.data;
  const history  = historyRes.data  ?? [];
  const reviews  = reviewsRes.data  ?? [];
  const feedback = feedbackRes.data ?? [];

  const watchHistory   = history.map(h => `${h.movie_title}${h.rating ? ` (${h.rating}/5)` : ""}`).join(", ") || "None yet";
  const reviewedMovies = reviews.map(r => `${r.movie_title || "Unknown"} (${r.rating}/5)${r.review_text ? `: "${r.review_text.slice(0, 60)}"` : ""}`).join("; ") || "None yet";
  const likedMovies    = feedback.filter(f => f.action === "like"   ).map(f => f.movie_id).join(", ") || "None yet";
  const dislikedMovies = feedback.filter(f => f.action === "dislike").map(f => f.movie_id).join(", ") || "None yet";
  const genres         = prefs?.favorite_genres?.join(", ")     || "Not specified";
  const platforms      = prefs?.favorite_platforms?.join(", ")  || "Not specified";
  const languages      = prefs?.preferred_languages?.join(", ") || "Not specified";

  return `You are CinePool's movie concierge. You help users discover movies through natural conversation.

User Context:
- Watched: ${watchHistory}
- Reviewed: ${reviewedMovies}
- Liked suggestions: ${likedMovies}
- Disliked suggestions: ${dislikedMovies}
- Favorite genres: ${genres}
- Platforms: ${platforms}
- Preferred languages: ${languages}

Guidelines:
- Ask clarifying questions about mood, occasion, who they're watching with
- Suggest 1-3 movies per response with brief, enthusiastic descriptions
- Reference their past watches when relevant: 'Since you loved X, you'll enjoy...'
- Include platform availability when suggesting movies
- Use emoji sparingly 🎬
- If they reject a suggestion, ask why and adjust
- Keep responses concise (under 150 words)
- Format movie suggestions as **Movie Title (Year)** — reason`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { user_id: userId, messages } = body;
  if (!userId)                            return jsonResponse({ error: "user_id is required" }, 400);
  if (!messages || messages.length === 0) return jsonResponse({ error: "messages are required" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const systemPrompt = await buildSystemPrompt(supabase, userId);

  const aiApiKey = Deno.env.get("LOVABLE_API_KEY") ?? "";

  let aiResponse: Response;
  try {
    aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model:    "google/gemini-2.5-flash",
        stream:   true,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });
  } catch (err) {
    console.error("AI Gateway fetch failed:", err);
    return jsonResponse({ error: "Failed to reach AI service" }, 503);
  }

  if (aiResponse.status === 429) return jsonResponse({ error: "Rate limit exceeded" }, 429);
  if (aiResponse.status === 402) return jsonResponse({ error: "AI credits exhausted" }, 402);
  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    console.error(`AI error ${aiResponse.status}:`, errText);
    return jsonResponse({ error: "AI service error" }, 502);
  }

  // Stream SSE back to client
  const { readable, writable } = new TransformStream();
  const writer  = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const reader  = aiResponse.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            await writer.write(encoder.encode("data: [DONE]\n\n"));
            break;
          }
          try {
            const parsed  = JSON.parse(data);
            const content = parsed?.choices?.[0]?.delta?.content;
            if (content) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`));
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    status:  200,
    headers: {
      ...corsHeaders,
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
});

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
=======
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are CinePool AI, a friendly and knowledgeable movie concierge. You help users discover movies and shows based on their mood, preferences, and viewing history.

Guidelines:
- Be enthusiastic but concise about movie recommendations
- Always format movie titles in bold with year: **Movie Title (2024)**
- Suggest 2-4 movies per response unless asked for more
- Include brief reasons why each movie fits the user's request
- Ask follow-up questions to refine suggestions
- You can discuss genres, directors, actors, plot themes, and streaming availability
- Keep responses conversational and fun`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("movie-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
>>>>>>> 822687860278937d328a1f80127f1d63ad2e187b
