import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATS_FILE = path.join(process.cwd(), 'metrics.json');

function getStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, 'utf8');
      if (!data || data.trim() === '') {
        return { totalScans: 0, cardScans: {} };
      }
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading metrics:', e);
  }
  return { totalScans: 0, cardScans: {} };
}

function saveStats(stats: any) {
  try {
    // Check if we are in a read-only environment like Vercel
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (e) {
    // On Vercel this will fail, which is expected for serverless
    console.warn('Metrics saving skipped (likely read-only filesystem):', e instanceof Error ? e.message : String(e));
  }
}

export async function GET() {
  console.log('GET /api/metrics request received');
  try {
    const stats = getStats();
    console.log('Successfully retrieved metrics:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in metrics GET handler:', error);
    return NextResponse.json({ totalScans: 0, cardScans: {} }, { status: 200 });
  }
}

export async function POST(request: Request) {
  console.log('POST /api/metrics request received');
  try {
    const { cardId } = await request.json();
    console.log('Tracking scan for cardId:', cardId);
    const stats = getStats();
    
    stats.totalScans += 1;
    if (cardId) {
      stats.cardScans[cardId] = (stats.cardScans[cardId] || 0) + 1;
    }
    
    saveStats(stats);
    console.log('Successfully updated metrics');
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error in metrics POST handler:', error);
    return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 });
  }
}
