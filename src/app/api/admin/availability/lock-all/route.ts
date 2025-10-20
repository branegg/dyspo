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

    const db = await getDatabase();

    // Lock all existing availabilities that don't have isLocked field or where it's false
    const result = await db.collection('availability').updateMany(
      { $or: [{ isLocked: { $exists: false } }, { isLocked: false }] },
      { $set: { isLocked: true, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: `Zablokowano ${result.modifiedCount} rekordów dyspozycyjności`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Lock all availabilities error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
