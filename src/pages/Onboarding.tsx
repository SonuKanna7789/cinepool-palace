import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Film, Check, Search, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { updatePreferences } from "@/services/api";

const GENRES = ["Action", "Drama", "Sci-Fi", "Comedy", "Horror", "Romance", "Documentary", "Thriller", "Animation", "Crime", "Fantasy", "Mystery"];
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "Korean", "Japanese", "Tamil", "Telugu", "Other"];
const PLATFORMS = [
  { id: "netflix", name: "Netflix" },
  { id: "prime", name: "Prime Video" },
  { id: "disney", name: "Disney+" },
  { id: "hbo", name: "HBO Max" },
  { id: "apple", name: "Apple TV+" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [genres, setGenres] = useState<string[]>([]);
  const [language, setLanguage] = useState<string>("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  
  // Movie Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState<any[]>([]);
  const [favoriteMovieId, setFavoriteMovieId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("cinepool_onboarded") === "true") {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchMovies(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchMovies = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${import.meta.env.VITE_TMDB_API_KEY}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error("TMDB Search Error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleGenre = (g: string) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const toggleMovie = (movie: any) => {
    setSelectedMovies(prev => {
      if (prev.find(m => m.id === movie.id)) {
        return prev.filter(m => m.id !== movie.id);
      }
      if (prev.length >= 10) {
        toast.error("You can select up to 10 movies");
        return prev;
      }
      return [...prev, movie];
    });
  };

  const canGoNext = () => {
    if (step === 1) return genres.length >= 3;
    if (step === 2) return !!language;
    if (step === 3) return platforms.length > 0;
    if (step === 4) return selectedMovies.length >= 3 && selectedMovies.length <= 10;
    if (step === 5) return !!favoriteMovieId;
    return true;
  };

  const completeOnboarding = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // 1. .NET API
      await updatePreferences({ favoriteGenres: genres, favoritePlatforms: platforms as any });

      // 2. Supabase preferences
      await supabase.from("user_preferences").insert({
        user_id: user.id,
        favorite_genres: genres,
        favorite_platforms: platforms,
        preferred_languages: [language]
      });

      // 3. Supabase watch history
      const historyData = selectedMovies.map(m => ({
        user_id: user.id,
        movie_id: m.id.toString(),
        movie_title: m.title,
        genre: m.genre_ids?.[0]?.toString() || "Unknown",
        rating: m.id.toString() === favoriteMovieId ? 5 : null,
      }));
      await supabase.from("user_watch_history").insert(historyData);

      // Mark profile as onboarded
      await supabase.from("profiles").update({ is_onboarded: true }).eq("id", user.id);

      localStorage.setItem("cinepool_onboarded", "true");
      navigate("/");
      toast.success("Welcome to CinePool!");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto p-6">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="font-display font-bold text-3xl mb-2">What genres do you love?</h1>
              <p className="text-muted-foreground">Select at least 3 genres.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {GENRES.map(g => {
                const active = genres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      active ? 'gradient-gold text-primary-foreground' : 'glass text-foreground hover:bg-muted'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="font-display font-bold text-3xl mb-2">What language do you prefer?</h1>
              <p className="text-muted-foreground">Choose your primary watch language.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`p-4 rounded-xl text-left font-medium transition-all ${
                    language === l ? 'border-2 border-primary bg-primary/10' : 'glass hover:bg-muted'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="font-display font-bold text-3xl mb-2">Where do you watch?</h1>
              <p className="text-muted-foreground">Select the streaming platforms you use.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map(p => {
                const active = platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`p-4 rounded-xl flex items-center justify-between font-medium transition-all ${
                      active ? 'border-2 border-primary bg-primary/10' : 'glass hover:bg-muted'
                    }`}
                  >
                    <span>{p.name}</span>
                    {active && <Check size={16} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <h1 className="font-display font-bold text-3xl mb-2">Pick some movies you've loved</h1>
              <p className="text-muted-foreground">Select 3 to 10 movies ({selectedMovies.length} selected).</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-secondary rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {isSearching ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {searchResults.map(movie => {
                  const isSelected = selectedMovies.find(m => m.id === movie.id);
                  return (
                    <div key={movie.id} className="relative cursor-pointer group" onClick={() => toggleMovie(movie)}>
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted">
                        {movie.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-muted-foreground">
                            {movie.title}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/40 flex items-center justify-center rounded-xl">
                          <div className="bg-background rounded-full p-1"><Check size={24} className="text-primary" /></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="font-display font-bold text-3xl mb-2">Rate your all-time favourite</h1>
              <p className="text-muted-foreground">Pick ONE from your selected movies.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {selectedMovies.map(movie => (
                <button
                  key={movie.id}
                  onClick={() => setFavoriteMovieId(movie.id.toString())}
                  className={`relative aspect-[2/3] rounded-xl overflow-hidden transition-all ${
                    favoriteMovieId === movie.id.toString() ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center p-4 text-sm font-medium">
                      {movie.title}
                    </div>
                  )}
                  {favoriteMovieId === movie.id.toString() && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border p-4 max-w-lg mx-auto">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center justify-center h-12 w-12 rounded-xl glass hover:bg-muted transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <button
            onClick={() => step < 5 ? setStep(s => s + 1) : completeOnboarding()}
            disabled={!canGoNext() || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl gradient-gold text-primary-foreground font-display font-semibold h-12 disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : step === 5 ? "Complete Setup" : "Continue"}
            {!isSubmitting && step < 5 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
