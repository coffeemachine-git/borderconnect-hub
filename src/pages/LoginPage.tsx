import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/data/mockData";
import { Shield, Heart, Settings, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const roles: { value: UserRole; label: string; icon: typeof Shield; description: string; className: string }[] = [
  { value: "border_security", label: "Border Security", icon: Shield, description: "Watchlists, visa status, background checks", className: "role-security" },
  { value: "humanitarian_ngo", label: "Humanitarian NGO", icon: Heart, description: "Medical, shelter, and food aid coordination", className: "role-humanitarian" },
  { value: "admin", label: "Administrator", icon: Settings, description: "Role management and system configuration", className: "bg-muted text-foreground" },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username.trim() || !selectedRole) return;
    login(username, selectedRole);
    navigate(selectedRole === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">
            Prototype
          </div>
          <h1 className="text-3xl font-bold tracking-tight">BorderLink</h1>
          <p className="text-muted-foreground text-sm">Inter-Agency Border Coordination Platform</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Select your role to access the appropriate dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            <div className="grid gap-2">
              {roles.map((r) => {
                const Icon = r.icon;
                const selected = selectedRole === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRole(r.value)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      selected ? "border-ring shadow-sm" : "border-transparent bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    <div className={`p-2 rounded-md ${r.className}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              className="w-full"
              disabled={!username.trim() || !selectedRole}
              onClick={handleLogin}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Access Dashboard
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Mock authentication — no real credentials required
        </p>
      </div>
    </div>
  );
}
