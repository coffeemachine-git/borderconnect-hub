import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockUsers, UserRole } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield, Heart, Settings } from "lucide-react";
import { toast } from "sonner";

const roleIcons: Record<UserRole, typeof Shield> = {
  border_security: Shield,
  humanitarian_ngo: Heart,
  admin: Settings,
};

export default function AdminPanel() {
  const [users, setUsers] = useState(mockUsers);
  const [newUser, setNewUser] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("humanitarian_ngo");

  const addUser = () => {
    if (!newUser.trim()) return;
    setUsers((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, username: newUser, role: newRole, agency: newRole === "border_security" ? "Border Protection Agency" : newRole === "humanitarian_ngo" ? "NGO Partner" : "Admin" },
    ]);
    toast.success(`User "${newUser}" added as ${newRole.replace("_", " ")}`);
    setNewUser("");
  };

  const changeRole = (userId: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    toast.success("Role updated");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage user roles and access control (RBAC)</p>
        </div>

        {/* Add user */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Add User</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Username" value={newUser} onChange={(e) => setNewUser(e.target.value)} className="flex-1" />
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="border_security">Border Security</SelectItem>
                  <SelectItem value="humanitarian_ngo">Humanitarian NGO</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addUser}><UserPlus className="h-4 w-4 mr-2" />Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Users & Roles</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs uppercase">
                  <th className="text-left py-2 pr-4">Username</th>
                  <th className="text-left py-2 pr-4">Agency</th>
                  <th className="text-left py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const Icon = roleIcons[u.role];
                  return (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />{u.username}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{u.agency}</td>
                      <td className="py-3">
                        <Select value={u.role} onValueChange={(v) => changeRole(u.id, v as UserRole)}>
                          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="border_security">Border Security</SelectItem>
                            <SelectItem value="humanitarian_ngo">Humanitarian NGO</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
