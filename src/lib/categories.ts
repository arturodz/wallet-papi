// Fixed expense/service category list for the UI selects.
export const CATEGORIES = [
  "acquisition",
  "maintenance",
  "fuel",
  "hangar",
  "insurance",
  "subscription",
  "parts",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];
