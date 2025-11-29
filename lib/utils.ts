/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Validate if coordinates are valid
 */
function isValidLat(lat: number): boolean {
  return !isNaN(lat) && isFinite(lat) && lat >= -90 && lat <= 90 && lat !== 0
}

function isValidLng(lng: number): boolean {
  return !isNaN(lng) && isFinite(lng) && lng >= -180 && lng <= 180 && lng !== 0
}

/**
 * Get Google Maps directions URL
 */
export function getDirectionsUrl(
  destinationLat: number,
  destinationLng: number,
  userLat?: number,
  userLng?: number,
  address?: string
): string {
  // Validate destination coordinates
  const hasValidDestination = isValidLat(destinationLat) && isValidLng(destinationLng)

  // If destination coordinates are invalid, use address search
  if (!hasValidDestination && address) {
    const encodedAddress = encodeURIComponent(address)
    if (userLat && userLng && isValidLat(userLat) && isValidLng(userLng)) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${encodedAddress}&travelmode=driving`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  }

  // If user location is provided and valid, use directions with coordinates
  if (userLat && userLng && isValidLat(userLat) && isValidLng(userLng)) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destinationLat},${destinationLng}&travelmode=driving`
  }

  // Otherwise, use place search with coordinates
  return `https://www.google.com/maps/search/?api=1&query=${destinationLat},${destinationLng}`
}

