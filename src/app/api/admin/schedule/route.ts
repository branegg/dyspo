import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Schedule } from '@/types';

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

    const schedule = await db.collection('schedules').findOne({ year, month });

    if (!schedule) {
      return NextResponse.json({ schedule: null });
    }

    // Populate user data for assignments
    const scheduleWithUsers = await db.collection('schedules').aggregate([
      { $match: { year, month } },
      { $unwind: '$assignments' },
      {
        $lookup: {
          from: 'users',
          let: { bagietyId: { $toObjectId: '$assignments.bagiety' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$bagietyId'] } } },
            { $project: { name: 1, email: 1 } }
          ],
          as: 'bagietyUser'
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { widokId: { $toObjectId: '$assignments.widok' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$widokId'] } } },
            { $project: { name: 1, email: 1 } }
          ],
          as: 'widokUser'
        }
      },
      {
        $addFields: {
          'assignments.bagiety': {
            $cond: {
              if: { $ne: ['$assignments.bagiety', null] },
              then: {
                userId: '$assignments.bagiety',
                name: { $arrayElemAt: ['$bagietyUser.name', 0] },
                email: { $arrayElemAt: ['$bagietyUser.email', 0] }
              },
              else: null
            }
          },
          'assignments.widok': {
            $cond: {
              if: { $ne: ['$assignments.widok', null] },
              then: {
                userId: '$assignments.widok',
                name: { $arrayElemAt: ['$widokUser.name', 0] },
                email: { $arrayElemAt: ['$widokUser.email', 0] }
              },
              else: null
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          year: { $first: '$year' },
          month: { $first: '$month' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          assignments: { $push: '$assignments' }
        }
      }
    ]).toArray();

    return NextResponse.json({
      schedule: scheduleWithUsers.length > 0 ? scheduleWithUsers[0] : null
    });
  } catch (error) {
    console.error('Get schedule error:', error);
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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
    }

    const { year, month, assignments } = await request.json();

    if (!year || !month || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: 'Rok, miesiąc i przydzielenia są wymagane' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const existingSchedule = await db.collection('schedules').findOne({ year, month });

    const scheduleData = {
      year,
      month,
      assignments,
      updatedAt: new Date(),
    };

    if (existingSchedule) {
      await db.collection('schedules').updateOne(
        { year, month },
        { $set: scheduleData }
      );
    } else {
      await db.collection('schedules').insertOne({
        ...scheduleData,
        createdAt: new Date(),
      } as Schedule);
    }

    return NextResponse.json({ message: 'Grafik został zapisany' });
  } catch (error) {
    console.error('Save schedule error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}