import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Heart, Settings, LogOut, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTravelers } from "@/context/TravelerContext";

const roleConfig = {
  border_security: { label: "Border Security", icon: Shield, color: "role-security" },
  humanitarian_ngo: { label: "Humanitarian NGO", icon: Heart, color: "role-humanitarian" },
  admin: { label: "Administrator", icon: Settings, color: "bg-muted text-foreground" },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { lastUpdated } = useTravelers();
  const navigate = useNavigate();

  if (!user) return null;

  const config = roleConfig[user.role];
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg tracking-tight">BorderLink</span>
            <div className={`px-2 py-0.5 rounded text-xs font-semibold ${config.color}`}>
              <Icon className="h-3 w-3 inline mr-1" />
              {config.label}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Radio className="h-3 w-3 text-success animate-pulse" />
              Live — {lastUpdated.toLocaleTimeString()}
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">{user.username}</span>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container px-4 py-6">{children}</main>
    </div>
  );
}
