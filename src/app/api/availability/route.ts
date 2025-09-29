import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Availability } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Brak tokenu autoryzacyjnego' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 });
    }

    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(url.searchParams.get('month') || (new Date().getMonth() + 1).toString());

    const db = await getDatabase();
    const availability = await db.collection<Availability>('availability').findOne({
      userId: decoded.userId,
      year,
      month,
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Brak tokenu autoryzacyjnego' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 });
    }

    const { year, month, availableDays } = await request.json();

    if (!year || !month || !Array.isArray(availableDays)) {
      return NextResponse.json(
        { error: 'Rok, miesiąc i dostępne dni są wymagane' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const existingAvailability = await db.collection<Availability>('availability').findOne({
      userId: decoded.userId,
      year,
      month,
    });

    const availabilityData = {
      userId: decoded.userId,
      year,
      month,
      availableDays,
      updatedAt: new Date(),
    };

    if (existingAvailability) {
      await db.collection<Availability>('availability').updateOne(
        { userId: decoded.userId, year, month },
        { $set: availabilityData }
      );
    } else {
      await db.collection<Availability>('availability').insertOne({
        ...availabilityData,
        createdAt: new Date(),
      } as Availability);
    }

    return NextResponse.json({ message: 'Dyspozycyjność została zapisana' });
  } catch (error) {
    console.error('Save availability error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}