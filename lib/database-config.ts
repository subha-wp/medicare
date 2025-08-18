// Database configuration and optimization settings for large-scale operations

export const DATABASE_CONFIG = {
  // Pagination settings
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,

  // Location-based search settings
  DEFAULT_SEARCH_RADIUS_KM: 10,
  MAX_SEARCH_RADIUS_KM: 90,

  // Performance settings
  QUERY_TIMEOUT_MS: 30000,
  CONNECTION_POOL_SIZE: 20,

  // Cache settings
  CACHE_TTL_SECONDS: 300, // 5 minutes

  // Search optimization
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 500,
} as const;

export const LOCATION_BOUNDS = {
  // India geographical bounds for validation
  INDIA: {
    MIN_LAT: 6.0,
    MAX_LAT: 37.6,
    MIN_LON: 68.7,
    MAX_LON: 97.25,
  },
} as const;

export function validateIndianCoordinates(lat: number, lon: number): boolean {
  return (
    lat >= LOCATION_BOUNDS.INDIA.MIN_LAT &&
    lat <= LOCATION_BOUNDS.INDIA.MAX_LAT &&
    lon >= LOCATION_BOUNDS.INDIA.MIN_LON &&
    lon <= LOCATION_BOUNDS.INDIA.MAX_LON
  );
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[^\w\s]/gi, "") // Remove special characters
    .substring(0, 100); // Limit length
}
