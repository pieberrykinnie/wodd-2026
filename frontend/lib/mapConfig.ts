export const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11";

// Central coordinates for each city
export const CITY_COORDS: Record<string, [number, number]> = {
  toronto: [-79.3832, 43.6532],
  vancouver: [-123.1207, 49.2827],
  montreal: [-73.5673, 45.5017],
  winnipeg: [-97.1384, 49.8951],
};

export const WINNIPEG_CENTER: [number, number] = [-97.1384, 49.8951];

// Marker colors per category
export const PIN_COLORS = {
  office: "#B23A2B",
  neighborhood: "#C8A44D",
  lifestyle: "#4C6E91",
  current: "#8B98A5",
  winnipeg: "#B23A2B",
};
