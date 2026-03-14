import DashboardLayout from "@/components/DashboardLayout";
import { useTravelers } from "@/context/TravelerContext";
import { AidBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Home, UtensilsCrossed, Baby, Users, Trash2 } from "lucide-react";

export default function HumanitarianDashboard() {
  // Grab both the travelers list AND the delete function from context
  const { travelers, deleteTraveler } = useTravelers();

  const needsMedical = travelers.filter((t) => t.aidNeeds.includes("medical"));
  const needsShelter = travelers.filter((t) => t.aidNeeds.includes("shelter"));
  const needsFood = travelers.filter((t) => t.aidNeeds.includes("food"));
  const unaccompanied = travelers.filter((t) => t.unaccompaniedMinor);
  const totalFamilyMembers = travelers.reduce((sum, t) => sum + t.familySize, 0);

  // Only show humanitarian-safe data (no visa, watchlist, background info)
  const aidTravelers = travelers.filter((t) => t.aidNeeds.some((n) => n !== "none"));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Humanitarian Aid Dashboard</h1>
          <p className="text-sm text-muted-foreground">Incoming traveler needs — medical, shelter, food coordination</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Medical", count: needsMedical.length, icon: Stethoscope, cls: "bg-danger/10 text-danger" },
            { label: "Shelter", count: needsShelter.length, icon: Home, cls: "bg-info/10 text-info" },
            { label: "Food", count: needsFood.length, icon: UtensilsCrossed, cls: "bg-warning/10 text-warning" },
            { label: "Unaccompanied Minors", count: unaccompanied.length, icon: Baby, cls: "bg-primary/10 text-primary" },
            { label: "Total People", count: totalFamilyMembers, icon: Users, cls: "bg-muted text-muted-foreground" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-md ${s.cls}`}><s.icon className="h-5 w-5" /></div>
                <div>
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Priority: medical critical */}
        {needsMedical.filter((t) => t.medicalPriority === "critical").length > 0 && (
          <Card className="border-danger/30 bg-danger/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-danger flex items-center gap-2">
                <Stethoscope className="h-4 w-4" /> Critical Medical Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {needsMedical.filter((t) => t.medicalPriority === "critical").map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded bg-card">
                    <div>
                      <span className="font-medium">{t.firstName} {t.lastName}</span>
                      <span className="text-xs text-muted-foreground ml-2">Family of {t.familySize}</span>
                    </div>
                    <div className="flex gap-1">
                      {t.aidNeeds.filter((n) => n !== "none").map((n) => <AidBadge key={n} need={n} />)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aid list */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Travelers Requiring Assistance</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs uppercase">
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4 hidden sm:table-cell">Family Size</th>
                  <th className="text-left py-2 pr-4">Needs</th>
                  <th className="text-left py-2 pr-4 hidden md:table-cell">Medical Priority</th>
                  <th className="text-left py-2 hidden md:table-cell">Minor</th>
                  <th className="text-right py-2 w-10"></th> {/* Empty header for delete button column */}
                </tr>
              </thead>
              <tbody>
                {aidTravelers.map((t) => (
                  <tr key={t.id} className={`border-b last:border-0 hover:bg-muted/50 ${t.unaccompaniedMinor ? "bg-primary/5" : ""}`}>
                    <td className="py-3 pr-4 font-medium">{t.firstName} {t.lastName}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell">{t.familySize}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1 flex-wrap">
                        {t.aidNeeds.filter((n) => n !== "none").map((n) => <AidBadge key={n} need={n} />)}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs hidden md:table-cell">{t.medicalPriority ?? "—"}</td>
                    <td className="py-3 hidden md:table-cell">
                      {t.unaccompaniedMinor ? <span className="text-xs font-semibold text-primary">Yes</span> : "—"}
                    </td>
                    
                    {/* Delete Button Cell */}
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => deleteTraveler(t.id)}
                        className="p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 rounded transition-colors"
                        title="Delete Traveler"
                      >
                        <Trash2 className="h-4 w-4 inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}