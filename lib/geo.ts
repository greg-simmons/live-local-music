import { cache } from "react";

type ZipApiResponse = {
  places?: Array<{
    latitude: string;
    longitude: string;
  }>;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type BoundingBox = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

const EARTH_RADIUS_MILES = 3958.8;
const ZIP_CODE_PATTERN = /^\d{5}$/;
const MIN_COS_LATITUDE = 1e-6;

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;
const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

export const normalizeZipCode = (zip: string | undefined | null) => {
  if (!zip) return null;
  const trimmed = zip.trim();
  return ZIP_CODE_PATTERN.test(trimmed) ? trimmed : null;
};

export const createBoundingBox = (center: Coordinates, radiusMiles: number): BoundingBox => {
  const latDelta = radiansToDegrees(radiusMiles / EARTH_RADIUS_MILES);
  const cosLat = Math.cos(degreesToRadians(center.latitude));
  const safeCosLat = Math.abs(cosLat) < MIN_COS_LATITUDE ? MIN_COS_LATITUDE : Math.abs(cosLat);
  const lonDelta = radiansToDegrees(radiusMiles / (EARTH_RADIUS_MILES * safeCosLat));

  return {
    minLatitude: center.latitude - latDelta,
    maxLatitude: center.latitude + latDelta,
    minLongitude: center.longitude - lonDelta,
    maxLongitude: center.longitude + lonDelta,
  };
};

export const isWithinBoundingBox = (point: Coordinates, box: BoundingBox) =>
  point.latitude >= box.minLatitude &&
  point.latitude <= box.maxLatitude &&
  point.longitude >= box.minLongitude &&
  point.longitude <= box.maxLongitude;

export const haversineMiles = (a: Coordinates, b: Coordinates) => {
  const dLat = degreesToRadians(b.latitude - a.latitude);
  const dLon = degreesToRadians(b.longitude - a.longitude);
  const lat1 = degreesToRadians(a.latitude);
  const lat2 = degreesToRadians(b.latitude);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * EARTH_RADIUS_MILES * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export const lookupZipCoordinates = cache(async (zip: string): Promise<Coordinates | null> => {
  const normalized = normalizeZipCode(zip);
  if (!normalized) return null;

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${normalized}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as ZipApiResponse;
    const place = data.places?.[0];
    if (!place) return null;

    const latitude = Number.parseFloat(place.latitude);
    const longitude = Number.parseFloat(place.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    return null;
  }
});
