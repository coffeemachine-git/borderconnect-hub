import { useState, useRef, useCallback, useEffect } from "react";
import { Traveler } from "@/data/mockData";
import { useTravelers } from "@/context/TravelerContext";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Camera, CameraOff, ScanLine, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = "http://localhost:8000/api/process-passport";

export default function OcrScanner({ onComplete }: { onComplete: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState<Partial<Traveler> | null>(null);
  const { addTraveler } = useTravelers();
  
  const videoRef = useRef<HTMLVideoElement>(null);
<<<<<<< HEAD
  const canvasRef = useRef<HTMLCanvasElement>(null); // Added for capturing frames
=======
  const canvasRef = useRef<HTMLCanvasElement>(null);
>>>>>>> c763641c0746a564fd7594d3f7dfcd0990f9a132
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", 
          width: { ideal: 1920 }, // Higher res for better OCR
          height: { ideal: 1080 } 
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setResult(null);
    } catch (err) {
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

  const captureFrame = (): Blob | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    // Convert to blob synchronously via dataURL
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const byteString = atob(dataUrl.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8 = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: "image/jpeg" });
  };

  const handleCaptureScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanning(true);
<<<<<<< HEAD
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match video resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg", 0.9);

      try {
        // ACTUAL BACKEND INTEGRATION
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ocr/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
        });

        if (!response.ok) throw new Error("Backend failed to process image");

        const data = await response.json();
        setResult(data);
        toast.success("Passport data extracted!");
        stopCamera();
      } catch (error) {
        console.error("OCR Error:", error);
        toast.error("Failed to read document. Ensure lighting is good and MRZ is visible.");
      } finally {
        setScanning(false);
      }
=======
    try {
      const imageBlob = captureFrame();
      if (!imageBlob) throw new Error("Failed to capture frame");

      const formData = new FormData();
      formData.append("file", imageBlob, "capture.jpg");

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Backend error (${response.status}): ${err}`);
      }

      const data = await response.json();
      setResult({
        firstName: data.first_name ?? data.firstName ?? "Unknown",
        lastName: data.last_name ?? data.lastName ?? "Unknown",
        nationality: data.nationality ?? "Unknown",
        documentType: data.document_type ?? data.documentType ?? "travel_document",
        documentNumber: data.document_number ?? data.documentNumber ?? "N/A",
        dateOfBirth: data.date_of_birth ?? data.dateOfBirth ?? "1990-01-01",
        arrivalDate: new Date().toISOString().split("T")[0],
        arrivalTime: new Date().toTimeString().slice(0, 5),
        mrzData: data.mrz_data ?? data.mrzData ?? data.mrz ?? "",
        ocrScanned: true,
      });
      toast.success("MRZ Data Extracted successfully");
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error(error instanceof Error ? error.message : "OCR extraction failed. Is the backend running?");
    } finally {
      setScanning(false);
      stopCamera();
>>>>>>> c763641c0746a564fd7594d3f7dfcd0990f9a132
    }
  };

  const handleSave = () => {
    if (!result) return;
    const newTraveler: Traveler = {
      id: `t-${Date.now()}`,
      firstName: result.firstName || "Unknown",
      lastName: result.lastName || "Unknown",
      nationality: result.nationality || "Unknown",
      documentType: result.documentType || "passport",
      documentNumber: result.documentNumber || "N/A",
      dateOfBirth: result.dateOfBirth || "",
      arrivalDate: new Date().toISOString().split("T")[0],
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      visaStatus: "pending",
      watchlistStatus: "clear",
      backgroundCheckResult: "pending",
      aidNeeds: [],
      familySize: 1,
      unaccompaniedMinor: false,
      ocrScanned: true,
      mrzData: result.mrzData,
    };
    
    addTraveler(newTraveler);
    toast.success("Traveler profile created");
    onComplete();
  };

  return (
    <div className="space-y-4">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-primary/20">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? "opacity-100" : "opacity-0"}`}
        />
        
        {cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Guidance Overlay */}
            <div className="w-[90%] h-[30%] border-2 border-white/50 rounded-lg bg-primary/5 relative">
                <div className="absolute -top-6 left-0 text-[10px] text-white bg-primary px-2 py-0.5 rounded">ALIGN MRZ (BOTTOM OF PASSPORT) HERE</div>
                <div className="absolute inset-0 border-2 border-dashed border-primary/40 animate-pulse" />
            </div>
          </div>
        )}

        {!cameraActive && !result && (
          <div className="text-center p-6 text-white">
            <CameraOff className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Ready to scan document</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!cameraActive ? (
          <Button onClick={startCamera} className="w-full" variant={result ? "outline" : "default"}>
            <Camera className="h-4 w-4 mr-2" />
            {result ? "Rescan Document" : "Start Scanner"}
          </Button>
        ) : (
          <>
            <Button onClick={handleCaptureScan} disabled={scanning} className="flex-1">
              {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ScanLine className="h-4 w-4 mr-2" />}
              {scanning ? "Processing..." : "Capture & Scan"}
            </Button>
            <Button variant="ghost" onClick={stopCamera} disabled={scanning}>Cancel</Button>
          </>
        )}
      </div>

      {result && (
        <div className="border rounded-lg p-4 space-y-3 bg-card animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
              <CheckCircle className="h-4 w-4" /> Data Verified
            </div>
            <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded">Confidence: High</span>
          </div>
<<<<<<< HEAD
          
          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Full Name</p>
              <p>{result.firstName} {result.lastName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Document #</p>
              <p className="font-mono">{result.documentNumber}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Nationality</p>
              <p>{result.nationality}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-bold">DOB</p>
              <p>{result.dateOfBirth}</p>
            </div>
=======
          {result.mrzData && (
            <div className="font-mono text-xs bg-muted p-2 rounded break-all">{result.mrzData}</div>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {result.firstName} {result.lastName}</div>
            <div><span className="text-muted-foreground">Nationality:</span> {result.nationality}</div>
            <div><span className="text-muted-foreground">Document:</span> {result.documentNumber}</div>
            <div><span className="text-muted-foreground">DOB:</span> {result.dateOfBirth}</div>
>>>>>>> c763641c0746a564fd7594d3f7dfcd0990f9a132
          </div>
          
          <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
            Confirm & Save to Hub
          </Button>
        </div>
      )}
    </div>
  );
}