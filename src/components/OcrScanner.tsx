import { useState, useRef, useCallback, useEffect } from "react";
import { mockOcrExtract, Traveler } from "@/data/mockData";
import { useTravelers } from "@/context/TravelerContext";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Camera, CameraOff, ScanLine } from "lucide-react";
import { toast } from "sonner";

export default function OcrScanner({ onComplete }: { onComplete: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState<Partial<Traveler> | null>(null);
  const { addTraveler } = useTravelers();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      toast.error("Unable to access camera. Please grant permission.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleCaptureScan = async () => {
    if (!videoRef.current) return;
    setScanning(true);
    // In production this frame would go to a real OCR service
    const data = await mockOcrExtract();
    setResult(data);
    setScanning(false);
    stopCamera();
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
      {/* Camera viewfinder */}
      <div className="relative rounded-lg overflow-hidden bg-muted/30 border-2 border-dashed aspect-video flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
        />
        {cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[80%] h-[40%] border-2 border-primary/70 rounded-md" />
          </div>
        )}
        {!cameraActive && !result && (
          <div className="text-center p-6">
            <CameraOff className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Camera inactive — tap below to start</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {!cameraActive && !result && (
        <Button onClick={startCamera} className="w-full">
          <Camera className="h-4 w-4 mr-2" />
          Open Camera
        </Button>
      )}

      {cameraActive && (
        <div className="flex gap-2">
          <Button onClick={handleCaptureScan} disabled={scanning} className="flex-1">
            {scanning ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scanning MRZ…</>
            ) : (
              <><ScanLine className="h-4 w-4 mr-2" />Capture &amp; Scan</>
            )}
          </Button>
          <Button variant="outline" onClick={stopCamera} disabled={scanning}>
            Stop
          </Button>
        </div>
      )}

      {/* Result */}
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
