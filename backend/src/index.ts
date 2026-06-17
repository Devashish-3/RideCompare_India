import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { compareRides } from './providers/providerAdapter';
import { reverseGeocode } from './services/reverseGeocode';
import { forwardGeocode } from './services/forwardGeocode';
import { RideCompareRequest } from './types/provider';

dotenv.config();

// Initialize MongoDB connection if MONGO_URI is provided
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO;
if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
  console.warn('No MongoDB connection string found in environment (MONGO_URI)');
}

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

/**
 * Health check endpoint for backend readiness.
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'RideCompare India backend is running' });
});

/**
 * Compare rides between providers using mock or future real provider adapters.
 * Validates request and returns sorted results by fare.
 */
app.post('/compare', async (req: Request, res: Response) => {
  try {
    const body = req.body as RideCompareRequest;

    if (!body?.pickup || !body?.destination) {
      return res.status(400).json({ error: 'pickup and destination are required' });
    }

    const compareResult = await compareRides(body);
    return res.json(compareResult);
  } catch (error) {
    console.error('Compare API error', error);
    return res.status(500).json({ error: 'Unable to compare rides at this time' });
  }
});

app.get('/reverse-geocode', async (req: Request, res: Response) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: 'lat and lng query parameters are required' });
    }

    const name = await reverseGeocode(lat, lng);
    return res.json({ name });
  } catch (error) {
    console.error('Reverse geocode error', error);
    return res.status(500).json({ error: 'Unable to reverse geocode location' });
  }
});

/**
 * Simple DB status endpoint to verify mongoose connection from the client
 */
app.get('/db-status', (_req: Request, res: Response) => {
  const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return res.json({ state });
});

app.get('/geocode', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '');
    const limit = Number(req.query.limit) || 5;
    const language = typeof req.query.language === 'string' ? String(req.query.language) : undefined;
    const country = typeof req.query.country === 'string' ? String(req.query.country) : undefined;
    if (!q) {
      return res.status(400).json({ error: 'q query parameter is required' });
    }

    const results = await forwardGeocode(q, limit, { language, country });
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No location found' });
    }

    return res.json({ suggestions: results.map((item) => ({ lat: item.lat, lng: item.lon, name: item.display_name })) });
  } catch (error) {
    console.error('Forward geocode error', error);
    return res.status(500).json({ error: 'Unable to geocode location' });
  }
});

app.listen(port, () => {
  console.log(`RideCompare India backend listening on http://localhost:${port}`);
});
