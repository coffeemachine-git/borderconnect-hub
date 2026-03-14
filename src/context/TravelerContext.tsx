import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Traveler } from "@/data/mockData";

interface TravelerContextType {
  travelers: Traveler[];
  addTraveler: (t: Traveler) => void;
  updateTraveler: (id: string, updates: Partial<Traveler>) => void;
  deleteTraveler: (id: string) => Promise<void>; // <-- ADD THIS LINE
  lastUpdated: Date;
}

const TravelerContext = createContext<TravelerContextType | null>(null);

export function TravelerProvider({ children }: { children: ReactNode }) {
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch real data from MongoDB on load and every 10 seconds
  useEffect(() => {
    const fetchTravelers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/scan");
        if (!response.ok) throw new Error("Network response was not ok");
        
        const dbRecords = await response.json();
        
        // Map the backend BorderRecord format to the frontend Traveler format
        const realTravelers: Traveler[] = dbRecords.map((record: any) => {
          const fullName = record.parsedData?.fullName || "Unknown";
          const names = fullName.split(" ");
          
          return {
            id: record._id, // Use MongoDB's unique ID
            firstName: names[0] || "Unknown",
            lastName: names.length > 1 ? names.slice(1).join(" ") : "Unknown",
            nationality: record.parsedData?.nationality || "Unknown",
            documentType: record.documentType || "passport",
            documentNumber: record.parsedData?.documentId || "N/A",
            dateOfBirth: "N/A", 
            arrivalDate: new Date(record.scanTimestamp).toISOString().split("T")[0],
            arrivalTime: new Date(record.scanTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            visaStatus: "pending",
            watchlistStatus: record.clearanceStatus === "Pending Verification" ? "clear" : "flagged",
            backgroundCheckResult: "pending",
            aidNeeds: [],
            familySize: 1,
            unaccompaniedMinor: false,
            ocrScanned: true,
            mrzData: record.extractedText || "",
          };
        });

        setTravelers(realTravelers);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch from MongoDB:", error);
      }
    };

    // Fetch immediately on load
    fetchTravelers();

    // Keep the polling so it auto-updates if another terminal adds a record
    const interval = setInterval(fetchTravelers, 10000);
    return () => clearInterval(interval);
  }, []);

  // When a new scan happens, add it to the local UI instantly so it feels fast
  const addTraveler = (t: Traveler) => {
    setTravelers((prev) => [t, ...prev]);
    setLastUpdated(new Date());
  };

  const updateTraveler = (id: string, updates: Partial<Traveler>) => {
    setTravelers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    setLastUpdated(new Date());
  };

  const deleteTraveler = async (id: string) => {
    try {
      // 1. Tell the backend to delete it from MongoDB
      const response = await fetch(`http://localhost:5000/api/scan/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete from database");

      // 2. Instantly remove it from the React UI without waiting for a refresh
      setTravelers((prev) => prev.filter((t) => t.id !== id));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  return (
    <TravelerContext.Provider value={{ travelers, addTraveler, updateTraveler, deleteTraveler, lastUpdated }}>
      {children}
    </TravelerContext.Provider>
  );
}

export function useTravelers() {
  const ctx = useContext(TravelerContext);
  if (!ctx) throw new Error("useTravelers must be inside TravelerProvider");
  return ctx;
}