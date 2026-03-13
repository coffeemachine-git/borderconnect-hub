import { useState } from "react";
import { mockOcrExtract, Traveler } from "@/data/mockData";
import { useTravelers } from "@/context/TravelerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";

export default function OcrScanner({ onComplete }: { onComplete: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Partial<Traveler> | null>(null);
  const { addTraveler } = useTravelers();

  const handleScan = async () => {
    setScanning(true);
    const data = await mockOcrExtract();
    setResult(data);
    setScanning(false);
  };

  const handleSave = () => {
    if (!result) return;
    const newTraveler: Traveler = {
      id: `t-${Date.now()}`,
      firstName: result.firstName ?? "Unknown",
      lastName: result.lastName ?? "Unknown",
      nationality: result.nationality ?? "Unknown",
      documentType: result.documentType ?? "travel_document",
      documentNumber: result.documentNumber ?? "N/A",
      dateOfBirth: result.dateOfBirth ?? "1990-01-01",
      arrivalDate: result.arrivalDate ?? new Date().toISOString().split("T")[0],
      arrivalTime: result.arrivalTime ?? "00:00",
      visaStatus: "pending",
      watchlistStatus: "clear",
      backgroundCheckResult: "pending",
      aidNeeds: ["none"],
      familySize: 1,
      unaccompaniedMinor: false,
      ocrScanned: true,
      mrzData: result.mrzData,
    };
    addTraveler(newTraveler);
    toast.success("Traveler profile created from OCR scan");
    onComplete();
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-3">Upload passport image for MRZ extraction</p>
        <Input type="file" accept="image/*" className="max-w-xs mx-auto" disabled={scanning} />
      </div>

      <Button onClick={handleScan} disabled={scanning} className="w-full">
        {scanning ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scanning MRZ…</> : "Simulate OCR Scan"}
      </Button>

      {result && (
        <div className="border rounded-lg p-4 space-y-3 bg-card">
          <div className="flex items-center gap-2 text-success text-sm font-semibold">
            <CheckCircle className="h-4 w-4" /> MRZ Data Extracted
          </div>
          <div className="font-mono text-xs bg-muted p-2 rounded break-all">{result.mrzData}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {result.firstName} {result.lastName}</div>
            <div><span className="text-muted-foreground">Nationality:</span> {result.nationality}</div>
            <div><span className="text-muted-foreground">Document:</span> {result.documentNumber}</div>
            <div><span className="text-muted-foreground">DOB:</span> {result.dateOfBirth}</div>
          </div>
          <Button onClick={handleSave} className="w-full">Save Traveler Profile</Button>
        </div>
      )}
    </div>
  );
}
