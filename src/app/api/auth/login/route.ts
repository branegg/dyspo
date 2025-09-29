import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { comparePassword, generateToken } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i hasło są wymagane' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const user = await db.collection<User>('users').findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'Nieprawidłowe dane logowania' },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.hashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Nieprawidłowe dane logowania' },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}