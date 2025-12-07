export interface DeclaredItem {
  id: string;
  brand: string;
  name: string;
  ingredients: string; // Comma separated list or full text
  weight: string;
  quantity: number;
  image?: string; // Base64 data url
  timestamp: number;
}

export interface ScanResult {
  brand: string;
  name: string;
  ingredients: string;
  weight: string;
  quantity: number;
  image?: string; // Base64 data url
}