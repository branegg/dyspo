import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Brak tokenu autoryzacyjnego' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
    }

    const { userId, year, month } = await request.json();

    if (!userId || !year || !month) {
      return NextResponse.json(
        { error: 'userId, rok i miesiąc są wymagane' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if availability exists
    const availability = await db.collection('availability').findOne({
      userId,
      year,
      month,
    });

    if (!availability) {
      return NextResponse.json(
        { error: 'Nie znaleziono dyspozycyjności dla tego pracownika i miesiąca' },
        { status: 404 }
      );
    }

    // Lock the availability
    await db.collection('availability').updateOne(
      { userId, year, month },
      { $set: { isLocked: true, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: 'Dyspozycyjność została zablokowana'
    });
  } catch (error) {
    console.error('Lock availability error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
