type NominatimResult = {
  lat: string;
  lon: string;
};

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

export type GeocodeCoordinates = {
  latitude: number;
  longitude: number;
};

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string,
): Promise<GeocodeCoordinates | null> {
  const parts = [address, city, state, zipCode].map((part) => part?.trim()).filter(Boolean);
  if (!parts.length) {
    return null;
  }

  const params = new URLSearchParams({
    q: parts.join(", "),
    format: "json",
    limit: "1",
    addressdetails: "0",
  });

  try {
    const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
      headers: {
        "User-Agent": "live-local-music/1.0 (contact@live-local-music.local)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as NominatimResult[];
    const match = data?.[0];
    if (!match) {
      return null;
    }

    const latitude = Number.parseFloat(match.lat);
    const longitude = Number.parseFloat(match.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch (error) {
    console.error("Failed to geocode address:", error);
    return null;
  }
}
