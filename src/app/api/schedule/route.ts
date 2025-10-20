import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
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
    const decoded = verifyToken(token) as any;

    if (!decoded) {
      return NextResponse.json(
        { error: 'Nieprawidłowy token' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'employee' && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Brak uprawnień' },
        { status: 403 }
      );
    }

    const db = await getDatabase();


    // Get schedule and manually populate user data (simpler approach)
    const schedule = await db.collection('schedules').findOne({ year, month });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Brak grafiku na ten miesiąc' },
        { status: 404 }
      );
    }

    // Get all users for lookup
    const userIds: string[] = [];
    schedule.assignments.forEach((assignment: any) => {
      if (assignment.bagiety) userIds.push(assignment.bagiety);
      if (assignment.widok) userIds.push(assignment.widok);
    });

    // Filter valid ObjectIds only
    const validUserIds = userIds.filter(id => {
      try {
        return ObjectId.isValid(id);
      } catch {
        return false;
      }
    });

    const users = await db.collection('users').find({
      _id: { $in: validUserIds.map((id: string) => new ObjectId(id)) }
    }).toArray();

    // Create user lookup map
    const userMap = new Map();
    users.forEach((user: any) => {
      userMap.set(user._id.toString(), {
        userId: user._id.toString(),
        name: user.name,
        email: user.email
      });
    });

    // Populate assignments with user data
    const populatedAssignments = schedule.assignments.map((assignment: any) => ({
      day: assignment.day,
      bagiety: assignment.bagiety ? userMap.get(assignment.bagiety) || null : null,
      widok: assignment.widok ? userMap.get(assignment.widok) || null : null
    }));

    const scheduleWithUsers = {
      ...schedule,
      assignments: populatedAssignments
    };

    return NextResponse.json(scheduleWithUsers);

  } catch (error) {
    console.error('Błąd pobierania grafiku:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}