import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Nieprawidłowy rok lub miesiąc' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Brak autoryzacji' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== 'employee') {
      return NextResponse.json(
        { error: 'Brak uprawnień' },
        { status: 403 }
      );
    }

    const db = await getDatabase();

    const schedule = await db.collection('schedules').aggregate([
      {
        $match: { year, month }
      },
      {
        $unwind: '$assignments'
      },
      {
        $lookup: {
          from: 'users',
          let: { bagiId: '$assignments.bagiety', widokId: '$assignments.widok' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: [{ $toString: '$_id' }, '$$bagiId'] },
                    { $eq: [{ $toString: '$_id' }, '$$widokId'] }
                  ]
                }
              }
            },
            {
              $project: { name: 1, email: 1 }
            }
          ],
          as: 'users'
        }
      },
      {
        $addFields: {
          'assignments.bagiety': {
            $cond: {
              if: { $ne: ['$assignments.bagiety', null] },
              then: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$users',
                      as: 'user',
                      cond: { $eq: [{ $toString: '$$user._id' }, '$assignments.bagiety'] }
                    }
                  },
                  0
                ]
              },
              else: null
            }
          },
          'assignments.widok': {
            $cond: {
              if: { $ne: ['$assignments.widok', null] },
              then: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$users',
                      as: 'user',
                      cond: { $eq: [{ $toString: '$$user._id' }, '$assignments.widok'] }
                    }
                  },
                  0
                ]
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

    if (schedule.length === 0) {
      return NextResponse.json(
        { error: 'Brak grafiku na ten miesiąc' },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule[0]);

  } catch (error) {
    console.error('Błąd pobierania grafiku:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}