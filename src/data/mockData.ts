export type VisaStatus = "approved" | "pending" | "denied" | "expired";
export type WatchlistStatus = "clear" | "flagged" | "under_review";
export type AidNeed = "medical" | "shelter" | "food" | "none";
export type UserRole = "border_security" | "humanitarian_ngo" | "admin";

export interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  documentType: "passport" | "refugee_paper" | "travel_document";
  documentNumber: string;
  dateOfBirth: string;
  arrivalDate: string;
  arrivalTime: string;
  // Security-only fields
  visaStatus: VisaStatus;
  watchlistStatus: WatchlistStatus;
  backgroundCheckResult: "clear" | "pending" | "alert";
  watchlistNotes?: string;
  // Humanitarian fields
  aidNeeds: AidNeed[];
  medicalPriority?: "critical" | "moderate" | "low";
  familySize: number;
  unaccompaniedMinor: boolean;
  // OCR
  mrzData?: string;
  ocrScanned: boolean;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  agency: string;
}

export const mockUsers: User[] = [
  { id: "u1", username: "officer_martinez", role: "border_security", agency: "Border Protection Agency" },
  { id: "u2", username: "dr_chen", role: "humanitarian_ngo", agency: "Médecins Sans Frontières" },
  { id: "u3", username: "admin_root", role: "admin", agency: "System Administration" },
];

export const mockTravelers: Traveler[] = [
  {
    id: "t1", firstName: "Ahmad", lastName: "Al-Rashid", nationality: "Syrian",
    documentType: "refugee_paper", documentNumber: "RF-2024-88712",
    dateOfBirth: "1988-03-15", arrivalDate: "2026-03-13", arrivalTime: "08:22",
    visaStatus: "pending", watchlistStatus: "clear", backgroundCheckResult: "clear",
    aidNeeds: ["medical", "shelter"], medicalPriority: "critical", familySize: 4,
    unaccompaniedMinor: false, ocrScanned: true,
    mrzData: "P<SYRAL_RASHID<<AHMAD<<<<<<<<<<<<<<<<<<RF2024887121SYR8803150M2512311<<<<<<<<<<<<<<06"
  },
  {
    id: "t2", firstName: "Maria", lastName: "Gonzalez", nationality: "Venezuelan",
    documentType: "passport", documentNumber: "V-19284756",
    dateOfBirth: "1995-07-22", arrivalDate: "2026-03-13", arrivalTime: "08:45",
    visaStatus: "approved", watchlistStatus: "clear", backgroundCheckResult: "clear",
    aidNeeds: ["food"], familySize: 1, unaccompaniedMinor: false, ocrScanned: true,
    mrzData: "P<VENGONZALEZ<<MARIA<<<<<<<<<<<<<<<<<<<V192847561VEN9507220F2612311<<<<<<<<<<<<<<02"
  },
  {
    id: "t3", firstName: "Dmitri", lastName: "Volkov", nationality: "Russian",
    documentType: "passport", documentNumber: "RU-77341298",
    dateOfBirth: "1979-11-03", arrivalDate: "2026-03-13", arrivalTime: "09:10",
    visaStatus: "denied", watchlistStatus: "flagged", backgroundCheckResult: "alert",
    watchlistNotes: "Interpol Notice — Financial crimes investigation",
    aidNeeds: ["none"], familySize: 1, unaccompaniedMinor: false, ocrScanned: true,
    mrzData: "P<RUSVOLKOV<<DMITRI<<<<<<<<<<<<<<<<<<<<RU773412981RUS7911030M2501011<<<<<<<<<<<<<<08"
  },
  {
    id: "t4", firstName: "Fatima", lastName: "Hassan", nationality: "Somali",
    documentType: "refugee_paper", documentNumber: "RF-2024-55219",
    dateOfBirth: "2010-06-18", arrivalDate: "2026-03-13", arrivalTime: "09:33",
    visaStatus: "pending", watchlistStatus: "clear", backgroundCheckResult: "pending",
    aidNeeds: ["medical", "shelter", "food"], medicalPriority: "moderate", familySize: 1,
    unaccompaniedMinor: true, ocrScanned: false,
  },
  {
    id: "t5", firstName: "Jean-Pierre", lastName: "Mbeki", nationality: "Congolese",
    documentType: "travel_document", documentNumber: "TD-2024-19083",
    dateOfBirth: "1970-01-28", arrivalDate: "2026-03-13", arrivalTime: "10:05",
    visaStatus: "pending", watchlistStatus: "under_review", backgroundCheckResult: "pending",
    watchlistNotes: "Name similarity match — manual review required",
    aidNeeds: ["shelter", "food"], familySize: 6, unaccompaniedMinor: false, ocrScanned: true,
    mrzData: "P<CODMBEKI<<JEAN_PIERRE<<<<<<<<<<<<<<<TD2024190831COD7001280M2512311<<<<<<<<<<<<<<04"
  },
  {
    id: "t6", firstName: "Yuki", lastName: "Tanaka", nationality: "Japanese",
    documentType: "passport", documentNumber: "JP-88123456",
    dateOfBirth: "2001-09-12", arrivalDate: "2026-03-13", arrivalTime: "10:30",
    visaStatus: "approved", watchlistStatus: "clear", backgroundCheckResult: "clear",
    aidNeeds: ["none"], familySize: 1, unaccompaniedMinor: false, ocrScanned: true,
    mrzData: "P<JPNTANAKA<<YUKI<<<<<<<<<<<<<<<<<<<<<<JP881234561JPN0109120F2712311<<<<<<<<<<<<<<00"
  },
  {
    id: "t7", firstName: "Amara", lastName: "Diallo", nationality: "Malian",
    documentType: "refugee_paper", documentNumber: "RF-2024-67432",
    dateOfBirth: "1992-04-05", arrivalDate: "2026-03-12", arrivalTime: "22:15",
    visaStatus: "pending", watchlistStatus: "clear", backgroundCheckResult: "clear",
    aidNeeds: ["medical", "food"], medicalPriority: "low", familySize: 3,
    unaccompaniedMinor: false, ocrScanned: true,
    mrzData: "P<MLIDIALLO<<AMARA<<<<<<<<<<<<<<<<<<<<<RF2024674321MLI9204050F2512311<<<<<<<<<<<<<<02"
  },
  {
    id: "t8", firstName: "Carlos", lastName: "Reyes", nationality: "Honduran",
    documentType: "passport", documentNumber: "HN-44298173",
    dateOfBirth: "1985-12-01", arrivalDate: "2026-03-12", arrivalTime: "23:50",
    visaStatus: "expired", watchlistStatus: "clear", backgroundCheckResult: "clear",
    aidNeeds: ["shelter"], familySize: 2, unaccompaniedMinor: false, ocrScanned: true,
    mrzData: "P<HNDREYES<<CARLOS<<<<<<<<<<<<<<<<<<<<<HN442981731HND8512010M2412311<<<<<<<<<<<<<<04"
  },
];

// Simulated OCR extraction
export function mockOcrExtract(imageFile?: File): Promise<Partial<Traveler>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        firstName: "New",
        lastName: "Arrival",
        nationality: "Unknown",
        documentType: "travel_document",
        documentNumber: `TD-${Date.now().toString().slice(-8)}`,
        dateOfBirth: "1990-01-01",
        arrivalDate: new Date().toISOString().split("T")[0],
        arrivalTime: new Date().toTimeString().slice(0, 5),
        ocrScanned: true,
        mrzData: "P<XXXARRIVAL<<NEW<<<<<<<<<<<<<<<<<<<<<<<TD000000001XXX9001010M2512311<<<<<<<<<<<<<<00",
      });
    }, 1500);
  });
}
