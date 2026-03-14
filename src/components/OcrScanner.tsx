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
  const canvasRef = useRef<HTMLCanvasElement>(null); // Added for capturing frames
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
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // 1. Calculate the exact dimensions of your UI crop box
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    const cropWidth = videoWidth * 0.9;  // 90% of video width
    const cropHeight = videoHeight * 0.3; // 30% of video height
    const cropX = (videoWidth - cropWidth) / 2; // Center horizontally
    const cropY = (videoHeight - cropHeight) / 2; // Center vertically

    // 2. Shrink the canvas to ONLY match the crop box size
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    const context = canvas.getContext("2d");
    if (context) {
      // 3. Draw ONLY the cropped rectangle from the video onto the canvas
      context.drawImage(
        video, 
        cropX, cropY, cropWidth, cropHeight, // Source coordinates (the crop box)
        0, 0, cropWidth, cropHeight          // Destination coordinates (the canvas)
      );
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to capture image.");
          setScanning(false);
          return;
        }

        const formData = new FormData();
        formData.append("documentImage", blob, "scan.jpg");

        try {
          const response = await fetch("http://localhost:5000/api/scan", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Backend failed to process image");

          const responseData = await response.json();
          
          if (responseData.data && responseData.data.documentType === 'Passport') {
            const parsed = responseData.data.parsedData;
            const nameParts = parsed.fullName.split(' ');
            
            setResult({
              firstName: nameParts.length > 0 ? nameParts[0] : '',
              lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
              nationality: parsed.nationality,
              documentType: responseData.data.documentType,
              documentNumber: parsed.documentId,
              mrzData: responseData.data.extractedText
            });
            
            toast.success("Passport data extracted!");
            stopCamera();
          } else {
            throw new Error("Could not parse MRZ");
          }

        } catch (error) {
          console.error("OCR Error:", error);
          toast.error("Failed to read document. Ensure lighting is good and MRZ is visible.");
        } finally {
          setScanning(false);
        }
      }, "image/jpeg", 0.9);
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
          </div>
          
          <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
            Confirm & Save to Hub
          </Button>
        </div>
      )}
    </div>
  );
}