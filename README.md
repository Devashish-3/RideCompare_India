# RideCompare India

RideCompare India is a mobile-first taxi fare comparison MVP for Indian users. It compares Uber, Ola, and Rapido estimates and opens the selected provider app or website via deep links.

## Features
- Auto-detect current location
- Smart destination parsing for addresses, Google Maps links, WhatsApp links, and raw coordinates
- Mock ride comparison engine with realistic pricing
- Deep-link redirection to Uber, Ola, and Rapido
- Mobile-first React + Vite frontend with Tailwind CSS
- Node.js + Express backend with modular provider adapters

## Project Structure
- `frontend/` — React + TypeScript application
- `backend/` — Express + TypeScript API server
- `.env.example` — environment variables for backend configuration
- `docker-compose.yml` — optional service composition for frontend and backend

## Getting Started

### 1. Install dependencies

From the workspace root:
```bash
cd "c:\Users\devas\OneDrive\Desktop\Test project"
cd frontend && npm install
cd ..\backend && npm install
```

### 2. Run the app

To start both services together from the root:
```bash
npm run dev
```

Or run each service separately:

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

### 3. Open the frontend

Visit the Vite dev server URL shown in the terminal, typically `http://localhost:5173`.

## Backend API

### `POST /compare`

Request body:
```json
{
  "pickup": { "lat": 18.5204, "lng": 73.8567, "name": "Current Location" },
  "destination": { "lat": 18.5319, "lng": 73.8520, "name": "Pune Railway Station" }
}
```

Response:
```json
{
  "results": [
    {
      "provider": "Uber",
      "vehicle": "Uber Go",
      "category": "Mini Cab",
      "fare": 132,
      "eta_minutes": 4,
      "deep_link": "https://m.uber.com/ul/?..."
    },
    {
      "provider": "Ola",
      "vehicle": "Ola Auto",
      "category": "Auto",
      "fare": 92,
      "eta_minutes": 4,
      "deep_link": "https://ola.app.link/?..."
    }
  ]
}
```

### `GET /reverse-geocode?lat=...&lng=...`

Returns a friendly location string for coordinates.

### `GET /geocode?q=...` and `GET /geocode?q=...&limit=5`

Returns location suggestions for typed addresses.

## Environment Variables

Copy `.env.example` to `.env` inside `backend/` and update values if needed. Use these variables to enable specific providers and store API keys.

Example `.env` values:
```env
ENABLE_UBER_API=true
ENABLE_OLA_API=true
ENABLE_RAPIDO_API=true
```

## Backend Configuration and Provider Integration

### Provider integration procedure

To add a new ride-booking partner, do the following:

1. Add a new provider adapter module in `backend/src/providers/`.
   - Export a function that returns one or more ride results.
   - Provide deep-link generation logic for booking.
2. Register the provider function in `backend/src/providers/providerAdapter.ts`.
3. Add new `.env` keys for API keys or enable flags if needed.
4. Update the frontend if you want custom branding or provider-specific UI behavior.

### Files to edit for provider integration

| Concern | Files / folders | What to change |
|---|---|---|
| API integration | `backend/src/providers/<newProvider>.ts` | Add provider logic, request handling, fare formulas, and deep-link generation |
| Provider registration | `backend/src/providers/providerAdapter.ts` | Register the new provider function |
| Enable flags / API keys | `backend/.env` | Add provider enable/secret variables like `ENABLE_<PROVIDER>_API` and `RIDE_<PROVIDER>_KEY` |
| Ride comparison logic | `backend/src/providers/providerAdapter.ts` | If needed, extend comparison rules or result shape |
| Redirect handling | `backend/src/providers/<newProvider>.ts` | Add deep-link URL composition and fallback booking URL |
| UI integration | `frontend/src/App.tsx`, `frontend/src/components/RideCard.tsx` | Add provider-specific display rules |

### Example provider module skeleton

`backend/src/providers/<newProvider>.ts`
```ts
import { RideCompareRequest, RideResult } from '../types/provider';

export async function getNewProviderEstimate(request: RideCompareRequest): Promise<RideResult[]> {
  const { pickup, destination } = request;

  return [
    {
      provider: 'NewProvider',
      vehicle: 'NewProvider Bike',
      category: 'Bike',
      fare: 75,
      eta_minutes: 4,
      deep_link: 'https://newprovider.app/book?pickup=...&drop=...'
    },
    {
      provider: 'NewProvider',
      vehicle: 'NewProvider Mini',
      category: 'Mini Cab',
      fare: 140,
      eta_minutes: 7,
      deep_link: 'https://newprovider.app/book?pickup=...&drop=...'
    }
  ];
}
```

## Fare calculation logic

You can extend or replace fare logic in provider modules under `backend/src/providers/`.

- `backend/src/providers/uberProvider.ts`
- `backend/src/providers/olaProvider.ts`
- `backend/src/providers/rapidoProvider.ts`

Each provider module can use a different formula or real API pricing call.

Example fare logic:
```ts
function calculateFare(distanceFactor: number, min: number, max: number, multiplier: number): number {
  const range = max - min;
  const base = min + Math.min(range, Math.round(distanceFactor * multiplier * 1.2));
  return Math.max(min, Math.min(max, base));
}
```

## Redirect/deep-link handling

Deep-link generation lives inside each provider module, so each partner controls its own booking behavior.

Example:
```ts
function generateUberDeepLink(pickup: RideCompareRequest['pickup'], destination: RideCompareRequest['destination'], vehicleName: string): string {
  const params = new URLSearchParams({
    action: 'setPickup',
    'pickup[latitude]': String(pickup.lat),
    'pickup[longitude]': String(pickup.lng),
    'pickup[nickname]': pickup.name,
    'dropoff[latitude]': String(destination.lat),
    'dropoff[longitude]': String(destination.lng),
    'dropoff[nickname]': destination.name,
    'product': vehicleName
  });

  return `https://m.uber.com/ul/?${params.toString()}`;
}
```

Place the logic in the provider file and return it in the provider result object.

## Frontend UI updates

To support a new provider visually, update:
`frontend/src/services/api.ts` — adapt to the backend response shape.
`frontend/src/App.tsx` — render the returned provider results.
`frontend/src/components/RideCard.tsx` — add provider-specific display details.

## How to add support for future providers

1. Create a provider module in `backend/src/providers/`.
2. Register it in `backend/src/providers/providerAdapter.ts`.
3. Add or update `.env` flags for the new provider if needed.
4. Add frontend display logic if required.

## Example folder structure for provider integration

```
backend/
  src/
    providers/
      uberProvider.ts
      olaProvider.ts
      rapidoProvider.ts
      newProvider.ts
    providers/providerAdapter.ts
    index.ts
    types/provider.ts
frontend/
  src/
    components/
      RideCard.tsx
    services/
      api.ts
      geocode.ts
    App.tsx
    types/index.ts
```

## Notes

- `backend/src/providers/providerAdapter.ts` registers provider modules directly.
- The backend returns a flat `results` array sorted by fare and ETA.

