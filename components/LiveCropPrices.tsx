'use client'

import { useState, useEffect } from 'react'
import { getDirectionsUrl } from '@/lib/utils'

interface CropPrice {
  mandi: string
  commodity: string
  min_price: number
  max_price: number
  modal_price: number
  state: string
  district: string
  latitude?: number
  longitude?: number
}

export default function LiveCropPrices() {
  const [prices, setPrices] = useState<CropPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState('All States')
  const [selectedCrop, setSelectedCrop] = useState('')
  const [crops, setCrops] = useState<string[]>([])

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

  useEffect(() => {
    fetchPrices()
  }, [selectedState, selectedCrop])

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/mandi-prices?state=${selectedState === 'All States' ? '' : encodeURIComponent(selectedState)}&limit=500`
      )
      const result = await response.json()

      if (result.success && result.data) {
        let filteredPrices = result.data.map((record: any) => {
          // Try to extract coordinates from the record
          let lat: number | undefined
          let lng: number | undefined

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

          return {
            mandi: record.mandi || record.market || record.market_name || 'Unknown',
            commodity: record.commodity || record.crop || record.commodity_name || 'Unknown',
            min_price: parseFloat(record.min_price || record.min || record.min_price_rs_quintal || 0),
            max_price: parseFloat(record.max_price || record.max || record.max_price_rs_quintal || 0),
            modal_price: parseFloat(record.modal_price || record.modal || record.modal_price_rs_quintal || 0),
            state: record.state || record.state_name || '',
            district: record.district || record.district_name || '',
            latitude: lat,
            longitude: lng,
          }
        })

        // Filter by crop if selected
        if (selectedCrop) {
          filteredPrices = filteredPrices.filter(
            (p: CropPrice) => p.commodity.toLowerCase().includes(selectedCrop.toLowerCase())
          )
        }

        // Extract unique crops for dropdown
        const uniqueCrops = Array.from(
          new Set(result.data.map((r: any) => r.commodity || r.crop || r.commodity_name).filter(Boolean))
        ).sort() as string[]
        setCrops(uniqueCrops)

        setPrices(filteredPrices.slice(0, 100)) // Limit to 100 for performance
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSelectedState('All States')
    setSelectedCrop('')
  }

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (err) => {
          reject(new Error('Unable to retrieve your location. Please enable location access.'))
        }
      )
    })
  }

  const geocodeLocation = async (locationName: string): Promise<{ lat: number; lng: number } | null> => {
    try {
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

  const handleGetDirections = async (price: CropPrice) => {
    try {
      // Get user's current location
      let userLocation: { lat: number; lng: number } | null = null
      
      try {
        userLocation = await getCurrentLocation()
      } catch (error) {
        alert('Please allow location access to get directions from your current location.')
        // If user denies location, we'll still open maps to the destination
      }

      // Get destination coordinates
      let destLat: number | undefined = price.latitude
      let destLng: number | undefined = price.longitude

      // If coordinates not available, geocode the location
      if (!destLat || !destLng) {
        const locationString = `${price.mandi}, ${price.district}, ${price.state}`
        const coords = await geocodeLocation(locationString)
        if (coords) {
          destLat = coords.lat
          destLng = coords.lng
        } else {
          alert('Could not find the location. Opening Google Maps with the address.')
          // Fallback: open with search query
          const searchQuery = encodeURIComponent(`${price.mandi}, ${price.district}, ${price.state}`)
          window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank')
          return
        }
      }

      // Generate directions URL
      const directionsUrl = getDirectionsUrl(
        destLat,
        destLng,
        userLocation?.lat,
        userLocation?.lng
      )

      // Open in new tab
      window.open(directionsUrl, '_blank')
    } catch (error) {
      console.error('Error getting directions:', error)
      alert('An error occurred while getting directions. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="state-filter" className="block text-lg font-semibold text-gray-900 mb-2">
            State
          </label>
          <select
            id="state-filter"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-800 font-medium shadow-sm hover:border-emerald-400 transition-colors"
          >
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="crop-filter" className="block text-lg font-semibold text-gray-900 mb-2">
            Crop
          </label>
          <input
            id="crop-filter"
            type="text"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            placeholder="Search crop..."
            list="crops-list"
            className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-800 font-medium shadow-sm hover:border-emerald-400 transition-colors"
          />
          <datalist id="crops-list">
            {crops.map((crop) => (
              <option key={crop} value={crop} />
            ))}
          </datalist>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleClear}
            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 mx-auto"
            viewBox="0 0 24 24"
          >
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
          <p className="mt-4 text-gray-600">Loading prices...</p>
        </div>
      ) : prices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No prices found. Try adjusting your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
              <tr>
                <th className="px-6 py-4 text-left text-base font-bold text-white uppercase tracking-wider">
                  Mandi Name
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-white uppercase tracking-wider">
                  Crop
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-white uppercase tracking-wider">
                  Min Price (₹/Quintal)
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-white uppercase tracking-wider">
                  Max Price (₹/Quintal)
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-white uppercase tracking-wider">
                  Modal Price (₹/Quintal)
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-white uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-base font-bold text-white uppercase tracking-wider">
                  Direction
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prices.map((price, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-gray-900">
                    {price.mandi}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="px-3 py-1.5 inline-flex text-sm leading-6 font-semibold rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-sm">
                      {price.commodity}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-900">
                    ₹{price.min_price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-900">
                    ₹{price.max_price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-base font-semibold text-emerald-600">
                      ₹{price.modal_price.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500">
                    {price.district}, {price.state}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <button
                      onClick={() => handleGetDirections(price)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      Direction
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

