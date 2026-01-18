import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { HourLog } from '@/types';
import { ObjectId } from 'mongodb';

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
    const hourLogs = await db.collection<HourLog>('hourLogs')
      .find({
        userId: decoded.userId,
        year,
        month,
      })
      .sort({ day: 1 })
      .toArray();

    return NextResponse.json({ hourLogs });
  } catch (error) {
    console.error('Get hour logs error:', error);
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

    const { year, month, day, hours, location, notes } = await request.json();

    if (!year || !month || !day) {
      return NextResponse.json(
        { error: 'Rok, miesiąc i dzień są wymagane' },
        { status: 400 }
      );
    }

    if (!hours || hours <= 0) {
      return NextResponse.json(
        { error: 'Godziny muszą być większe od 0' },
        { status: 400 }
      );
    }

    if (!location || !['bagiety', 'widok'].includes(location)) {
      return NextResponse.json(
        { error: 'Nieprawidłowa lokalizacja' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if there's already an entry for this day and location
    const existingLog = await db.collection<HourLog>('hourLogs').findOne({
      userId: decoded.userId,
      year,
      month,
      day,
      location,
    });

    if (existingLog) {
      return NextResponse.json(
        { error: 'Wpis dla tej daty i lokalizacji już istnieje. Użyj edycji aby go zaktualizować.' },
        { status: 400 }
      );
    }

    const hourLogData: Omit<HourLog, '_id'> = {
      userId: decoded.userId,
      year,
      month,
      day,
      hours: parseFloat(hours),
      location,
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection<HourLog>('hourLogs').insertOne(hourLogData as HourLog);

    return NextResponse.json({ message: 'Godziny zostały zapisane' });
  } catch (error) {
    console.error('Save hour log error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const { id, hours, location, notes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID wpisu jest wymagane' }, { status: 400 });
    }

    if (!hours || hours <= 0) {
      return NextResponse.json(
        { error: 'Godziny muszą być większe od 0' },
        { status: 400 }
      );
    }

    if (!location || !['bagiety', 'widok'].includes(location)) {
      return NextResponse.json(
        { error: 'Nieprawidłowa lokalizacja' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Verify the log belongs to this user
    const existingLog = await db.collection('hourLogs').findOne({
      _id: new ObjectId(id),
      userId: decoded.userId,
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Wpis nie został znaleziony' }, { status: 404 });
    }

    await db.collection('hourLogs').updateOne(
      { _id: new ObjectId(id), userId: decoded.userId },
      {
        $set: {
          hours: parseFloat(hours),
          location,
          notes: notes || '',
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ message: 'Wpis został zaktualizowany' });
  } catch (error) {
    console.error('Update hour log error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID wpisu jest wymagane' }, { status: 400 });
    }

    const db = await getDatabase();

    // Verify the log belongs to this user
    const existingLog = await db.collection('hourLogs').findOne({
      _id: new ObjectId(id),
      userId: decoded.userId,
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Wpis nie został znaleziony' }, { status: 404 });
    }

    await db.collection('hourLogs').deleteOne({
      _id: new ObjectId(id),
      userId: decoded.userId,
    });

    return NextResponse.json({ message: 'Wpis został usunięty' });
  } catch (error) {
    console.error('Delete hour log error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
