import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Schedule } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'No administrator privileges' }, { status: 403 });
    }

    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(url.searchParams.get('month') || (new Date().getMonth() + 1).toString());

    const db = await getDatabase();


    // Get schedule and manually populate user data
    const schedule = await db.collection('schedules').findOne({ year, month });

    if (!schedule) {
      return NextResponse.json({ schedule: null });
    }

    // Get all users for lookup
    const userIds: string[] = [];
    schedule.assignments.forEach((assignment: any) => {
      if (assignment.bagiety) userIds.push(assignment.bagiety);
      if (assignment.widok) userIds.push(assignment.widok);
    });

    const users = await db.collection('users').find({
      _id: { $in: userIds.map((id: string) => new ObjectId(id)) }
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

    return NextResponse.json({
      schedule: scheduleWithUsers
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'No administrator privileges' }, { status: 403 });
    }

    const { year, month, assignments } = await request.json();


    if (!year || !month || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: 'Year, month and assignments are required' },
        { status: 400 }
      );
    }

    // Validate assignments structure
    const validAssignments = assignments.filter(assignment =>
      assignment &&
      typeof assignment.day === 'number' &&
      assignment.day > 0 &&
      assignment.day <= 31
    );


    const db = await getDatabase();

    const existingSchedule = await db.collection('schedules').findOne({ year, month });

    const scheduleData = {
      year,
      month,
      assignments: validAssignments,
      updatedAt: new Date(),
    };


    if (existingSchedule) {
      const result = await db.collection('schedules').updateOne(
        { year, month },
        { $set: scheduleData }
      );
    } else {
      const result = await db.collection('schedules').insertOne({
        ...scheduleData,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ message: 'Schedule has been saved' });
  } catch (error) {
    console.error('Save schedule error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}