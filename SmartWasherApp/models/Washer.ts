export interface Washer {
  id: number;
  name: string;
  location: string;
  weight: number;
  price: number;
  status: "available" | "running" | "error";
  ip_address?: string;
  last_used?: string;
}
