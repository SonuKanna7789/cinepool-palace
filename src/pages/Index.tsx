import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { ChatDrawer } from "@/components/ChatDrawer";
import { SocialFeed } from "@/tabs/SocialFeed";
import { OttPooling } from "@/tabs/OttPooling";
import { SmartSuggestions } from "@/tabs/SmartSuggestions";
import { UserProfile } from "@/tabs/UserProfile";
import AuthPage from "@/pages/AuthPage";
import { Loader2 } from "lucide-react";

const tabs = [SocialFeed, OttPooling, SmartSuggestions, UserProfile];

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { isLoggedIn, loading, user } = useAuth();
  const navigate = useNavigate();
  const ActiveComponent = tabs[activeTab];

  useEffect(() => {
    if (isLoggedIn && !loading) {
      const onboarded = localStorage.getItem("cinepool_onboarded") === "true";
      if (!onboarded && !user?.is_onboarded) {
        navigate("/onboarding");
      } else if (user?.is_onboarded) {
        localStorage.setItem("cinepool_onboarded", "true");
      }
    }
  }, [isLoggedIn, loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <ActiveComponent />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      {/* FIX: use user_id (Supabase auth UUID) not id (profiles PK) */}
      <ChatDrawer userId={user?.user_id ?? "anon"} />
    </div>
  );
};

export default Index;
