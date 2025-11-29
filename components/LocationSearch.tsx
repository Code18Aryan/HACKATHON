'use client'

import { useState } from 'react'
import { MandiPrice } from '@/lib/types'
import { calculateDistance } from '@/lib/utils'

interface LocationSearchProps {
  onSearch: (prices: MandiPrice[], location: { lat: number; lng: number }) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

const INDIAN_STATES = [
  'All States',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

export default function LocationSearch({ onSearch, loading, setLoading }: LocationSearchProps) {
  const [state, setState] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [geocodingProgress, setGeocodingProgress] = useState('')

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return null
    }

    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (err) => {
          setError('Unable to retrieve your location')
          reject(err)
        }
      )
    })
  }

  const geocodeLocation = async (locationName: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName + ', India')}&limit=1`
      )
      const data = await response.json()
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        }
      }
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  const handleSearch = async () => {
    setError('')
    
    if (!state || state === 'All States') {
      setError('Please select a state')
      return
    }

    if (!location.trim()) {
      setError('Please enter your location')
      return
    }

    setLoading(true)

    try {
      // Get user location coordinates
      let userLocation: { lat: number; lng: number } | null = null

      // Try to get current location first, if that fails, geocode the entered location
      try {
        userLocation = await getCurrentLocation()
      } catch {
        userLocation = await geocodeLocation(location)
      }

      if (!userLocation) {
        userLocation = await geocodeLocation(location)
      }

      if (!userLocation) {
        setError('Could not determine location coordinates. Please try again.')
        setLoading(false)
        return
      }

      // Fetch mandi prices from API
      const response = await fetch(
        `/api/mandi-prices?state=${encodeURIComponent(state)}&limit=1000`
      )
      const result = await response.json()

      if (!result.success || !result.data) {
        setError('Failed to fetch mandi prices. Please try again.')
        setLoading(false)
        return
      }

      // Process and filter mandi prices
      // Handle different possible field names from the API
      const mandiPrices: any[] = result.data
        .map((record: any) => {
          // Try to extract coordinates from the record
          let lat: number | undefined
          let lng: number | undefined

          // Try common field names (API might use different field names)
          if (record.latitude) lat = parseFloat(record.latitude)
          if (record.longitude) lng = parseFloat(record.longitude)
          if (record.lat) lat = parseFloat(record.lat)
          if (record.lng) lng = parseFloat(record.lng)
          if (record.lat_long) {
            const coords = record.lat_long.split(',').map((c: string) => parseFloat(c.trim()))
            if (coords.length === 2) {
              lat = coords[0]
              lng = coords[1]
            }
          }

          // Build mandi location string for geocoding
          const mandiLocation = `${record.mandi || record.market || record.market_name || ''}, ${record.district || record.district_name || ''}, ${record.state || record.state_name || ''}`

          return {
            mandi_name: record.mandi || record.market || record.market_name || 'Unknown',
            crop: record.commodity || record.crop || record.commodity_name || 'Unknown',
            min_price: parseFloat(record.min_price || record.min || record.min_price_rs_quintal || 0),
            max_price: parseFloat(record.max_price || record.max || record.max_price_rs_quintal || 0),
            modal_price: parseFloat(record.modal_price || record.modal || record.modal_price_rs_quintal || 0),
            state: record.state || record.state_name || '',
            district: record.district || record.district_name || '',
            latitude: lat,
            longitude: lng,
            mandiLocation, // Store for geocoding
          }
        })
        .filter((price: any) => price.mandi_name !== 'Unknown' && price.modal_price > 0)

      // Geocode mandi locations that don't have coordinates
      // Rate limit: 1 request per second (Nominatim policy)
      const geocodedPrices: any[] = []
      const totalToGeocode = Math.min(mandiPrices.length, 50)
      let geocodedCount = 0
      
      for (let i = 0; i < mandiPrices.length && geocodedPrices.length < 50; i++) {
        const price = mandiPrices[i]
        if (price.latitude && price.longitude) {
          geocodedPrices.push(price)
        } else {
          // Add delay to respect rate limits
          if (geocodedCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          setGeocodingProgress(`Geocoding mandi locations... ${geocodedCount + 1}/${totalToGeocode}`)
          const coords = await geocodeLocation(price.mandiLocation)
          if (coords) {
            geocodedPrices.push({ ...price, latitude: coords.lat, longitude: coords.lng })
          } else {
            geocodedPrices.push(price)
          }
          geocodedCount++
        }
      }
      setGeocodingProgress('')

      // Calculate distances and filter within 200km
      const pricesWithDistance = geocodedPrices
        .filter((price) => price.latitude && price.longitude)
        .map((price) => ({
          ...price,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            price.latitude!,
            price.longitude!
          ),
        }))
        .filter((price) => price.distance <= 200)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10) // Get top 10 closest

      onSearch(pricesWithDistance, userLocation)
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Your Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city or district name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {geocodingProgress && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          {geocodingProgress}
        </div>
      )}

      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Searching...
          </span>
        ) : (
          'Find Best Price'
        )}
      </button>
    </div>
  )
}

