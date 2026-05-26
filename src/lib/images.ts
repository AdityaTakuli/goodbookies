import football from "@/assets/venue-football.jpg";
import cricket from "@/assets/venue-cricket.jpg";
import basketball from "@/assets/venue-basketball.jpg";

const map: Record<string, string> = {
  "venue-football": football,
  "venue-cricket": cricket,
  "venue-basketball": basketball,
};

export function resolveVenueImage(key?: string | null): string {
  if (!key) return football;
  return map[key] ?? football;
}