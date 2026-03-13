import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useTravelers } from "@/context/TravelerContext";
import { VisaBadge, WatchlistBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, AlertTriangle, Clock, CheckCircle, Search, ScanLine } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OcrScanner from "@/components/OcrScanner";

export default function BorderSecurityDashboard() {
  const { travelers } = useTravelers();
  const [search, setSearch] = useState("");
  const [ocrOpen, setOcrOpen] = useState(false);

  const filtered = travelers.filter((t) =>
    `${t.firstName} ${t.lastName} ${t.documentNumber} ${t.nationality}`.toLowerCase().includes(search.toLowerCase())
  );

  const flagged = travelers.filter((t) => t.watchlistStatus === "flagged").length;
  const pending = travelers.filter((t) => t.visaStatus === "pending").length;
  const cleared = travelers.filter((t) => t.backgroundCheckResult === "clear").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Border Security Dashboard</h1>
            <p className="text-sm text-muted-foreground">Threat assessment & traveler screening</p>
          </div>
          <Dialog open={ocrOpen} onOpenChange={setOcrOpen}>
            <DialogTrigger asChild>
              <Button><ScanLine className="h-4 w-4 mr-2" />Scan Document</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>OCR Document Scanner</DialogTitle></DialogHeader>
              <OcrScanner onComplete={() => setOcrOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div>
              <div><div className="text-2xl font-bold">{travelers.length}</div><div className="text-xs text-muted-foreground">Total Travelers</div></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-danger/10"><AlertTriangle className="h-5 w-5 text-danger" /></div>
              <div><div className="text-2xl font-bold">{flagged}</div><div className="text-xs text-muted-foreground">Watchlist Flags</div></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-warning/10"><Clock className="h-5 w-5 text-warning" /></div>
              <div><div className="text-2xl font-bold">{pending}</div><div className="text-xs text-muted-foreground">Pending Visas</div></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-success/10"><CheckCircle className="h-5 w-5 text-success" /></div>
              <div><div className="text-2xl font-bold">{cleared}</div><div className="text-xs text-muted-foreground">Background Clear</div></div>
            </CardContent>
          </Card>
        </div>

        {/* Search + Table */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, document, or nationality…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Traveler Screening</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs uppercase">
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4 hidden md:table-cell">Nationality</th>
                  <th className="text-left py-2 pr-4 hidden lg:table-cell">Document</th>
                  <th className="text-left py-2 pr-4">Visa</th>
                  <th className="text-left py-2 pr-4">Watchlist</th>
                  <th className="text-left py-2 pr-4 hidden sm:table-cell">Background</th>
                  <th className="text-left py-2 hidden lg:table-cell">Arrival</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className={`border-b last:border-0 hover:bg-muted/50 ${t.watchlistStatus === "flagged" ? "bg-danger/5" : ""}`}>
                    <td className="py-3 pr-4 font-medium">{t.firstName} {t.lastName}</td>
                    <td className="py-3 pr-4 hidden md:table-cell">{t.nationality}</td>
                    <td className="py-3 pr-4 font-mono text-xs hidden lg:table-cell">{t.documentNumber}</td>
                    <td className="py-3 pr-4"><VisaBadge status={t.visaStatus} /></td>
                    <td className="py-3 pr-4"><WatchlistBadge status={t.watchlistStatus} /></td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <span className={`text-xs font-semibold uppercase ${t.backgroundCheckResult === "clear" ? "text-success" : t.backgroundCheckResult === "alert" ? "text-danger" : "text-warning"}`}>
                        {t.backgroundCheckResult}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground hidden lg:table-cell">{t.arrivalTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No travelers match your search.</p>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
