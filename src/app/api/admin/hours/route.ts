import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { HourLogWithUser } from '@/types';

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(url.searchParams.get('month') || (new Date().getMonth() + 1).toString());

    const db = await getDatabase();

    const hourLogs = await db.collection('hourLogs').aggregate([
      {
        $match: { year, month }
      },
      {
        $addFields: {
          userObjectId: { $toObjectId: "$userId" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: 1,
          year: 1,
          month: 1,
          day: 1,
          hours: 1,
          location: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
          'user.name': 1,
          'user.email': 1
        }
      },
      {
        $sort: { 'user.name': 1, day: 1 }
      }
    ]).toArray();

    return NextResponse.json({ hourLogs });
  } catch (error) {
    console.error('Get admin hour logs error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
