import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATS_FILE = path.join(process.cwd(), 'stats.json');

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
    console.error('Error reading stats:', e);
  }
  return { totalScans: 0, cardScans: {} };
}

function saveStats(stats: any) {
  try {
    // Check if we are in a read-only environment like Vercel
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (e) {
    // On Vercel this will fail, which is expected for serverless
    console.warn('Stats saving skipped (likely read-only filesystem):', e instanceof Error ? e.message : String(e));
  }
}

export async function GET() {
  const stats = getStats();
  return NextResponse.json(stats);
}

export async function POST(request: Request) {
  const { cardId } = await request.json();
  const stats = getStats();
  
  stats.totalScans += 1;
  if (cardId) {
    stats.cardScans[cardId] = (stats.cardScans[cardId] || 0) + 1;
  }
  
  saveStats(stats);
  return NextResponse.json({ success: true, stats });
}
