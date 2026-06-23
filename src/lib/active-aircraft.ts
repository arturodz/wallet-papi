// Pure resolution logic for the active aircraft id, extracted so it can be
// unit-tested without a DB or cookie store.

/**
 * Resolve which aircraft is "active" given the cookie value and the known set
 * of aircraft ids. The cookie wins only if it points at an aircraft that still
 * exists; otherwise we fall back to the first aircraft. Returns null when there
 * are no aircraft at all.
 */
export function resolveActiveAircraftId(
  cookieValue: string | null | undefined,
  aircraftIds: readonly string[],
): string | null {
  if (aircraftIds.length === 0) return null;
  if (cookieValue && aircraftIds.includes(cookieValue)) return cookieValue;
  return aircraftIds[0];
}

export const ACTIVE_AIRCRAFT_COOKIE = "activeAircraftId";
