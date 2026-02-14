import { Clapperboard, Users, Sparkles, User } from "lucide-react";

interface BottomNavProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

const tabs = [
  { icon: Clapperboard, label: "Feed" },
  { icon: Users, label: "Pools" },
  { icon: Sparkles, label: "For You" },
  { icon: User, label: "Profile" },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab, i) => {
          const active = activeTab === i;
          return (
            <button
              key={tab.label}
              onClick={() => onTabChange(i)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all duration-200 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={20} className={active ? "drop-shadow-[0_0_6px_hsl(38,90%,55%,0.5)]" : ""} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {active && (
                <div className="h-0.5 w-4 rounded-full gradient-gold" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
