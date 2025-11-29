import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const MANDI_API_KEY = '579b464db66ec23bdd0000019690f051ed194cd97481b30e543cb306'
const MANDI_API_BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get('state')
    const limit = searchParams.get('limit') || '1000'
    const offset = searchParams.get('offset') || '0'

    // Build API URL
    const apiUrl = `${MANDI_API_BASE}?api-key=${MANDI_API_KEY}&format=json&limit=${limit}&offset=${offset}${state ? `&filters[state]=${encodeURIComponent(state)}` : ''}`

    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      timeout: 30000,
    })

    if (response.data && response.data.records) {
      return NextResponse.json({
        success: true,
        data: response.data.records,
        total: response.data.total || response.data.records.length,
      })
    }

    return NextResponse.json(
      { success: false, error: 'No data received from API' },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('Mandi API Error:', error.message)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch mandi prices',
      },
      { status: 500 }
    )
  }
}

