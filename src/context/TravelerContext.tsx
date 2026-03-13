import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Traveler, mockTravelers } from "@/data/mockData";

interface TravelerContextType {
  travelers: Traveler[];
  addTraveler: (t: Traveler) => void;
  updateTraveler: (id: string, updates: Partial<Traveler>) => void;
  lastUpdated: Date;
}

const TravelerContext = createContext<TravelerContextType | null>(null);

export function TravelerProvider({ children }: { children: ReactNode }) {
  const [travelers, setTravelers] = useState<Traveler[]>(mockTravelers);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time polling
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const addTraveler = (t: Traveler) => {
    setTravelers((prev) => [t, ...prev]);
    setLastUpdated(new Date());
  };

  const updateTraveler = (id: string, updates: Partial<Traveler>) => {
    setTravelers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    setLastUpdated(new Date());
  };

  return (
    <TravelerContext.Provider value={{ travelers, addTraveler, updateTraveler, lastUpdated }}>
      {children}
    </TravelerContext.Provider>
  );
}

export function useTravelers() {
  const ctx = useContext(TravelerContext);
  if (!ctx) throw new Error("useTravelers must be inside TravelerProvider");
  return ctx;
}
