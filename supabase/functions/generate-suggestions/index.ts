import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, force_refresh } = await req.json();

    if (!user_id) {
      throw new Error("user_id is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user preferences
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user_id)
      .single();

    // Fetch watch history
    const { data: history } = await supabase
      .from("user_watch_history")
      .select("*")
      .eq("user_id", user_id)
      .order("watched_at", { ascending: false })
      .limit(20);

    // Fetch feedback
    const { data: feedback } = await supabase
      .from("suggestion_feedback")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(50);

    const favoriteGenres = prefs?.favorite_genres || [];
    const favoritePlatforms = prefs?.favorite_platforms || [];
    const recentMovies = history?.map(h => h.movie_title).slice(0, 10) || [];
    const likedMovies = feedback?.filter(f => f.action === "like").map(f => f.movie_id) || [];
    const dislikedMovies = feedback?.filter(f => f.action === "dislike").map(f => f.movie_id) || [];

    const allShownMovies = feedback?.map(f => f.movie_id) || [];

    const prompt = `You are a movie recommendation AI. Generate 5 personalized movie suggestions based on the user's preferences.

User Profile:
- Favorite Genres: ${favoriteGenres.join(", ") || "Not specified"}
- Favorite Platforms: ${favoritePlatforms.join(", ") || "Not specified"}
- Recently Watched: ${recentMovies.join(", ") || "None"}
- Liked Suggestions: ${likedMovies.join(", ") || "None"}
- Disliked Suggestions: ${dislikedMovies.join(", ") || "None"}
- Already Shown (DO NOT repeat these): ${allShownMovies.join(", ") || "None"}

Provide exactly 5 movie recommendations as a JSON array with the following structure:
[
  {
    "title": "Movie Title",
    "year": 2025,
    "genre": "Genre",
    "director": "Director Name",
    "platforms": ["netflix", "prime"],
    "matchPercent": 85,
    "reason": "Why this movie matches the user's taste"
  }
]

Important:
- matchPercent should be between 70-99
- platforms should be an array of: netflix, prime, disney, hbo, apple
- NEVER suggest movies the user has already seen, disliked, or that were already shown
- Prioritize genres and platforms the user prefers
- Provide diverse and FRESH recommendations the user hasn't seen before
- Return ONLY the JSON array, no other text`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI Gateway error:", await aiResponse.text());
      return new Response(
        JSON.stringify({ suggestions: generateFallbackSuggestions(), cached: false, generatedAt: new Date().toISOString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";
    
    let suggestions = [];
    try {
      suggestions = JSON.parse(content.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      suggestions = generateFallbackSuggestions();
    }

    return new Response(
      JSON.stringify({ suggestions, cached: false, generatedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message, suggestions: generateFallbackSuggestions(), cached: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackSuggestions() {
  return [
    {
      title: "The Shawshank Redemption",
      year: 1994,
      genre: "Drama",
      director: "Frank Darabont",
      platforms: ["netflix", "prime"],
      matchPercent: 92,
      reason: "A timeless classic loved by audiences worldwide"
    },
    {
      title: "Inception",
      year: 2010,
      genre: "Sci-Fi",
      director: "Christopher Nolan",
      platforms: ["netflix"],
      matchPercent: 88,
      reason: "Mind-bending thriller with stunning visuals"
    },
    {
      title: "Parasite",
      year: 2019,
      genre: "Thriller",
      director: "Bong Joon-ho",
      platforms: ["hbo"],
      matchPercent: 85,
      reason: "Award-winning masterpiece with social commentary"
    },
    {
      title: "The Grand Budapest Hotel",
      year: 2014,
      genre: "Comedy",
      director: "Wes Anderson",
      platforms: ["disney"],
      matchPercent: 81,
      reason: "Quirky comedy with unique visual style"
    },
    {
      title: "Interstellar",
      year: 2014,
      genre: "Sci-Fi",
      director: "Christopher Nolan",
      platforms: ["prime"],
      matchPercent: 90,
      reason: "Epic space adventure with emotional depth"
    }
  ];
}
