import { useState } from "react";
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
  const ActiveComponent = tabs[activeTab];

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
      <ChatDrawer userId={user?.id ?? "anon"} />
    </div>
  );
};

export default Index;
