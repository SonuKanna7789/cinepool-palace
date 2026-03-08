import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { ChatDrawer } from "@/components/ChatDrawer";
import { SocialFeed } from "@/tabs/SocialFeed";
import { OttPooling } from "@/tabs/OttPooling";
import { SmartSuggestions } from "@/tabs/SmartSuggestions";
import { UserProfile } from "@/tabs/UserProfile";
import AuthPage from "@/pages/AuthPage";

const tabs = [SocialFeed, OttPooling, SmartSuggestions, UserProfile];

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { isLoggedIn } = useAuth();
  const ActiveComponent = tabs[activeTab];

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <ActiveComponent />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
