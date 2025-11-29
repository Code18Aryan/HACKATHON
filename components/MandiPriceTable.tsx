'use client'

import { MandiPrice } from '@/lib/types'
import { getDirectionsUrl } from '@/lib/utils'

interface MandiPriceTableProps {
  prices: MandiPrice[]
  userLocation: { lat: number; lng: number } | null
}

export default function MandiPriceTable({ prices, userLocation }: MandiPriceTableProps) {
  if (prices.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No mandi prices found within 200km range.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-green-50 to-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Mandi Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Crop
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Min Price (₹/Quintal)
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Max Price (₹/Quintal)
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Modal Price (₹/Quintal)
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Distance
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Directions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prices.map((price, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {price.mandi_name}
                </div>
                <div className="text-sm text-gray-500">
                  {price.district}, {price.state}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {price.crop}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹{price.min_price.toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹{price.max_price.toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-semibold text-blue-600">
                  ₹{price.modal_price.toLocaleString('en-IN')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {price.distance?.toFixed(1)} km
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {price.latitude && price.longitude ? (
                  <a
                    href={getDirectionsUrl(
                      price.latitude,
                      price.longitude,
                      userLocation?.lat,
                      userLocation?.lng
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    Directions
                  </a>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

