# Mandi Price Finder

A modern web application to find local mandi (market) prices for crops within a 200km radius. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔍 **Smart Location Search**: Enter your location and find nearby mandi prices
- 📊 **Distance-based Results**: Shows top 10 mandi prices within 200km range
- 🗺️ **Google Maps Integration**: Get directions to each mandi with one click
- 📈 **Live Crop Prices**: Browse real-time mandi prices across all states
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** for API calls

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

**Note:** The application runs on port 3001 by default. To use a different port, you can run `next dev -p <port-number>` or modify the port in `package.json`.

## API Configuration

The app uses the Mandi Price API from data.gov.in. The API key is configured in `app/api/mandi-prices/route.ts`.

## Features in Detail

### Location Search
- Select your state from the dropdown
- Enter your city or district name
- The app will automatically geocode your location
- Finds mandi prices within 200km radius
- Displays top 10 closest mandis

### Mandi Price Display
- Shows min, max, and modal prices
- Displays distance from your location
- One-click directions to each mandi via Google Maps

### Live Crop Prices
- Filter by state and crop
- Real-time price updates
- Searchable crop list

## Project Structure

```
├── app/
│   ├── api/
│   │   └── mandi-prices/
│   │       └── route.ts          # API route for fetching mandi prices
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── LocationSearch.tsx        # Location input component
│   ├── MandiPriceTable.tsx       # Mandi price display table
│   └── LiveCropPrices.tsx        # Live crop prices section
├── lib/
│   └── utils.ts                  # Utility functions (distance calculation, etc.)
└── package.json
```

## License

MIT

