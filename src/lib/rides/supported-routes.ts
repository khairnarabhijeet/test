const ROUTE_PAIRS = [
  ["Pune", "Mumbai"],
  ["Pune", "Nashik"],
  ["Pune", "Chhatrapati Sambhajinagar"],
] as const;

export const SEARCH_CITIES = [
  "Pune",
  "Mumbai",
  "Nashik",
  "Chhatrapati Sambhajinagar",
] as const;

export type SearchCity = (typeof SEARCH_CITIES)[number];

export function getRouteDestinations(source: string): SearchCity[] {
  const normalizedSource = source.trim().toLocaleLowerCase();

  return ROUTE_PAIRS.flatMap(([first, second]) => {
    if (first.toLocaleLowerCase() === normalizedSource) return [second];
    if (second.toLocaleLowerCase() === normalizedSource) return [first];
    return [];
  });
}

export function getSupportedSearchRoute(
  source: string,
  destination: string,
): { source: SearchCity; destination: SearchCity } | null {
  const normalizedSource = source.trim().toLocaleLowerCase();
  const normalizedDestination = destination.trim().toLocaleLowerCase();

  for (const [first, second] of ROUTE_PAIRS) {
    if (
      first.toLocaleLowerCase() === normalizedSource &&
      second.toLocaleLowerCase() === normalizedDestination
    ) {
      return { source: first, destination: second };
    }

    if (
      second.toLocaleLowerCase() === normalizedSource &&
      first.toLocaleLowerCase() === normalizedDestination
    ) {
      return { source: second, destination: first };
    }
  }

  return null;
}
