import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'employee' } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, hasło i imię są wymagane' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Hasło musi mieć co najmniej 6 znaków' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const existingUser = await db.collection<User>('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Użytkownik o tym adresie email już istnieje' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser: Omit<User, '_id'> = {
      email,
      name,
      role: role as 'employee' | 'admin',
      hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection<User>('users').insertOne(newUser as User);

    return NextResponse.json(
      { message: 'Użytkownik został utworzony', userId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}