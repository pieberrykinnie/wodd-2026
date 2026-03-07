export const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v12";

// Central coordinates for each city
export const CITY_COORDS: Record<string, [number, number]> = {
  toronto: [-79.3832, 43.6532],
  vancouver: [-123.1207, 49.2827],
  montreal: [-73.5673, 45.5017],
  calgary: [-114.0719, 51.0447],
  ottawa: [-75.6972, 45.4215],
  winnipeg: [-97.1384, 49.8951],
};

export const WINNIPEG_CENTER: [number, number] = [-97.1384, 49.8951];

// Marker colors per category
export const PIN_COLORS = {
  office: "#B99445",
  neighborhood: "#1D507A",
  lifestyle: "#49575E",
  current: "#49575E",
  winnipeg: "#B99445",
};
